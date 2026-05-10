'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase, FileText, CreditCard, Key, BookOpen, GraduationCap,
  Building2, Shield, Train, Landmark, Stethoscope, ChevronRight,
  TrendingUp, Clock, Bell, Loader2,
} from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import { CATEGORIES, DEPARTMENTS } from '@/lib/mock-data';
import { normalizeAll } from '@/lib/db';

const SUPABASE_URL = 'https://urfzljcwduycxywyzlnt.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const SEL = 'id,slug,title,post_type,status,total_vacancies,application_end,exam_date,is_featured,is_trending,view_count,published_at,departments(id,name,slug,official_site),categories(id,name,slug,color)';

const QUICK_LINKS = [
  { label: 'Latest Jobs', href: '/jobs', icon: Briefcase, color: '#1d4ed8', bg: '#dbeafe' },
  { label: 'Results', href: '/results', icon: FileText, color: '#15803d', bg: '#dcfce7' },
  { label: 'Admit Cards', href: '/admit-card', icon: CreditCard, color: '#a16207', bg: '#fef9c3' },
  { label: 'Answer Keys', href: '/answer-key', icon: Key, color: '#7e22ce', bg: '#f3e8ff' },
  { label: 'Syllabus', href: '/syllabus', icon: BookOpen, color: '#be123c', bg: '#ffe4e6' },
  { label: 'Admissions', href: '/admission', icon: GraduationCap, color: '#0369a1', bg: '#e0f2fe' },
];

async function fetchPosts(filter = '') {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/posts?select=${SEL}&status=eq.published&order=published_at.desc&limit=20${filter}`,
      { headers: H }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return normalizeAll(data);
  } catch { return []; }
}

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [deadline, setDeadline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPosts('&is_featured=eq.true&limit=3'),
      fetchPosts('&post_type=eq.job&limit=6'),
      fetchPosts('&post_type=in.(result,admit_card)&limit=4'),
      (async () => {
        const now = new Date().toISOString();
        const week = new Date(Date.now() + 7 * 86400000).toISOString();
        return fetchPosts(`&post_type=eq.job&application_end=gte.${now}&application_end=lte.${week}&order=application_end.asc&limit=5`);
      })(),
    ]).then(([f, j, r, d]) => {
      setFeatured(f);
      setJobs(j);
      setResults(r);
      setDeadline(d);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', padding: '48px 0 40px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--accent-light)', border:'1px solid #fed7aa', borderRadius:999, padding:'4px 14px', marginBottom:16, fontSize:12, fontWeight:600, color:'var(--accent)' }}>
              <Bell size={11} /> LIVE UPDATES • ALL FROM OFFICIAL SOURCES
            </div>
            <h1 style={{ fontFamily:'Crimson Pro, serif', fontSize:'clamp(32px,5vw,54px)', fontWeight:700, color:'var(--text-primary)', lineHeight:1.15, marginBottom:14 }}>
              India's Most Trusted<br />
              <span style={{ color:'var(--accent)' }}>Government Jobs Platform</span>
            </h1>
            <p style={{ fontSize:16, color:'var(--text-secondary)', maxWidth:520, margin:'0 auto 24px' }}>
              UPSC, SSC, IBPS, RRB, Defence, PSU and State PSC jobs — all sourced directly from official websites.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/jobs" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--accent)', color:'white', padding:'12px 24px', borderRadius:10, fontWeight:600, fontSize:15, textDecoration:'none' }}>
                <Briefcase size={16} /> Browse All Jobs
              </Link>
              <a href="https://t.me/rojgarschool" target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#229ED9', color:'white', padding:'12px 24px', borderRadius:10, fontWeight:600, fontSize:15, textDecoration:'none' }}>
                <Bell size={16} /> Get Alerts on Telegram
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, maxWidth:600, margin:'0 auto' }} className="sm:grid-cols-6 sm:max-w-none">
            {QUICK_LINKS.map(({ label, href, icon: Icon, color, bg }) => (
              <Link key={href} href={href} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'14px 8px', borderRadius:12, background:'var(--bg-card)', border:'1px solid var(--border)', textDecoration:'none', transition:'all 0.2s' }}>
                <div style={{ width:40, height:40, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', textAlign:'center', lineHeight:1.3 }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
            <Loader2 size={32} style={{ margin:'0 auto 12px', animation:'spin 1s linear infinite' }} />
            <p style={{ fontSize:14 }}>Loading latest notifications...</p>
            <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
          </div>
        ) : (
          <div style={{ display:'grid', gap:32 }} className="lg:grid-cols-[1fr_320px]">
            {/* LEFT */}
            <div>
              {featured.length > 0 && (
                <section style={{ marginBottom:36 }}>
                  <SectionHeader title="Featured Notifications" icon={<TrendingUp size={16} />} href="/jobs" />
                  <div style={{ display:'grid', gap:12 }}>
                    {featured.map((p: any) => <PostCard key={p.id} post={p} />)}
                  </div>
                </section>
              )}

              <section style={{ marginBottom:36 }}>
                <SectionHeader title="Latest Government Jobs" icon={<Briefcase size={16} />} href="/jobs" />
                {jobs.length > 0 ? (
                  <div style={{ display:'grid', gap:12 }} className="sm:grid-cols-2">
                    {jobs.map((p: any) => <PostCard key={p.id} post={p} />)}
                  </div>
                ) : (
                  <EmptyState msg="No jobs yet. Add your first post from the Admin panel." />
                )}
                <Link href="/jobs" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:16, padding:12, borderRadius:10, border:'1px dashed var(--border)', color:'var(--accent)', fontSize:14, fontWeight:500, textDecoration:'none' }}>
                  View All Jobs <ChevronRight size={14} />
                </Link>
              </section>

              {results.length > 0 && (
                <section style={{ marginBottom:36 }}>
                  <SectionHeader title="Results & Admit Cards" icon={<FileText size={16} />} href="/results" />
                  <div style={{ display:'grid', gap:12 }} className="sm:grid-cols-2">
                    {results.map((p: any) => <PostCard key={p.id} post={p} />)}
                  </div>
                </section>
              )}

              {/* Departments */}
              <section>
                <SectionHeader title="Browse by Department" icon={<Building2 size={16} />} href="/jobs" />
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                  {DEPARTMENTS.map((dept) => (
                    <Link key={dept.id} href={`/department/${dept.slug}`} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'16px 8px', borderRadius:12, background:'var(--bg-card)', border:'1px solid var(--border)', textDecoration:'none', transition:'all 0.2s' }}>
                      <Landmark size={22} style={{ color:'var(--accent)' }} />
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', textAlign:'center' }}>{dept.name}</span>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* SIDEBAR */}
            <aside style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {/* Closing soon */}
              <div className="card" style={{ padding:'16px 18px' }}>
                <h3 style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:14 }}>
                  <Clock size={14} style={{ color:'var(--warning)' }} /> Closing Soon
                </h3>
                {deadline.length > 0
                  ? deadline.map((p: any) => <PostCard key={p.id} post={p} compact />)
                  : <p style={{ fontSize:13, color:'var(--text-muted)' }}>No deadlines in next 7 days</p>}
              </div>

              {/* States */}
              <div className="card" style={{ padding:'16px 18px' }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:12 }}>Jobs by State</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {['UP','RJ','BR','MH','MP','GJ','TN','KA','WB','HR','DL','PB'].map(code => (
                    <Link key={code} href={`/state/${code.toLowerCase()}`} style={{ padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:600, background:'var(--bg-subtle)', color:'var(--text-secondary)', border:'1px solid var(--border)', textDecoration:'none' }}>
                      {code}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Telegram CTA */}
              <div style={{ background:'linear-gradient(135deg,#0088cc,#229ED9)', borderRadius:12, padding:20, color:'white', textAlign:'center' }}>
                <Bell size={24} style={{ marginBottom:10, opacity:0.9 }} />
                <h3 style={{ fontFamily:'Crimson Pro, serif', fontSize:18, fontWeight:700, marginBottom:6 }}>Get Instant Alerts</h3>
                <p style={{ fontSize:12, opacity:0.85, marginBottom:14 }}>Join our Telegram channel for instant government job notifications</p>
                <a href="https://t.me/rojgarschool" target="_blank" rel="noopener noreferrer"
                  style={{ display:'inline-block', background:'white', color:'#0088cc', padding:'9px 20px', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>
                  Join Now — Free
                </a>
              </div>

              {/* Categories */}
              <div className="card" style={{ padding:'16px 18px' }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:12 }}>Job Categories</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {CATEGORIES.map(cat => (
                    <Link key={cat.id} href={`/category/${cat.slug}`} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, textDecoration:'none', background:'var(--bg-subtle)' }}>
                      <span style={{ fontSize:13, fontWeight:500, color:'var(--text-secondary)' }}>{cat.name}</span>
                      <ChevronRight size={13} style={{ color:'var(--text-muted)' }} />
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, icon, href }: { title: string; icon: React.ReactNode; href: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
      <h2 style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'Crimson Pro, serif', fontSize:20, fontWeight:700, color:'var(--text-primary)' }}>
        <span style={{ color:'var(--accent)' }}>{icon}</span>{title}
      </h2>
      <Link href={href} style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'var(--accent)', fontWeight:500, textDecoration:'none' }}>
        View all <ChevronRight size={13} />
      </Link>
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div style={{ textAlign:'center', padding:'40px 20px', border:'1px dashed var(--border)', borderRadius:12, color:'var(--text-muted)' }}>
      <p style={{ fontSize:14 }}>{msg}</p>
    </div>
  );
}
