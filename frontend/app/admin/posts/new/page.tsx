'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Save, Send, Plus, Trash2 } from 'lucide-react';

const DEPARTMENTS = [
  'UPSC','SSC','IBPS','RRB','SBI','RBI','DRDO','ISRO','NTPC','ONGC','IOCL',
  'BHEL','HAL','SAIL','GAIL','BEL','FCI','DSSSB','KVS','NVS','AIIMS','ESIC',
  'CRPF','BSF','CISF','ITBP','Coast Guard','Indian Army','Indian Navy',
  'Indian Air Force','NTA','NABARD','SIDBI','Bank of Baroda','Punjab National Bank',
  'Canara Bank','Union Bank',
];

const CATEGORIES = [
  'Banking','Defence','Railways','Teaching','PSU','Police','Health','State PSC',
];

const POST_TYPES = [
  { value: 'job', label: 'Job Notification' },
  { value: 'result', label: 'Result' },
  { value: 'admit_card', label: 'Admit Card' },
  { value: 'answer_key', label: 'Answer Key' },
  { value: 'syllabus', label: 'Syllabus' },
  { value: 'admission', label: 'Admission' },
];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://urfzljcwduycxywyzlnt.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [sendTelegram, setSendTelegram] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    post_type: 'job',
    department: '',
    category: '',
    total_vacancies: '',
    application_start: '',
    application_end: '',
    exam_date: '',
    description: '',
    source_url: '',
    pdf_url: '',
    salary_text: '',
    seo_title: '',
    seo_description: '',
    is_featured: false,
    is_trending: false,
  });

  const [importantDates, setImportantDates] = useState([
    { label: '', date: '' },
  ]);

  const [eligibility, setEligibility] = useState([
    { label: 'Age Limit', value: '' },
    { label: 'Qualification', value: '' },
  ]);

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 200);

  const buildTelegramCaption = () => {
    const emoji = { job: '💼', result: '📊', admit_card: '🎫', answer_key: '🔑', syllabus: '📚', admission: '🎓' }[form.post_type] || '🔔';
    let msg = `${emoji} *${form.title}*\n\n`;
    if (form.total_vacancies) msg += `📋 *Posts:* ${form.total_vacancies}\n`;
    if (form.application_start) msg += `📅 *Apply From:* ${form.application_start}\n`;
    if (form.application_end) msg += `⏰ *Last Date:* ${form.application_end}\n`;
    if (form.exam_date) msg += `📝 *Exam Date:* ${form.exam_date}\n`;
    if (form.salary_text) msg += `💰 *Salary:* ${form.salary_text}\n`;
    msg += `\n🌐 Full Details: https://rojgarresult.vercel.app/jobs/${slugify(form.title)}\n`;
    if (form.source_url) msg += `📎 Official Site: ${form.source_url}\n`;
    msg += `\n#RojgarSchool #GovtJobs #${form.department.replace(/\s/g, '')} #${form.category.replace(/\s/g, '')}`;
    return msg;
  };

  const sendToTelegram = async (caption: string, pdfUrl: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rojgarresult-production.up.railway.app';
    try {
      const res = await fetch(`${API_URL}/api/v1/telegram/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, pdf_url: pdfUrl || null }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (status: 'published' | 'draft') => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.department) { setError('Department is required'); return; }
    if (!form.post_type) { setError('Post type is required'); return; }

    setSaving(true);
    setError('');

    try {
      const slug = slugify(form.title) + '-' + Date.now().toString().slice(-4);

      const seoTitle = form.seo_title || `${form.title} — Apply Online, Official Notification`;
      const seoDesc = form.seo_description || `${form.title}${form.total_vacancies ? `. ${form.total_vacancies} vacancies` : ''}${form.application_end ? `. Last date: ${form.application_end}` : ''}. Check eligibility and apply online.`.slice(0, 155);

      // Find department_id and category_id from Supabase
      const [deptRes, catRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/departments?slug=eq.${slugify(form.department)}&select=id&limit=1`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        }),
        fetch(`${SUPABASE_URL}/rest/v1/categories?slug=eq.${slugify(form.category)}&select=id&limit=1`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        }),
      ]);

      const [depts, cats] = await Promise.all([deptRes.json(), catRes.json()]);
      const department_id = depts[0]?.id || null;
      const category_id = cats[0]?.id || null;

      const payload: any = {
        slug,
        title: form.title.trim(),
        post_type: form.post_type,
        status,
        source_type: 'official',
        source_url: form.source_url || null,
        department_id,
        category_id,
        description: form.description || null,
        is_featured: form.is_featured,
        is_trending: form.is_trending,
        seo_title: seoTitle.slice(0, 80),
        seo_description: seoDesc,
        published_at: status === 'published' ? new Date().toISOString() : null,
      };

      if (form.total_vacancies) payload.total_vacancies = parseInt(form.total_vacancies);
      if (form.application_start) payload.application_start = new Date(form.application_start).toISOString();
      if (form.application_end) payload.application_end = new Date(form.application_end).toISOString();
      if (form.exam_date) payload.exam_date = new Date(form.exam_date).toISOString();
      if (form.salary_text) payload.salary_range = { text: form.salary_text };
      if (form.pdf_url) payload.pdf_urls = [form.pdf_url];

      const validDates = importantDates.filter(d => d.label && d.date);
      if (validDates.length > 0) payload.important_dates = validDates;

      const validEligibility = eligibility.filter(e => e.label && e.value);
      if (validEligibility.length > 0) payload.eligibility = validEligibility;

      // Insert into Supabase
      const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      // Send Telegram if published and toggled on
      if (status === 'published' && sendTelegram) {
        const caption = buildTelegramCaption();
        const tgOk = await sendToTelegram(caption, form.pdf_url);
        setSuccess(tgOk
          ? '✅ Post published and Telegram alert sent!'
          : '✅ Post published! (Telegram alert failed — check bot token in Railway)');
      } else {
        setSuccess(status === 'published' ? '✅ Post published!' : '✅ Draft saved!');
      }

      setTimeout(() => router.push('/admin/posts'), 1500);
    } catch (e: any) {
      setError(`Failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--bg-subtle)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: 6,
    textTransform: 'uppercase' as const, letterSpacing: '0.04em',
  };

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header */}
      <nav style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link href="/admin/posts" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Posts</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)' }}>New Post</span>
      </nav>

      <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
        Add New Post
      </h1>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#15803d', marginBottom: 16 }}>
          {success}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Title */}
        <div className="card" style={{ padding: 20 }}>
          <label style={labelStyle}>Post Title *</label>
          <input
            style={{ ...inputStyle, fontSize: 16 }}
            placeholder="e.g. SSC CGL 2025 Recruitment — 17727 Posts"
            value={form.title}
            onChange={e => set('title', e.target.value)}
          />
        </div>

        {/* Type + Dept + Category */}
        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <div>
            <label style={labelStyle}>Post Type *</label>
            <select style={inputStyle} value={form.post_type} onChange={e => set('post_type', e.target.value)}>
              {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Department *</label>
            <select style={inputStyle} value={form.department} onChange={e => set('department', e.target.value)}>
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Vacancy + Dates */}
        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <div>
            <label style={labelStyle}>Total Vacancies</label>
            <input style={inputStyle} type="number" placeholder="e.g. 1056" value={form.total_vacancies} onChange={e => set('total_vacancies', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Apply Start</label>
              <input style={inputStyle} type="date" value={form.application_start} onChange={e => set('application_start', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Last Date *</label>
              <input style={inputStyle} type="date" value={form.application_end} onChange={e => set('application_end', e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Exam Date</label>
            <input style={inputStyle} type="date" value={form.exam_date} onChange={e => set('exam_date', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Salary / Pay Scale</label>
            <input style={inputStyle} placeholder="e.g. ₹56,100 – ₹1,77,500 (Level 10)" value={form.salary_text} onChange={e => set('salary_text', e.target.value)} />
          </div>
        </div>

        {/* Important Dates */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Important Dates</label>
            <button onClick={() => setImportantDates(d => [...d, { label: '', date: '' }])}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Plus size={13} /> Add row
            </button>
          </div>
          {importantDates.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8 }}>
              <input style={inputStyle} placeholder="Label (e.g. Last Date)" value={row.label}
                onChange={e => setImportantDates(d => d.map((r, j) => j === i ? { ...r, label: e.target.value } : r))} />
              <input style={inputStyle} type="date" value={row.date}
                onChange={e => setImportantDates(d => d.map((r, j) => j === i ? { ...r, date: e.target.value } : r))} />
              <button onClick={() => setImportantDates(d => d.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Eligibility */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Eligibility</label>
            <button onClick={() => setEligibility(e => [...e, { label: '', value: '' }])}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Plus size={13} /> Add row
            </button>
          </div>
          {eligibility.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, marginBottom: 8 }}>
              <input style={inputStyle} placeholder="Label" value={row.label}
                onChange={e => setEligibility(d => d.map((r, j) => j === i ? { ...r, label: e.target.value } : r))} />
              <input style={inputStyle} placeholder="Value" value={row.value}
                onChange={e => setEligibility(d => d.map((r, j) => j === i ? { ...r, value: e.target.value } : r))} />
              <button onClick={() => setEligibility(d => d.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="card" style={{ padding: 20 }}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
            placeholder="Brief description about this notification..."
            value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        {/* Links */}
        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <div>
            <label style={labelStyle}>Official Website URL</label>
            <input style={inputStyle} placeholder="https://ssc.nic.in" value={form.source_url} onChange={e => set('source_url', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>PDF / Notification URL</label>
            <input style={inputStyle} placeholder="https://ssc.nic.in/notice.pdf" value={form.pdf_url} onChange={e => set('pdf_url', e.target.value)} />
          </div>
        </div>

        {/* SEO */}
        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <div>
            <label style={labelStyle}>SEO Title <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(max 80 chars — leave blank to auto-generate)</span></label>
            <input style={inputStyle} placeholder="Auto-generated if empty" value={form.seo_title} onChange={e => set('seo_title', e.target.value)} maxLength={80} />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{form.seo_title.length}/80</p>
          </div>
          <div>
            <label style={labelStyle}>SEO Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(max 155 chars)</span></label>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
              placeholder="Auto-generated if empty" value={form.seo_description}
              onChange={e => set('seo_description', e.target.value)} maxLength={155} />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{form.seo_description.length}/155</p>
          </div>
        </div>

        {/* Flags */}
        <div className="card" style={{ padding: 20, display: 'flex', gap: 24 }}>
          {[
            { key: 'is_featured', label: 'Featured post' },
            { key: 'is_trending', label: 'Mark as trending' },
          ].map(({ key, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={(form as any)[key]} onChange={e => set(key, e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              {label}
            </label>
          ))}
        </div>

        {/* Telegram toggle */}
        <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Send Telegram Alert</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Posts to @rojgarschool channel when published</p>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
            <input type="checkbox" checked={sendTelegram} onChange={e => setSendTelegram(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{
              position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: 24,
              background: sendTelegram ? 'var(--accent)' : 'var(--border)', transition: '0.2s',
            }}>
              <span style={{
                position: 'absolute', height: 18, width: 18, left: sendTelegram ? 23 : 3, bottom: 3,
                background: 'white', borderRadius: '50%', transition: '0.2s',
              }} />
            </span>
          </label>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, paddingBottom: 40 }}>
          <button
            onClick={() => handleSubmit('published')}
            disabled={saving}
            style={{
              flex: 1, padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700,
              background: saving ? 'var(--text-muted)' : 'var(--accent)', color: 'white',
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {saving ? 'Publishing...' : <><Send size={16} /> Publish Now</>}
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            style={{
              padding: '13px 20px', borderRadius: 10, fontSize: 15, fontWeight: 600,
              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <Save size={16} /> Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}
