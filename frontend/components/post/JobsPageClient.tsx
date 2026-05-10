'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ChevronRight } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import { MOCK_POSTS, CATEGORIES, DEPARTMENTS } from '@/lib/mock-data';

const ALL_JOBS = MOCK_POSTS.filter((p) => p.post_type === 'job');

export default function JobsPageClient() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDept, setActiveDept] = useState<string | null>(null);

  const filtered = ALL_JOBS.filter((p) => {
    if (activeCategory && p.category.slug !== activeCategory) return false;
    if (activeDept && p.department.slug !== activeDept) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Government Jobs</span>
      </nav>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Latest Government Jobs 2025
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {filtered.length} active notifications · All from official sources
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(activeCategory || activeDept) && (
            <button
              onClick={() => { setActiveCategory(null); setActiveDept(null); }}
              style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                background: 'var(--accent-light)', border: '1px solid var(--accent)',
                color: 'var(--accent)', cursor: 'pointer',
              }}
            >
              Clear filters
            </button>
          )}
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 500,
            background: 'var(--bg-subtle)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', cursor: 'pointer',
          }}>
            <SlidersHorizontal size={14} /> Filter
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24 }} className="lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside>
          <div className="card" style={{ padding: 16, marginBottom: 14 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                  style={{
                    padding: '7px 10px', borderRadius: 7, fontSize: 13,
                    color: activeCategory === cat.slug ? 'var(--accent)' : 'var(--text-secondary)',
                    background: activeCategory === cat.slug ? 'var(--accent-light)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontWeight: activeCategory === cat.slug ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Departments
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setActiveDept(activeDept === dept.slug ? null : dept.slug)}
                  style={{
                    padding: '7px 10px', borderRadius: 7, fontSize: 13,
                    color: activeDept === dept.slug ? 'var(--accent)' : 'var(--text-secondary)',
                    background: activeDept === dept.slug ? 'var(--accent-light)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontWeight: activeDept === dept.slug ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Job list */}
        <div>
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {filtered.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No jobs match your filters.</p>
              <button
                onClick={() => { setActiveCategory(null); setActiveDept(null); }}
                style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              {[1, 2, 3, '...', 12].map((p, i) => (
                <button key={i} style={{
                  width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
                  background: p === 1 ? 'var(--accent)' : 'var(--bg-card)',
                  color: p === 1 ? 'white' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
