import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const hasDirectUrl = Boolean(process.env.DIRECT_URL);
  const hasJwtSecret = Boolean(process.env.JWT_SECRET);

  let dbConnected = false;
  let errorDetail: string | null = null;
  let housesCount = 0;

  if (hasDbUrl) {
    try {
      housesCount = await prisma.house.count();
      dbConnected = true;
    } catch (err: unknown) {
      errorDetail = err instanceof Error ? err.message : String(err);
    }
  } else {
    errorDetail = 'DATABASE_URL environment variable is missing on Vercel';
  }

  return NextResponse.json(
    {
      status: dbConnected ? 'HEALTHY' : 'CONFIGURATION_REQUIRED',
      environment: {
        DATABASE_URL_CONFIGURED: hasDbUrl,
        DIRECT_URL_CONFIGURED: hasDirectUrl,
        JWT_SECRET_CONFIGURED: hasJwtSecret,
        NODE_ENV: process.env.NODE_ENV,
      },
      database: {
        connected: dbConnected,
        housesCount,
        error: errorDetail,
      },
      timestamp: new Date().toISOString(),
    },
    { status: dbConnected ? 200 : 503 }
  );
}
