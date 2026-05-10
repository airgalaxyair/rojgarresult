'use client';

import { useState } from 'react';
import { Send, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';

const TELEGRAM_LOGS = [
  { id: 1, title: 'UPSC Civil Services 2025 Notification — 1056 Posts', channel: '@rojgarschool', sentAt: '2025-01-15 09:05', status: 'sent', messageId: 2841 },
  { id: 2, title: 'SSC CGL 2025 Recruitment — 17727 Posts', channel: '@rojgarschool', sentAt: '2025-01-15 08:45', status: 'sent', messageId: 2840 },
  { id: 3, title: 'DRDO CEPTAM 10 Result', channel: '@rojgarschool', sentAt: '2025-01-14 16:20', status: 'failed', error: 'Message too long' },
  { id: 4, title: 'IBPS PO 2025 Admit Card', channel: '@rojgarschool', sentAt: '2025-01-14 11:00', status: 'sent', messageId: 2839 },
];

export default function AdminTelegramPage() {
  const [customMsg, setCustomMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!customMsg.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setCustomMsg('');
      setTimeout(() => setSent(false), 3000);
    }, 1500);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Telegram
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Manage Telegram channel alerts and bot messages
        </p>
      </div>

      {/* Channel info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Channel', value: '@rojgarschool', sub: 'Public channel' },
          { label: 'Sent Today', value: '12', sub: 'Auto + manual' },
          { label: 'Bot', value: '@Rojgarschoolbot', sub: 'Active' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card" style={{ padding: '16px 18px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              {label}
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 20 }} className="lg:grid-cols-[1fr_380px]">
        {/* Logs */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Messages
            </h2>
          </div>
          {TELEGRAM_LOGS.map((log, i) => (
            <div
              key={log.id}
              style={{
                padding: '14px 18px',
                borderBottom: i < TELEGRAM_LOGS.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}
            >
              <div style={{ marginTop: 2 }}>
                {log.status === 'sent'
                  ? <CheckCircle size={15} style={{ color: '#16a34a' }} />
                  : <XCircle size={15} style={{ color: '#dc2626' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}
                  className="line-clamp-2">
                  {log.title}
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} /> {log.sentAt}
                  </span>
                  <span style={{ fontSize: 11, color: '#229ED9' }}>{log.channel}</span>
                  {log.messageId && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {log.messageId}</span>
                  )}
                  {log.error && (
                    <span style={{ fontSize: 11, color: '#dc2626' }}>Error: {log.error}</span>
                  )}
                </div>
              </div>
              {log.status === 'failed' && (
                <button style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: '#fff7ed', border: '1px solid #fed7aa',
                  color: 'var(--accent)', cursor: 'pointer', flexShrink: 0,
                }}>
                  Retry
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Send custom message */}
        <div className="card" style={{ padding: '18px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={14} style={{ color: '#229ED9' }} />
            Send Custom Alert
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Manually send a message to the Telegram channel. Supports Markdown.
          </p>

          <textarea
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder={`*Breaking:* UPSC CSE 2025 notification released\\n\\n📋 1056 vacancies\\n⏰ Last date: 04 Mar 2025\\n\\n[Apply Online](https://upsc.gov.in)\\n\\n#UPSC #GovtJobs #RojgarSchool`}
            rows={10}
            style={{
              width: '100%', padding: '12px', borderRadius: 9,
              border: '1px solid var(--border)', background: 'var(--bg-subtle)',
              color: 'var(--text-primary)', fontSize: 13, fontFamily: 'monospace',
              resize: 'vertical', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {customMsg.length} chars · To: @rojgarschool
            </span>
            <button
              onClick={handleSend}
              disabled={sending || !customMsg.trim()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 9, fontSize: 14, fontWeight: 600,
                background: sent ? '#16a34a' : 'var(--accent)', color: 'white',
                border: 'none', cursor: sending || !customMsg.trim() ? 'not-allowed' : 'pointer',
                opacity: !customMsg.trim() ? 0.5 : 1,
              }}
            >
              {sent ? <><CheckCircle size={14} /> Sent!</> : sending ? 'Sending...' : <><Send size={14} /> Send</>}
            </button>
          </div>

          <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-subtle)', borderRadius: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Quick templates:
            </p>
            {[
              'New Job Alert 💼',
              'Result Declared 📊',
              'Admit Card Out 🎫',
              'Answer Key Released 🔑',
            ].map((t) => (
              <button
                key={t}
                onClick={() => setCustomMsg(`🔔 *${t}*\n\n`)}
                style={{
                  display: 'inline-block', margin: '3px', padding: '4px 10px',
                  borderRadius: 6, fontSize: 11, fontWeight: 500,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
