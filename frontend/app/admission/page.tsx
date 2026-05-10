import type { Metadata } from 'next';
import Link from 'next/link';
import PostCard from '@/components/post/PostCard';
import { MOCK_POSTS } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Admissions 2025 — Central & State University Admissions',
  description: 'Latest admission notifications 2025 for central universities, IITs, NITs, AIIMS and state institutions. Application dates, eligibility and forms.',
};

const ADMISSIONS = MOCK_POSTS.filter((p) => p.post_type === 'admission');

export default function AdmissionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 6px' }}>›</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Admissions</span>
      </nav>
      <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        Admissions 2025
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Central and state institution admission notifications
      </p>
      <div style={{ display: 'grid', gap: 12 }}>
        {ADMISSIONS.length > 0 ? (
          ADMISSIONS.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 16 }}>No admissions available right now. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
