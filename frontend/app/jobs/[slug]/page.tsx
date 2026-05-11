import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Users, Clock, ExternalLink, FileDown, Bell, CheckCircle, AlertCircle, ChevronRight, Building2, Tag } from 'lucide-react';
import { getPostBySlug, getAllPublishedSlugs, normalizeAll, normalize } from '@/lib/db';
import { formatDate, timeAgo, isExpired, daysLeft, formatVacancies } from '@/lib/utils';

export const revalidate = 300;
export const dynamicParams = true;

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const raw = await getPostBySlug(slug);
  const post = normalize(raw);
  if (!post) return { title: 'Post Not Found — Rojgar School' };
  return {
    title: `${post.seo_title || post.title} | Rojgar School`,
    description: post.seo_description || post.description?.slice(0, 155) || post.title,
    openGraph: { title: post.title, description: post.description?.slice(0, 155) || '' },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((p: any) => ({ slug: p.slug }));
}

// Detect department from title for third-party posts
function detectDeptFromTitle(title: string): { name: string; official_site: string } | null {
  const t = title.toLowerCase();
  const depts: Array<{ keywords: string[]; name: string; site: string }> = [
    { keywords: ['ssc', 'staff selection'], name: 'SSC', site: 'https://ssc.nic.in' },
    { keywords: ['upsc', 'civil services', 'ias', 'ips'], name: 'UPSC', site: 'https://upsc.gov.in' },
    { keywords: ['ibps', 'banking personnel'], name: 'IBPS', site: 'https://www.ibps.in' },
    { keywords: ['rrb', 'railway recruitment', 'ntpc', 'group d', 'alp'], name: 'RRB', site: 'https://www.indianrailways.gov.in' },
    { keywords: ['sbi ', 'state bank of india'], name: 'SBI', site: 'https://bank.sbi/web/careers/current-openings' },
    { keywords: ['rbi ', 'reserve bank'], name: 'RBI', site: 'https://www.rbi.org.in' },
    { keywords: ['drdo'], name: 'DRDO', site: 'https://www.drdo.gov.in' },
    { keywords: ['isro'], name: 'ISRO', site: 'https://www.isro.gov.in' },
    { keywords: ['kvs', 'kendriya vidyalaya'], name: 'KVS', site: 'https://kvsangathan.nic.in' },
    { keywords: ['nvs', 'navodaya'], name: 'NVS', site: 'https://navodaya.gov.in' },
    { keywords: ['aiims'], name: 'AIIMS', site: 'https://www.aiims.edu' },
    { keywords: ['esic'], name: 'ESIC', site: 'https://esic.nic.in' },
    { keywords: ['fci', 'food corporation'], name: 'FCI', site: 'https://fci.gov.in' },
    { keywords: ['ntpc'], name: 'NTPC', site: 'https://www.ntpc.co.in' },
    { keywords: ['crpf'], name: 'CRPF', site: 'https://crpf.gov.in' },
    { keywords: ['bsf', 'border security'], name: 'BSF', site: 'https://bsf.nic.in' },
    { keywords: ['indian army', 'agniveer'], name: 'Indian Army', site: 'https://joinindianarmy.nic.in' },
    { keywords: ['indian navy', 'navy'], name: 'Indian Navy', site: 'https://www.joinindiannavy.gov.in' },
    { keywords: ['air force', 'afcat', 'airforce'], name: 'Indian Air Force', site: 'https://careerairforce.nic.in' },
    { keywords: ['nta ', 'neet', 'jee', 'cuet', 'ugc net'], name: 'NTA', site: 'https://nta.ac.in' },
  ];
  for (const d of depts) {
    if (d.keywords.some(k => t.includes(k))) {
      return { name: d.name, official_site: d.site };
    }
  }
  return null;
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const raw = await getPostBySlug(slug);
  const post = normalize(raw);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 style={{ fontFamily:'Crimson Pro, serif', fontSize:28, color:'var(--text-primary)', marginBottom:12 }}>Post not found</h1>
        <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:16 }}>This post may have been removed or the URL is incorrect.</p>
        <Link href="/jobs" style={{ color:'var(--accent)', fontWeight:600 }}>← Back to Jobs</Link>
      </div>
    );
  }

  const expired = isExpired(post.application_end);
  const days = daysLeft(post.application_end);

  // Detect department for third-party posts with no dept set
  const detectedDept = (!post.department?.official_site && post.source_type === 'third_party')
    ? detectDeptFromTitle(post.title)
    : null;

  const officialSite = post.department?.official_site || detectedDept?.official_site || post.source_url || null;
  const deptName = post.department?.name || detectedDept?.name || null;

  // Post type labels
  const TYPE_EMOJI: any = { job:'💼', result:'📊', admit_card:'🎫', answer_key:'🔑', syllabus:'📚', admission:'🎓' };
  const TYPE_LABEL: any = { job:'Job Notification', result:'Result', admit_card:'Admit Card', answer_key:'Answer Key', syllabus:'Syllabus', admission:'Admission' };

  // Schema.org
  const schema = {
    '@context': 'https://schema.org',
    '@type': post.post_type === 'job' ? 'JobPosting' : 'Article',
    title: post.title,
    description: post.description || post.title,
    datePosted: post.published_at,
    validThrough: post.application_end,
    hiringOrganization: { '@type': 'Organization', name: deptName || 'Government of India' },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'IN' } },
  };

  // Build related links from Supabase
  const SUPABASE_URL = 'https://urfzljcwduycxywyzlnt.supabase.co/rest/v1';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g';
  const SEL = 'id,slug,title,post_type,status,source_type,total_vacancies,application_end,published_at,notice_image_url,pdf_urls,departments(id,name,slug,official_site),categories(id,name,slug,color)';
  let related: any[] = [];
  try {
    const filters = [];
    if (post.department?.id) filters.push(`department_id.eq.${post.department.id}`);
    if (post.category?.id) filters.push(`category_id.eq.${post.category.id}`);
    if (filters.length > 0) {
      const res = await fetch(
        `${SUPABASE_URL}/posts?select=${SEL}&status=eq.published&or=(${filters.join(',')})&id=neq.${post.id}&order=published_at.desc&limit=5`,
        { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, next: { revalidate: 300 } }
      );
      const data = await res.json();
      related = normalizeAll(Array.isArray(data) ? data : []);
    }
  } catch {}

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav style={{ marginBottom:14, fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4, flexWrap:'wrap' }}>
          <Link href="/" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Home</Link>
          <ChevronRight size={10} />
          <Link href="/jobs" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Jobs</Link>
          {deptName && <><ChevronRight size={10} /><span>{deptName}</span></>}
          <ChevronRight size={10} />
          <span style={{ color:'var(--text-primary)' }}>{post.title.slice(0, 40)}...</span>
        </nav>

        <div style={{ display:'grid', gap:20 }} className="lg:grid-cols-[1fr_300px]">
          {/* MAIN */}
          <div>
            {/* Header card */}
            <div className="card" style={{ marginBottom:16, overflow:'hidden' }}>
              {/* Title bar */}
              <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                  <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:'var(--accent)', color:'white' }}>
                    {TYPE_EMOJI[post.post_type]} {TYPE_LABEL[post.post_type] || 'Notification'}
                  </span>
                  {deptName && deptName !== 'Unknown' && (
                    <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600, background:'var(--bg-subtle)', color:'var(--text-secondary)', border:'1px solid var(--border)' }}>
                      {deptName}
                    </span>
                  )}
                  {post.category?.name && (
                    <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600, background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe' }}>
                      {post.category.name}
                    </span>
                  )}
                  {post.source_type === 'third_party' && (
                    <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600, background:'#fdf4ff', color:'#7e22ce', border:'1px solid #e9d5ff' }}>
                      3rd Party Source
                    </span>
                  )}
                </div>

                <h1 style={{ fontFamily:'Crimson Pro, serif', fontSize:'clamp(18px,3.5vw,26px)', fontWeight:700, color:'var(--text-primary)', lineHeight:1.3, marginBottom:8 }}>
                  {post.title}
                </h1>

                <p style={{ fontSize:12, color:'var(--text-muted)' }}>
                  Updated {timeAgo(post.updated_at || post.published_at)}
                  {officialSite && <> · <a href={officialSite} target="_blank" rel="noopener noreferrer" style={{ color:'var(--accent)' }}>{(deptName && deptName !== 'Unknown') ? `${deptName} Official Website` : 'Official Website'}</a></>}
                </p>
              </div>

              {/* Deadline warning */}
              {!expired && days !== null && days <= 7 && (
                <div style={{ background:'#fffbeb', borderBottom:'1px solid var(--border)', padding:'10px 20px', display:'flex', alignItems:'center', gap:8 }}>
                  <AlertCircle size={14} style={{ color:'#d97706', flexShrink:0 }} />
                  <p style={{ fontSize:13, color:'#92400e', fontWeight:500 }}>
                    ⚠️ Last date to apply is in <strong>{days} day{days!==1?'s':''}</strong> — {formatDate(post.application_end!)}
                  </p>
                </div>
              )}
              {expired && post.application_end && (
                <div style={{ background:'#fef2f2', borderBottom:'1px solid var(--border)', padding:'10px 20px', display:'flex', alignItems:'center', gap:8 }}>
                  <AlertCircle size={14} style={{ color:'#dc2626', flexShrink:0 }} />
                  <p style={{ fontSize:13, color:'#991b1b' }}>Application period has closed. Check official website for updates.</p>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ padding:'16px 20px', display:'flex', gap:10, flexWrap:'wrap', background:'var(--bg-subtle)' }}>
                {officialSite && !expired && (
                  <a href={officialSite} target="_blank" rel="noopener noreferrer nofollow"
                    style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--accent)', color:'white', padding:'10px 20px', borderRadius:9, fontSize:14, fontWeight:700, textDecoration:'none' }}>
                    <ExternalLink size={14} /> Apply Online
                  </a>
                )}
                {officialSite && (
                  <a href={officialSite} target="_blank" rel="noopener noreferrer nofollow"
                    style={{ display:'inline-flex', alignItems:'center', gap:8, background:'white', color:'var(--text-secondary)', padding:'10px 16px', borderRadius:9, fontSize:13, fontWeight:500, textDecoration:'none', border:'1px solid var(--border)' }}>
                    <Building2 size={13} /> Official Website
                  </a>
                )}
                {post.pdf_urls?.[0] && (
                  <a href={post.pdf_urls[1] || post.pdf_urls[0]} target="_blank" rel="noopener noreferrer"
                    style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#dc2626', color:'white', padding:'10px 16px', borderRadius:9, fontSize:13, fontWeight:700, textDecoration:'none' }}>
                    <FileDown size={13} /> Download Notification PDF
                  </a>
                )}
                {!post.pdf_urls?.[0] && officialSite && (
                  <a href={officialSite} target="_blank" rel="noopener noreferrer nofollow"
                    style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#dc2626', color:'white', padding:'10px 16px', borderRadius:9, fontSize:13, fontWeight:700, textDecoration:'none' }}>
                    <FileDown size={13} /> Download Notification
                  </a>
                )}
                {post.notice_image_url && (
                  <a href={post.notice_image_url} target="_blank" rel="noopener noreferrer"
                    style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#7c3aed', color:'white', padding:'10px 16px', borderRadius:9, fontSize:13, fontWeight:700, textDecoration:'none' }}>
                    <FileDown size={13} /> View Short Notice
                  </a>
                )}
              </div>
            </div>

            {/* Short Info */}
            {post.description && (
              <div className="card" style={{ marginBottom:16, overflow:'hidden' }}>
                <div style={{ padding:'12px 20px', background:'var(--bg-subtle)', borderBottom:'1px solid var(--border)' }}>
                  <h2 style={{ fontFamily:'Crimson Pro, serif', fontSize:17, fontWeight:700, color:'var(--text-primary)' }}>
                    {deptName && deptName !== 'Unknown' ? `${deptName} — ` : ''}Short Information
                  </h2>
                </div>
                <div style={{ padding:'16px 20px' }}>
                  <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.8 }}>{post.description}</p>
                  {officialSite && (
                    <div style={{ marginTop:12, padding:'10px 14px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, display:'flex', alignItems:'flex-start', gap:8 }}>
                      <CheckCircle size={14} style={{ color:'#16a34a', marginTop:2, flexShrink:0 }} />
                      <p style={{ fontSize:13, color:'#166534' }}>
                        Always verify details at the <a href={officialSite} target="_blank" rel="noopener noreferrer nofollow" style={{ color:'#16a34a', fontWeight:700 }}>
                          official {deptName || 'department'} website
                        </a> before applying.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Important Dates + Fee table side by side like SarkariResult */}
            {(post.important_dates?.length > 0 || post.application_end || post.application_start || post.exam_date) && (
              <div className="card" style={{ marginBottom:16, overflow:'hidden' }}>
                <div style={{ padding:'12px 20px', background:'var(--bg-subtle)', borderBottom:'1px solid var(--border)', textAlign:'center' }}>
                  <h2 style={{ fontFamily:'Crimson Pro, serif', fontSize:17, fontWeight:700, color:'var(--accent)' }}>
                    {post.title.slice(0, 50)}{post.title.length > 50 ? '...' : ''}
                  </h2>
                  <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>Short Details of Notification</p>
                </div>

                <div style={{ display:'grid' }} className="sm:grid-cols-2">
                  {/* Important Dates */}
                  <div style={{ borderRight:'1px solid var(--border)' }}>
                    <div style={{ padding:'10px 16px', background:'#fff7ed', borderBottom:'1px solid var(--border)', textAlign:'center' }}>
                      <h3 style={{ fontSize:14, fontWeight:700, color:'var(--accent)' }}>📅 Important Dates</h3>
                    </div>
                    <div style={{ padding:'4px 0' }}>
                      {/* Auto-generate from post fields */}
                      {[
                        post.application_start && { label: 'Application Begin', value: formatDate(post.application_start), highlight: false },
                        post.application_end && { label: 'Last Date Apply Online', value: formatDate(post.application_end), highlight: !expired && (days??99)<=7 },
                        post.exam_date && { label: 'Exam Date', value: formatDate(post.exam_date), highlight: false },
                        ...(post.important_dates || []).map((d: any) => ({ label: d.label, value: d.date, highlight: false })),
                      ].filter(Boolean).map((row: any, i: number) => (
                        <div key={i} style={{ display:'flex', borderBottom:'1px solid var(--border)', padding:'8px 16px', gap:8 }}>
                          <span style={{ fontSize:13, color:'var(--text-secondary)', flex:1, lineHeight:1.4 }}>• {row.label}</span>
                          <span style={{ fontSize:13, fontWeight:700, color: row.highlight ? '#dc2626' : 'var(--text-primary)', whiteSpace:'nowrap' }}>{row.value}</span>
                        </div>
                      ))}
                      {!post.application_start && !post.application_end && !post.exam_date && (!post.important_dates || post.important_dates.length === 0) && (
                        <div style={{ padding:'12px 16px', fontSize:13, color:'var(--text-muted)' }}>
                          Check official website for dates
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Eligibility / Details */}
                  <div>
                    <div style={{ padding:'10px 16px', background:'#f0fdf4', borderBottom:'1px solid var(--border)', textAlign:'center' }}>
                      <h3 style={{ fontSize:14, fontWeight:700, color:'#15803d' }}>📋 Post Details</h3>
                    </div>
                    <div style={{ padding:'4px 0' }}>
                      {[
                        post.total_vacancies && { label: 'Total Vacancies', value: `${formatVacancies(post.total_vacancies)} Posts` },
                        post.salary_range?.text && { label: 'Pay Scale / Salary', value: post.salary_range.text },
                        ...(post.eligibility || []).map((e: any) => ({ label: e.label, value: e.value })),
                      ].filter(Boolean).map((row: any, i: number) => (
                        <div key={i} style={{ display:'flex', borderBottom:'1px solid var(--border)', padding:'8px 16px', gap:8 }}>
                          <span style={{ fontSize:13, color:'var(--text-secondary)', flex:1 }}>• {row.label}</span>
                          <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', textAlign:'right' }}>{row.value}</span>
                        </div>
                      ))}
                      {!post.total_vacancies && !post.salary_range && (!post.eligibility || post.eligibility.length === 0) && (
                        <div style={{ padding:'12px 16px', fontSize:13, color:'var(--text-muted)' }}>
                          Check official website for details
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vacancies highlight if available */}
                {post.total_vacancies && (
                  <div style={{ padding:'10px 20px', background:'#eff6ff', borderTop:'1px solid var(--border)', textAlign:'center' }}>
                    <p style={{ fontSize:15, fontWeight:700, color:'#1d4ed8' }}>
                      Total Vacancies: {formatVacancies(post.total_vacancies)} Posts
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Eligibility full table */}
            {post.eligibility?.length > 0 && (
              <div className="card" style={{ marginBottom:16, overflow:'hidden' }}>
                <div style={{ padding:'12px 20px', background:'var(--bg-subtle)', borderBottom:'1px solid var(--border)' }}>
                  <h2 style={{ fontFamily:'Crimson Pro, serif', fontSize:17, fontWeight:700, color:'var(--text-primary)' }}>Eligibility Criteria</h2>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <tbody>
                    {post.eligibility.map((item: any, i: number) => (
                      <tr key={i} style={{ background: i%2===0 ? 'transparent' : 'var(--bg-subtle)', borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'10px 20px', fontSize:14, fontWeight:600, color:'var(--accent)', width:'35%' }}>{item.label}</td>
                        <td style={{ padding:'10px 20px', fontSize:14, color:'var(--text-primary)' }}>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Useful Links — like SarkariResult */}
            <div className="card" style={{ marginBottom:16, overflow:'hidden' }}>
              <div style={{ padding:'12px 20px', background:'var(--bg-subtle)', borderBottom:'1px solid var(--border)', textAlign:'center' }}>
                <h2 style={{ fontFamily:'Crimson Pro, serif', fontSize:17, fontWeight:700, color:'var(--text-primary)' }}>Some Useful Important Links</h2>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <tbody>
                  {[
                    officialSite && !expired && { label: 'Apply Online', href: officialSite, text: 'Click Here ✓', highlight: true },
                    (post.pdf_urls?.[0] || officialSite) && { label: 'Download Notification PDF', href: post.pdf_urls?.[1] || post.pdf_urls?.[0] || officialSite, text: 'Click Here', highlight: false },
                    post.notice_image_url && { label: 'Short Notice / Image', href: post.notice_image_url, text: 'View Notice', highlight: false },
                    officialSite && { label: 'Official Website', href: officialSite, text: (deptName && deptName !== 'Unknown') ? `${deptName} Official Website` : 'Official Website', highlight: false },
                  ].filter(Boolean).map((link: any, i: number) => (
                    <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'10px 20px', fontSize:14, fontWeight:600, color:'var(--accent)', width:'50%', textAlign:'center', borderRight:'1px solid var(--border)' }}>
                        {link.label}
                      </td>
                      <td style={{ padding:'10px 20px', textAlign:'center' }}>
                        <a href={link.href} target="_blank" rel="noopener noreferrer nofollow"
                          style={{ fontSize:14, fontWeight:700, color: link.highlight ? '#dc2626' : '#1d4ed8', textDecoration:'none' }}>
                          {link.text}
                        </a>
                      </td>
                    </tr>
                  ))}
                  {!officialSite && !post.pdf_urls?.[0] && (
                    <tr>
                      <td colSpan={2} style={{ padding:'14px 20px', fontSize:13, color:'var(--text-muted)', textAlign:'center' }}>
                        Visit the official department website for application links
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'12px 20px', background:'var(--bg-subtle)', borderBottom:'1px solid var(--border)', textAlign:'center' }}>
                  <h2 style={{ fontFamily:'Crimson Pro, serif', fontSize:17, fontWeight:700, color:'var(--text-primary)' }}>
                    Find More Latest {deptName || ''} Updates
                  </h2>
                </div>
                <div style={{ padding:'4px 0' }}>
                  {related.map((p: any, i: number) => (
                    <Link key={p.id} href={`/jobs/${p.slug}`} style={{ display:'block', padding:'10px 20px', borderBottom: i<related.length-1 ? '1px solid var(--border)' : 'none', textDecoration:'none', fontSize:14, color:'var(--accent)', fontWeight:500 }}>
                      → {p.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Quick Stats */}
            <div className="card" style={{ overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', background:'var(--bg-subtle)', borderBottom:'1px solid var(--border)' }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>Quick Info</h3>
              </div>
              <div style={{ padding:'4px 0' }}>
                {[
                  deptName && deptName !== 'Unknown' && { label: 'Department', value: deptName },
                  post.category?.name && { label: 'Category', value: post.category.name },
                  post.total_vacancies && { label: 'Total Posts', value: `${formatVacancies(post.total_vacancies)}`, bold: true },
                  post.application_start && { label: 'Apply From', value: formatDate(post.application_start) },
                  post.application_end && { label: 'Last Date', value: formatDate(post.application_end), warn: !expired && (days??99)<=7, expired },
                  post.exam_date && { label: 'Exam Date', value: formatDate(post.exam_date) },
                  post.salary_range?.text && { label: 'Salary', value: post.salary_range.text },
                ].filter(Boolean).map((row: any, i: number) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', gap:8, padding:'9px 16px', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>{row.label}</span>
                    <span style={{ fontSize:13, fontWeight: row.bold ? 700 : 600, color: row.expired ? '#dc2626' : row.warn ? '#d97706' : 'var(--text-primary)', textAlign:'right', maxWidth:'55%' }}>{row.value}</span>
                  </div>
                ))}
                {!deptName && !post.total_vacancies && !post.application_end && (
                  <div style={{ padding:'12px 16px', fontSize:13, color:'var(--text-muted)' }}>
                    Details available on official website
                  </div>
                )}
              </div>
              {officialSite && (
                <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)' }}>
                  <a href={officialSite} target="_blank" rel="noopener noreferrer nofollow"
                    style={{ display:'block', textAlign:'center', background:'var(--accent)', color:'white', padding:'10px', borderRadius:8, fontSize:14, fontWeight:700, textDecoration:'none' }}>
                    Apply Online →
                  </a>
                </div>
              )}
            </div>

            {/* Telegram CTA */}
            <div style={{ background:'linear-gradient(135deg,#0088cc,#229ED9)', borderRadius:12, padding:18, color:'white', textAlign:'center' }}>
              <Bell size={20} style={{ marginBottom:8 }} />
              <h3 style={{ fontFamily:'Crimson Pro, serif', fontSize:16, fontWeight:700, marginBottom:6 }}>Get Instant Alerts</h3>
              <p style={{ fontSize:12, opacity:0.85, marginBottom:12 }}>Join our Telegram for instant job notifications</p>
              <a href="https://t.me/rojgarschool" target="_blank" rel="noopener noreferrer"
                style={{ display:'block', background:'white', color:'#0088cc', padding:9, borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>
                Join @rojgarschool — Free
              </a>
            </div>

            {/* Notice */}
            <div style={{ padding:'14px 16px', background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:10, fontSize:12, color:'#92400e', lineHeight:1.6 }}>
              <strong>⚠️ Disclaimer:</strong> Always verify all details — dates, eligibility, vacancies — at the official department website before applying. Rojgar School aggregates information for convenience only.
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
