// lib/supabase.ts
// Connects Next.js frontend directly to Supabase for real data

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://urfzljcwduycxywyzlnt.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type SupabaseResponse<T> = { data: T | null; error: string | null };

async function supabaseFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<SupabaseResponse<T>> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...options.headers,
      },
      next: { revalidate: 1800 }, // 30 min ISR
    });

    if (!res.ok) {
      const err = await res.text();
      return { data: null, error: err };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(options: {
  type?: string;
  status?: string;
  featured?: boolean;
  trending?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const params = new URLSearchParams();
  params.set('select', 'id,slug,title,post_type,status,total_vacancies,application_end,exam_date,is_featured,is_trending,view_count,published_at,department_id,category_id,departments(id,name,slug,official_site),categories(id,name,slug,color)');
  params.set('order', 'published_at.desc');
  params.set('limit', String(options.limit || 20));
  if (options.offset) params.set('offset', String(options.offset));
  if (options.status) params.set('status', `eq.${options.status}`);
  else params.set('status', 'eq.published');
  if (options.type) params.set('post_type', `eq.${options.type}`);
  if (options.featured) params.set('is_featured', 'eq.true');
  if (options.trending) params.set('is_trending', 'eq.true');

  return supabaseFetch(`posts?${params}`);
}

export async function getPostBySlug(slug: string) {
  const params = new URLSearchParams();
  params.set('select', '*,departments(id,name,slug,official_site),categories(id,name,slug,color)');
  params.set('slug', `eq.${slug}`);
  params.set('status', 'eq.published');
  params.set('limit', '1');

  const { data, error } = await supabaseFetch<any[]>(`posts?${params}`);
  return { data: data?.[0] || null, error };
}

export async function getRelatedPosts(departmentId: number, categoryId: number, excludeId: number) {
  const params = new URLSearchParams();
  params.set('select', 'id,slug,title,post_type,status,application_end,published_at,departments(id,name,slug),categories(id,name,slug)');
  params.set('status', 'eq.published');
  params.set('or', `(department_id.eq.${departmentId},category_id.eq.${categoryId})`);
  params.set('id', `neq.${excludeId}`);
  params.set('limit', '4');
  params.set('order', 'published_at.desc');

  return supabaseFetch(`posts?${params}`);
}

export async function getDeadlineSoon(days = 7) {
  const now = new Date().toISOString();
  const future = new Date(Date.now() + days * 86400000).toISOString();
  const params = new URLSearchParams();
  params.set('select', 'id,slug,title,post_type,status,application_end,published_at,departments(id,name,slug),categories(id,name,slug)');
  params.set('status', 'eq.published');
  params.set('post_type', 'eq.job');
  params.set('application_end', `gte.${now}`);
  params.set('application_end', `lte.${future}`);
  params.set('order', 'application_end.asc');
  params.set('limit', '6');

  return supabaseFetch(`posts?${params}`);
}

// ─── Reference data ──────────────────────────────────────────────────────────

export async function getDepartments() {
  return supabaseFetch('departments?select=id,name,slug,official_site&order=name.asc');
}

export async function getDepartmentBySlug(slug: string) {
  const { data, error } = await supabaseFetch<any[]>(
    `departments?select=id,name,slug,official_site&slug=eq.${slug}&limit=1`
  );
  return { data: data?.[0] || null, error };
}

export async function getCategories() {
  return supabaseFetch('categories?select=id,name,slug,color&order=name.asc');
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabaseFetch<any[]>(
    `categories?select=id,name,slug,color&slug=eq.${slug}&limit=1`
  );
  return { data: data?.[0] || null, error };
}

export async function getStates() {
  return supabaseFetch('states?select=id,name,slug,code&order=name.asc');
}

export async function getStateBySlug(slug: string) {
  const { data, error } = await supabaseFetch<any[]>(
    `states?select=id,name,slug,code&slug=eq.${slug}&limit=1`
  );
  return { data: data?.[0] || null, error };
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchPosts(query: string, limit = 20) {
  // Supabase PostgREST full-text search
  const params = new URLSearchParams();
  params.set('select', 'id,slug,title,post_type,status,application_end,published_at,departments(id,name,slug),categories(id,name,slug)');
  params.set('status', 'eq.published');
  params.set('or', `(title.ilike.*${query}*,description.ilike.*${query}*)`);
  params.set('order', 'published_at.desc');
  params.set('limit', String(limit));

  return supabaseFetch(`posts?${params}`);
}

// ─── Post counts for sitemap ──────────────────────────────────────────────────

export async function getAllSlugs(type?: string) {
  const params = new URLSearchParams();
  params.set('select', 'slug,post_type,updated_at');
  params.set('status', 'eq.published');
  if (type) params.set('post_type', `eq.${type}`);
  params.set('order', 'published_at.desc');

  return supabaseFetch<{ slug: string; post_type: string; updated_at: string }[]>(`posts?${params}`);
}
