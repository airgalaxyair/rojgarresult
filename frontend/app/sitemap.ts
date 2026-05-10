import type { MetadataRoute } from 'next';
import { MOCK_POSTS, DEPARTMENTS, CATEGORIES, STATES } from '@/lib/mock-data';

const BASE_URL = 'https://sarkarischool.in';

export default function sitemap(): MetadataRoute.Sitemap {
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
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ];

  // Post pages
  const postPages: MetadataRoute.Sitemap = MOCK_POSTS.map((post) => {
    const prefix = post.post_type === 'job' ? 'jobs'
      : post.post_type === 'admit_card' ? 'admit-card'
      : post.post_type === 'answer_key' ? 'answer-key'
      : post.post_type;
    return {
      url: `${BASE_URL}/${prefix}/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly',
      priority: post.is_featured ? 0.9 : 0.8,
    };
  });

  // Department pages
  const deptPages: MetadataRoute.Sitemap = DEPARTMENTS.map((d) => ({
    url: `${BASE_URL}/department/${d.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.75,
  }));

  // Category pages
  const catPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE_URL}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.75,
  }));

  // State pages
  const statePages: MetadataRoute.Sitemap = STATES.map((s) => ({
    url: `${BASE_URL}/state/${s.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticPages, ...postPages, ...deptPages, ...catPages, ...statePages];
}
