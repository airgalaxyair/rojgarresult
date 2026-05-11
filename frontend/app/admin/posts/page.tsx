'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Edit3, Trash2, ThumbsUp, ThumbsDown, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { adminGetPosts, adminApprovePost, adminRejectPost, adminDeletePost, sendTelegramAlert } from '@/lib/admin-db';
import { timeAgo } from '@/lib/utils';
import { POST_TYPE_BADGE, POST_TYPE_LABELS } from '@/lib/types';

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published', color: '#15803d' },
  { label: 'Pending', value: 'pending_approval', color: '#d97706' },
  { label: 'Draft', value: 'draft', color: '#6b7280' },
];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    const { posts: p, total: t } = await adminGetPosts({
      status: filterStatus === 'all' ? undefined : filterStatus,
      post_type: filterType === 'all' ? undefined : filterType,
      page,
      limit: PER_PAGE,
    });
    // Client-side search filter
    const filtered = search ? p.filter((post: any) => post.title.toLowerCase().includes(search.toLowerCase())) : p;
    setPosts(filtered);
    setTotal(t);
    setLoading(false);
  }, [filterStatus, filterType, page, search]);

  useEffect(() => { load(); }, [load]);

  const approve = async (post: any) => {
    setActionId(post.id);
    const ok = await adminApprovePost(post.id);
    if (ok) {
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

  const del = async (id: number) => {
    if (!confirm('Delete this post permanently?')) return;
    setActionId(id);
    await adminDeletePost(id);
    await load();
    setActionId(null);
  };

  const pages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Posts</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} total in database</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
            <RefreshCw size={13} />
          </button>
          <Link href="/admin/posts/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: 'var(--accent)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            <Plus size={13} /> New Post
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: '1px solid var(--border)' }}>
        {STATUS_TABS.map(tab => (
          <button key={tab.value} onClick={() => { setFilterStatus(tab.value); setPage(1); }}
            style={{ padding: '8px 16px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: filterStatus === tab.value ? 700 : 400, background: filterStatus === tab.value ? 'var(--bg-card)' : 'transparent', border: filterStatus === tab.value ? '1px solid var(--border)' : '1px solid transparent', borderBottom: filterStatus === tab.value ? '1px solid var(--bg-card)' : '1px solid transparent', color: filterStatus === tab.value ? (tab.color || 'var(--accent)') : 'var(--text-muted)', cursor: 'pointer', marginBottom: -1 }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: 'var(--text-primary)' }} />
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
          <option value="all">All Types</option>
          <option value="job">Jobs</option>
          <option value="result">Results</option>
          <option value="admit_card">Admit Cards</option>
          <option value="answer_key">Answer Keys</option>
          <option value="syllabus">Syllabus</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Type', 'Source', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading posts...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No posts found</td></tr>
              ) : posts.map((post, i) => (
                <tr key={post.id} style={{ borderBottom: i < posts.length - 1 ? '1px solid var(--border)' : 'none', opacity: actionId === post.id ? 0.5 : 1 }}>
                  <td style={{ padding: '12px 14px', maxWidth: 320 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }} className="line-clamp-2">{post.title}</p>
                    {post.departments?.name && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{post.departments.name}</p>}
                  </td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <span className={`badge ${POST_TYPE_BADGE[post.post_type as keyof typeof POST_TYPE_BADGE] || 'badge-job'}`}>{POST_TYPE_LABELS[post.post_type as keyof typeof POST_TYPE_LABELS] || post.post_type}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, fontWeight: 600, background: post.source_type === 'official' ? '#dcfce7' : '#f3e8ff', color: post.source_type === 'official' ? '#15803d' : '#7e22ce' }}>
                      {post.source_type === 'official' ? 'Official' : '3rd Party'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, fontWeight: 600, background: post.status === 'published' ? '#dcfce7' : post.status === 'pending_approval' ? '#fef9c3' : '#f3f4f6', color: post.status === 'published' ? '#15803d' : post.status === 'pending_approval' ? '#a16207' : '#6b7280' }}>
                      {post.status === 'pending_approval' ? 'Pending' : post.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(post.created_at)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {post.source_url && (
                        <a href={post.source_url} target="_blank" rel="noopener noreferrer" title="View source"
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none' }}>
                          <ExternalLink size={11} />
                        </a>
                      )}
                      {post.status !== 'archived' && (
                        <Link href={`/jobs/${post.slug}`} target="_blank" title="View on site"
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none' }}>
                          <Eye size={11} />
                        </Link>
                      )}
                      {post.status === 'pending_approval' && (
                        <>
                          <button onClick={() => approve(post)} disabled={actionId === post.id} title="Approve + send Telegram"
                            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #bbf7d0', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', cursor: 'pointer' }}>
                            <ThumbsUp size={11} />
                          </button>
                          <button onClick={() => reject(post.id)} disabled={actionId === post.id} title="Reject"
                            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #fecaca', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', cursor: 'pointer' }}>
                            <ThumbsDown size={11} />
                          </button>
                        </>
                      )}
                      {post.status === 'draft' && (
                        <button onClick={() => approve(post)} disabled={actionId === post.id} title="Publish"
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #fed7aa', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', cursor: 'pointer' }}>
                          <CheckCircle size={11} />
                        </button>
                      )}
                      <button onClick={() => del(post.id)} disabled={actionId === post.id} title="Delete"
                        style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page} of {pages} ({total} total)</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13, opacity: page === 1 ? 0.5 : 1 }}>
              ← Prev
            </button>
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
              style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: page === pages ? 'not-allowed' : 'pointer', fontSize: 13, opacity: page === pages ? 0.5 : 1 }}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
