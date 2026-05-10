'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import { MOCK_POSTS } from '@/lib/mock-data';
import type { Post } from '@/lib/types';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Post[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = MOCK_POSTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.department.name.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <nav style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 6px' }}>›</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Search</span>
      </nav>

      <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
        {query ? `Search results for "${query}"` : 'Search Government Jobs'}
      </h1>

      {/* Search box */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--bg-card)', border: '2px solid var(--accent)',
        borderRadius: 12, padding: '10px 16px', marginBottom: 28,
      }}>
        <Search size={18} style={{ color: 'var(--accent)' }} />
        <input
          defaultValue={query}
          placeholder="Search for jobs, results, admit cards..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value;
              if (val.trim()) window.location.href = `/search?q=${encodeURIComponent(val)}`;
            }
          }}
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: 15,
            background: 'transparent', color: 'var(--text-primary)',
          }}
        />
      </div>

      {query && (
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </p>
      )}

      {results.length > 0 ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {results.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      ) : query ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Search size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: 16, marginBottom: 8 }}>No results for "{query}"</p>
          <p style={{ fontSize: 14 }}>Try searching with different keywords</p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>Popular searches:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['SSC CGL 2025', 'UPSC 2025', 'IBPS PO', 'RRB NTPC', 'Bank Jobs', 'Defence Jobs', 'State PSC'].map((term) => (
              <a key={term} href={`/search?q=${encodeURIComponent(term)}`} style={{
                padding: '7px 14px', borderRadius: 999,
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.15s',
              }}>
                {term}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8" style={{ color: 'var(--text-muted)' }}>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
