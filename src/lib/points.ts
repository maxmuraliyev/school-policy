import prisma from './prisma';
import { logAuditEvent } from './audit';

export interface LeaderboardHouse {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  symbol: string;
  motto: string;
  description: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgGradient: string;
  totalPoints: number;
  rank: number;
  monthlyPoints: number;
  weeklyPoints: number;
  totalTransactions: number;
  categories: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string;
    points: number;
  }[];
}

// In-memory score cache to make pages load instantly (Issue 5: Performance)
let scoreCache: { data: LeaderboardHouse[]; timestamp: number; key: string } | null = null;
const CACHE_TTL_MS = 15000; // 15 seconds

export function invalidateScoreCache() {
  scoreCache = null;
}

export async function getActiveSeason() {
  const active = await prisma.season.findFirst({
    where: { status: 'ACTIVE' },
  });
  if (active) return active;
  return await prisma.season.findFirst({
    orderBy: { startsAt: 'desc' },
  });
}

export async function generateTransactionCode(): Promise<string> {
  const count = await prisma.pointTransaction.count();
  const nextNum = 100 + count + 1;
  return `PT-${nextNum.toString().padStart(6, '0')}`;
}

export async function calculateHouseScores(options?: {
  seasonId?: string;
  timeFilter?: 'all' | 'month' | 'week' | 'custom';
  startDate?: Date;
  endDate?: Date;
}) {
  const isDefaultQuery =
    !options?.timeFilter || options.timeFilter === 'all';
  const cacheKey = `${options?.seasonId || 'default'}_${options?.timeFilter || 'all'}`;

  if (
    isDefaultQuery &&
    !options?.startDate &&
    !options?.endDate &&
    scoreCache &&
    scoreCache.key === cacheKey &&
    Date.now() - scoreCache.timestamp < CACHE_TTL_MS
  ) {
    return scoreCache.data;
  }

  const season = options?.seasonId
    ? await prisma.season.findUnique({ where: { id: options.seasonId } })
    : await getActiveSeason();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Base where condition for approved points
  const baseSeasonFilter = season ? { seasonId: season.id } : {};

  // High-performance single batch query (reduces 9 sequential Supabase roundtrips to 1 parallel batch)
  const [houses, categories, allSeasonTxs] = await Promise.all([
    prisma.house.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.pointTransaction.findMany({
      where: {
        status: { in: ['APPROVED', 'REVERSED'] },
        ...baseSeasonFilter,
      },
      select: {
        id: true,
        houseId: true,
        categoryId: true,
        points: true,
        earnedAt: true,
      },
    }),
  ]);

  const results: LeaderboardHouse[] = [];

  for (const house of houses) {
    const houseTxs = allSeasonTxs.filter((tx) => tx.houseId === house.id);

    // Filter for total points
    let filteredTxs = houseTxs;
    if (options?.timeFilter === 'month') {
      filteredTxs = houseTxs.filter((tx) => tx.earnedAt >= startOfMonth);
    } else if (options?.timeFilter === 'week') {
      filteredTxs = houseTxs.filter((tx) => tx.earnedAt >= startOfWeek);
    } else if (options?.timeFilter === 'custom' && options?.startDate && options?.endDate) {
      filteredTxs = houseTxs.filter(
        (tx) => tx.earnedAt >= options.startDate! && tx.earnedAt <= options.endDate!
      );
    }

    const totalPoints = filteredTxs.reduce((sum, tx) => sum + tx.points, 0);

    // This month points
    const monthlyPoints = houseTxs
      .filter((tx) => tx.earnedAt >= startOfMonth)
      .reduce((sum, tx) => sum + tx.points, 0);

    // This week points
    const weeklyPoints = houseTxs
      .filter((tx) => tx.earnedAt >= startOfWeek)
      .reduce((sum, tx) => sum + tx.points, 0);

    // Category breakdown
    const categoryBreakdown = categories.map((cat) => {
      const catPoints = filteredTxs
        .filter((tx) => tx.categoryId === cat.id)
        .reduce((sum, tx) => sum + tx.points, 0);
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        icon: cat.icon,
        points: catPoints,
      };
    });

    results.push({
      id: house.id,
      name: house.name,
      slug: house.slug,
      shortName: house.shortName,
      symbol: house.symbol,
      motto: house.motto,
      description: house.description,
      logoUrl: house.logoUrl,
      primaryColor: house.primaryColor,
      secondaryColor: house.secondaryColor,
      accentColor: house.accentColor,
      bgGradient: house.bgGradient,
      totalPoints,
      rank: 0,
      monthlyPoints,
      weeklyPoints,
      totalTransactions: filteredTxs.length,
      categories: categoryBreakdown,
    });
  }

  // Sort descending by totalPoints
  results.sort((a, b) => b.totalPoints - a.totalPoints);

  // Assign ranks
  results.forEach((h, index) => {
    h.rank = index + 1;
  });

  if (isDefaultQuery && !options?.startDate && !options?.endDate) {
    scoreCache = {
      data: results,
      timestamp: Date.now(),
      key: cacheKey,
    };
  }

  return results;
}

export async function getTopContributors(limit = 10, seasonId?: string) {
  const season = seasonId
    ? await prisma.season.findUnique({ where: { id: seasonId } })
    : await getActiveSeason();

  const transactions = await prisma.pointTransaction.findMany({
    where: {
      status: { in: ['APPROVED', 'REVERSED'] },
      studentId: { not: null },
      ...(season ? { seasonId: season.id } : {}),
    },
    include: {
      student: {
        include: { house: true },
      },
      category: true,
    },
  });

  const studentMap = new Map<
    string,
    {
      student: NonNullable<(typeof transactions)[0]['student']>;
      totalPoints: number;
      categories: Record<string, number>;
      count: number;
    }
  >();

  for (const tx of transactions) {
    if (!tx.student) continue;
    const existing = studentMap.get(tx.student.id) || {
      student: tx.student,
      totalPoints: 0,
      categories: {},
      count: 0,
    };

    existing.totalPoints += tx.points;
    existing.count += 1;
    existing.categories[tx.category.name] = (existing.categories[tx.category.name] || 0) + tx.points;
    studentMap.set(tx.student.id, existing);
  }

  const contributors = Array.from(studentMap.values())
    .map((item) => ({
      id: item.student.id,
      studentCode: item.student.studentCode,
      name: `${item.student.firstName} ${item.student.lastName}`,
      grade: item.student.grade,
      className: item.student.className,
      houseName: item.student.house.name,
      houseSlug: item.student.house.slug,
      houseColor: item.student.house.primaryColor,
      totalPoints: item.totalPoints,
      transactionsCount: item.count,
      topCategory: Object.entries(item.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General',
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);

  return contributors;
}

export async function approveTransaction(
  transactionId: string,
  approver: { id: string; name: string }
) {
  const tx = await prisma.pointTransaction.findUnique({
    where: { id: transactionId },
    include: { house: true },
  });

  if (!tx) {
    throw new Error('Transaction not found');
  }

  if (tx.status === 'APPROVED') {
    throw new Error('Transaction has already been approved');
  }

  if (tx.status === 'REVERSED') {
    throw new Error('Cannot approve a reversed transaction');
  }

  // PRD anti-abuse check: no self-approval unless explicitly permitted in settings
  const selfApprovalSetting = await prisma.setting.findUnique({
    where: { key: 'self_approval_allowed' },
  });
  if (selfApprovalSetting?.value !== 'true' && tx.createdById === approver.id) {
    throw new Error('Fairness rule violation: You cannot approve your own point request.');
  }

  const userExists = approver.id ? await prisma.user.findUnique({ where: { id: approver.id } }) : null;
  const validApproverId = userExists ? approver.id : null;

  const updated = await prisma.pointTransaction.update({
    where: { id: transactionId },
    data: {
      status: 'APPROVED',
      approvedById: validApproverId,
      approvedByName: approver.name,
      approvedAt: new Date(),
    },
  });

  invalidateScoreCache();

  await logAuditEvent({
    userId: approver.id,
    userName: approver.name,
    action: 'POINT_APPROVE',
    entityType: 'PointTransaction',
    entityId: tx.id,
    oldData: { status: tx.status, points: tx.points },
    newData: { status: 'APPROVED', approvedByName: approver.name },
    reason: `Approved ${tx.points} points for ${tx.house.name}: ${tx.reason}`,
  });

  return updated;
}

export async function rejectTransaction(
  transactionId: string,
  user: { id: string; name: string },
  reason: string
) {
  const tx = await prisma.pointTransaction.findUnique({
    where: { id: transactionId },
    include: { house: true },
  });

  if (!tx) throw new Error('Transaction not found');
  if (tx.status === 'APPROVED') throw new Error('Cannot reject an already approved transaction. Use reversal instead.');

  const updated = await prisma.pointTransaction.update({
    where: { id: transactionId },
    data: {
      status: 'REJECTED',
      internalNotes: tx.internalNotes ? `${tx.internalNotes}\nRejection reason: ${reason}` : `Rejection reason: ${reason}`,
    },
  });

  invalidateScoreCache();

  await logAuditEvent({
    userId: user.id,
    userName: user.name,
    action: 'POINT_REJECT',
    entityType: 'PointTransaction',
    entityId: tx.id,
    oldData: { status: tx.status },
    newData: { status: 'REJECTED', reason },
    reason,
  });

  return updated;
}

export async function reverseTransaction(
  transactionId: string,
  user: { id: string; name: string },
  reason: string
) {
  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed reason is required to reverse an approved point transaction.');
  }

  const tx = await prisma.pointTransaction.findUnique({
    where: { id: transactionId },
    include: { house: true, reversedBy: true },
  });

  if (!tx) throw new Error('Transaction not found');
  if (tx.status !== 'APPROVED') {
    throw new Error(`Only approved transactions can be reversed. Current status: ${tx.status}`);
  }

  if (tx.reversedBy) {
    throw new Error('This transaction has already been reversed.');
  }

  const reversalCode = await generateTransactionCode();

  // Create offsetting transaction record with exact negative points
  const reversalTx = await prisma.pointTransaction.create({
    data: {
      transactionCode: reversalCode,
      houseId: tx.houseId,
      studentId: tx.studentId,
      categoryId: tx.categoryId,
      competitionId: tx.competitionId,
      achievementId: tx.achievementId,
      points: -tx.points, // Offset exact points
      reason: `REVERSAL of ${tx.transactionCode}: ${reason}`,
      description: `Reversal of transaction ${tx.transactionCode}. Original reason: ${tx.reason}`,
      createdById: user.id,
      createdByName: user.name,
      approvedById: user.id,
      approvedByName: user.name,
      approvedAt: new Date(),
      status: 'APPROVED',
      seasonId: tx.seasonId,
      reversalOfId: tx.id,
    },
  });

  // Mark original transaction as REVERSED
  await prisma.pointTransaction.update({
    where: { id: tx.id },
    data: { status: 'REVERSED' },
  });

  invalidateScoreCache();

  await logAuditEvent({
    userId: user.id,
    userName: user.name,
    action: 'POINT_REVERSE',
    entityType: 'PointTransaction',
    entityId: tx.id,
    oldData: { status: tx.status, points: tx.points },
    newData: {
      status: 'REVERSED',
      reversalTransactionId: reversalTx.id,
      offsettingPoints: reversalTx.points,
    },
    reason: `Reversed ${tx.points} points: ${reason}`,
  });

  return reversalTx;
}
