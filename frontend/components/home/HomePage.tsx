'use client';

import Link from 'next/link';
import {
  Briefcase, FileText, CreditCard, Key, BookOpen, GraduationCap,
  Building2, Shield, Train, Landmark, Stethoscope, ChevronRight,
  TrendingUp, Clock, Bell
} from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import { MOCK_POSTS, CATEGORIES, DEPARTMENTS } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';

const QUICK_LINKS = [
  { label: 'Latest Jobs', href: '/jobs', icon: Briefcase, color: '#1d4ed8', bg: '#dbeafe' },
  { label: 'Results', href: '/results', icon: FileText, color: '#15803d', bg: '#dcfce7' },
  { label: 'Admit Cards', href: '/admit-card', icon: CreditCard, color: '#a16207', bg: '#fef9c3' },
  { label: 'Answer Keys', href: '/answer-key', icon: Key, color: '#7e22ce', bg: '#f3e8ff' },
  { label: 'Syllabus', href: '/syllabus', icon: BookOpen, color: '#be123c', bg: '#ffe4e6' },
  { label: 'Admissions', href: '/admission', icon: GraduationCap, color: '#0369a1', bg: '#e0f2fe' },
];

const DEPT_ICONS: Record<string, React.ElementType> = {
  upsc: Landmark,
  ssc: Building2,
  ibps: Landmark,
  rrb: Train,
  sbi: Landmark,
  drdo: Shield,
  isro: Shield,
  ntpc: Building2,
};

const DEADLINE_POSTS = MOCK_POSTS.filter(
  (p) => p.post_type === 'job' && p.application_end && new Date(p.application_end) > new Date()
).slice(0, 5);

const FEATURED = MOCK_POSTS.filter((p) => p.is_featured).slice(0, 3);
const LATEST_JOBS = MOCK_POSTS.filter((p) => p.post_type === 'job').slice(0, 6);
const LATEST_RESULTS = MOCK_POSTS.filter((p) => p.post_type === 'result' || p.post_type === 'admit_card').slice(0, 4);

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', padding: '48px 0 40px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--accent-light)', border: '1px solid #fed7aa',
              borderRadius: 999, padding: '4px 14px', marginBottom: 16,
              fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.04em',
            }}>
              <Bell size={11} /> LIVE UPDATES • ALL FROM OFFICIAL SOURCES
            </div>
            <h1 style={{
              fontFamily: 'Crimson Pro, serif',
              fontSize: 'clamp(32px, 5vw, 54px)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              marginBottom: 14,
            }}>
              India's Most Trusted<br />
              <span style={{ color: 'var(--accent)' }}>Government Jobs Platform</span>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 24px' }}>
              UPSC, SSC, IBPS, RRB, Defence, PSU and State PSC jobs — all sourced directly from official websites. No middlemen.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/jobs" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--accent)', color: 'white',
                padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: 15,
                textDecoration: 'none',
              }}>
                <Briefcase size={16} /> Browse All Jobs
              </Link>
              <a href="https://t.me/rojgarschool" target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#229ED9', color: 'white',
                  padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: 15,
                  textDecoration: 'none',
                }}>
                <Bell size={16} /> Get Alerts on Telegram
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 600, margin: '0 auto' }}
            className="sm:grid-cols-6 sm:max-w-none">
            {QUICK_LINKS.map(({ label, href, icon: Icon, color, bg }) => (
              <Link key={href} href={href} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '14px 8px', borderRadius: 12,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = color;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${color}20`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3 }}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }} className="lg:grid-cols-[1fr_320px]">
          {/* LEFT COLUMN */}
          <div>
            {/* Featured Posts */}
            {FEATURED.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <SectionHeader title="Featured Notifications" icon={<TrendingUp size={16} />} href="/jobs?featured=true" />
                <div style={{ display: 'grid', gap: 12 }}>
                  {FEATURED.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* Latest Jobs */}
            <section style={{ marginBottom: 36 }}>
              <SectionHeader title="Latest Government Jobs" icon={<Briefcase size={16} />} href="/jobs" />
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(1, 1fr)' }} className="sm:grid-cols-2">
                {LATEST_JOBS.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <Link href="/jobs" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginTop: 16, padding: '12px', borderRadius: 10,
                border: '1px dashed var(--border)', color: 'var(--accent)',
                fontSize: 14, fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.2s',
              }}>
                View All Jobs <ChevronRight size={14} />
              </Link>
            </section>

            {/* Results & Admit Cards */}
            <section style={{ marginBottom: 36 }}>
              <SectionHeader title="Results & Admit Cards" icon={<FileText size={16} />} href="/results" />
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(1, 1fr)' }} className="sm:grid-cols-2">
                {LATEST_RESULTS.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>

            {/* Department Grid */}
            <section>
              <SectionHeader title="Browse by Department" icon={<Building2 size={16} />} href="/department" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {DEPARTMENTS.map((dept) => {
                  const Icon = DEPT_ICONS[dept.slug] || Building2;
                  return (
                    <Link key={dept.id} href={`/department/${dept.slug}`} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '16px 8px', borderRadius: 12, background: 'var(--bg-card)',
                      border: '1px solid var(--border)', textDecoration: 'none', transition: 'all 0.2s',
                    }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                      }}>
                      <Icon size={22} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{dept.name}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Closing Soon */}
            <div className="card" style={{ padding: '16px 18px' }}>
              <h3 style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: 14,
              }}>
                <Clock size={14} style={{ color: 'var(--warning)' }} />
                Closing Soon
              </h3>
              {DEADLINE_POSTS.map((post) => (
                <PostCard key={post.id} post={post} compact />
              ))}
            </div>

            {/* State-wise links */}
            <div className="card" style={{ padding: '16px 18px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                Jobs by State
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['UP', 'RJ', 'BR', 'MH', 'MP', 'GJ', 'TN', 'KA', 'WB', 'HR', 'DL', 'PB'].map((code, i) => (
                  <Link key={code} href={`/state/${code.toLowerCase()}`} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: 'var(--bg-subtle)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)', textDecoration: 'none', transition: 'all 0.15s',
                  }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    }}>
                    {code}
                  </Link>
                ))}
              </div>
            </div>

            {/* Telegram CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #0088cc 0%, #229ED9 100%)',
              borderRadius: 12, padding: '20px', color: 'white', textAlign: 'center',
            }}>
              <Bell size={24} style={{ marginBottom: 10, opacity: 0.9 }} />
              <h3 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                Get Instant Alerts
              </h3>
              <p style={{ fontSize: 12, opacity: 0.85, marginBottom: 14, lineHeight: 1.5 }}>
                Join our Telegram channel for instant government job notifications
              </p>
              <a href="https://t.me/rojgarschool" target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-block', background: 'white', color: '#0088cc',
                  padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                }}>
                Join Now — Free
              </a>
            </div>

            {/* Category pills */}
            <div className="card" style={{ padding: '16px 18px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                Job Categories
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CATEGORIES.map((cat) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8, textDecoration: 'none',
                    background: 'var(--bg-subtle)', transition: 'all 0.15s',
                  }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
                    }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {cat.name}
                    </span>
                    <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon, href }: { title: string; icon: React.ReactNode; href: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <h2 style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'Crimson Pro, serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
      }}>
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        {title}
      </h2>
      <Link href={href} style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 13, color: 'var(--accent)', fontWeight: 500, textDecoration: 'none',
      }}>
        View all <ChevronRight size={13} />
      </Link>
    </div>
  );
}
