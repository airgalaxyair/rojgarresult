import type { Metadata } from 'next';
import JobsPageClient from '@/components/post/JobsPageClient';

export const metadata: Metadata = {
  title: 'Latest Government Jobs 2025 — UPSC, SSC, IBPS, RRB, PSU',
  description: 'Browse latest government job notifications 2025 from UPSC, SSC, IBPS, RRB, SBI, DRDO, ISRO and all PSUs. All sourced from official websites.',
};

export default function JobsPage() {
  return <JobsPageClient />;
}
