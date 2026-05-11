'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Save, Send, Plus, Trash2, CheckCircle, ExternalLink } from 'lucide-react';

const SUPABASE_URL = 'https://urfzljcwduycxywyzlnt.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
const API = 'https://rojgarresult-production.up.railway.app';

const DEPARTMENTS = ['UPSC','SSC','IBPS','RRB','SBI','RBI','DRDO','ISRO','NTPC','ONGC','IOCL','BHEL','HAL','SAIL','GAIL','BEL','FCI','DSSSB','KVS','NVS','AIIMS','ESIC','CRPF','BSF','CISF','ITBP','Coast Guard','Indian Army','Indian Navy','Indian Air Force','NTA','NABARD','SIDBI','Bank of Baroda','Punjab National Bank','Canara Bank','Union Bank','DMRC','AAI','NHAI'];
const CATEGORIES = ['Banking','Defence','Railways','Teaching','PSU','Police','Health','State PSC'];
const POST_TYPES = [
  { value: 'job', label: '💼 Job' },
  { value: 'result', label: '📊 Result' },
  { value: 'admit_card', label: '🎫 Admit Card' },
  { value: 'answer_key', label: '🔑 Answer Key' },
  { value: 'syllabus', label: '📚 Syllabus' },
  { value: 'admission', label: '🎓 Admission' },
];

const inp: React.CSSProperties = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-subtle)', color:'var(--text-primary)', fontSize:14, outline:'none', boxSizing:'border-box' };
const lbl: React.CSSProperties = { display:'block', fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' };

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const isNew = postId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');
  const [sendTelegram, setSendTelegram] = useState(true);

  const [f, setF] = useState({
    title: '', post_type: 'job', department: '', category: '',
    vacancies: '', apply_start: '', apply_end: '', exam_date: '',
    description: '', source_url: '', pdf_url: '', salary: '',
    seo_title: '', seo_desc: '', featured: false, trending: false,
    status: 'draft',
  });
  const [dates, setDates] = useState([{ label: '', date: '' }]);
  const [elig, setElig] = useState([{ label: 'Age Limit', value: '' }, { label: 'Qualification', value: '' }]);

  const s = (k: string, v: any) => setF(x => ({ ...x, [k]: v }));

  // Load existing post
  useEffect(() => {
    if (isNew) return;
    fetch(`${SUPABASE_URL}/posts?id=eq.${postId}&select=*,departments(id,name,slug),categories(id,name,slug)&limit=1`, { headers: H })
      .then(r => r.json())
      .then(data => {
        const p = data[0];
        if (!p) return;
        setF({
          title: p.title || '',
          post_type: p.post_type || 'job',
          department: p.departments?.name || '',
          category: p.categories?.name || '',
          vacancies: p.total_vacancies?.toString() || '',
          apply_start: p.application_start ? p.application_start.split('T')[0] : '',
          apply_end: p.application_end ? p.application_end.split('T')[0] : '',
          exam_date: p.exam_date ? p.exam_date.split('T')[0] : '',
          description: p.description || '',
          source_url: p.source_url || '',
          pdf_url: p.pdf_urls?.[0] || '',
          salary: p.salary_range?.text || '',
          seo_title: p.seo_title || '',
          seo_desc: p.seo_description || '',
          featured: p.is_featured || false,
          trending: p.is_trending || false,
          status: p.status || 'draft',
        });
        if (p.important_dates?.length) setDates(p.important_dates);
        if (p.eligibility?.length) setElig(p.eligibility);
        setLoading(false);
      });
  }, [postId, isNew]);

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^\w\s-]/g,'').replace(/[\s_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,180);
  }

  const save = async (newStatus: string) => {
    if (!f.title.trim()) { setErr('Title is required'); return; }
    setSaving(true); setErr(''); setStatus('Saving...');

    try {
      const seoTitle = (f.seo_title || `${f.title} — Official Notification`).slice(0, 80);
      const seoDesc = (f.seo_desc || `${f.title}${f.vacancies ? `. ${f.vacancies} vacancies` : ''}. Check details and apply.`).slice(0, 155);

      const payload: any = {
        title: f.title.trim(),
        post_type: f.post_type,
        status: newStatus,
        description: f.description || null,
        source_url: f.source_url || null,
        is_featured: f.featured,
        is_trending: f.trending,
        seo_title: seoTitle,
        seo_description: seoDesc,
        updated_at: new Date().toISOString(),
      };
      if (f.vacancies) payload.total_vacancies = parseInt(f.vacancies);
      if (f.apply_start) payload.application_start = new Date(f.apply_start).toISOString();
      if (f.apply_end) payload.application_end = new Date(f.apply_end).toISOString();
      if (f.exam_date) payload.exam_date = new Date(f.exam_date).toISOString();
      if (f.salary) payload.salary_range = { text: f.salary };
      if (f.pdf_url) payload.pdf_urls = [f.pdf_url];
      const validDates = dates.filter(d => d.label && d.date);
      if (validDates.length) payload.important_dates = validDates;
      const validElig = elig.filter(e => e.label && e.value);
      if (validElig.length) payload.eligibility = validElig;
      if (newStatus === 'published') payload.published_at = new Date().toISOString();

      // Get dept + category IDs
      if (f.department) {
        const deptSlug = slugify(f.department);
        const dr = await fetch(`${SUPABASE_URL}/departments?slug=eq.${deptSlug}&select=id&limit=1`, { headers: H });
        const depts = await dr.json();
        if (depts[0]) payload.department_id = depts[0].id;
      }
      if (f.category) {
        const catSlug = slugify(f.category);
        const cr = await fetch(`${SUPABASE_URL}/categories?slug=eq.${catSlug}&select=id&limit=1`, { headers: H });
        const cats = await cr.json();
        if (cats[0]) payload.category_id = cats[0].id;
      }

      let savedSlug = '';

      if (isNew) {
        // Create new post
        const slug = slugify(f.title) + '-' + Date.now().toString().slice(-5);
        payload.slug = slug;
        payload.source_type = 'official';
        const res = await fetch(`${SUPABASE_URL}/posts`, {
          method: 'POST', headers: H, body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const saved = await res.json();
        savedSlug = saved[0]?.slug || slug;
      } else {
        // Update existing post
        const res = await fetch(`${SUPABASE_URL}/posts?id=eq.${postId}`, {
          method: 'PATCH', headers: H, body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        // Get slug for Telegram
        const gr = await fetch(`${SUPABASE_URL}/posts?id=eq.${postId}&select=slug&limit=1`, { headers: H });
        const gd = await gr.json();
        savedSlug = gd[0]?.slug || '';
      }

      // Send Telegram if publishing
      if (newStatus === 'published' && sendTelegram) {
        setStatus('Sending Telegram...');
        const emoji: any = { job:'💼', result:'📊', admit_card:'🎫', answer_key:'🔑', syllabus:'📚', admission:'🎓' };
        let caption = `${emoji[f.post_type]||'🔔'} *${f.title}*\n\n`;
        if (f.vacancies) caption += `📋 *Posts:* ${parseInt(f.vacancies).toLocaleString()}\n`;
        if (f.apply_end) caption += `⏰ *Last Date:* ${f.apply_end}\n`;
        caption += `\n🌐 [Full Details](https://rojgarresult.vercel.app/jobs/${savedSlug})`;
        if (f.source_url) caption += `\n📎 [Official Site](${f.source_url})`;
        caption += `\n\n#RojgarSchool #GovtJobs`;
        try {
          await fetch(`${API}/api/v1/telegram/send`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caption }),
          });
        } catch {}
      }

      setStatus(newStatus === 'published' ? '✅ Published!' : '✅ Saved!');
      setTimeout(() => router.push('/admin/posts'), 1500);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading post...</div>;
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <nav style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link href="/admin/posts" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Posts</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)' }}>{isNew ? 'New Post' : 'Edit Post'}</span>
      </nav>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
          {isNew ? 'Add New Post' : 'Edit Post'}
        </h1>
        {!isNew && f.status === 'published' && (
          <a href={`/jobs/${postId}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
            <ExternalLink size={13} /> View on site
          </a>
        )}
      </div>

      {err && <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 16 }}>{err}</div>}
      {status && <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#15803d', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={14} />{status}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Title */}
        <div className="card" style={{ padding: 18 }}>
          <label style={lbl}>Title *</label>
          <input style={{ ...inp, fontSize: 16 }} placeholder="e.g. SSC CGL 2025 — 17727 Posts" value={f.title} onChange={e => s('title', e.target.value)} />
        </div>

        {/* Type + Dept + Category */}
        <div className="card" style={{ padding: 18, display: 'grid', gap: 12 }}>
          <div>
            <label style={lbl}>Post Type *</label>
            <select style={inp} value={f.post_type} onChange={e => s('post_type', e.target.value)}>
              {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Department *</label>
            <select style={inp} value={f.department} onChange={e => s('department', e.target.value)}>
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Category</label>
            <select style={inp} value={f.category} onChange={e => s('category', e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Vacancies + Dates */}
        <div className="card" style={{ padding: 18, display: 'grid', gap: 12 }}>
          <div>
            <label style={lbl}>Total Vacancies</label>
            <input style={inp} type="number" placeholder="e.g. 1056" value={f.vacancies} onChange={e => s('vacancies', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>Apply From</label><input style={inp} type="date" value={f.apply_start} onChange={e => s('apply_start', e.target.value)} /></div>
            <div><label style={lbl}>Last Date</label><input style={inp} type="date" value={f.apply_end} onChange={e => s('apply_end', e.target.value)} /></div>
          </div>
          <div><label style={lbl}>Exam Date</label><input style={inp} type="date" value={f.exam_date} onChange={e => s('exam_date', e.target.value)} /></div>
          <div><label style={lbl}>Salary / Pay Scale</label><input style={inp} placeholder="e.g. ₹56,100 – ₹1,77,500" value={f.salary} onChange={e => s('salary', e.target.value)} /></div>
        </div>

        {/* Important Dates */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Important Dates</label>
            <button onClick={() => setDates(d => [...d, { label: '', date: '' }])} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={12} /> Add
            </button>
          </div>
          {dates.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8 }}>
              <input style={inp} placeholder="Label (e.g. Last Date)" value={row.label} onChange={e => setDates(d => d.map((r,j) => j===i ? {...r,label:e.target.value} : r))} />
              <input style={inp} type="date" value={row.date} onChange={e => setDates(d => d.map((r,j) => j===i ? {...r,date:e.target.value} : r))} />
              <button onClick={() => setDates(d => d.filter((_,j) => j!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:'#dc2626' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Eligibility */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Eligibility</label>
            <button onClick={() => setElig(e => [...e, { label: '', value: '' }])} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={12} /> Add
            </button>
          </div>
          {elig.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, marginBottom: 8 }}>
              <input style={inp} placeholder="Label" value={row.label} onChange={e => setElig(d => d.map((r,j) => j===i ? {...r,label:e.target.value} : r))} />
              <input style={inp} placeholder="Value" value={row.value} onChange={e => setElig(d => d.map((r,j) => j===i ? {...r,value:e.target.value} : r))} />
              <button onClick={() => setElig(d => d.filter((_,j) => j!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:'#dc2626' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="card" style={{ padding: 18 }}>
          <label style={lbl}>Description</label>
          <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} placeholder="Brief description..." value={f.description} onChange={e => s('description', e.target.value)} />
        </div>

        {/* Links — IMPORTANT: source_url must be OFFICIAL website */}
        <div className="card" style={{ padding: 18, display: 'grid', gap: 12 }}>
          <div>
            <label style={lbl}>
              Official Website URL
              <span style={{ color: 'var(--accent)', fontWeight: 400, marginLeft: 6 }}>← Must be official dept website (not third-party)</span>
            </label>
            <input style={inp} placeholder="https://ssc.nic.in or https://upsc.gov.in" value={f.source_url} onChange={e => s('source_url', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>PDF / Notification URL</label>
            <input style={inp} placeholder="https://ssc.nic.in/notice.pdf" value={f.pdf_url} onChange={e => s('pdf_url', e.target.value)} />
          </div>
        </div>

        {/* SEO */}
        <div className="card" style={{ padding: 18, display: 'grid', gap: 12 }}>
          <div>
            <label style={lbl}>SEO Title <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({f.seo_title.length}/80)</span></label>
            <input style={inp} placeholder="Auto-generated if empty" value={f.seo_title} onChange={e => s('seo_title', e.target.value)} maxLength={80} />
          </div>
          <div>
            <label style={lbl}>SEO Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({f.seo_desc.length}/155)</span></label>
            <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }} placeholder="Auto-generated if empty" value={f.seo_desc} onChange={e => s('seo_desc', e.target.value)} maxLength={155} />
          </div>
        </div>

        {/* Flags */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
            {[['featured','⭐ Featured'],['trending','🔥 Trending']].map(([k,lbl]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={(f as any)[k]} onChange={e => s(k, e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--accent)' }} />
                {lbl}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 8 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Send Telegram Alert</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Only sent when publishing</p>
            </div>
            <input type="checkbox" checked={sendTelegram} onChange={e => setSendTelegram(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }} />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, paddingBottom: 40 }}>
          <button onClick={() => save('published')} disabled={saving}
            style={{ flex: 1, padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 700, background: saving ? '#ccc' : 'var(--accent)', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving ? 'Saving...' : <><Send size={15} /> Publish</>}
          </button>
          <button onClick={() => save('draft')} disabled={saving}
            style={{ padding: '14px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={15} /> Save Draft
          </button>
          <button onClick={() => router.back()}
            style={{ padding: '14px 18px', borderRadius: 10, fontSize: 14, background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
