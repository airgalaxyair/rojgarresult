'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Send, Save, Plus, Trash2, CheckCircle } from 'lucide-react';

const SUPABASE_URL = 'https://urfzljcwduycxywyzlnt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g';
const API_URL = 'https://rojgarresult-production.up.railway.app';

const DEPARTMENTS = ['UPSC','SSC','IBPS','RRB','SBI','RBI','DRDO','ISRO','NTPC','ONGC','IOCL','BHEL','HAL','SAIL','GAIL','BEL','FCI','DSSSB','KVS','NVS','AIIMS','ESIC','CRPF','BSF','CISF','ITBP','Coast Guard','Indian Army','Indian Navy','Indian Air Force','NTA','NABARD','SIDBI','Bank of Baroda','Punjab National Bank','Canara Bank','Union Bank'];
const CATEGORIES = ['Banking','Defence','Railways','Teaching','PSU','Police','Health','State PSC'];
const POST_TYPES = [
  { value: 'job', label: '💼 Job Notification' },
  { value: 'result', label: '📊 Result' },
  { value: 'admit_card', label: '🎫 Admit Card' },
  { value: 'answer_key', label: '🔑 Answer Key' },
  { value: 'syllabus', label: '📚 Syllabus' },
  { value: 'admission', label: '🎓 Admission' },
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180);
}

const input: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-subtle)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
};
const label: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em',
};

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [telegram, setTelegram] = useState(true);
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');

  const [f, setF] = useState({
    title: '', post_type: 'job', department: '', category: '',
    vacancies: '', apply_start: '', apply_end: '', exam_date: '',
    description: '', source_url: '', pdf_url: '', salary: '',
    seo_title: '', seo_desc: '', featured: false, trending: false,
  });
  const s = (k: string, v: any) => setF(x => ({ ...x, [k]: v }));

  const [dates, setDates] = useState([{ label: '', date: '' }]);
  const [elig, setElig] = useState([
    { label: 'Age Limit', value: '' },
    { label: 'Qualification', value: '' },
  ]);

  const publish = async (postStatus: 'published' | 'draft') => {
    if (!f.title.trim()) { setErr('Title is required'); return; }
    if (!f.department) { setErr('Department is required'); return; }
    setSaving(true); setErr(''); setStatus('Saving post...');

    try {
      const slug = slugify(f.title) + '-' + Date.now().toString().slice(-5);

      // Get department_id from Supabase
      const deptSlug = slugify(f.department);
      const deptRes = await fetch(
        `${SUPABASE_URL}/rest/v1/departments?slug=eq.${deptSlug}&select=id&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const depts = await deptRes.json();
      const department_id = depts[0]?.id || null;

      // Get category_id from Supabase
      let category_id = null;
      if (f.category) {
        const catSlug = slugify(f.category);
        const catRes = await fetch(
          `${SUPABASE_URL}/rest/v1/categories?slug=eq.${catSlug}&select=id&limit=1`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        const cats = await catRes.json();
        category_id = cats[0]?.id || null;
      }

      // Build post object
      const seoTitle = (f.seo_title || `${f.title} — Official Notification, Apply Online`).slice(0, 80);
      const seoDesc = (f.seo_desc || `${f.title}${f.vacancies ? `. ${f.vacancies} vacancies` : ''}${f.apply_end ? `. Last date: ${f.apply_end}` : ''}. Check eligibility and apply.`).slice(0, 155);

      const post: any = {
        slug,
        title: f.title.trim(),
        post_type: f.post_type,
        status: postStatus,
        source_type: 'official',
        source_url: f.source_url || null,
        department_id,
        category_id,
        description: f.description || null,
        is_featured: f.featured,
        is_trending: f.trending,
        seo_title: seoTitle,
        seo_description: seoDesc,
        published_at: postStatus === 'published' ? new Date().toISOString() : null,
      };

      if (f.vacancies) post.total_vacancies = parseInt(f.vacancies);
      if (f.apply_start) post.application_start = new Date(f.apply_start).toISOString();
      if (f.apply_end) post.application_end = new Date(f.apply_end).toISOString();
      if (f.exam_date) post.exam_date = new Date(f.exam_date).toISOString();
      if (f.salary) post.salary_range = { text: f.salary };
      if (f.pdf_url) post.pdf_urls = [f.pdf_url];

      const validDates = dates.filter(d => d.label && d.date);
      if (validDates.length) post.important_dates = validDates;
      const validElig = elig.filter(e => e.label && e.value);
      if (validElig.length) post.eligibility = validElig;

      // Save to Supabase directly
      const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(post),
      });

      if (!res.ok) {
        const e = await res.text();
        throw new Error(`Supabase error: ${e}`);
      }

      const saved = await res.json();
      const postId = saved[0]?.id;

      // Send Telegram if published
      if (postStatus === 'published' && telegram) {
        setStatus('Sending Telegram alert...');
        const emoji: any = { job:'💼', result:'📊', admit_card:'🎫', answer_key:'🔑', syllabus:'📚', admission:'🎓' };
        let caption = `${emoji[f.post_type] || '🔔'} *${f.title}*\n\n`;
        if (f.vacancies) caption += `📋 *Posts:* ${parseInt(f.vacancies).toLocaleString()}\n`;
        if (f.apply_start) caption += `📅 *Apply From:* ${f.apply_start}\n`;
        if (f.apply_end) caption += `⏰ *Last Date:* ${f.apply_end}\n`;
        if (f.exam_date) caption += `📝 *Exam Date:* ${f.exam_date}\n`;
        if (f.salary) caption += `💰 *Salary:* ${f.salary}\n`;
        caption += `\n🌐 [Full Details](https://rojgarresult.vercel.app/jobs/${slug})`;
        if (f.source_url) caption += `\n📎 [Official Site](${f.source_url})`;
        caption += `\n\n#RojgarSchool #GovtJobs #${f.department.replace(/\s/g,'')}`;

        try {
          const tgRes = await fetch(`${API_URL}/api/v1/telegram/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caption, pdf_url: f.pdf_url || null }),
          });
          const tgData = await tgRes.json();
          if (tgRes.ok) {
            setStatus('✅ Published and Telegram alert sent!');
          } else {
            setStatus(`✅ Post published! Telegram failed: ${tgData.detail || 'Check bot token in Railway'}`);
          }
        } catch {
          setStatus('✅ Post published! Telegram failed — check TELEGRAM_BOT_TOKEN in Railway variables.');
        }
      } else {
        setStatus(postStatus === 'published' ? '✅ Post published successfully!' : '✅ Draft saved!');
      }

      setTimeout(() => router.push('/admin/posts'), 2500);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <nav style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link href="/admin/posts" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Posts</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)' }}>New Post</span>
      </nav>

      <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
        Add New Post
      </h1>

      {err && <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 16 }}>{err}</div>}
      {status && (
        <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#15803d', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={14} />{status}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Title */}
        <div className="card" style={{ padding: 18 }}>
          <label style={label}>Post Title *</label>
          <input style={{ ...input, fontSize: 16 }} placeholder="e.g. SSC CGL 2025 — 17727 Posts" value={f.title} onChange={e => s('title', e.target.value)} />
        </div>

        {/* Type + Dept + Category */}
        <div className="card" style={{ padding: 18, display: 'grid', gap: 12 }}>
          <div>
            <label style={label}>Post Type *</label>
            <select style={input} value={f.post_type} onChange={e => s('post_type', e.target.value)}>
              {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Department *</label>
            <select style={input} value={f.department} onChange={e => s('department', e.target.value)}>
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Category</label>
            <select style={input} value={f.category} onChange={e => s('category', e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Vacancies + Dates + Salary */}
        <div className="card" style={{ padding: 18, display: 'grid', gap: 12 }}>
          <div>
            <label style={label}>Total Vacancies</label>
            <input style={input} type="number" placeholder="e.g. 1056" value={f.vacancies} onChange={e => s('vacancies', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={label}>Apply From</label>
              <input style={input} type="date" value={f.apply_start} onChange={e => s('apply_start', e.target.value)} />
            </div>
            <div>
              <label style={label}>Last Date</label>
              <input style={input} type="date" value={f.apply_end} onChange={e => s('apply_end', e.target.value)} />
            </div>
          </div>
          <div>
            <label style={label}>Exam Date</label>
            <input style={input} type="date" value={f.exam_date} onChange={e => s('exam_date', e.target.value)} />
          </div>
          <div>
            <label style={label}>Salary / Pay Scale</label>
            <input style={input} placeholder="e.g. ₹25,500 – ₹81,100 (Level 4–8)" value={f.salary} onChange={e => s('salary', e.target.value)} />
          </div>
        </div>

        {/* Important Dates */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ ...label, marginBottom: 0 }}>Important Dates</label>
            <button onClick={() => setDates(d => [...d, { label: '', date: '' }])}
              style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={12} /> Add
            </button>
          </div>
          {dates.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8 }}>
              <input style={input} placeholder="e.g. Last Date" value={row.label} onChange={e => setDates(d => d.map((r,j) => j===i ? {...r, label: e.target.value} : r))} />
              <input style={input} type="date" value={row.date} onChange={e => setDates(d => d.map((r,j) => j===i ? {...r, date: e.target.value} : r))} />
              <button onClick={() => setDates(d => d.filter((_,j) => j!==i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Eligibility */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ ...label, marginBottom: 0 }}>Eligibility</label>
            <button onClick={() => setElig(e => [...e, { label: '', value: '' }])}
              style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={12} /> Add
            </button>
          </div>
          {elig.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, marginBottom: 8 }}>
              <input style={input} placeholder="Label" value={row.label} onChange={e => setElig(d => d.map((r,j) => j===i ? {...r, label: e.target.value} : r))} />
              <input style={input} placeholder="Value" value={row.value} onChange={e => setElig(d => d.map((r,j) => j===i ? {...r, value: e.target.value} : r))} />
              <button onClick={() => setElig(d => d.filter((_,j) => j!==i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="card" style={{ padding: 18 }}>
          <label style={label}>Description</label>
          <textarea style={{ ...input, minHeight: 90, resize: 'vertical' }} placeholder="Brief description..." value={f.description} onChange={e => s('description', e.target.value)} />
        </div>

        {/* Links */}
        <div className="card" style={{ padding: 18, display: 'grid', gap: 12 }}>
          <div>
            <label style={label}>Official Website URL</label>
            <input style={input} placeholder="https://ssc.nic.in" value={f.source_url} onChange={e => s('source_url', e.target.value)} />
          </div>
          <div>
            <label style={label}>PDF / Notification URL</label>
            <input style={input} placeholder="https://ssc.nic.in/notice.pdf" value={f.pdf_url} onChange={e => s('pdf_url', e.target.value)} />
          </div>
        </div>

        {/* Flags + Telegram toggle */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
            {[['featured','⭐ Featured'],['trending','🔥 Trending']].map(([k,lbl]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={(f as any)[k]} onChange={e => s(k, e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--accent)' }} />
                {lbl}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 8 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Send Telegram Alert on Publish</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Posts to @rojgarschool automatically</p>
            </div>
            <input type="checkbox" checked={telegram} onChange={e => setTelegram(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }} />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, paddingBottom: 40 }}>
          <button onClick={() => publish('published')} disabled={saving}
            style={{ flex: 1, padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 700, background: saving ? '#ccc' : 'var(--accent)', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving ? 'Working...' : <><Send size={15} /> Publish Now</>}
          </button>
          <button onClick={() => publish('draft')} disabled={saving}
            style={{ padding: '14px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={15} /> Draft
          </button>
        </div>
      </div>
    </div>
  );
}
