import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Briefcase } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import { CategorySidebar } from '@/components/post/CategorySidebar';
import { MOCK_POSTS, CATEGORIES } from '@/lib/mock-data';

interface Props { params: Promise<{ slug: string }>; }

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  banking: 'Latest banking jobs 2025 from SBI, IBPS, RBI, NABARD, SIDBI and all public sector banks. Probationary Officer, Clerk, Specialist Officer and more.',
  defence: 'Defence jobs 2025 from Indian Army, Navy, Air Force, CRPF, BSF, CISF, ITBP and Coast Guard. Officer and soldier recruitment notifications.',
  railways: 'Railway jobs 2025 from RRB, RRC, IRCON, DFCCIL, DMRC and RITES. NTPC, Group D, ALP, Junior Engineer and more posts.',
  teaching: 'Teaching jobs 2025 from DSSSB, KVS, NVS, CTET, UGC NET. Primary, TGT, PGT teacher recruitment and education board notifications.',
  psu: 'PSU jobs 2025 from ONGC, IOCL, NTPC, BHEL, DRDO, ISRO, SAIL, GAIL, HAL and all central public sector undertakings.',
  police: 'Police jobs 2025 from state police recruitment boards. Sub-Inspector, Constable, Head Constable recruitment across all states.',
  health: 'Health sector jobs 2025 from AIIMS, ESIC, NHM. Doctor, Nurse, Paramedical, Staff Nurse and other healthcare positions.',
  'state-psc': 'State PSC jobs 2025 from all Indian state public service commissions. Civil services, judicial services and allied posts.',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return { title: 'Category Not Found' };
  const desc = CATEGORY_DESCRIPTIONS[slug] || `Latest ${cat.name} government job notifications 2025.`;
  return {
    title: `${cat.name} Jobs 2025 — Latest ${cat.name} Government Notifications`,
    description: desc,
  };
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);

  if (!cat) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 28, color: 'var(--text-primary)' }}>Category not found</h1>
        <Link href="/" style={{ color: 'var(--accent)', display: 'inline-block', marginTop: 12 }}>← Home</Link>
      </div>
    );
  }

  const posts = MOCK_POSTS.filter((p) => p.category.slug === slug);
  const description = CATEGORY_DESCRIPTIONS[slug] || `Latest ${cat.name} government job notifications.`;
  const related = CATEGORIES.filter((c) => c.slug !== slug).slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        <Link href="/jobs" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Jobs</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat.name}</span>
      </nav>

      <div className="card" style={{ padding: '24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent-light)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Briefcase size={24} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            {cat.name} Jobs 2025
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 680 }}>{description}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24 }} className="lg:grid-cols-[1fr_260px]">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>
              Latest {cat.name} Notifications
            </h2>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{posts.length} found</span>
          </div>
          {posts.length > 0 ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text-muted)' }}>
              <Briefcase size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 16, marginBottom: 6 }}>No {cat.name} notifications right now.</p>
              <p style={{ fontSize: 13 }}>We scrape official sites every few hours — check back soon.</p>
            </div>
          )}
        </div>
        <aside>
          <CategorySidebar related={related} catName={cat.name} />
        </aside>
      </div>
    </div>
  );
}
