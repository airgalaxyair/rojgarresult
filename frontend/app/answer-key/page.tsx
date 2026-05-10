import type { Metadata } from 'next';
import Link from 'next/link';
import PostCard from '@/components/post/PostCard';
import { MOCK_POSTS } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Answer Key 2025 — Download Official Answer Keys for Govt Exams',
  description: 'Download official answer keys for SSC, UPSC, IBPS, RRB, DRDO and other government exams 2025. Raise objections and check provisional answers.',
};

const ANSWER_KEYS = MOCK_POSTS.filter((p) => p.post_type === 'answer_key');

export default function AnswerKeyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 6px' }}>›</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Answer Keys</span>
      </nav>
      <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        Answer Keys 2025
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Official answer keys from examination authorities — direct links for download
      </p>
      <div style={{ display: 'grid', gap: 12 }}>
        {ANSWER_KEYS.length > 0 ? (
          ANSWER_KEYS.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <EmptyState label="answer keys" />
        )}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 8 }}>
        No {label} available right now.
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        We update this page automatically from official sources. Check back soon.
      </p>
    </div>
  );
}
