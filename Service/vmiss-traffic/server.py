#!/usr/bin/env python3
"""VMISS traffic API: serves this billing period's traffic from vnstat.

VMISS counts inbound + outbound and resets on day RESET_DAY at 00:00 in
UTC+UTC_OFFSET. vnstatd runs with that time zone, so its daily buckets start
at VMISS midnight; summing the days since the last reset gives this billing
period. vnstat keeps its database on disk, so totals survive reboots.

GET /traffic   (header X-Token: <token>, or ?token=<token>)
-> {"used": bytes, "rx": bytes, "tx": bytes, "periodStart": iso, "nextReset": iso, "updated": iso}

Environment (see vmiss-traffic.env.example):
  VMISS_TOKEN        required shared secret
  VMISS_IFACE        default eth0
  VMISS_PORT         default 8890
  VMISS_RESET_DAY    default 23 (1-28)
  VMISS_UTC_OFFSET   default -5
  VMISS_BASE_BYTES   traffic already used before vnstat was installed
  VMISS_BASE_PERIOD  period start (YYYY-MM-DD) that VMISS_BASE_BYTES belongs to;
                     ignored in every later period
"""
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
TZ = dt.timezone(dt.timedelta(hours=UTC_OFFSET))
VNSTAT_TZ = "Etc/GMT%+d" % -UTC_OFFSET
BASE_BYTES = int(os.environ.get("VMISS_BASE_BYTES", "0") or 0)
BASE_PERIOD = os.environ.get("VMISS_BASE_PERIOD", "")


def period(now):
    """Start of the current billing period and the next reset, in VMISS time."""
    local = now.astimezone(TZ)
    year, month = local.year, local.month
    if local.day < RESET_DAY:
        year, month = (year - 1, 12) if month == 1 else (year, month - 1)
    start = dt.datetime(year, month, RESET_DAY, tzinfo=TZ)
    nxt = dt.datetime(year + 1, 1, RESET_DAY, tzinfo=TZ) if month == 12 else dt.datetime(year, month + 1, RESET_DAY, tzinfo=TZ)
    return start, nxt


def vnstat_since(start, run=subprocess.run):
    """rx/tx summed over vnstat's daily buckets from the period start day on.

    vnstatd writes days in VMISS local time (TZ=VNSTAT_TZ), so the period starts
    exactly at a day boundary. DailyDays defaults to 62, more than one period.
    """
    # Read with the same time zone vnstatd writes in (POSIX Etc/GMT sign is inverted).
    out = run(["vnstat", "--json", "d", "-i", IFACE], capture_output=True, text=True, check=True,
              env={**os.environ, "TZ": VNSTAT_TZ})
    days = json.loads(out.stdout)["interfaces"][0]["traffic"]["day"]
    first = (start.year, start.month, start.day)
    rx = tx = 0
    for day in days:
        if (day["date"]["year"], day["date"]["month"], day["date"]["day"]) >= first:
            rx += int(day["rx"])
            tx += int(day["tx"])
    return rx, tx


def traffic(now=None, run=subprocess.run):
    now = now or dt.datetime.now(dt.timezone.utc)
    start, nxt = period(now)
    rx, tx = vnstat_since(start, run)
    base = BASE_BYTES if BASE_PERIOD == start.date().isoformat() else 0
    return {
        "used": rx + tx + base, "rx": rx, "tx": tx, "base": base,
        "periodStart": start.isoformat(), "nextReset": nxt.isoformat(),
        "updated": now.isoformat(timespec="seconds"),
    }


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
            self.send(200, traffic())
        except Exception as error:  # vnstat missing, no data yet, ...
            self.send(500, {"error": str(error)[:200]})

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    if not TOKEN:
        raise SystemExit("VMISS_TOKEN is required")
    ThreadingHTTPServer(("", PORT), Handler).serve_forever()
