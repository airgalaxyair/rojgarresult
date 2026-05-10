import type { Metadata } from 'next';
import Link from 'next/link';
import PostCard from '@/components/post/PostCard';
import { getPosts, normalizeAll } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Government Exam Results 2025 — SSC, UPSC, IBPS, RRB Results',
  description: 'Check latest government exam results 2025. SSC CGL, UPSC, IBPS PO, RRB results declared.',
};

export const revalidate = 300;

export default async function ResultsPage() {
  const raw = await getPosts({ type: 'result', limit: 30 });
  const posts = normalizeAll(raw);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav style={{ marginBottom:16, fontSize:13, color:'var(--text-muted)' }}>
        <Link href="/" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Home</Link>
        <span style={{ margin:'0 6px' }}>›</span>
        <span style={{ color:'var(--text-primary)', fontWeight:500 }}>Results</span>
      </nav>
      <h1 style={{ fontFamily:'Crimson Pro, serif', fontSize:28, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
        Latest Government Exam Results 2025
      </h1>
      <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:24 }}>{posts.length} results from official sources</p>
      <div style={{ display:'grid', gap:12 }}>
        {posts.length > 0
          ? posts.map((p:any) => <PostCard key={p.id} post={p} />)
          : <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}><p>No results yet. Check back soon.</p></div>}
      </div>
    </div>
  );
}
