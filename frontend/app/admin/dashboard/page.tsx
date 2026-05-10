'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText, RefreshCw, Send, TrendingUp, Clock, CheckCircle,
  AlertCircle, Plus, Eye, ThumbsUp, ThumbsDown, Zap,
} from 'lucide-react';
import { MOCK_POSTS } from '@/lib/mock-data';
import { timeAgo, formatVacancies } from '@/lib/utils';
import { POST_TYPE_BADGE, POST_TYPE_LABELS } from '@/lib/types';

const SCRAPER_STATUS = [
  { name: 'SSC', site: 'ssc.nic.in', status: 'ok', last: '2h ago', found: 3 },
  { name: 'UPSC', site: 'upsc.gov.in', status: 'ok', last: '2h ago', found: 1 },
  { name: 'IBPS', site: 'ibps.in', status: 'ok', last: '4h ago', found: 2 },
  { name: 'RRB', site: 'indianrailways.gov.in', status: 'warning', last: '6h ago', found: 0 },
  { name: 'SBI', site: 'sbi.co.in', status: 'ok', last: '4h ago', found: 1 },
  { name: 'DRDO', site: 'drdo.gov.in', status: 'error', last: '12h ago', found: 0 },
];

const PENDING = MOCK_POSTS.slice(0, 3).map((p) => ({ ...p, status: 'pending_approval' }));

export default function AdminDashboard() {
  const [runningScrapers, setRunningScrapers] = useState<string[]>([]);

  const triggerScraper = (name: string) => {
    setRunningScrapers((prev) => [...prev, name]);
    setTimeout(() => {
      setRunningScrapers((prev) => prev.filter((n) => n !== name));
    }, 3000);
  };

  const stats = [
    { label: 'Total Published', value: MOCK_POSTS.length, icon: FileText, color: 'var(--info)' },
    { label: 'Pending Approval', value: 3, icon: Clock, color: 'var(--warning)', href: '/admin/posts?status=pending' },
    { label: 'Active Scrapers', value: 5, icon: RefreshCw, color: 'var(--success)' },
    { label: 'Telegram Today', value: 12, icon: Send, color: '#229ED9' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Welcome back. Here's what's happening today.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent)', color: 'white',
            padding: '10px 18px', borderRadius: 9, fontSize: 14, fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <Plus size={15} /> New Post
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 28 }}
        className="sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {label}
                </p>
                <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {value}
                </p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            {href && (
              <Link href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 12, color, fontWeight: 500, textDecoration: 'none' }}>
                View all →
              </Link>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 20 }} className="lg:grid-cols-[1fr_340px]">
        {/* Pending Approvals */}
        <div>
          <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={14} style={{ color: 'var(--warning)' }} />
                Pending Approval ({PENDING.length})
              </h2>
              <Link href="/admin/posts?status=pending" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
                View all
              </Link>
            </div>
            <div style={{ padding: '12px 18px' }}>
              {PENDING.map((post) => (
                <div
                  key={post.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 0', borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}
                      className="line-clamp-2">
                      {post.title}
                    </p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge ${POST_TYPE_BADGE[post.post_type]}`}>
                        {POST_TYPE_LABELS[post.post_type]}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {timeAgo(post.published_at)} · {post.department.name}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      style={{
                        padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                        background: '#dcfce7', color: '#15803d', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <ThumbsUp size={11} /> Approve
                    </button>
                    <button
                      style={{
                        padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                        background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <ThumbsDown size={11} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Recent Posts
              </h2>
              <Link href="/admin/posts" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
                All posts
              </Link>
            </div>
            <div>
              {MOCK_POSTS.slice(0, 5).map((post, i) => (
                <div
                  key={post.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 18px',
                    borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <span className={`badge ${POST_TYPE_BADGE[post.post_type]}`}>
                    {POST_TYPE_LABELS[post.post_type]}
                  </span>
                  <p style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.3 }}
                    className="line-clamp-1">
                    {post.title}
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Eye size={10} /> {(post.view_count || 0).toLocaleString()}
                    </span>
                    <span style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 600,
                      background: post.status === 'published' ? '#dcfce7' : '#fef9c3',
                      color: post.status === 'published' ? '#15803d' : '#a16207',
                    }}>
                      {post.status}
                    </span>
                    <Link href={`/admin/posts/${post.id}`} style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scraper Status Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={14} style={{ color: 'var(--accent)' }} />
                Scraper Health
              </h2>
              <Link href="/admin/scrapers" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
                Manage
              </Link>
            </div>
            <div style={{ padding: '8px 0' }}>
              {SCRAPER_STATUS.map((s) => {
                const isRunning = runningScrapers.includes(s.name);
                return (
                  <div
                    key={s.name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 18px',
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: isRunning ? '#f59e0b'
                        : s.status === 'ok' ? '#16a34a'
                        : s.status === 'warning' ? '#f59e0b'
                        : '#dc2626',
                      animation: isRunning ? 'pulse 1s infinite' : 'none',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {isRunning ? 'Running...' : `${s.last} · ${s.found} new`}
                      </p>
                    </div>
                    <button
                      onClick={() => triggerScraper(s.name)}
                      disabled={isRunning}
                      style={{
                        padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                        color: 'var(--text-muted)', cursor: isRunning ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <RefreshCw size={10} style={{ animation: isRunning ? 'spin 1s linear infinite' : 'none' }} />
                      Run
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick stats */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              Today's Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Posts scraped', value: '14', color: 'var(--info)' },
                { label: 'Posts published', value: '9', color: 'var(--success)' },
                { label: 'Pending review', value: '3', color: 'var(--warning)' },
                { label: 'Telegram sent', value: '12', color: '#229ED9' },
                { label: 'Page views', value: '4,820', color: 'var(--accent)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
