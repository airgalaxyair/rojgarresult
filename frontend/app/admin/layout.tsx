'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, Settings, Radio, Send,
  LogOut, Menu, X, ChevronRight, Shield, Globe,
  AlertCircle, CheckCircle, RefreshCw,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Posts', href: '/admin/posts', icon: FileText },
  { label: 'Scrapers', href: '/admin/scrapers', icon: RefreshCw },
  { label: 'Telegram', href: '/admin/telegram', icon: Send },
  { label: 'SEO', href: '/admin/seo', icon: Globe },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [admin, setAdmin] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    // Check auth — in production validate JWT from localStorage
    const token = localStorage.getItem('admin_token');
    if (!token && pathname !== '/admin') {
      router.push('/admin');
      return;
    }
    // Mock admin info
    setAdmin({ name: 'Super Admin', role: 'superadmin' });
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  if (pathname === '/admin') return <>{children}</>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 230 : 60,
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '16px 14px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--accent)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 15, flexShrink: 0,
            }}
          >
            S
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                Sarkari School
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Admin Panel
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ marginLeft: 'auto', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '10px 8px', overflow: 'auto' }}>
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 10px',
                  borderRadius: 8,
                  marginBottom: 2,
                  textDecoration: 'none',
                  background: active ? 'var(--accent-light)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 13,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {sidebarOpen && label}
              </Link>
            );
          })}
        </nav>

        {/* Admin info + logout */}
        {admin && (
          <div
            style={{
              padding: '12px 10px',
              borderTop: '1px solid var(--border)',
            }}
          >
            {sidebarOpen && (
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{admin.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {admin.role}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 8, width: '100%',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--danger)', fontSize: 13, fontWeight: 500,
              }}
            >
              <LogOut size={14} />
              {sidebarOpen && 'Logout'}
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Top bar */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
            <Shield size={13} style={{ color: 'var(--accent)' }} />
            <span>Admin</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {NAV.find((n) => pathname.startsWith(n.href))?.label || 'Panel'}
            </span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              href="/"
              target="_blank"
              style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Globe size={12} /> View Site
            </Link>
          </div>
        </div>

        <div style={{ padding: '28px 24px' }}>{children}</div>
      </div>
    </div>
  );
}
