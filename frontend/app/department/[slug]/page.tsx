import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, ChevronRight } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import { MOCK_POSTS, DEPARTMENTS } from '@/lib/mock-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dept = DEPARTMENTS.find((d) => d.slug === slug);
  if (!dept) return { title: 'Department Not Found' };
  return {
    title: `${dept.name} Jobs, Results & Notifications 2025`,
    description: `Latest ${dept.name} government job notifications, results, admit cards and answer keys. All sourced from official ${dept.name} website.`,
  };
}

export async function generateStaticParams() {
  return DEPARTMENTS.map((d) => ({ slug: d.slug }));
}

export default async function DepartmentPage({ params }: Props) {
  const { slug } = await params;
  const dept = DEPARTMENTS.find((d) => d.slug === slug);
  if (!dept) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 28, color: 'var(--text-primary)' }}>
          Department not found
        </h1>
        <Link href="/" style={{ color: 'var(--accent)', display: 'inline-block', marginTop: 12 }}>← Home</Link>
      </div>
    );
  }

  const posts = MOCK_POSTS.filter((p) => p.department.slug === slug);
  const jobs = posts.filter((p) => p.post_type === 'job');
  const results = posts.filter((p) => p.post_type === 'result');
  const admitCards = posts.filter((p) => p.post_type === 'admit_card');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        <Link href="/jobs" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Jobs</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{dept.name}</span>
      </nav>

      {/* Dept header */}
      <div className="card" style={{ padding: '24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 14, background: 'var(--accent-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 900, color: 'var(--accent)',
          fontFamily: 'Crimson Pro, serif',
        }}>
          {dept.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {dept.name} — Official Notifications
          </h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {jobs.length} Jobs · {results.length} Results · {admitCards.length} Admit Cards
            </span>
            {dept.official_site && (
              <a href={dept.official_site} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ExternalLink size={11} /> Official Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      {posts.length > 0 ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 16 }}>No notifications found for {dept.name}.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Check back soon for updates.</p>
        </div>
      )}
    </div>
  );
}
