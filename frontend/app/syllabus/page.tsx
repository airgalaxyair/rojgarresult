import type { Metadata } from 'next';
import Link from 'next/link';
import PostCard from '@/components/post/PostCard';
import { MOCK_POSTS } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Syllabus 2025 — Download Exam Syllabus & Pattern for Govt Exams',
  description: 'Download latest syllabus and exam pattern for UPSC, SSC, IBPS, RRB, DRDO, ISRO and all government exams 2025. Updated from official websites.',
};

const SYLLABUS = MOCK_POSTS.filter((p) => p.post_type === 'syllabus');

export default function SyllabusPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 6px' }}>›</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Syllabus</span>
      </nav>
      <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        Exam Syllabus 2025
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Official exam syllabus and patterns from recruitment bodies
      </p>
      <div style={{ display: 'grid', gap: 12 }}>
        {SYLLABUS.length > 0 ? (
          SYLLABUS.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 16 }}>No syllabus documents available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
