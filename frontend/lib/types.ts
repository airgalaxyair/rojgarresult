export type PostType = 'job' | 'result' | 'admit_card' | 'answer_key' | 'syllabus' | 'admission';
export type PostStatus = 'published' | 'draft' | 'pending_approval' | 'archived';

export interface Post {
  id: string;
  slug: string;
  title: string;
  post_type: PostType;
  status: PostStatus;
  department: Department;
  category: Category;
  states: State[];
  total_vacancies?: number;
  application_start?: string;
  application_end?: string;
  exam_date?: string;
  result_date?: string;
  description: string;
  important_dates?: ImportantDate[];
  eligibility?: EligibilityItem[];
  salary_range?: { min?: number; max?: number; text?: string };
  pdf_urls?: string[];
  featured_image_url?: string;
  is_featured?: boolean;
  is_pinned?: boolean;
  is_trending?: boolean;
  seo_title?: string;
  seo_description?: string;
  view_count?: number;
  published_at: string;
  updated_at: string;
  source_url?: string;
}

export interface ImportantDate {
  label: string;
  date: string;
}

export interface EligibilityItem {
  label: string;
  value: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  official_site?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface State {
  id: string;
  name: string;
  slug: string;
  code: string;
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
  job: 'Job',
  result: 'Result',
  admit_card: 'Admit Card',
  answer_key: 'Answer Key',
  syllabus: 'Syllabus',
  admission: 'Admission',
};

export const POST_TYPE_BADGE: Record<PostType, string> = {
  job: 'badge-job',
  result: 'badge-result',
  admit_card: 'badge-admit',
  answer_key: 'badge-answer',
  syllabus: 'badge-syllabus',
  admission: 'badge-admission',
};

export const POST_TYPE_EMOJI: Record<PostType, string> = {
  job: '💼',
  result: '📊',
  admit_card: '🎫',
  answer_key: '🔑',
  syllabus: '📚',
  admission: '🎓',
};
