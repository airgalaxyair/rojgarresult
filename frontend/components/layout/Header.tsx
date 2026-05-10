'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Sun, Moon, Bell, ChevronDown } from 'lucide-react';
import { TICKER_ITEMS } from '@/lib/mock-data';

const NAV_LINKS = [
  {
    label: 'Jobs',
    href: '/jobs',
    children: [
      { label: 'Latest Jobs', href: '/jobs' },
      { label: 'Banking Jobs', href: '/category/banking' },
      { label: 'Railway Jobs', href: '/category/railways' },
      { label: 'Defence Jobs', href: '/category/defence' },
      { label: 'Teaching Jobs', href: '/category/teaching' },
      { label: 'PSU Jobs', href: '/category/psu' },
    ],
  },
  { label: 'Results', href: '/results' },
  { label: 'Admit Card', href: '/admit-card' },
  { label: 'Answer Key', href: '/answer-key' },
  { label: 'Syllabus', href: '/syllabus' },
];

export default function Header() {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <>
      {/* Ticker */}
      <div style={{ background: 'var(--accent)', color: 'white' }} className="text-xs py-1.5 overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="shrink-0 px-3 font-semibold tracking-wide" style={{ borderRight: '1px solid rgba(255,255,255,0.3)' }}>
            LIVE
          </span>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div className="animate-ticker whitespace-nowrap inline-block">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="mr-12 opacity-90">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        style={{
          background: 'var(--bg-card)',
          borderBottom: `1px solid var(--border)`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'box-shadow 0.2s',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                style={{ background: 'var(--accent)', borderRadius: 10 }}
                className="w-9 h-9 flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-105"
              >
                S
              </div>
              <div>
                <div style={{ fontFamily: 'Crimson Pro, serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                  Rojgar School
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Official Govt Jobs
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {link.label}
                    {link.children && <ChevronDown size={13} />}
                  </Link>

                  {link.children && activeDropdown === link.label && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: '6px',
                        minWidth: 180,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        zIndex: 100,
                      }}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-2 rounded-lg text-sm transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
                            (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                          }}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  minWidth: 140,
                }}
              >
                <Search size={14} />
                <span className="hidden sm:inline">Search jobs...</span>
              </button>

              {/* Telegram */}
              <a
                href="https://t.me/rojgarschool"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: '#229ED9', color: 'white' }}
              >
                <Bell size={13} />
                <span>Join</span>
              </a>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
              >
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }} className="lg:hidden px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://t.me/rojgarschool"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: '#229ED9', color: 'white' }}
            >
              <Bell size={14} />
              Join Telegram Channel
            </a>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: 560,
              background: 'var(--bg-card)',
              borderRadius: 16,
              border: '1px solid var(--border)',
              padding: 20,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                autoFocus
                placeholder="Search government jobs, results, admit cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                  }
                  if (e.key === 'Escape') setSearchOpen(false);
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 16,
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {['SSC CGL 2025', 'UPSC 2025', 'IBPS PO', 'RRB NTPC', 'Bank Jobs'].map((term) => (
                  <a
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      borderRadius: 999,
                      padding: '4px 12px',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    {term}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
