import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import { MOCK_POSTS, STATES, CATEGORIES } from '@/lib/mock-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = STATES.find((s) => s.slug === slug);
  if (!state) return { title: 'State Not Found' };
  return {
    title: `${state.name} Government Jobs 2025 — State & Central Sarkari Naukri`,
    description: `Latest government job notifications 2025 in ${state.name}. State PSC, police, teaching, health and central government jobs for ${state.name} residents.`,
  };
}

export async function generateStaticParams() {
  return STATES.map((s) => ({ slug: s.slug }));
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = STATES.find((s) => s.slug === slug);

  if (!state) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 28, color: 'var(--text-primary)' }}>
          State not found
        </h1>
        <Link href="/" style={{ color: 'var(--accent)', display: 'inline-block', marginTop: 12 }}>
          ← Home
        </Link>
      </div>
    );
  }

  // State-specific posts (in production, filter by state_ids array)
  // For now showing all as placeholder — real filtering done via DB
  const posts = MOCK_POSTS.filter((p) =>
    p.states?.some((s) => s.slug === slug) || p.states?.length === 0
  ).slice(0, 8);

  const otherStates = STATES.filter((s) => s.slug !== slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav
        style={{
          marginBottom: 16, fontSize: 13, color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        }}
      >
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        <Link href="/jobs" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Jobs</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{state.name}</span>
      </nav>

      {/* Hero */}
      <div className="card" style={{ padding: '24px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: 12,
              background: 'var(--accent-light)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MapPin size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: 4,
              }}
            >
              {state.name} Government Jobs 2025
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              State PSC, police, teaching, health and central government jobs for {state.name}
            </p>
          </div>
        </div>

        {/* Category quick links for this state */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {CATEGORIES.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              style={{
                padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', textDecoration: 'none',
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24 }} className="lg:grid-cols-[1fr_260px]">
        {/* Posts */}
        <div>
          <h2
            style={{
              fontFamily: 'Crimson Pro, serif', fontSize: 19, fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: 14,
            }}
          >
            Latest Jobs in {state.name}
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside>
          {/* Other states */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              Other States
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {otherStates.map((s) => (
                <Link
                  key={s.id}
                  href={`/state/${s.slug}`}
                  style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', textDecoration: 'none',
                  }}
                >
                  {s.code}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
