'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import { normalizeAll } from '@/lib/db';

const URL = 'https://urfzljcwduycxywyzlnt.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g';
const SEL = 'id,slug,title,post_type,status,total_vacancies,application_end,published_at,departments(id,name,slug,official_site),categories(id,name,slug,color)';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const q = encodeURIComponent(query);
    fetch(`${URL}/posts?select=${SEL}&status=eq.published&or=(title.ilike.*${q}*,description.ilike.*${q}*)&order=published_at.desc&limit=30`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } })
      .then(r => r.json())
      .then(data => { setResults(normalizeAll(data)); setLoading(false); })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 style={{ fontFamily:'Crimson Pro, serif', fontSize:26, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>
        {query ? `Results for "${query}"` : 'Search Government Jobs'}
      </h1>
      <div style={{ display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)', border:'2px solid var(--accent)', borderRadius:12, padding:'10px 16px', marginBottom:28 }}>
        <Search size={18} style={{ color:'var(--accent)' }} />
        <input autoFocus defaultValue={query}
          placeholder="Search jobs, results, admit cards..."
          onKeyDown={e => { if (e.key==='Enter') { const v=(e.target as HTMLInputElement).value; if(v.trim()) window.location.href=`/search?q=${encodeURIComponent(v)}`; }}}
          style={{ flex:1, border:'none', outline:'none', fontSize:15, background:'transparent', color:'var(--text-primary)' }} />
      </div>
      {loading ? (
        <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>
          <Loader2 size={24} style={{ margin:'0 auto 10px', animation:'spin 1s linear infinite' }} />
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : results.length > 0 ? (
        <>
          <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:16 }}>{results.length} result{results.length!==1?'s':''} found</p>
          <div style={{ display:'grid', gap:12 }}>{results.map((p:any) => <PostCard key={p.id} post={p} />)}</div>
        </>
      ) : query ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <p style={{ fontSize:16, marginBottom:8 }}>No results for "{query}"</p>
          <p style={{ fontSize:14 }}>Try different keywords</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {['SSC CGL 2025','UPSC 2025','IBPS PO','RRB NTPC','Bank Jobs','Defence Jobs'].map(term => (
            <a key={term} href={`/search?q=${encodeURIComponent(term)}`}
              style={{ padding:'7px 14px', borderRadius:999, background:'var(--bg-subtle)', border:'1px solid var(--border)', fontSize:14, color:'var(--text-secondary)', textDecoration:'none' }}>
              {term}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8" style={{ color:'var(--text-muted)' }}>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
