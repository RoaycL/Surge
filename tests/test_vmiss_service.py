"""Billing-period math and vnstat parsing of Service/vmiss-traffic/server.py."""
import datetime as dt
import importlib.util
import json
import os
import unittest
from pathlib import Path

os.environ.update(VMISS_TOKEN="t", VMISS_RESET_DAY="23", VMISS_UTC_OFFSET="-5",
                  VMISS_BASE_BYTES="100", VMISS_BASE_PERIOD="2026-10-23")
spec = importlib.util.spec_from_file_location("vmiss_server", Path(__file__).parents[1] / "Service/vmiss-traffic/server.py")
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


def day(y, m, d, rx, tx):
    return {"date": {"year": y, "month": m, "day": d}, "rx": rx, "tx": tx}


class Fake:
    def __init__(self, days):
        self.calls = []
        self.stdout = json.dumps({"interfaces": [{"traffic": {"day": days}}]})

    def __call__(self, argv, **kwargs):
        self.calls.append((argv, kwargs["env"]["TZ"]))
        return self


def at(text):
    return dt.datetime.fromisoformat(text)


class PeriodTest(unittest.TestCase):
    def test_reset_is_23rd_midnight_utc_minus_5(self):
        self.assertEqual(server.VNSTAT_TZ, "Etc/GMT+5")
        start, nxt = server.period(at("2026-11-23T04:59:59+00:00"))
        self.assertEqual((start.isoformat(), nxt.isoformat()), ("2026-10-23T00:00:00-05:00", "2026-11-23T00:00:00-05:00"))
        start, nxt = server.period(at("2026-11-23T05:00:00+00:00"))
        self.assertEqual((start.isoformat(), nxt.isoformat()), ("2026-11-23T00:00:00-05:00", "2026-12-23T00:00:00-05:00"))

    def test_year_boundaries(self):
        self.assertEqual(server.period(at("2027-01-10T00:00:00+00:00"))[0].isoformat(), "2026-12-23T00:00:00-05:00")
        self.assertEqual(server.period(at("2026-12-30T00:00:00+00:00"))[1].isoformat(), "2027-01-23T00:00:00-05:00")


class TrafficTest(unittest.TestCase):
    days = [day(2026, 10, 22, 1000, 1000), day(2026, 10, 23, 5, 7), day(2026, 11, 22, 1, 1), day(2026, 11, 23, 2, 3)]

    def test_sums_days_of_current_period_plus_base(self):
        fake = Fake(self.days[:3])
        result = server.traffic(at("2026-11-20T00:00:00+00:00"), fake)
        self.assertEqual((result["rx"], result["tx"], result["base"], result["used"]), (6, 8, 100, 114))
        self.assertEqual(fake.calls[0][1], "Etc/GMT+5", "vnstat is read in VMISS time")

    def test_base_only_applies_to_its_own_period(self):
        result = server.traffic(at("2026-11-24T00:00:00+00:00"), Fake(self.days))
        self.assertEqual((result["used"], result["base"]), (5, 0))


if __name__ == "__main__":
    unittest.main()
