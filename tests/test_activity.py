import json
import tempfile
import unittest
from pathlib import Path
from ai_usage.activity import scan_activity
from ai_usage.common import ProviderError
from ai_usage.store import Store

NOW = '2026-09-09T20:00:00Z'
AT = '2026-09-09T19:30:00Z'  # September 10 in Almaty

class ActivityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def write(self, name, rows):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(''.join(json.dumps(r) + '\n' for r in rows))
        return path

    def claude(self, identity='p1', **extra):
        return dict(type='user', sessionId='secret-session', promptId=identity, timestamp=AT,
                    message={'role':'user','content':'private user prompt'}, **extra)

    def codex(self, identity='p1'):
        return {'type':'event_msg','timestamp':AT,'payload':{'type':'item_completed',
                'item':{'type':'UserMessage','id':identity,'content':[{'type':'text','text':'private user prompt'}]}}}

    def test_claude_ignores_tool_results_system_messages_subagents_and_copies(self):
        tool=self.claude('tool');tool['message']['content']=[{'type':'tool_result','content':'private tool output'}]
        notice=self.claude('notice',origin={'kind':'task-notification'})
        interrupted=self.claude('interrupt');interrupted['message']['content']='[Request interrupted by user]'
        image=self.claude('image');image['message']['content']=[{'type':'image','source':{}}]
        rows=[self.claude(),self.claude('meta',isMeta=True),self.claude('agent',isSidechain=True),
              self.claude('summary',isCompactSummary=True),tool,notice,interrupted,image]
        self.write('one.jsonl',rows);self.write('copy.jsonl',rows)
        self.write('subagents/agent.jsonl',[self.claude('hidden')])
        data=scan_activity('claude',[self.root],NOW,'Asia/Almaty')
        self.assertEqual(sum(d['prompts'] for d in data['daily']),2)
        self.assertEqual(data['daily'][-1]['date'],'2026-09-10')
        self.assertEqual(len(data['daily'][-1]['sessionIds']),1)
        self.assertNotIn('private',json.dumps(data));self.assertNotIn('secret-session',json.dumps(data))

    def test_codex_uses_user_items_once_and_ignores_subagent_sessions(self):
        meta={'type':'session_meta','payload':{'id':'session','source':'vscode'}}
        rows=[meta,self.codex(),self.codex(),{'type':'event_msg','timestamp':AT,'payload':{'type':'user_message','message':'private user prompt'}}]
        self.write('one.jsonl',rows);self.write('copy.jsonl',rows)
        self.write('agent.jsonl',[{'type':'session_meta','payload':{'id':'agent','source':{'subagent':{}}}},self.codex('agent')])
        data=scan_activity('codex',[self.root],NOW,'Asia/Almaty')
        self.assertEqual(sum(d['prompts'] for d in data['daily']),1)

    def test_legacy_codex_and_almaty_midnight(self):
        rows=[{'type':'session_meta','payload':{'id':'session','source':'cli'}},
              {'type':'event_msg','timestamp':'2026-09-09T18:59:59Z','payload':{'type':'user_message','message':'same'}},
              {'type':'event_msg','timestamp':AT,'payload':{'type':'user_message','message':'same'}}]
        self.write('old.jsonl',rows)
        data=scan_activity('codex',[self.root],NOW,'Asia/Almaty')
        self.assertEqual([d['prompts'] for d in data['daily'][-2:]],[1,1])
        self.assertEqual(data['daily'][-2]['sessionIds'],data['daily'][-1]['sessionIds'])

    def test_codex_transcript_can_span_old_and_new_formats(self):
        self.write('mixed.jsonl',[{'type':'session_meta','payload':{'id':'session','source':'cli'}},
            {'type':'event_msg','timestamp':'2026-09-09T18:00:00Z','payload':{'type':'user_message','message':'older prompt'}},
            self.codex('new')])
        data=scan_activity('codex',[self.root],NOW,'Asia/Almaty')
        self.assertEqual(sum(d['prompts'] for d in data['daily']),2)

    def test_missing_logs_not_zero_and_corrupt_record_not_silent(self):
        with self.assertRaises(ProviderError):scan_activity('claude',[self.root],NOW,'Asia/Almaty')
        path=self.write('one.jsonl',[self.claude()]);path.write_text(path.read_text()+'{"partial":')
        self.assertEqual(scan_activity('claude',[self.root],NOW,'Asia/Almaty')['daily'][-1]['prompts'],1)
        path.write_text('{bad}\n')
        with self.assertRaises(ProviderError):scan_activity('claude',[self.root],NOW,'Asia/Almaty')

    def test_activity_store_upserts_zero_and_preserves_error_age(self):
        self.write('one.jsonl',[self.claude()]);data=scan_activity('claude',[self.root],NOW,'Asia/Almaty')
        store=Store(self.root/'usage.sqlite3')
        try:
            store.success('claude','activity',data,NOW);store.success('claude','activity',data,NOW)
            store.failure('claude','activity',ProviderError('timeout'),'2026-09-10T01:00:00Z')
            p=store.snapshot(NOW,'Asia/Almaty')['providers'][0]['activity']
            self.assertEqual(p['daily'][-1]['prompts'],1);self.assertEqual(p['state']['fetchedAt'],NOW)
            self.assertEqual(p['state']['state'],'error')
            data['daily'][-1]['prompts']=0;data['daily'][-1]['sessionIds']=[]
            store.success('claude','activity',data,NOW)
            self.assertEqual(store.snapshot(NOW,'Asia/Almaty')['providers'][0]['activity']['daily'][-1]['prompts'],0)
        finally:store.close()

if __name__=='__main__':unittest.main()
