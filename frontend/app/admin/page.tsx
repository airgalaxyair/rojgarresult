'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // In production: POST /api/v1/admin/auth/login
      // Mock login for demo
      if (email && password) {
        localStorage.setItem('admin_token', 'mock_jwt_token');
        router.push('/admin/dashboard');
      } else {
        setError('Please enter email and password');
      }
    } catch {
      setError('Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'var(--accent)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, margin: '0 auto 12px',
            }}
          >
            S
          </div>
          <h1
            style={{
              fontFamily: 'Crimson Pro, serif', fontSize: 22, fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: 4,
            }}
          >
            Sarkari School
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Admin Panel — Authorised Access Only
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sarkarischool.in"
              required
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '10px 40px 10px 12px',
                  background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px',
              background: loading ? 'var(--text-muted)' : 'var(--accent)',
              color: 'white', border: 'none', borderRadius: 9,
              fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s',
            }}
          >
            <Lock size={14} />
            {loading ? 'Logging in...' : 'Login to Admin'}
          </button>
        </form>

        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 20,
            padding: '10px 12px', background: 'var(--bg-subtle)',
            borderRadius: 8, fontSize: 12, color: 'var(--text-muted)',
          }}
        >
          <Shield size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          All admin actions are logged. Unauthorised access is prohibited.
        </div>
      </div>
    </div>
  );
}
