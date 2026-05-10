'use client';

import Link from 'next/link';
import { Play, Send } from 'lucide-react';
// Note: lucide-react this version uses Play for YouTube icon

const FOOTER_LINKS = {
  'Job Categories': [
    { label: 'Banking Jobs', href: '/category/banking' },
    { label: 'Railway Jobs', href: '/category/railways' },
    { label: 'Defence Jobs', href: '/category/defence' },
    { label: 'Teaching Jobs', href: '/category/teaching' },
    { label: 'PSU Jobs', href: '/category/psu' },
    { label: 'Police Jobs', href: '/category/police' },
    { label: 'Health Jobs', href: '/category/health' },
    { label: 'State PSC', href: '/category/state-psc' },
  ],
  'Quick Links': [
    { label: 'Latest Jobs', href: '/jobs' },
    { label: 'Results', href: '/results' },
    { label: 'Admit Cards', href: '/admit-card' },
    { label: 'Answer Keys', href: '/answer-key' },
    { label: 'Syllabus', href: '/syllabus' },
    { label: 'Admissions', href: '/admission' },
  ],
  'Top Departments': [
    { label: 'UPSC', href: '/department/upsc' },
    { label: 'SSC', href: '/department/ssc' },
    { label: 'IBPS', href: '/department/ibps' },
    { label: 'RRB', href: '/department/rrb' },
    { label: 'SBI', href: '/department/sbi' },
    { label: 'DRDO', href: '/department/drdo' },
    { label: 'ISRO', href: '/department/isro' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink-950, #110e0b)', color: 'var(--ink-300, #c4bdb0)', borderTop: '1px solid #3d3530' }}>
      {/* CTA Banner */}
      <div style={{ background: 'var(--accent, #ea580c)', padding: '24px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: 22, fontWeight: 700, color: 'white' }}>
              Never miss a government job update
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              Join 2L+ candidates on our Telegram channel
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://t.me/rojgarschool"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'white', color: '#ea580c',
                padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
                textDecoration: 'none', transition: 'transform 0.2s',
              }}
            >
              <Send size={15} />
              Join Telegram
            </a>
            <a
              href="https://www.youtube.com/@RojgarSchool"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.15)', color: 'white',
                padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <Play size={15} />
              YouTube
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Crimson Pro, serif', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 10 }}>
              Rojgar School
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#a69d90', marginBottom: 16 }}>
              India's most trusted automated government jobs platform. All content sourced directly from official government websites.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="https://t.me/rojgarschool" target="_blank" rel="noopener noreferrer"
                style={{ width: 34, height: 34, borderRadius: 8, background: '#229ED9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Send size={14} />
              </a>
              <a href="https://www.youtube.com/@RojgarSchool" target="_blank" rel="noopener noreferrer"
                style={{ width: 34, height: 34, borderRadius: 8, background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Play size={14} />
              </a>
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8c8278', marginBottom: 14 }}>
                {title}
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{ fontSize: 13, color: '#a69d90', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ea580c')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#a69d90')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #3d3530', marginTop: 40, paddingTop: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#726860' }}>
            © {new Date().getFullYear()} Rojgar School. All content sourced from official government websites.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['About', 'Privacy Policy', 'Disclaimer', 'Contact'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase().replace(' ', '-')}`}
                style={{ fontSize: 12, color: '#726860', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ea580c')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#726860')}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
