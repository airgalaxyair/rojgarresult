'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Filter, Eye, Edit3, Trash2,
  ThumbsUp, ThumbsDown, Send, CheckCircle,
} from 'lucide-react';
import { MOCK_POSTS } from '@/lib/mock-data';
import { POST_TYPE_BADGE, POST_TYPE_LABELS } from '@/lib/types';
import { timeAgo, formatDate } from '@/lib/utils';

type FilterStatus = 'all' | 'published' | 'pending_approval' | 'draft';

export default function AdminPostsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = MOCK_POSTS.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterType !== 'all' && p.post_type !== filterType) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const STATUS_TABS: { label: string; value: FilterStatus; color?: string }[] = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published', color: '#15803d' },
    { label: 'Pending', value: 'pending_approval', color: '#d97706' },
    { label: 'Draft', value: 'draft', color: '#6b7280' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
          Posts
        </h1>
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

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            style={{
              padding: '8px 16px', borderRadius: '8px 8px 0 0', fontSize: 13,
              background: filterStatus === tab.value ? 'var(--bg-card)' : 'transparent',
              border: filterStatus === tab.value ? '1px solid var(--border)' : '1px solid transparent',
              borderBottom: filterStatus === tab.value ? '1px solid var(--bg-card)' : '1px solid transparent',
              color: filterStatus === tab.value ? (tab.color || 'var(--accent)') : 'var(--text-muted)',
              cursor: 'pointer',
              marginBottom: -1,
              fontWeight: filterStatus === tab.value ? 700 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 9, padding: '8px 12px',
        }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 9, border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
          }}
        >
          <option value="all">All Types</option>
          <option value="job">Jobs</option>
          <option value="result">Results</option>
          <option value="admit_card">Admit Cards</option>
          <option value="answer_key">Answer Keys</option>
          <option value="syllabus">Syllabus</option>
        </select>
      </div>

      {/* Posts table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Type', 'Department', 'Status', 'Views', 'Date', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post, i) => (
                <tr
                  key={post.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <td style={{ padding: '12px 14px', maxWidth: 320 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}
                      className="line-clamp-2">
                      {post.title}
                    </p>
                    {post.total_vacancies && (
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {post.total_vacancies.toLocaleString()} vacancies
                      </p>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <span className={`badge ${POST_TYPE_BADGE[post.post_type]}`}>
                      {POST_TYPE_LABELS[post.post_type]}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {post.department.name}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      fontSize: 11, padding: '3px 8px', borderRadius: 999, fontWeight: 600,
                      background: post.status === 'published' ? '#dcfce7'
                        : post.status === 'pending_approval' ? '#fef9c3'
                        : '#f3f4f6',
                      color: post.status === 'published' ? '#15803d'
                        : post.status === 'pending_approval' ? '#a16207'
                        : '#6b7280',
                    }}>
                      {post.status === 'pending_approval' ? 'Pending' : post.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {(post.view_count || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {timeAgo(post.published_at)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link
                        href={`/jobs/${post.slug}`}
                        target="_blank"
                        title="View"
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-muted)', textDecoration: 'none',
                        }}
                      >
                        <Eye size={12} />
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        title="Edit"
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-muted)', textDecoration: 'none',
                        }}
                      >
                        <Edit3 size={12} />
                      </Link>
                      {post.status === 'pending_approval' && (
                        <>
                          <button title="Approve" style={{
                            width: 28, height: 28, borderRadius: 6, border: '1px solid #bbf7d0',
                            background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#15803d', cursor: 'pointer',
                          }}>
                            <ThumbsUp size={11} />
                          </button>
                          <button title="Reject" style={{
                            width: 28, height: 28, borderRadius: 6, border: '1px solid #fecaca',
                            background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#dc2626', cursor: 'pointer',
                          }}>
                            <ThumbsDown size={11} />
                          </button>
                        </>
                      )}
                      {post.status === 'draft' && (
                        <button title="Publish" style={{
                          width: 28, height: 28, borderRadius: 6, border: '1px solid #fed7aa',
                          background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--accent)', cursor: 'pointer',
                        }}>
                          <CheckCircle size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No posts match your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {MOCK_POSTS.length} posts
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3].map((p) => (
            <button key={p} style={{
              width: 32, height: 32, borderRadius: 7, border: '1px solid var(--border)',
              background: p === 1 ? 'var(--accent)' : 'var(--bg-card)',
              color: p === 1 ? 'white' : 'var(--text-secondary)',
              fontSize: 13, cursor: 'pointer',
            }}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
