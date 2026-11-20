#!/usr/bin/env python3
"""VMISS traffic API: serves the current billing period's traffic from vnstat.

vnstatd records hourly buckets (kept for HourlyDays=70 days, longer than any
billing period). The caller says when its period resets, so one server
works for any reset day / time zone; the period is cut on hour boundaries,
which is exact for every whole-hour UTC offset. vnstat keeps its database on
disk, so totals survive reboots. Inbound + outbound are both counted.

GET /traffic?reset_day=23&utc_offset=-5   (header X-Token: <token>, or ?token=)
  reset_day   1-31; a day missing from a month means that month's last day
  utc_offset  whole hours, -12..14
-> {"used": bytes, "rx": bytes, "tx": bytes, "base": bytes,
    "periodStart": iso, "nextReset": iso, "updated": iso}

Environment (see vmiss-traffic.env.example):
  VMISS_TOKEN        required shared secret
  VMISS_IFACE        default eth0
  VMISS_PORT         default 8890
  VMISS_RESET_DAY    default reset day when the request gives none (23)
  VMISS_UTC_OFFSET   default UTC offset when the request gives none (-5)
  VMISS_BASE_BYTES   traffic already used in the running period before vnstat started
  VMISS_BASE_AT      when vnstat started (ISO time); the base counts only for
                     the period that contains this moment
"""
import calendar
import datetime as dt
import hmac
import json
import os
import subprocess
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

TOKEN = os.environ.get("VMISS_TOKEN", "")
IFACE = os.environ.get("VMISS_IFACE", "eth0")
PORT = int(os.environ.get("VMISS_PORT", "8890"))
RESET_DAY = int(os.environ.get("VMISS_RESET_DAY", "23"))
UTC_OFFSET = int(os.environ.get("VMISS_UTC_OFFSET", "-5"))
BASE_BYTES = int(os.environ.get("VMISS_BASE_BYTES", "0") or 0)
BASE_AT = os.environ.get("VMISS_BASE_AT", "")


def reset_at(year, month, day, tz):
    return dt.datetime(year, month, min(day, calendar.monthrange(year, month)[1]), tzinfo=tz)


def period(now, reset_day=RESET_DAY, utc_offset=UTC_OFFSET):
    """Start of the current billing period and the next reset."""
    tz = dt.timezone(dt.timedelta(hours=utc_offset))
    local = now.astimezone(tz)
    year, month = local.year, local.month
    start = reset_at(year, month, reset_day, tz)
    if local < start:
        year, month = (year - 1, 12) if month == 1 else (year, month - 1)
        start = reset_at(year, month, reset_day, tz)
    year, month = (year + 1, 1) if month == 12 else (year, month + 1)
    return start, reset_at(year, month, reset_day, tz)


def vnstat_between(start, end, run=subprocess.run):
    """rx/tx summed over vnstat's hourly buckets that begin in [start, end)."""
    # Read in the system time zone, the same one vnstatd writes its buckets in;
    # each bucket's "timestamp" is then the true epoch of that hour.
    out = run(["vnstat", "--json", "h", "0", "-i", IFACE], capture_output=True, text=True, check=True)
    hours = json.loads(out.stdout)["interfaces"][0]["traffic"]["hour"]
    first, last = start.timestamp(), end.timestamp()
    rx = tx = 0
    for hour in hours:
        if first <= hour["timestamp"] < last:
            rx += int(hour["rx"])
            tx += int(hour["tx"])
    return rx, tx


def traffic(now=None, run=subprocess.run, reset_day=RESET_DAY, utc_offset=UTC_OFFSET):
    now = now or dt.datetime.now(dt.timezone.utc)
    start, nxt = period(now, reset_day, utc_offset)
    rx, tx = vnstat_between(start, nxt, run)
    base_at = dt.datetime.fromisoformat(BASE_AT) if BASE_AT else None
    base = BASE_BYTES if base_at and start <= base_at < nxt else 0
    return {
        "used": rx + tx + base, "rx": rx, "tx": tx, "base": base,
        "periodStart": start.isoformat(), "nextReset": nxt.isoformat(),
        "updated": now.isoformat(timespec="seconds"),
    }


def parse_params(query):
    """reset_day / utc_offset from the query string; ValueError when invalid."""
    values = parse_qs(query)
    day = int(values.get("reset_day", [RESET_DAY])[0])
    offset = int(values.get("utc_offset", [UTC_OFFSET])[0])
    if not 1 <= day <= 31:
        raise ValueError("reset_day must be 1-31")
    if not -12 <= offset <= 14:
        raise ValueError("utc_offset must be whole hours between -12 and 14")
    return day, offset


class Handler(BaseHTTPRequestHandler):
    server_version = "vmiss-traffic"

    def send(self, status, body):
        payload = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        url = urlparse(self.path)
        given = self.headers.get("X-Token") or parse_qs(url.query).get("token", [""])[0]
        if not TOKEN or not hmac.compare_digest(given.encode(), TOKEN.encode()):
            return self.send(401, {"error": "unauthorized"})
        if url.path != "/traffic":
            return self.send(404, {"error": "not found"})
        try:
            reset_day, utc_offset = parse_params(url.query)
        except ValueError as error:
            return self.send(400, {"error": str(error)})
        try:
            self.send(200, traffic(reset_day=reset_day, utc_offset=utc_offset))
        except Exception as error:  # vnstat missing, no data yet, ...
            self.send(500, {"error": str(error)[:200]})

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    if not TOKEN:
        raise SystemExit("VMISS_TOKEN is required")
    ThreadingHTTPServer(("", PORT), Handler).serve_forever()
