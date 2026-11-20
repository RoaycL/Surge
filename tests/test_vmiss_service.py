"""Billing-period math and vnstat parsing of Service/vmiss-traffic/server.py."""
import datetime as dt
import importlib.util
import json
import os
import unittest
from pathlib import Path

os.environ.update(VMISS_TOKEN="t", VMISS_RESET_DAY="23", VMISS_UTC_OFFSET="-5",
                  VMISS_BASE_BYTES="100", VMISS_BASE_AT="2026-11-20T03:26:39+00:00")
spec = importlib.util.spec_from_file_location("vmiss_server", Path(__file__).parents[1] / "Service/vmiss-traffic/server.py")
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


def at(text):
    return dt.datetime.fromisoformat(text)


def hour(iso, rx, tx):
    return {"timestamp": int(at(iso).timestamp()), "rx": rx, "tx": tx}


class Fake:
    def __init__(self, hours):
        self.calls = []
        self.stdout = json.dumps({"interfaces": [{"traffic": {"hour": hours}}]})

    def __call__(self, argv, **kwargs):
        self.calls.append(argv)
        return self


def iso(pair):
    return tuple(x.isoformat() for x in pair)


class PeriodTest(unittest.TestCase):
    def test_default_is_23rd_midnight_utc_minus_5(self):
        self.assertEqual(iso(server.period(at("2026-11-23T04:59:59+00:00"))),
                         ("2026-10-23T00:00:00-05:00", "2026-11-23T00:00:00-05:00"))
        self.assertEqual(iso(server.period(at("2026-11-23T05:00:00+00:00"))),
                         ("2026-11-23T00:00:00-05:00", "2026-12-23T00:00:00-05:00"))

    def test_any_reset_day_and_zone(self):
        self.assertEqual(iso(server.period(at("2026-11-20T00:00:00+00:00"), 1, 8)),
                         ("2026-11-01T00:00:00+08:00", "2026-12-01T00:00:00+08:00"))
        self.assertEqual(iso(server.period(at("2027-01-10T00:00:00+00:00"), 23, -5))[0], "2026-12-23T00:00:00-05:00")

    def test_day_missing_from_month_means_month_end(self):
        self.assertEqual(iso(server.period(at("2027-02-15T00:00:00+00:00"), 31, 0)),
                         ("2027-01-31T00:00:00+00:00", "2027-02-28T00:00:00+00:00"))
        self.assertEqual(iso(server.period(at("2027-03-01T00:00:00+00:00"), 31, 0)),
                         ("2027-02-28T00:00:00+00:00", "2027-03-31T00:00:00+00:00"))

    def test_query_validation(self):
        self.assertEqual(server.parse_params(""), (23, -5))
        self.assertEqual(server.parse_params("reset_day=1&utc_offset=8"), (1, 8))
        for bad in ["reset_day=0", "reset_day=32", "utc_offset=15", "utc_offset=5.5", "reset_day=x"]:
            with self.assertRaises(ValueError, msg=bad):
                server.parse_params(bad)


class TrafficTest(unittest.TestCase):
    hours = [hour("2026-10-23T04:00:00+00:00", 1000, 1000),   # 23:00 UTC-5 on the 22nd: previous period
             hour("2026-10-23T05:00:00+00:00", 5, 7),         # first hour of the period
             hour("2026-11-23T04:00:00+00:00", 1, 1),         # last hour of the period
             hour("2026-11-23T05:00:00+00:00", 2, 3)]         # next period

    def test_sums_hours_of_current_period_plus_base(self):
        fake = Fake(self.hours[:3])
        result = server.traffic(at("2026-11-23T04:30:00+00:00"), fake)
        self.assertEqual((result["rx"], result["tx"], result["base"], result["used"]), (6, 8, 100, 114))
        self.assertEqual(fake.calls[0][:4], ["vnstat", "--json", "h", "0"])

    def test_base_only_applies_to_the_period_it_was_measured_in(self):
        result = server.traffic(at("2026-11-24T00:00:00+00:00"), Fake(self.hours))
        self.assertEqual((result["used"], result["base"]), (5, 0))

    def test_other_zone_cuts_at_its_own_midnight(self):
        # UTC-4 midnight is 04:00 UTC: the 04:00 hour opens the period and the
        # Nov 23 04:00 hour already belongs to the next one.
        result = server.traffic(at("2026-11-20T00:00:00+00:00"), Fake(self.hours), reset_day=23, utc_offset=-4)
        self.assertEqual(result["used"], 1000 + 1000 + 5 + 7 + 100)


if __name__ == "__main__":
    unittest.main()
