'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle, XCircle, Clock, Bell, Loader2 } from 'lucide-react';

const API = 'https://rojgarresult-production.up.railway.app';
const SUPABASE_URL = 'https://urfzljcwduycxywyzlnt.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g';

export default function AdminTelegramPage() {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');
  const [botStatus, setBotStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Test bot connection
    fetch(`${API}/api/v1/telegram/test`)
      .then(r => r.json())
      .then(setBotStatus)
      .catch(() => setBotStatus({ ok: false, error: 'Cannot reach Railway backend' }));

    // Load telegram logs from Supabase
    fetch(`${SUPABASE_URL}/telegram_logs?select=id,sent_at,status,error_message,posts(title)&order=sent_at.desc&limit=20`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } })
      .then(r => r.json())
      .then(setLogs)
      .catch(() => {});
  }, []);

  const send = async () => {
    if (!msg.trim()) return;
    setSending(true); setResult('');
    try {
      const res = await fetch(`${API}/api/v1/telegram/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: msg }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult('✅ Message sent to @rojgarschool!');
        setMsg('');
      } else {
        setResult(`❌ Failed: ${data.detail || 'Unknown error'}`);
      }
    } catch (e) {
      setResult('❌ Cannot reach Railway backend. Check if it is running.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Crimson Pro, serif', fontSize:26, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>Telegram</h1>
        <p style={{ fontSize:14, color:'var(--text-muted)' }}>Send alerts to @rojgarschool channel</p>
      </div>

      {/* Bot status */}
      <div className="card" style={{ padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
        {botStatus === null ? (
          <><Loader2 size={16} style={{ animation:'spin 1s linear infinite', color:'var(--text-muted)' }} /><span style={{ fontSize:13, color:'var(--text-muted)' }}>Checking bot connection...</span></>
        ) : botStatus.ok ? (
          <><CheckCircle size={16} style={{ color:'#16a34a' }} /><span style={{ fontSize:13, color:'#15803d', fontWeight:600 }}>Bot connected: @{botStatus.bot} → {botStatus.channel}</span></>
        ) : (
          <><XCircle size={16} style={{ color:'#dc2626' }} /><span style={{ fontSize:13, color:'#dc2626' }}>Bot not configured: {botStatus.error} — Add TELEGRAM_BOT_TOKEN in Railway Variables</span></>
        )}
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>

      <div style={{ display:'grid', gap:20 }} className="lg:grid-cols-[1fr_380px]">
        {/* Logs */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', background:'var(--bg-subtle)' }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>Recent Messages</h2>
          </div>
          {logs.length === 0 ? (
            <div style={{ padding:'30px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>No messages sent yet</div>
          ) : logs.map((log, i) => (
            <div key={log.id} style={{ padding:'12px 18px', borderBottom: i < logs.length-1 ? '1px solid var(--border)' : 'none', display:'flex', alignItems:'flex-start', gap:10 }}>
              {log.status === 'sent'
                ? <CheckCircle size={14} style={{ color:'#16a34a', marginTop:2 }} />
                : <XCircle size={14} style={{ color:'#dc2626', marginTop:2 }} />}
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)', marginBottom:3 }}>
                  {log.posts?.title || 'Manual message'}
                </p>
                <div style={{ display:'flex', gap:10 }}>
                  <span style={{ fontSize:11, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:3 }}>
                    <Clock size={10} /> {new Date(log.sent_at).toLocaleString('en-IN')}
                  </span>
                  {log.error_message && <span style={{ fontSize:11, color:'#dc2626' }}>{log.error_message}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Send message */}
        <div className="card" style={{ padding:18 }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:4, display:'flex', alignItems:'center', gap:8 }}>
            <Bell size={14} style={{ color:'#229ED9' }} /> Send Custom Alert
          </h2>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>Supports *bold*, _italic_, and [links](url)</p>

          {result && (
            <div style={{ padding:'10px 12px', background: result.startsWith('✅') ? '#dcfce7' : '#fee2e2', border:`1px solid ${result.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`, borderRadius:8, fontSize:13, color: result.startsWith('✅') ? '#15803d' : '#dc2626', marginBottom:12 }}>
              {result}
            </div>
          )}

          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={10}
            placeholder={`*New Job Alert!* 💼\n\nSSC CGL 2025 — 17727 Posts\n\n📅 Last Date: 07 Jul 2025\n\n🌐 [Full Details](https://rojgarresult.vercel.app/jobs/ssc-cgl-2025)\n\n#RojgarSchool #GovtJobs #SSC`}
            style={{ width:'100%', padding:12, borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-subtle)', color:'var(--text-primary)', fontSize:13, fontFamily:'monospace', resize:'vertical', outline:'none', boxSizing:'border-box' }} />

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10 }}>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{msg.length} chars</span>
            <button onClick={send} disabled={sending || !msg.trim()}
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:9, fontSize:14, fontWeight:600, background: sending ? '#ccc' : '#229ED9', color:'white', border:'none', cursor: sending || !msg.trim() ? 'not-allowed' : 'pointer' }}>
              {sending ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Sending...</> : <><Send size={14} /> Send to Channel</>}
            </button>
          </div>

          <div style={{ marginTop:14, padding:12, background:'var(--bg-subtle)', borderRadius:8 }}>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:6 }}>Quick templates:</p>
            {['💼 New Job Alert!','📊 Result Declared!','🎫 Admit Card Out!','🔑 Answer Key Released!'].map(t => (
              <button key={t} onClick={() => setMsg(`*${t}*\n\n`)}
                style={{ display:'inline-block', margin:'3px', padding:'4px 10px', borderRadius:6, fontSize:11, background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-secondary)', cursor:'pointer' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
