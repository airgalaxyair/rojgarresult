'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Category } from '@/lib/types';

export function CategorySidebar({ related, catName }: { related: Category[]; catName: string }) {
  return (
    <>
      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Other Categories
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {related.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
                color: 'var(--text-secondary)', fontSize: 13, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)';
                (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              {c.name} Jobs
              <ChevronRight size={13} style={{ opacity: 0.4 }} />
            </Link>
          ))}
        </div>
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg, #0088cc, #229ED9)',
          borderRadius: 12, padding: '18px', color: 'white', marginTop: 14, textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          Get {catName} Alerts
        </p>
        <p style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
          Instant Telegram notifications for new {catName} jobs
        </p>
        <a
          href="https://t.me/rojgarschool"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block', background: 'white', color: '#0088cc',
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Join Free
        </a>
      </div>
    </>
  );
}
