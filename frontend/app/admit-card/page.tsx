import type { Metadata } from 'next';
import Link from 'next/link';
import PostCard from '@/components/post/PostCard';
import { MOCK_POSTS } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Admit Card 2025 — Download Hall Ticket for Govt Exams',
  description: 'Download admit cards for government exams 2025. IBPS, SSC, UPSC, RRB, DRDO hall tickets released. Get direct download links.',
};

const ADMIT_CARDS = MOCK_POSTS.filter((p) => p.post_type === 'admit_card');

export default function AdmitCardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 6px' }}>›</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Admit Cards</span>
      </nav>
      <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        Admit Cards 2025 — Download Hall Tickets
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Direct download links from official examination authorities
      </p>
      <div style={{ display: 'grid', gap: 12 }}>
        {ADMIT_CARDS.length > 0
          ? ADMIT_CARDS.map((post) => <PostCard key={post.id} post={post} />)
          : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 16 }}>No admit cards currently available. Check back soon.</p>
            </div>
          )}
      </div>
    </div>
  );
}
