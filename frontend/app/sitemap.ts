import type { MetadataRoute } from 'next';
import { getAllSlugs, getDepartments, getCategories, getStates } from '@/lib/supabase';
import { MOCK_POSTS, DEPARTMENTS, CATEGORIES, STATES } from '@/lib/mock-data';

const BASE_URL = 'https://rojgarschool.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${BASE_URL}/jobs`, lastModified: now, changeFrequency: 'hourly', priority: 0.95 },
    { url: `${BASE_URL}/results`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/admit-card`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE_URL}/answer-key`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE_URL}/syllabus`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/admission`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  // Post pages from Supabase (with fallback to mock)
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const { data: slugs } = await getAllSlugs();
    if (slugs && slugs.length > 0) {
      postPages = slugs.map((p) => {
        const prefix = p.post_type === 'job' ? 'jobs'
          : p.post_type === 'admit_card' ? 'admit-card'
          : p.post_type === 'answer_key' ? 'answer-key'
          : p.post_type;
        return {
          url: `${BASE_URL}/${prefix}/${p.slug}`,
          lastModified: new Date(p.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });
    }
  } catch {
    // Fallback to mock
    postPages = MOCK_POSTS.map((post) => ({
      url: `${BASE_URL}/jobs/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  }

  // Department pages
  let deptPages: MetadataRoute.Sitemap = [];
  try {
    const { data: depts } = await getDepartments();
    if (depts && Array.isArray(depts)) {
      deptPages = (depts as any[]).map((d) => ({
        url: `${BASE_URL}/department/${d.slug}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.75,
      }));
    }
  } catch {
    deptPages = DEPARTMENTS.map((d) => ({
      url: `${BASE_URL}/department/${d.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.75,
    }));
  }

  // Category + state pages (static list is fine — doesn't change)
  const catPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE_URL}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.75,
  }));

  const statePages: MetadataRoute.Sitemap = STATES.map((s) => ({
    url: `${BASE_URL}/state/${s.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticPages, ...postPages, ...deptPages, ...catPages, ...statePages];
}
