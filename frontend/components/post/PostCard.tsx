'use client';

import Link from 'next/link';
import { Calendar, Users, Clock, MapPin, ChevronRight, Flame } from 'lucide-react';
import type { Post } from '@/lib/types';
import { POST_TYPE_LABELS, POST_TYPE_BADGE, POST_TYPE_EMOJI } from '@/lib/types';
import { formatDate, timeAgo, isDeadlineSoon, isExpired, daysLeft, formatVacancies } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const badge = POST_TYPE_BADGE[post.post_type];
  const emoji = POST_TYPE_EMOJI[post.post_type];
  const deadlineSoon = isDeadlineSoon(post.application_end, 7);
  const expired = isExpired(post.application_end);
  const days = daysLeft(post.application_end);
  const postUrl = `/${post.post_type === 'job' ? 'jobs' : post.post_type === 'admit_card' ? 'admit-card' : post.post_type === 'answer_key' ? 'answer-key' : post.post_type}/${post.slug}`;

  if (compact) {
    return (
      <Link
        href={postUrl}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '12px 0',
          borderBottom: '1px solid var(--border)',
          textDecoration: 'none',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.75')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
      >
        <span style={{ fontSize: 16, marginTop: 1 }}>{emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 3 }}
            className="line-clamp-2">
            {post.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${badge}`}>{POST_TYPE_LABELS[post.post_type]}</span>
            {post.application_end && (
              <span style={{ fontSize: 11, color: expired ? 'var(--danger)' : deadlineSoon ? 'var(--warning)' : 'var(--text-muted)' }}>
                {expired ? 'Expired' : deadlineSoon ? `${days}d left` : formatDate(post.application_end)}
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
      </Link>
    );
  }

  return (
    <Link
      href={postUrl}
      className="card"
      style={{ display: 'block', padding: '18px 20px', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}
    >
      {/* Trending badge */}
      {post.is_trending && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#fff7ed', color: '#ea580c',
            borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700,
          }}>
            <Flame size={9} /> HOT
          </span>
        </div>
      )}

      {/* Type badge */}
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className={`badge ${badge}`}>
          {emoji} {POST_TYPE_LABELS[post.post_type]}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{post.department.name}</span>
        {post.is_featured && (
          <span style={{ fontSize: 10, fontWeight: 700, background: '#fef9c3', color: '#a16207', borderRadius: 999, padding: '1px 7px' }}>
            FEATURED
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'Crimson Pro, serif',
        fontSize: 18,
        fontWeight: 600,
        color: 'var(--text-primary)',
        lineHeight: 1.35,
        marginBottom: 10,
      }}
        className="line-clamp-2">
        {post.title}
      </h3>

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginBottom: 14 }}>
        {post.total_vacancies && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Users size={12} style={{ color: 'var(--accent)' }} />
            <strong style={{ color: 'var(--text-primary)' }}>{formatVacancies(post.total_vacancies)}</strong> Vacancies
          </span>
        )}
        {post.application_end && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
            color: expired ? 'var(--danger)' : deadlineSoon ? 'var(--warning)' : 'var(--text-secondary)',
            fontWeight: deadlineSoon || expired ? 600 : 400,
          }}>
            <Clock size={12} />
            {expired
              ? 'Closed'
              : deadlineSoon
              ? `Closing in ${days} day${days !== 1 ? 's' : ''}`
              : `Last date: ${formatDate(post.application_end)}`}
          </span>
        )}
        {post.states && post.states.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
            <MapPin size={12} />
            {post.states.slice(0, 2).map((s) => s.code).join(', ')}
            {post.states.length > 2 && ` +${post.states.length - 2}`}
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1px solid var(--border)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
          <Calendar size={11} />
          {timeAgo(post.published_at)}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 600, color: 'var(--accent)',
        }}>
          View Details <ChevronRight size={13} />
        </span>
      </div>
    </Link>
  );
}
