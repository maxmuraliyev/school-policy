'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Trophy, Award, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFound() {
  const { lang } = useLanguage();

  return (
    <div
      className="container"
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(0, 71, 186, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Official School Seal Badge */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: '#ffffff',
            padding: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 4px 16px rgba(0, 71, 186, 0.4)',
            border: '2px solid var(--school-blue-light)',
          }}
        >
          <Image
            src="/logo.png"
            alt="Angren Ixtisoslashtirilgan Maktabi"
            width={62}
            height={62}
            style={{ objectFit: 'contain', borderRadius: '50%' }}
            priority
          />
        </div>

        {/* 404 Numerical Indicator */}
        <div
          style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            fontFamily: 'var(--font-display)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff 30%, var(--school-blue-accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem',
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '0.75rem',
          }}
        >
          {lang === 'uz' ? 'Sahifa Topilmadi' : 'Page Not Found'}
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          {lang === 'uz'
            ? 'Siz qidirayotgan sahifa mavjud emas, nomi o‘zgargan yoki manzili noto‘g‘ri kiritilgan.'
            : 'The page you are looking for does not exist, has been removed, or the link is incorrect.'}
        </p>

        {/* Quick Navigation Links */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.2rem' }}
          >
            <Home size={16} />
            <span>{lang === 'uz' ? 'Bosh Sahifa' : 'Home'}</span>
          </Link>

          <Link
            href="/leaderboard"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.2rem' }}
          >
            <Trophy size={16} />
            <span>{lang === 'uz' ? 'Ballar Jadvali' : 'Leaderboard'}</span>
          </Link>

          <Link
            href="/competitions"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.2rem' }}
          >
            <Award size={16} />
            <span>{lang === 'uz' ? 'Musobaqalar' : 'Competitions'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
