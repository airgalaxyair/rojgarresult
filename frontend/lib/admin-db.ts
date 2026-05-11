// Admin Supabase client — direct REST calls for admin operations

const URL = 'https://urfzljcwduycxywyzlnt.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };

const SEL = 'id,slug,title,post_type,status,source_type,total_vacancies,application_end,view_count,published_at,created_at,source_url,description,departments(id,name,slug),categories(id,name,slug)';

export async function adminGetPosts({ status, source_type, post_type, page = 1, limit = 30 }: {
  status?: string; source_type?: string; post_type?: string; page?: number; limit?: number;
}) {
  let q = `${URL}/posts?select=${SEL}&order=created_at.desc&limit=${limit}&offset=${(page-1)*limit}`;
  if (status && status !== 'all') q += `&status=eq.${status}`;
  if (source_type) q += `&source_type=eq.${source_type}`;
  if (post_type) q += `&post_type=eq.${post_type}`;
  
  const res = await fetch(q, { headers: { ...H, Prefer: 'count=exact' } });
  const total = parseInt(res.headers.get('content-range')?.split('/')[1] || '0');
  const data = await res.json();
  return { posts: Array.isArray(data) ? data : [], total };
}

export async function adminGetStats() {
  const res = await fetch(`${URL}/posts?select=status,source_type,post_type`, { headers: H });
  const all = await res.json();
  if (!Array.isArray(all)) return { published: 0, pending: 0, draft: 0, total: 0, official: 0, third_party: 0 };
  return {
    total: all.length,
    published: all.filter((p:any) => p.status === 'published').length,
    pending: all.filter((p:any) => p.status === 'pending_approval').length,
    draft: all.filter((p:any) => p.status === 'draft').length,
    official: all.filter((p:any) => p.source_type === 'official').length,
    third_party: all.filter((p:any) => p.source_type === 'third_party').length,
  };
}

export async function adminApprovePost(id: number) {
  // Approve = set status to published + set published_at
  const res = await fetch(`${URL}/posts?id=eq.${id}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({ status: 'published', published_at: new Date().toISOString() }),
  });
  return res.ok;
}

export async function adminRejectPost(id: number) {
  const res = await fetch(`${URL}/posts?id=eq.${id}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({ status: 'archived' }),
  });
  return res.ok;
}

export async function adminDeletePost(id: number) {
  const res = await fetch(`${URL}/posts?id=eq.${id}`, {
    method: 'DELETE',
    headers: H,
  });
  return res.ok;
}

export async function adminUpdatePost(id: number, data: Record<string, any>) {
  const res = await fetch(`${URL}/posts?id=eq.${id}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify(data),
  });
  return res.ok;
}

export async function adminGetScraperLogs() {
  const res = await fetch(`${URL}/scraper_raw_items?select=id,raw_hash,status,created_at,source_site_id&order=created_at.desc&limit=50`, { headers: H });
  return res.json();
}

export async function adminGetTelegramLogs() {
  const res = await fetch(`${URL}/telegram_logs?select=id,sent_at,status,error_message,post_id&order=sent_at.desc&limit=50`, { headers: H });
  return res.json();
}

export async function sendTelegramAlert(postId: number, title: string, slug: string, sourceUrl: string) {
  const API = 'https://rojgarresult-production.up.railway.app';
  const caption = `💼 *${title}*\n\n🌐 [Full Details](https://rojgarresult.vercel.app/jobs/${slug})\n📎 [Official Site](${sourceUrl})\n\n#RojgarSchool #GovtJobs`;
  const res = await fetch(`${API}/api/v1/telegram/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption }),
  });
  return res.ok;
}
