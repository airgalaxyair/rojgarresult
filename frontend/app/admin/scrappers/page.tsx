'use client';

import { useState } from 'react';
import { RefreshCw, Power, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';

const SCRAPERS = [
  { id: 1, name: 'SSC', site: 'ssc.nic.in', url: 'https://ssc.nic.in', interval: 120, status: 'ok', active: true, last: '2025-01-15T10:00:00Z', found: 3, new: 2, fails: 0 },
  { id: 2, name: 'UPSC', site: 'upsc.gov.in', url: 'https://upsc.gov.in', interval: 120, status: 'ok', active: true, last: '2025-01-15T10:00:00Z', found: 1, new: 1, fails: 0 },
  { id: 3, name: 'IBPS', site: 'ibps.in', url: 'https://ibps.in', interval: 120, status: 'ok', active: true, last: '2025-01-15T08:00:00Z', found: 2, new: 0, fails: 0 },
  { id: 4, name: 'RRB', site: 'indianrailways.gov.in', url: 'https://indianrailways.gov.in', interval: 240, status: 'warning', active: true, last: '2025-01-14T20:00:00Z', found: 0, new: 0, fails: 1 },
  { id: 5, name: 'SBI', site: 'sbi.co.in', url: 'https://bank.sbi', interval: 240, status: 'ok', active: true, last: '2025-01-15T08:00:00Z', found: 1, new: 1, fails: 0 },
  { id: 6, name: 'DRDO', site: 'drdo.gov.in', url: 'https://drdo.gov.in', interval: 360, status: 'error', active: true, last: '2025-01-14T06:00:00Z', found: 0, new: 0, fails: 3 },
  { id: 7, name: 'ISRO', site: 'isro.gov.in', url: 'https://isro.gov.in', interval: 360, status: 'ok', active: true, last: '2025-01-15T06:00:00Z', found: 0, new: 0, fails: 0 },
  { id: 8, name: 'NTPC', site: 'ntpc.co.in', url: 'https://ntpc.co.in', interval: 360, status: 'ok', active: false, last: '2025-01-13T12:00:00Z', found: 0, new: 0, fails: 0 },
];

const LOG_ENTRIES = [
  { id: 1, scraper: 'SSC', status: 'success', started: '2025-01-15 10:00', duration: '12s', found: 3, new: 2 },
  { id: 2, scraper: 'UPSC', status: 'success', started: '2025-01-15 10:00', duration: '8s', found: 1, new: 1 },
  { id: 3, scraper: 'DRDO', status: 'failed', started: '2025-01-14 06:00', duration: '30s', found: 0, new: 0, error: 'Connection timeout after 30s' },
  { id: 4, scraper: 'RRB', status: 'partial', started: '2025-01-14 20:00', duration: '18s', found: 0, new: 0 },
  { id: 5, scraper: 'SBI', status: 'success', started: '2025-01-15 08:00', duration: '9s', found: 1, new: 1 },
];

export default function AdminScrapersPage() {
  const [scrapers, setScrapers] = useState(SCRAPERS);
  const [running, setRunning] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'scrapers' | 'logs'>('scrapers');

  const runScraper = (id: number) => {
    setRunning((prev) => [...prev, id]);
    setTimeout(() => setRunning((prev) => prev.filter((n) => n !== id)), 4000);
  };

  const toggleScraper = (id: number) => {
    setScrapers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const statusColor = (status: string, active: boolean) => {
    if (!active) return '#9ca3af';
    if (status === 'ok') return '#16a34a';
    if (status === 'warning') return '#d97706';
    return '#dc2626';
  };

  const statusIcon = (status: string) => {
    if (status === 'ok') return <CheckCircle size={14} style={{ color: '#16a34a' }} />;
    if (status === 'warning') return <AlertCircle size={14} style={{ color: '#d97706' }} />;
    return <AlertCircle size={14} style={{ color: '#dc2626' }} />;
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Scraper Control
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Monitor and control all official source scrapers
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}
        className="sm:grid-cols-4">
        {[
          { label: 'Total Scrapers', value: scrapers.length, color: 'var(--info)' },
          { label: 'Active', value: scrapers.filter((s) => s.active).length, color: 'var(--success)' },
          { label: 'Errors', value: scrapers.filter((s) => s.status === 'error').length, color: 'var(--danger)' },
          { label: 'New Posts Today', value: scrapers.reduce((a, s) => a + s.new, 0), color: 'var(--accent)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 18px' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {label}
            </p>
            <p style={{ fontSize: 24, fontWeight: 800, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: '1px solid var(--border)' }}>
        {(['scrapers', 'logs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 18px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 600,
              background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
              border: activeTab === tab ? '1px solid var(--border)' : '1px solid transparent',
              borderBottom: activeTab === tab ? '1px solid var(--bg-card)' : '1px solid transparent',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer', textTransform: 'capitalize', marginBottom: -1,
            }}
          >
            {tab === 'scrapers' ? 'Scrapers' : 'Recent Logs'}
          </button>
        ))}
      </div>

      {activeTab === 'scrapers' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  {['Source', 'URL', 'Interval', 'Status', 'Last Run', 'Found / New', 'Actions'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scrapers.map((s, i) => {
                  const isRunning = running.includes(s.id);
                  return (
                    <tr key={s.id} style={{ borderBottom: i < scrapers.length - 1 ? '1px solid var(--border)' : 'none', opacity: s.active ? 1 : 0.5 }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(s.status, s.active), flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, color: 'var(--info)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {s.site} <ExternalLink size={10} />
                        </a>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {s.interval >= 60 ? `${s.interval / 60}h` : `${s.interval}m`}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isRunning ? (
                            <span style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>Running...</span>
                          ) : (
                            <>
                              {statusIcon(s.status)}
                              <span style={{ fontSize: 12, fontWeight: 600, color: statusColor(s.status, s.active) }}>
                                {s.active ? (s.status === 'ok' ? 'Healthy' : s.status) : 'Disabled'}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(s.last).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {s.found} / <span style={{ color: 'var(--success)', fontWeight: 600 }}>{s.new}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => runScraper(s.id)}
                            disabled={isRunning || !s.active}
                            title="Run now"
                            style={{
                              padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                              color: 'var(--text-secondary)', cursor: isRunning ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', gap: 4,
                            }}
                          >
                            <RefreshCw size={11} style={{ animation: isRunning ? 'spin 1s linear infinite' : 'none' }} />
                            Run
                          </button>
                          <button
                            onClick={() => toggleScraper(s.id)}
                            title={s.active ? 'Disable' : 'Enable'}
                            style={{
                              padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                              background: s.active ? '#fee2e2' : '#dcfce7',
                              border: s.active ? '1px solid #fecaca' : '1px solid #bbf7d0',
                              color: s.active ? '#dc2626' : '#15803d',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                            }}
                          >
                            <Power size={11} />
                            {s.active ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  {['Scraper', 'Status', 'Started', 'Duration', 'Found', 'New', 'Error'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LOG_ENTRIES.map((log, i) => (
                  <tr key={log.id} style={{ borderBottom: i < LOG_ENTRIES.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.scraper}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: 11, padding: '3px 8px', borderRadius: 999, fontWeight: 600,
                        background: log.status === 'success' ? '#dcfce7' : log.status === 'partial' ? '#fef9c3' : '#fee2e2',
                        color: log.status === 'success' ? '#15803d' : log.status === 'partial' ? '#a16207' : '#dc2626',
                      }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {log.started}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {log.duration}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{log.found}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>{log.new}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--danger)', maxWidth: 220 }}>
                      {log.error || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
