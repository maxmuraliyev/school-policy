'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  Shield,
  Users,
  Award,
  Calendar,
  Bell,
  BookOpen,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LeaderboardData {
  houses: {
    id: string;
    slug: string;
    name: string;
    shortName: string;
    totalPoints: number;
    primaryColor: string;
  }[];
  leader: {
    shortName: string;
    totalPoints: number;
  } | null;
  scoreDifference: number;
}

export default function Header() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scores, setScores] = useState<LeaderboardData | null>(null);

  // Fast score loading: fetch once on mount and refresh every 60 seconds (Issue 5: performance)
  useEffect(() => {
    const loadScores = () => {
      fetch('/api/leaderboard')
        .then((res) => res.json())
        .then((data) => setScores(data))
        .catch((err) => console.error('Failed to load header scores:', err));
    };

    loadScores();
    const interval = setInterval(loadScores, 60000);
    return () => clearInterval(interval);
  }, []);

  const astra = scores?.houses?.find((h) => h.slug === 'astra');
  const terra = scores?.houses?.find((h) => h.slug === 'terra');
  const astraPts = astra?.totalPoints ?? 1420;
  const terraPts = terra?.totalPoints ?? 1385;
  const delta = Math.abs(astraPts - terraPts);
  const isAstraLead = astraPts >= terraPts;

  const navItems = [
    { key: 'leaderboard', label: t('leaderboard'), href: '/leaderboard', icon: Trophy },
    { key: 'houses', label: t('houses'), href: '/houses', icon: Shield },
    { key: 'competitions', label: t('competitions'), href: '/competitions', icon: Award },
    { key: 'students', label: t('students'), href: '/students', icon: Users },
    { key: 'honors', label: t('honors'), href: '/achievements', icon: Award },
    { key: 'events', label: t('events'), href: '/events', icon: Calendar },
    { key: 'announcements', label: t('announcements'), href: '/announcements', icon: Bell },
    { key: 'rules', label: t('rules'), href: '/rules', icon: BookOpen },
  ];

  return (
    <header className="header-nav">
      <div className="container nav-container">
        {/* Official Angren Specialized School Logo & Brand (Issue 1: Perfectly fitted & non-clipped) */}
        <Link href="/" className="header-brand-link">
          <div className="header-logo-badge">
            <Image
              src="/logo.png"
              alt="Angren Ixtisoslashtirilgan Maktabi Logo"
              width={42}
              height={42}
              style={{ objectFit: 'contain', borderRadius: '50%' }}
              priority
            />
          </div>
          <div className="header-brand-text">
            <div className="header-brand-name">
              {lang === 'uz' ? 'ANGREN IXTISOSLASHTIRILGAN MAKTABI' : 'ANGREN SPECIALIZED SCHOOL'}
            </div>
            <div className="header-brand-tag">
              {t('houseSystemTag')}
            </div>
          </div>
        </Link>

        {/* Dynamic Duel Status Badge (Sleek, Single-line, Never Wraps, Clickable to Leaderboard) */}
        <Link
          href="/leaderboard"
          className="header-duel-badge"
          title={
            lang === 'uz'
              ? `Ballar: Astra ${astraPts.toLocaleString()} vs ${terraPts.toLocaleString()} Terra (${delta > 0 ? (isAstraLead ? 'Astra' : 'Terra') + ' +' + delta + ' oldinda' : 'Durang'}). Turnir jadvalini ko‘rish.`
              : `Scores: Astra ${astraPts.toLocaleString()} vs ${terraPts.toLocaleString()} Terra (${delta > 0 ? (isAstraLead ? 'Astra' : 'Terra') + ' +' + delta + ' leading' : 'Tied'}). View leaderboard.`
          }
        >
          {/* Astra */}
          <span className={`duel-side astra ${isAstraLead ? 'leading' : ''}`}>
            <span className="duel-dot astra-dot" />
            <span className="duel-label">ASTRA</span>
            <span className="font-stats duel-score">{astraPts.toLocaleString()}</span>
          </span>

          {/* VS Divider Chip */}
          <span className="duel-mid">
            <span className="duel-vs">VS</span>
            {delta > 0 && (
              <span className={`duel-diff ${isAstraLead ? 'astra-diff' : 'terra-diff'}`}>
                +{delta}
              </span>
            )}
          </span>

          {/* Terra */}
          <span className={`duel-side terra ${!isAstraLead ? 'leading' : ''}`}>
            <span className="font-stats duel-score">{terraPts.toLocaleString()}</span>
            <span className="duel-label">TERRA</span>
            <span className="duel-dot terra-dot" />
          </span>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Language Switcher & Mobile Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Bilingual Switcher (Uzbek / English) */}
          <div
            className="lang-switcher"
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-full)',
              padding: '2px',
              gap: '2px',
            }}
            title={lang === 'uz' ? "Tilni o'zgartirish" : "Switch Language"}
          >
            <button
              type="button"
              onClick={() => setLang('uz')}
              style={{
                background: lang === 'uz' ? 'var(--school-blue)' : 'transparent',
                color: lang === 'uz' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              UZ
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              style={{
                background: lang === 'en' ? 'var(--school-blue)' : 'transparent',
                color: lang === 'en' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              EN
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="mobile-toggle"
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.45rem',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (No admin buttons) */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Mobile Drawer Live House Duel Card */}
          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-medium)',
              textDecoration: 'none',
              marginBottom: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--astra-accent)' }} />
              <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#93c5fd' }}>ASTRA</span>
              <span className="font-stats" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                {astraPts.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                background: isAstraLead ? 'rgba(29, 78, 216, 0.35)' : 'rgba(5, 150, 105, 0.35)',
                color: isAstraLead ? '#93c5fd' : '#6ee7b7',
                border: isAstraLead ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(52, 211, 153, 0.35)',
              }}
            >
              <span>VS</span>
              {delta > 0 && <span>+{delta}</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="font-stats" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                {terraPts.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#6ee7b7' }}>TERRA</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--terra-accent)' }} />
            </div>
          </Link>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: pathname === item.href ? '#ffffff' : 'var(--text-secondary)',
                background: pathname === item.href ? 'var(--bg-surface-elevated)' : 'transparent',
                fontWeight: 600,
                fontSize: '0.925rem',
                textDecoration: 'none',
              }}
            >
              <item.icon size={18} color={pathname === item.href ? 'var(--school-blue-accent)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
