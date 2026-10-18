import unittest
from datetime import datetime, timedelta, timezone

from ai_usage.forecast import current_run, forecast, same_reset
from ai_usage.store import compact_history

T0 = datetime(2026, 10, 1, 10, 0, tzinfo=timezone.utc)


def at(minutes):
    return (T0 + timedelta(minutes=minutes)).isoformat().replace("+00:00", "Z")


def rows(points, reset=300):
    return [{"at": at(m), "used": u, "reset_at": at(reset)} for m, u in points]


class ForecastTest(unittest.TestCase):
    def test_runs_out_before_reset_at_recent_pace(self):
        history = rows([(0, 10), (20, 20), (40, 30), (60, 40)])        # +30 points per hour
        pace = forecast(history, {"resetsAt": at(300), "usedPercent": 40}, at(60))
        self.assertEqual(pace["atResetPercent"], 100)
        self.assertEqual(pace["exhaustsAt"], at(180))                 # 60 points left at 30/h -> 2 h
        self.assertEqual(pace["ratePerHour"], 30.0)

    def test_far_run_out_is_not_called(self):
        weekly = rows([(0, 10), (30, 11), (60, 12)], reset=7 * 1440)     # 2 points/h, runs out in 44 h
        self.assertIsNone(forecast(weekly, {"resetsAt": at(7 * 1440), "usedPercent": 12}, at(60)))

    def test_enough_until_reset(self):
        history = rows([(0, 10), (30, 11), (60, 12)])
        pace = forecast(history, {"resetsAt": at(300), "usedPercent": 12}, at(60))
        self.assertIsNone(pace["exhaustsAt"])
        self.assertEqual(pace["atResetPercent"], 20)

    def test_idle_keeps_current_value(self):
        pace = forecast(rows([(0, 50), (60, 50)]), {"resetsAt": at(300), "usedPercent": 50}, at(60))
        self.assertEqual(pace["atResetPercent"], 50)
        self.assertEqual(pace["ratePerHour"], 0.0)

    def test_says_nothing_without_enough_data(self):
        window = {"resetsAt": at(300), "usedPercent": 40}
        self.assertIsNone(forecast(rows([(55, 39), (60, 40)]), window, at(60)))   # 5 minutes only
        self.assertIsNone(forecast([], window, at(60)))
        self.assertIsNone(forecast(rows([(0, 10), (60, 40)]), {**window, "resetsAt": at(30)}, at(60)))
        self.assertIsNone(forecast(rows([(0, 10), (60, 40)]), {**window, "usedPercent": None}, at(60)))

    def test_previous_window_and_gaps_are_not_mixed_in(self):
        old = [{"at": at(m), "used": u, "reset_at": at(0)} for m, u in [(-60, 90), (-30, 95)]]
        history = old + rows([(10, 5), (40, 6), (60, 7)])
        self.assertEqual([round(u) for _, u in current_run(history, at(300))], [5, 6, 7])
        drop = rows([(0, 80), (20, 2), (40, 3), (60, 4)])                      # reset credit used mid-window
        self.assertEqual([round(u) for _, u in current_run(drop, at(300))], [2, 3, 4])
        gap = rows([(0, 10), (100, 30), (130, 31)])
        self.assertEqual(len(current_run(gap, at(300))), 2)

    def test_reset_jitter_is_one_window(self):
        self.assertTrue(same_reset(at(300), at(301)))
        self.assertFalse(same_reset(at(300), at(320)))
        jittery = [{"at": at(m), "used": u, "reset_at": at(300 + (m // 20) % 2)} for m, u in [(0, 10), (20, 20), (40, 30), (60, 40)]]
        self.assertEqual(len(current_run(jittery, at(300))), 4)
        every5 = [{"at": at(m), "used": m / 2, "reset_at": at(300 + (m // 5) % 2)} for m in range(0, 61, 5)]
        points = compact_history(every5, at(60))
        self.assertEqual(sum(p["breakBefore"] for p in points), 1)               # no false chart breaks


if __name__ == "__main__":
    unittest.main()
