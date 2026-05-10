import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calendar, Users, Clock, ExternalLink, FileDown,
  Share2, Bookmark, Bell, CheckCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import { MOCK_POSTS } from '@/lib/mock-data';
import { formatDate, timeAgo, isExpired, daysLeft, formatVacancies } from '@/lib/utils';
import { POST_TYPE_LABELS, POST_TYPE_BADGE } from '@/lib/types';
import type { Post } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

function getPost(slug: string): Post | undefined {
  return MOCK_POSTS.find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.description.slice(0, 155),
    openGraph: { title: post.title, description: post.description.slice(0, 155) },
  };
}

export async function generateStaticParams() {
  return MOCK_POSTS.filter((p) => p.post_type === 'job').map((p) => ({ slug: p.slug }));
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 28, color: 'var(--text-primary)' }}>
          Post not found
        </h1>
        <Link href="/jobs" style={{ color: 'var(--accent)', marginTop: 12, display: 'inline-block' }}>
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  const expired = isExpired(post.application_end);
  const days = daysLeft(post.application_end);
  const related = MOCK_POSTS.filter(
    (p) => p.id !== post.id && (p.department.id === post.department.id || p.category.id === post.category.id)
  ).slice(0, 3);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: post.title,
    description: post.description,
    datePosted: post.published_at,
    validThrough: post.application_end,
    hiringOrganization: { '@type': 'Organization', name: post.department.name },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'IN' } },
    baseSalary: post.salary_range?.text
      ? { '@type': 'MonetaryAmount', currency: 'INR', value: post.salary_range.text }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <Link href="/jobs" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Jobs</Link>
          <ChevronRight size={12} />
          <Link href={`/department/${post.department.slug}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            {post.department.name}
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-primary)' }} className="line-clamp-1">{post.title}</span>
        </nav>

        <div style={{ display: 'grid', gap: 28 }} className="lg:grid-cols-[1fr_300px]">
          {/* Main Content */}
          <article>
            {/* Header */}
            <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <span className={`badge ${POST_TYPE_BADGE[post.post_type]}`}>
                  {POST_TYPE_LABELS[post.post_type]}
                </span>
                <span style={{
                  padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: 'var(--bg-subtle)', color: 'var(--text-muted)',
                }}>
                  {post.department.name}
                </span>
                <span style={{
                  padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: 'var(--bg-subtle)', color: 'var(--text-muted)',
                }}>
                  {post.category.name}
                </span>
              </div>

              <h1 style={{
                fontFamily: 'Crimson Pro, serif', fontSize: 'clamp(22px, 4vw, 30px)',
                fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: 16,
              }}>
                {post.title}
              </h1>

              {/* Key stats */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', marginBottom: 18 }}>
                {post.total_vacancies && (
                  <Stat icon={<Users size={14} />} label="Total Vacancies" value={`${formatVacancies(post.total_vacancies)} Posts`} />
                )}
                {post.application_end && (
                  <Stat
                    icon={<Clock size={14} />}
                    label="Last Date"
                    value={expired ? 'Expired' : `${formatDate(post.application_end)} ${!expired && days !== null ? `(${days}d left)` : ''}`}
                    danger={expired}
                    warn={!expired && (days ?? 99) <= 7}
                  />
                )}
                {post.exam_date && (
                  <Stat icon={<Calendar size={14} />} label="Exam Date" value={formatDate(post.exam_date)} />
                )}
                {post.salary_range?.text && (
                  <Stat icon={<span style={{ fontSize: 12 }}>₹</span>} label="Salary" value={post.salary_range.text} />
                )}
              </div>

              {/* Deadline alert */}
              {!expired && days !== null && days <= 7 && (
                <div style={{
                  background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8,
                  padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                }}>
                  <AlertCircle size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>
                    Last date to apply is in {days} day{days !== 1 ? 's' : ''}. Apply before {formatDate(post.application_end!)}.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {post.source_url && (
                  <a href={post.source_url} target="_blank" rel="noopener noreferrer nofollow" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'var(--accent)', color: 'white',
                    padding: '10px 18px', borderRadius: 9, fontSize: 14, fontWeight: 600,
                    textDecoration: 'none',
                  }}>
                    <ExternalLink size={14} /> Apply Online
                  </a>
                )}
                {post.pdf_urls && post.pdf_urls[0] && (
                  <a href={post.pdf_urls[0]} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', padding: '10px 18px', borderRadius: 9,
                    fontSize: 14, fontWeight: 500, textDecoration: 'none',
                  }}>
                    <FileDown size={14} /> Official PDF
                  </a>
                )}
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', padding: '10px 18px', borderRadius: 9,
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                }}>
                  <Bookmark size={14} /> Save
                </button>
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', padding: '10px 18px', borderRadius: 9,
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                }}>
                  <Share2 size={14} /> Share
                </button>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                Updated {timeAgo(post.updated_at)} · Source:{' '}
                <a href={post.source_url || '#'} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  {post.department.official_site || 'Official Website'}
                </a>
              </p>
            </div>

            {/* Important Dates */}
            {post.important_dates && post.important_dates.length > 0 && (
              <Section title="Important Dates">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {post.important_dates.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 14px', fontSize: 14, color: 'var(--text-secondary)', width: '55%' }}>
                          {item.label}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatDate(item.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            )}

            {/* Eligibility */}
            {post.eligibility && post.eligibility.length > 0 && (
              <Section title="Eligibility Criteria">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {post.eligibility.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', width: '35%' }}>
                          {item.label}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)' }}>
                          {item.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            )}

            {/* Description */}
            <Section title="About This Notification">
              <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                {post.description}
              </div>
              <div style={{
                marginTop: 16, padding: '12px 14px', borderRadius: 8,
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <CheckCircle size={14} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: '#166534' }}>
                  This notification is sourced directly from the official {post.department.name} website.
                  Always verify details at the{' '}
                  <a href={post.source_url || '#'} target="_blank" rel="noopener noreferrer nofollow"
                    style={{ color: '#16a34a', fontWeight: 600 }}>
                    official source
                  </a>.
                </p>
              </div>
            </Section>
          </article>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Telegram */}
            <div style={{
              background: 'linear-gradient(135deg, #0088cc, #229ED9)',
              borderRadius: 12, padding: 18, color: 'white',
            }}>
              <Bell size={20} style={{ marginBottom: 8 }} />
              <h3 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                Get alerts like this
              </h3>
              <p style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                Join our Telegram for instant notifications on new jobs, results and admit cards.
              </p>
              <a href="https://t.me/rojgarschool" target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'block', textAlign: 'center', background: 'white', color: '#0088cc',
                  padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                }}>
                Join Telegram — Free
              </a>
            </div>

            {/* Quick info */}
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                Quick Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <QuickInfoRow label="Department" value={post.department.name} />
                <QuickInfoRow label="Category" value={post.category.name} />
                {post.total_vacancies && (
                  <QuickInfoRow label="Vacancies" value={`${formatVacancies(post.total_vacancies)} Posts`} />
                )}
                {post.application_start && (
                  <QuickInfoRow label="Apply From" value={formatDate(post.application_start)} />
                )}
                {post.application_end && (
                  <QuickInfoRow
                    label="Last Date"
                    value={formatDate(post.application_end)}
                    highlight={!expired && (days ?? 99) <= 7}
                  />
                )}
                {post.exam_date && (
                  <QuickInfoRow label="Exam Date" value={formatDate(post.exam_date)} />
                )}
              </div>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="card" style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  Related Posts
                </h3>
                {related.map((p) => (
                  <PostCard key={p.id} post={p} compact />
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

function Stat({ icon, label, value, danger = false, warn = false }: {
  icon: React.ReactNode; label: string; value: string; danger?: boolean; warn?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span style={{ color: danger ? 'var(--danger)' : warn ? 'var(--warning)' : 'var(--accent)', marginTop: 2 }}>
        {icon}
      </span>
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 1, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: danger ? 'var(--danger)' : warn ? 'var(--warning)' : 'var(--text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
      }}>
        <h2 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function QuickInfoRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: highlight ? 'var(--warning)' : 'var(--text-primary)', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}
