'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, ThumbsUp, ThumbsDown, RefreshCw, Send, TrendingUp, Globe, AlertCircle, Plus } from 'lucide-react';
import { adminGetStats, adminGetPosts, adminApprovePost, adminRejectPost, sendTelegramAlert } from '@/lib/admin-db';
import { timeAgo } from '@/lib/utils';
import { POST_TYPE_BADGE, POST_TYPE_LABELS } from '@/lib/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const [s, p, r] = await Promise.all([
      adminGetStats(),
      adminGetPosts({ status: 'pending_approval', limit: 10 }),
      adminGetPosts({ status: 'published', limit: 8 }),
    ]);
    setStats(s);
    setPending(p.posts);
    setRecent(r.posts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (post: any) => {
    setActionId(post.id);
    const ok = await adminApprovePost(post.id);
    if (ok) {
      // Send Telegram
      await sendTelegramAlert(post.id, post.title, post.slug, post.source_url || '');
      await load();
    }
    setActionId(null);
  };

  const reject = async (id: number) => {
    setActionId(id);
    await adminRejectPost(id);
    await load();
    setActionId(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Live data from Supabase</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <Link href="/admin/posts/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: 'var(--accent)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            <Plus size={13} /> New Post
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }} className="sm:grid-cols-4">
          {[
            { label: 'Total Posts', value: stats.total, icon: FileText, color: 'var(--info)' },
            { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'var(--warning)', href: '/admin/posts?status=pending_approval' },
            { label: 'Published', value: stats.published, icon: CheckCircle, color: 'var(--success)' },
            { label: 'Third-Party', value: stats.third_party, icon: Globe, color: '#7c3aed' },
          ].map(({ label, value, icon: Icon, color, href }) => (
            <div key={label} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} style={{ color }} />
                </div>
              </div>
              {href && <Link href={href} style={{ fontSize: 12, color, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>View →</Link>}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gap: 20 }} className="lg:grid-cols-[1fr_320px]">
        {/* Pending Approvals */}
        <div>
          <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={14} style={{ color: 'var(--warning)' }} />
                Pending Approval ({stats?.pending || 0})
              </h2>
              <Link href="/admin/posts?status=pending_approval" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all</Link>
            </div>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
            ) : pending.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No pending posts 🎉</div>
            ) : (
              <div>
                {pending.map((post, i) => (
                  <div key={post.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 18px', borderBottom: i < pending.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }} className="line-clamp-2">{post.title}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className={`badge ${POST_TYPE_BADGE[post.post_type as keyof typeof POST_TYPE_BADGE] || 'badge-job'}`}>{POST_TYPE_LABELS[post.post_type as keyof typeof POST_TYPE_LABELS] || post.post_type}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{post.departments?.name || '—'}</span>
                        <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>THIRD-PARTY</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(post.created_at)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {post.source_url && (
                        <a href={post.source_url} target="_blank" rel="noopener noreferrer"
                          style={{ padding: '5px 8px', borderRadius: 6, fontSize: 11, background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)', textDecoration: 'none' }}>
                          View
                        </a>
                      )}
                      <button disabled={actionId === post.id} onClick={() => approve(post)}
                        style={{ padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#dcfce7', color: '#15803d', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ThumbsUp size={11} /> Approve
                      </button>
                      <button disabled={actionId === post.id} onClick={() => reject(post.id)}
                        style={{ padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ThumbsDown size={11} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Published */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Recently Published</h2>
              <Link href="/admin/posts?status=published" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all</Link>
            </div>
            {recent.map((post, i) => (
              <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span className={`badge ${POST_TYPE_BADGE[post.post_type as keyof typeof POST_TYPE_BADGE] || 'badge-job'}`}>{POST_TYPE_LABELS[post.post_type as keyof typeof POST_TYPE_LABELS] || post.post_type}</span>
                <p style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.3 }} className="line-clamp-1">{post.title}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(post.created_at)}</span>
                  <Link href={`/admin/posts/${post.id}`} style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Edit</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Scraper status */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Scraper Batches</h2>
            </div>
            <div style={{ padding: '12px 18px' }}>
              {[
                { name: 'Batch 1 — SSC/UPSC/IBPS', schedule: 'Every 2h' },
                { name: 'Batch 2 — SBI/RBI/NABARD', schedule: 'Every 2h' },
                { name: 'Batch 3 — DRDO/ISRO/NTPC', schedule: 'Every 2h' },
                { name: 'Batch 4 — KVS/NVS/AIIMS', schedule: 'Every 4h' },
                { name: 'Batch 5 — SarkariResult etc', schedule: 'Every 6h' },
                { name: 'Batch 6 — FreeJobAlert etc', schedule: 'Every 6h' },
              ].map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.schedule}</span>
                </div>
              ))}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                Running via cron-job.org → Supabase Edge Function
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Database Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Official posts', value: stats?.official || 0, color: 'var(--success)' },
                { label: 'Third-party (pending)', value: stats?.pending || 0, color: 'var(--warning)' },
                { label: 'Total published', value: stats?.published || 0, color: 'var(--accent)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
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
