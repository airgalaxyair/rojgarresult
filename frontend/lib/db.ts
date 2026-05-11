// Direct Supabase REST calls — used by all pages instead of mock data

const URL = 'https://urfzljcwduycxywyzlnt.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g';

const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const SELECT_POST = 'id,slug,title,post_type,status,source_type,total_vacancies,application_start,application_end,exam_date,is_featured,is_trending,is_pinned,view_count,published_at,updated_at,description,important_dates,eligibility,salary_range,pdf_urls,notice_image_url,source_url,seo_title,seo_description,departments(id,name,slug,official_site),categories(id,name,slug,color)';

async function get(path: string, revalidate = 300) {
  try {
    const res = await fetch(`${URL}/${path}`, {
      headers: H,
      next: { revalidate },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getPosts({ type, limit = 20, featured, trending }: { type?: string; limit?: number; featured?: boolean; trending?: boolean } = {}) {
  let q = `posts?select=${SELECT_POST}&status=eq.published&order=published_at.desc&limit=${limit}`;
  if (type) q += `&post_type=eq.${type}`;
  if (featured) q += `&is_featured=eq.true`;
  if (trending) q += `&is_trending=eq.true`;
  return get(q, 300);
}

export async function getPostBySlug(slug: string) {
  const data = await get(`posts?select=${SELECT_POST}&slug=eq.${slug}&status=eq.published&limit=1`, 300);
  return data[0] || null;
}

export async function getAllPublishedSlugs() {
  return get('posts?select=slug,post_type,updated_at&status=eq.published&order=published_at.desc', 3600);
}

export async function getDeadlineSoon() {
  const now = new Date().toISOString();
  const week = new Date(Date.now() + 7 * 86400000).toISOString();
  return get(`posts?select=${SELECT_POST}&status=eq.published&post_type=eq.job&application_end=gte.${now}&application_end=lte.${week}&order=application_end.asc&limit=6`, 600);
}

export async function searchPosts(q: string) {
  return get(`posts?select=${SELECT_POST}&status=eq.published&or=(title.ilike.*${encodeURIComponent(q)}*,description.ilike.*${encodeURIComponent(q)}*)&order=published_at.desc&limit=30`, 60);
}

export async function getDepts() {
  return get('departments?select=id,name,slug,official_site&order=name.asc', 86400);
}

export async function getDeptBySlug(slug: string) {
  const data = await get(`departments?select=id,name,slug,official_site&slug=eq.${slug}&limit=1`, 86400);
  return data[0] || null;
}

export async function getPostsByDept(departmentId: number) {
  return get(`posts?select=${SELECT_POST}&status=eq.published&department_id=eq.${departmentId}&order=published_at.desc&limit=20`, 300);
}

export async function getPostsByCategory(categorySlug: string) {
  // Get category id first
  const cats = await get(`categories?select=id&slug=eq.${categorySlug}&limit=1`, 86400);
  if (!cats[0]) return [];
  return get(`posts?select=${SELECT_POST}&status=eq.published&category_id=eq.${cats[0].id}&order=published_at.desc&limit=20`, 300);
}

// Normalize post from Supabase to match component expectations
export function normalize(p: any) {
  if (!p) return null;
  return {
    ...p,
    department: p.departments || { id: 0, name: 'Unknown', slug: 'unknown' },
    category: p.categories || { id: 0, name: 'General', slug: 'general' },
    states: [],
  };
}

export function normalizeAll(posts: any[]) {
  return posts.map(normalize).filter(Boolean);
}
