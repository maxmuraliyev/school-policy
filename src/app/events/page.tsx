import React from 'react';
import { Calendar, Clock, MapPin, Shield, Users } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getActiveSeason } from '@/lib/points';
import { getServerI18n } from '@/lib/i18n';
import SectionHeader from '@/components/SectionHeader';
import HouseBadge from '@/components/HouseBadge';
import EmptyState from '@/components/EmptyState';

export const revalidate = 0;

export default async function EventsPage() {
  const { lang, t } = await getServerI18n();
  const season = await getActiveSeason();
  const events = await prisma.event.findMany({
    where: {
      ...(season ? { seasonId: season.id } : {}),
      isPublic: true,
    },
    include: {
      category: true,
      house: true,
    },
    orderBy: { startsAt: 'asc' },
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <SectionHeader
        tag={lang === 'uz' ? 'TADBIRLAR VA TAQVIM' : 'FIXTURES & SCHEDULE'}
        title={lang === 'uz' ? 'Maktab Tadbirlari va Guruhlar Rejasi' : 'School Events & House Calendar'}
        description={
          lang === 'uz'
            ? 'Guruhlar o‘rtasidagi musobaqalar, strategik yig‘ilishlar, jamoaviy aksiyalar va taqdirlash marosimlari jadvali.'
            : 'Follow upcoming inter-house tournaments, strategy assemblies, volunteer packaging drives, and championship ceremonies.'
        }
      />

      {events.length === 0 ? (
        <EmptyState
          title={lang === 'uz' ? 'Rejalashtirilgan tadbirlar yo‘q' : 'No Scheduled Events'}
          description={
            lang === 'uz'
              ? 'Yangi tadbirlar va bellashuvlar tez orada e’lon qilinadi.'
              : 'Upcoming house fixtures, assemblies, and championship matches will be scheduled here.'
          }
          icon={<Calendar size={40} color="var(--gold)" />}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {events.map((ev) => {
            const isHouseSpecific = Boolean(ev.house);
            const eventDate = new Date(ev.startsAt);
            const endDate = new Date(ev.endsAt);

            return (
              <div
                key={ev.id}
                className="arena-card"
                style={{
                  padding: '1.75rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.75rem',
                  borderLeft: isHouseSpecific
                    ? `4px solid ${ev.house?.primaryColor}`
                    : '4px solid var(--gold)',
                }}
              >
                <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
                  {/* Date badge */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.85rem 1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      minWidth: '85px',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 800, letterSpacing: '0.08em' }}>
                      {eventDate.toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-GB', { month: 'short' })}
                    </span>
                    <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#fff', lineHeight: 1.1 }}>
                      {eventDate.getDate()}
                    </span>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {eventDate.toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-GB', { weekday: 'short' })}
                    </span>
                  </div>

                  {/* Main Event Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                      {ev.house ? (
                        <HouseBadge
                          name={ev.house.name}
                          slug={ev.house.slug}
                          color={ev.house.primaryColor}
                          size="sm"
                        />
                      ) : (
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: 'var(--gold)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {lang === 'uz' ? 'UMUMIY MAKTAB' : 'SCHOOL-WIDE'}
                        </span>
                      )}

                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.06em' }}>
                        {ev.eventType.replace(/_/g, ' ')}
                      </span>

                      {ev.category && (
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.7rem',
                          }}
                        >
                          {ev.category.name}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.4rem', fontWeight: 700 }}>
                      {ev.title}
                    </h3>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '650px', lineHeight: 1.55 }}>
                      {ev.description}
                    </p>
                  </div>
                </div>

                {/* Time & Venue meta block */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '0.85rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    minWidth: '200px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <Clock size={14} color="var(--astra-accent)" />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {eventDate.toLocaleTimeString(lang === 'uz' ? 'uz-UZ' : 'en-GB', { hour: '2-digit', minute: '2-digit' })} &ndash;{' '}
                      {endDate.toLocaleTimeString(lang === 'uz' ? 'uz-UZ' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <MapPin size={14} color="var(--terra-accent)" />
                    <span style={{ color: 'var(--text-secondary)' }}>{ev.venue}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
