'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  Users,
  Trophy,
  Award,
  Calendar,
  Bell,
  Sliders,
  ShieldAlert,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Activity,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    name: string;
    roleName: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
  } | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    // Check session
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user) {
          router.push('/login');
        } else {
          setCurrentUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
        setLoading(false);
      });

    // Check pending count for badge
    fetch('/api/points?status=PENDING&limit=1')
      .then((res) => res.json())
      .then((data) => {
        if (data?.pagination?.total !== undefined) {
          setPendingCount(data.pagination.total);
        }
      })
      .catch(() => {});
  }, [router, pathname]);

  const navGroups = [
    {
      group: lang === 'uz' ? 'Ballar va Tasdiqlash' : 'Scoring & Approvals',
      items: [
        { label: lang === 'uz' ? 'Boshqaruv Paneli' : 'Command Center', href: '/admin', icon: LayoutDashboard },
        {
          label: lang === 'uz' ? 'Tasdiqlash Kutilmoqda' : 'Pending Approvals',
          href: '/admin/points/pending',
          icon: Clock,
          badge: pendingCount > 0 ? String(pendingCount) : undefined,
        },
        { label: lang === 'uz' ? 'Ballar Daftari' : 'All Point Ledger', href: '/admin/points', icon: CheckCircle2 },
      ],
    },
    {
      group: lang === 'uz' ? 'Ro‘yxatlar va Musobaqalar' : 'Roster & Competitions',
      items: [
        { label: lang === 'uz' ? 'O‘quvchilar Ro‘yxati' : 'Students Roster', href: '/admin/students', icon: Users },
        { label: lang === 'uz' ? 'CSV Ommaviy Import' : 'CSV Bulk Import', href: '/admin/students/import', icon: FileSpreadsheet },
        { label: lang === 'uz' ? 'Musobaqalar va Natijalar' : 'Competitions & Results', href: '/admin/competitions', icon: Trophy },
        { label: lang === 'uz' ? 'Yutuqlar Ko‘rigi' : 'Achievements Review', href: '/admin/achievements', icon: Award },
      ],
    },
    {
      group: lang === 'uz' ? 'Tadbirlar va Xabarlar' : 'Content & Scheduling',
      items: [
        { label: lang === 'uz' ? 'Tadbirlar Taqvimi' : 'Events Calendar', href: '/admin/events', icon: Calendar },
        { label: lang === 'uz' ? 'E‘lonlar Taxtasi' : 'Announcements', href: '/admin/announcements', icon: Bell },
      ],
    },
    {
      group: lang === 'uz' ? 'Nazorat va Sozlamalar' : 'Governance & Integrity',
      items: [
        { label: lang === 'uz' ? 'Xolislik Tahlili' : 'Fairness Analytics', href: '/admin/analytics', icon: Activity },
        { label: lang === 'uz' ? 'Kategoriyalar va Qoidalar' : 'Categories & Rules', href: '/admin/categories', icon: Sliders },
        { label: lang === 'uz' ? 'Audit Jurnali' : 'Audit Trail Logs', href: '/admin/audit-logs', icon: ShieldAlert },
        { label: lang === 'uz' ? 'Xodimlar va Huquqlar' : 'Staff & Roles', href: '/admin/users', icon: Shield },
        { label: lang === 'uz' ? 'Tizim Sozlamalari' : 'System Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Verifying faculty authorization credentials...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', background: 'var(--bg-primary)' }}>
      {/* SIDEBAR NAVIGATION */}
      <aside
        style={{
          width: '270px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
        className={`admin-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}
      >
        <div>
          {/* User profile capsule */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
              {currentUser?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <span
                className="badge"
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: 'var(--astra-accent)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '0.1rem 0.4rem',
                }}
              >
                {currentUser?.roleName}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                @{currentUser?.username}
              </span>
            </div>
          </div>

          {/* Navigation link groups */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            {navGroups.map((group) => (
              <div key={group.group}>
                <div
                  style={{
                    fontSize: '0.675rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    padding: '0 0.75rem 0.4rem 0.75rem',
                  }}
                >
                  {group.group}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.85rem',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#fff' : 'var(--text-secondary)',
                          background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                          borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                          transition: 'all 0.15s ease',
                          textDecoration: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <item.icon size={15} color={isActive ? 'var(--gold)' : 'var(--text-muted)'} />
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className="badge badge-gold"
                            style={{ fontSize: '0.675rem', padding: '0.15rem 0.45rem', fontWeight: 800 }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom utility links */}
        <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.75rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} />
            <span>Public Tournament Portal</span>
          </Link>

          <button
            onClick={async () => {
              await fetch('/api/auth', { method: 'DELETE' });
              router.push('/login');
            }}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.8rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE CONTENT */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
