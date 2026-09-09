import asyncio
import json
import tempfile
import unittest
from datetime import datetime, timedelta
from pathlib import Path

from ai_usage.common import ProviderError, UTC, atomic_json, iso
from ai_usage.config import defaults
from ai_usage.providers import normalize_claude, normalize_codex, normalize_tokens, run_json
from ai_usage.service import collect_sources, publish
from ai_usage.store import Store, compact_history

NOW = "2026-09-07T10:00:00Z"
RESET = "2026-09-07T12:00:00Z"


def codex_fixture(used=23):
    return {"rateLimitsByLimitId": {
        "codex": {"primary": {"usedPercent": used, "windowDurationMins": 300, "resetsAt": 1788782400},
                  "secondary": {"usedPercent": 10, "windowDurationMins": 10080, "resetsAt": None}},
        "special": {"limitName": "Special", "primary": {"usedPercent": 40, "windowDurationMins": 300}},
    }}


class ProviderTests(unittest.TestCase):
    def test_reset_count_is_authoritative_and_not_paid_credits_or_detail_length(self):
        raw = codex_fixture()
        raw['rateLimitsByLimitId']['codex']['credits'] = {'balance': '999', 'hasCredits': True}
        raw['rateLimitResetCredits'] = {'availableCount': 3, 'credits': [
            {'id': 'private-credit', 'status': 'available', 'expiresAt': RESET},
            {'status': 'consumed', 'expiresAt': NOW}]}
        result = normalize_codex(raw, NOW)
        self.assertEqual(result['resetCredits'], {'availableCount': 3, 'nextExpiresAt': RESET})
        self.assertNotIn('private-credit', json.dumps(result))
        for rows in (None, [], 'invalid'):
            raw['rateLimitResetCredits']['credits'] = rows
            self.assertEqual(normalize_codex(raw, NOW)['resetCredits'], {'availableCount': 3, 'nextExpiresAt': None})

    def test_zero_and_unavailable_reset_counts_are_distinct(self):
        raw = codex_fixture()
        for credits in (None, {}, {'availableCount': None}, {'availableCount': -1},
                        {'availableCount': True}, {'availableCount': '3'}, {'availableCount': 1.5}):
            raw['rateLimitResetCredits'] = credits
            self.assertIsNone(normalize_codex(raw, NOW)['resetCredits'])
        raw['rateLimitResetCredits'] = {'availableCount': 0, 'credits': [{'status': 'available', 'expiresAt': RESET}]}
        self.assertEqual(normalize_codex(raw, NOW)['resetCredits'], {'availableCount': 0, 'nextExpiresAt': None})

    def test_multiple_codex_groups_and_legacy_not_double_counted(self):
        raw = codex_fixture()
        raw["rateLimits"] = raw["rateLimitsByLimitId"]["codex"]
        result = normalize_codex(raw, NOW)
        self.assertEqual([x["id"] for x in result["limits"]], ["codex:primary", "codex:secondary", "special:primary"])

    def test_percent_normalization_and_missing_values(self):
        raw = codex_fixture(140)
        raw["rateLimitsByLimitId"]["codex"]["secondary"]["usedPercent"] = None
        raw["rateLimitsByLimitId"]["special"]["primary"]["usedPercent"] = -2
        result = normalize_codex(raw, NOW)["limits"]
        self.assertEqual([x["usedPercent"] for x in result], [100, None, 0])
        self.assertIsNone(result[1]["resetsAt"])

    def test_null_groups_fall_back_to_legacy(self):
        self.assertEqual(normalize_codex({"rateLimitsByLimitId": None, "rateLimits": codex_fixture()["rateLimitsByLimitId"]["codex"]}, NOW)["limits"][0]["id"], "codex:primary")

    def test_empty_is_unavailable_not_zero(self):
        with self.assertRaises(ProviderError) as raised:
            normalize_codex({}, NOW)
        self.assertEqual(raised.exception.code, "unavailable")

    def test_claude_source_time_not_poll_time_and_no_identity_export(self):
        raw = [{"provider": "claude", "usage": {"updatedAt": "2026-09-07T09:00:00Z", "accountEmail": "private@example.com",
                "primary": {"usedPercent": 42, "windowMinutes": 300, "resetDescription": "Resets today"},
                "secondary": {"usedPercent": 0, "windowMinutes": 10080, "resetsAt": RESET}}}]
        result = normalize_claude(raw, NOW)
        self.assertEqual(result["fetchedAt"], "2026-09-07T09:00:00Z")
        self.assertNotIn("private", json.dumps(result))
        self.assertIsNone(result["limits"][0]["resetsAt"])
        self.assertEqual(result["limits"][1]["usedPercent"], 0)

    def test_token_total_uses_authoritative_total_including_subset_counters(self):
        raw = [{"provider": "codex", "daily": [{"date": "2026-09-07", "inputTokens": 100,
            "outputTokens": 20, "cacheReadTokens": 90, "reasoningTokens": 10, "totalTokens": 120, "totalCost": 2.3}]}]
        result = normalize_tokens(raw, "codex", NOW)
        self.assertEqual(result["daily"][0]["totalTokens"], 120)
        self.assertNotIn("totalCost", result["daily"][0])

    def test_error_messages_redacted(self):
        with self.assertRaises(ProviderError) as caught:
            normalize_claude([{"provider": "claude", "error": {"message": "login expired for private@example.com secret=sk-123"}}], NOW)
        self.assertEqual(caught.exception.code, "auth")
        self.assertNotIn("private", str(caught.exception))

    def test_bad_tokens_not_converted_to_zero(self):
        result = normalize_tokens([{"provider": "claude", "daily": [{"date": "2026-09-07", "totalTokens": None},
            {"date": "2026-09-06", "totalTokens": 0}]}], "claude", NOW)
        self.assertEqual(result["daily"], [{"date": "2026-09-06", "totalTokens": 0, "inputTokens": None,
            "outputTokens": None, "cacheReadTokens": None, "cacheCreationTokens": None}])

    def test_timeout_terminates_subprocess(self):
        import sys
        with self.assertRaises(ProviderError) as caught:
            asyncio.run(run_json([sys.executable, "-c", "import time; time.sleep(30)"], timeout=0.05))
        self.assertEqual(caught.exception.code, "timeout")


class StoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name)
        self.store = Store(self.path / "usage.sqlite3")

    def tearDown(self):
        self.store.close()
        self.temp.cleanup()

    def test_failed_source_keeps_old_values_without_rejuvenating_timestamp(self):
        data = normalize_codex(codex_fixture(), NOW)
        self.store.success("codex", "limits", data, NOW)
        self.store.failure("codex", "limits", ProviderError("auth"), "2026-09-07T11:00:00Z")
        p = self.store.snapshot("2026-09-07T11:00:00Z", "Asia/Almaty")["providers"][1]
        self.assertEqual(p["limits"][0]["usedPercent"], 23)
        self.assertEqual(p["limitsState"]["fetchedAt"], NOW)
        self.assertEqual(p["limitsState"]["state"], "error")

    def test_reset_count_sync_retains_failed_read_and_clears_new_unknown(self):
        raw = codex_fixture()
        raw['rateLimitResetCredits'] = {'availableCount': 3}
        self.store.success('codex', 'limits', normalize_codex(raw, NOW), NOW)
        self.store.failure('codex', 'limits', ProviderError('timeout'), '2026-09-07T11:00:00Z')
        p = self.store.snapshot(NOW, 'Asia/Almaty')['providers'][1]
        self.assertEqual(p['resetCredits']['availableCount'], 3)
        self.assertEqual(p['limitsState']['fetchedAt'], NOW)
        for credits in ({'availableCount': 0}, None):
            raw['rateLimitResetCredits'] = credits
            self.store.success('codex', 'limits', normalize_codex(raw, NOW), NOW)
            actual = self.store.snapshot(NOW, 'Asia/Almaty')['providers'][1]['resetCredits']
            self.assertEqual(actual, {'availableCount': 0, 'nextExpiresAt': None} if credits else None)

    def test_idempotent_daily_upsert_and_restart(self):
        data = {"daily": [{"date": "2026-09-07", "totalTokens": 100}], "fetchedAt": NOW, "source": "local"}
        self.store.success("codex", "tokens", data, NOW)
        self.store.success("codex", "tokens", data, NOW)
        data["daily"][0]["totalTokens"] = 120
        self.store.success("codex", "tokens", data, NOW)
        self.store.close(); self.store = Store(self.path / "usage.sqlite3")
        daily = self.store.snapshot(NOW, "Asia/Almaty")["providers"][1]["tokens"]["daily"]
        self.assertEqual(daily, [{"date": "2026-09-07", "totalTokens": 120}])

    def test_quota_reset_and_gap_break_chart(self):
        rows = [dict(at="2026-09-07T09:00:00Z", used=20, reset_at=RESET),
                dict(at="2026-09-07T09:05:00Z", used=25, reset_at=RESET),
                dict(at="2026-09-07T09:30:00Z", used=27, reset_at=RESET),
                dict(at="2026-09-07T09:35:00Z", used=1, reset_at="2026-09-07T14:00:00Z")]
        self.assertEqual([p["breakBefore"] for p in compact_history(rows, NOW)], [True, False, True, True])

    def test_compaction_keeps_extrema_and_does_not_create_false_gaps(self):
        start = datetime(2026, 9, 1, tzinfo=UTC)
        rows = [dict(at=iso(start + timedelta(minutes=5 * i)), used=i, reset_at=RESET) for i in range(12)]
        result = compact_history(rows, NOW)
        self.assertEqual([x["usedPercent"] for x in result], [0, 11])
        self.assertEqual([x["breakBefore"] for x in result], [True, False])

    def test_ninety_day_retention(self):
        self.store.success("codex", "limits", normalize_codex(codex_fixture(), "2026-01-01T00:00:00Z"), NOW)
        self.store.prune(NOW)
        self.assertEqual(self.store.db.execute("SELECT COUNT(*) FROM quota_points").fetchone()[0], 0)

    def test_provider_failure_does_not_block_other_provider(self):
        async def good(at): return normalize_codex(codex_fixture(), at)
        async def bad(at): raise ProviderError("auth")
        result = asyncio.run(collect_sources(defaults(self.path), self.store, fetchers={
            ("codex", "limits"): good, ("claude", "limits"): bad}, clock=lambda: NOW))
        self.assertFalse(result)
        providers = self.store.snapshot(NOW, "Asia/Almaty")["providers"]
        self.assertEqual(providers[0]["limitsState"]["state"], "error")
        self.assertEqual(providers[1]["limitsState"]["state"], "ok")

    def test_absent_icloud_keeps_local_snapshot_without_creating_container(self):
        cloud = self.path / "nonexistent-icloud"
        result = publish(self.store.snapshot(NOW, "Asia/Almaty"), self.path, cloud)
        self.assertEqual(result["state"], "waiting_for_icloud")
        self.assertFalse(cloud.exists())
        self.assertTrue((self.path / "snapshot.json").exists())

    def test_atomic_publish_no_temporary_artifacts(self):
        cloud = self.path / "cloud"; cloud.mkdir()
        snapshot = self.store.snapshot(NOW, "Asia/Almaty")
        publish(snapshot, self.path, cloud)
        self.assertEqual(json.loads((cloud / "AI Usage/snapshot.json").read_text()), snapshot)
        self.assertEqual([p.name for p in (cloud / "AI Usage").iterdir()], ["snapshot.json"])


if __name__ == "__main__":
    unittest.main()
