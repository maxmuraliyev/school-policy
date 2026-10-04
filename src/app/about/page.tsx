import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import HouseBadge from '@/components/HouseBadge';
import { ArrowRight, Shield, Award, Users, BookOpen } from 'lucide-react';
import { getServerI18n } from '@/lib/i18n';

export const revalidate = 0;

export default async function AboutPage() {
  const { lang, t } = await getServerI18n();
  const houses = await prisma.house.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#ffffff',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0, 71, 186, 0.4)',
            border: '2px solid var(--school-blue-light)',
            marginBottom: '1.25rem',
          }}
        >
          <img
            src="/logo.png"
            alt="Angren Ixtisoslashtirilgan Maktabi Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
          />
        </div>
        <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
          {t('charterTag')}
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', marginBottom: '0.75rem', fontWeight: 800 }}>
          {t('charterTitle')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7 }}>
          {t('charterSubtitle')}
        </p>
      </div>

      {/* Houses Spotlight Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {houses.map((house) => {
          const isAstra = house.slug === 'astra';

          return (
            <div
              key={house.id}
              className="arena-card"
              style={{
                padding: '2.25rem',
                borderTop: `4px solid ${house.primaryColor}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <HouseBadge
                    name={house.name}
                    slug={house.slug}
                    color={house.primaryColor}
                    size="md"
                  />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: house.accentColor,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {isAstra
                      ? (lang === 'uz' ? 'Lochin Ramzi' : 'The Falcon')
                      : (lang === 'uz' ? 'Bo‘ri Ramzi' : 'The Wolf')}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>
                  {house.name}
                </h2>

                <div
                  style={{
                    fontSize: '0.9rem',
                    color: house.accentColor,
                    fontWeight: 600,
                    marginBottom: '1rem',
                    fontStyle: 'italic',
                  }}
                >
                  {isAstra
                    ? (lang === 'uz' ? '“Yuksak maqsadlar sari”' : '“Aim Beyond”')
                    : (lang === 'uz' ? '“Birlashgan kuchmiz”' : '“Stronger Together”')}
                </div>

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.925rem' }}>
                  {isAstra ? t('houseAstraDesc') : t('houseTerraDesc')}
                </p>
              </div>

              <div>
                <Link
                  href={`/houses/${house.slug}`}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                >
                  <span>
                    {lang === 'uz' ? `${house.name} Bo‘limiga Kirish` : `Explore ${house.name} Chapter`}
                  </span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Frequently Asked Questions */}
      <section className="arena-card" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.75rem', fontWeight: 700, color: '#fff' }}>
          {lang === 'uz' ? 'Ko‘p Beriladigan Savollar' : 'Frequently Asked Questions'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.4rem', fontWeight: 600 }}>
              {lang === 'uz' ? 'Ballar qanday tasdiqlanadi?' : 'How are points verified?'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.925rem' }}>
              {lang === 'uz'
                ? 'Har bir ball kiritilishi uchun dalil (musobaqa bayonnomalari, hakamlar qaydnomalari yoki sertifikatlar) talab etiladi. O‘qituvchilar so‘rov yuboradi va ma’muriyat tomonidan tasdiqlangach kuchga kiradi.'
                : 'Every point submission requires evidence (tournament scoresheets, referee match cards, or Olympiad certificates). Faculty mentors review requests, and approvals are verified through administrative oversight.'}
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.4rem', fontWeight: 600 }}>
              {lang === 'uz' ? 'Guruh umumiy ballini to‘g‘ridan-to‘g‘ri o‘zgartirish mumkinmi?' : 'Can a house total be edited directly?'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.925rem' }}>
              {lang === 'uz'
                ? 'Yo‘q. Tizim qoidasiga ko‘ra, umumiy ball tasdiqlangan amallar yig‘indisidan avtomatik hisoblanadi. Bazada ixtiyoriy ravishda raqam kiritib qo‘yish imkoniyati yo‘q.'
                : 'No. By strict system architectural principle, house scores are mathematically derived from approved point events. There is no “edit score” button in the entire database.'}
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.4rem', fontWeight: 600 }}>
              {lang === 'uz' ? 'O‘quvchilar shaxsiy ma’lumotlari qanday himoyalangan?' : 'How is student privacy protected?'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.925rem' }}>
              {lang === 'uz'
                ? 'Faqatgina o‘quvchining ismi-sharifi, sinfi va rasmiy yutuqlari ommaviy ko‘rinadi. Telefon raqamlari, uy manzillari yoki boshqa nozik ma’lumotlar tizimda saqlanmaydi va ommaga chiqarilmaydi.'
                : 'Only students’ names, grades, and approved school achievements are public. Sensitive personal details like home addresses, phone numbers, and private files are never collected or displayed.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
