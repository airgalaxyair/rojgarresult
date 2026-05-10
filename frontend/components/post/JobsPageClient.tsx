'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ChevronRight, Loader2 } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import { CATEGORIES, DEPARTMENTS } from '@/lib/mock-data';
import { normalizeAll } from '@/lib/db';

const URL = 'https://urfzljcwduycxywyzlnt.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g';
const SEL = 'id,slug,title,post_type,status,total_vacancies,application_end,exam_date,is_featured,is_trending,view_count,published_at,departments(id,name,slug,official_site),categories(id,name,slug,color)';

export default function JobsPageClient() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDept, setActiveDept] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let q = `${URL}/posts?select=${SEL}&status=eq.published&post_type=eq.job&order=published_at.desc&limit=50`;
    fetch(q, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } })
      .then(r => r.json())
      .then(data => { setPosts(normalizeAll(data)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => {
    if (activeCategory && p.category?.slug !== activeCategory) return false;
    if (activeDept && p.department?.slug !== activeDept) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav style={{ marginBottom:16, fontSize:13, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
        <Link href="/" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Home</Link>
        <ChevronRight size={12} />
        <span style={{ color:'var(--text-primary)', fontWeight:500 }}>Government Jobs</span>
      </nav>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontFamily:'Crimson Pro, serif', fontSize:28, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>Latest Government Jobs 2025</h1>
          <p style={{ fontSize:14, color:'var(--text-secondary)' }}>{filtered.length} notifications from official sources</p>
        </div>
        {(activeCategory || activeDept) && (
          <button onClick={() => { setActiveCategory(null); setActiveDept(null); }}
            style={{ padding:'8px 14px', borderRadius:8, fontSize:13, fontWeight:500, background:'var(--accent-light)', border:'1px solid var(--accent)', color:'var(--accent)', cursor:'pointer' }}>
            Clear filters
          </button>
        )}
      </div>

      <div style={{ display:'grid', gap:24 }} className="lg:grid-cols-[220px_1fr]">
        <aside>
          <div className="card" style={{ padding:16, marginBottom:14 }}>
            <h3 style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>Categories</h3>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                style={{ display:'block', width:'100%', padding:'7px 10px', borderRadius:7, fontSize:13, color: activeCategory === cat.slug ? 'var(--accent)' : 'var(--text-secondary)', background: activeCategory === cat.slug ? 'var(--accent-light)' : 'transparent', border:'none', cursor:'pointer', textAlign:'left', fontWeight: activeCategory === cat.slug ? 600 : 400 }}>
                {cat.name}
              </button>
            ))}
          </div>
          <div className="card" style={{ padding:16 }}>
            <h3 style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>Departments</h3>
            {DEPARTMENTS.map(dept => (
              <button key={dept.id} onClick={() => setActiveDept(activeDept === dept.slug ? null : dept.slug)}
                style={{ display:'block', width:'100%', padding:'7px 10px', borderRadius:7, fontSize:13, color: activeDept === dept.slug ? 'var(--accent)' : 'var(--text-secondary)', background: activeDept === dept.slug ? 'var(--accent-light)' : 'transparent', border:'none', cursor:'pointer', textAlign:'left', fontWeight: activeDept === dept.slug ? 600 : 400 }}>
                {dept.name}
              </button>
            ))}
          </div>
        </aside>

        <div>
          {loading ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
              <Loader2 size={28} style={{ margin:'0 auto 10px', animation:'spin 1s linear infinite' }} />
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              <p>Loading jobs...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div style={{ display:'grid', gap:12 }}>
              {filtered.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
              <p style={{ fontSize:16 }}>No jobs found. <Link href="/admin/posts/new" style={{ color:'var(--accent)' }}>Add the first post →</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
