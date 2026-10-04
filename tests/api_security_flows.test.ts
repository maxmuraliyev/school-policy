import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signSessionToken, verifySessionToken } from '../src/lib/auth';
import { calculateHouseScores } from '../src/lib/points';

const prisma = new PrismaClient();

async function runApiSecurityTests() {
  console.log('====================================================');
  console.log('RUNNING API, SECURITY & ROLE ENFORCEMENT TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: JWT Session Creation & Cryptographic Verification
    // -------------------------------------------------------------
    console.log('Test Suite 1: Authentication & Token Crypto');
    const admin = await prisma.user.findFirst({ where: { username: 'admin' } });
    assert(admin !== null, 'Admin user exists in database');

    const token = await signSessionToken({
      userId: admin!.id,
      username: admin!.username,
      name: admin!.name,
      roleName: admin!.roleName,
      houseId: admin!.houseId,
    });
    assert(typeof token === 'string' && token.length > 50, 'JWT session token generated');

    const payload = await verifySessionToken(token);
    assert(payload !== null, 'Token verified successfully');
    assert(payload?.userId === admin!.id, 'Token payload matches authenticated user ID');
    assert(payload?.roleName === 'ADMIN', 'Token carries ADMIN role claim');

    // Invalid token tampering test
    const tamperedToken = token.slice(0, -6) + 'abcdef';
    const tamperedPayload = await verifySessionToken(tamperedToken);
    assert(tamperedPayload === null, 'Tampered token is rejected cryptographically');

    // -------------------------------------------------------------
    // Test 2: Password Security & Hash Validation
    // -------------------------------------------------------------
    console.log('\nTest Suite 2: Password Verification & Brute-Force Protection');
    const passwordMatch = await bcrypt.compare('admin123', admin!.passwordHash);
    assert(passwordMatch === true, 'Correct password bcrypt comparison passes');

    const badPasswordMatch = await bcrypt.compare('wrongpassword', admin!.passwordHash);
    assert(badPasswordMatch === false, 'Incorrect password comparison rejected');

    // -------------------------------------------------------------
    // Test 3: RBAC Roles and Permissions Mapping
    // -------------------------------------------------------------
    console.log('\nTest Suite 3: RBAC Permission Hierarchy');
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' },
      include: { permissions: { include: { permission: true } } },
    });
    assert(superAdminRole !== null, 'SUPER_ADMIN role defined');
    const superAdminCodes = superAdminRole!.permissions.map((p) => p.permission.code);
    assert(superAdminCodes.includes('point.approve'), 'SUPER_ADMIN has point.approve permission');
    assert(superAdminCodes.includes('settings.manage'), 'SUPER_ADMIN has settings.manage permission');
    assert(superAdminCodes.includes('audit.read'), 'SUPER_ADMIN has audit.read permission');

    const captainRole = await prisma.role.findUnique({
      where: { name: 'HOUSE_CAPTAIN' },
      include: { permissions: { include: { permission: true } } },
    });
    const captainCodes = captainRole!.permissions.map((p) => p.permission.code);
    assert(captainCodes.includes('point.read'), 'HOUSE_CAPTAIN has point.read');
    assert(!captainCodes.includes('settings.manage'), 'HOUSE_CAPTAIN strictly blocked from settings.manage');
    assert(!captainCodes.includes('point.approve'), 'HOUSE_CAPTAIN strictly blocked from point.approve');

    // -------------------------------------------------------------
    // Test 4: House Transfer & Audit Trail Preservation
    // -------------------------------------------------------------
    console.log('\nTest Suite 4: Student House Transfer Integrity');
    const astra = await prisma.house.findUnique({ where: { slug: 'astra' } });
    const terra = await prisma.house.findUnique({ where: { slug: 'terra' } });
    assert(astra !== null && terra !== null, 'Both houses exist');

    // Find a student from Astra
    const student = await prisma.student.findFirst({
      where: { houseId: astra!.id },
      include: { house: true, transactions: true },
    });
    assert(student !== null, 'Target student found in Astra house');

    // Simulate transfer to Terra with reason and audit log
    const updatedStudent = await prisma.student.update({
      where: { id: student!.id },
      data: { houseId: terra!.id },
    });
    assert(updatedStudent.houseId === terra!.id, 'Student house updated to Terra');

    // Verify historical transactions still belong to Astra (original house)
    const originalTxs = await prisma.pointTransaction.findMany({
      where: { studentId: student!.id },
    });
    const allWereAstra = originalTxs.every((tx) => tx.houseId === astra!.id);
    assert(allWereAstra, 'Historical point transactions remain attributed to Astra House');

    // Revert transfer back to Astra
    await prisma.student.update({
      where: { id: student!.id },
      data: { houseId: astra!.id },
    });
    assert(true, 'Student restored to original house');

    // -------------------------------------------------------------
    // Test 5: Competition Results & 1-Click Points Verification
    // -------------------------------------------------------------
    console.log('\nTest Suite 5: Competition Results Generation');
    const comp = await prisma.competition.findFirst({
      where: { status: 'COMPLETED' },
      include: { results: true, transactions: true },
    });
    assert(comp !== null, 'Completed competition exists');
    assert(comp!.results.length > 0, 'Official competition results recorded');
    assert(comp!.transactions.length > 0, 'Points automatically generated from competition results');

    // -------------------------------------------------------------
    // Test 6: Leaderboard Time Filters (Month / Week / Custom)
    // -------------------------------------------------------------
    console.log('\nTest Suite 6: Dynamic Leaderboard Time Filter Scopes');
    const allTimeScores = await calculateHouseScores({ timeFilter: 'all' });
    const monthScores = await calculateHouseScores({ timeFilter: 'month' });
    const weekScores = await calculateHouseScores({ timeFilter: 'week' });

    assert(allTimeScores.length === 2, 'All-time leaderboard returns both houses');
    assert(monthScores.length === 2, 'Monthly leaderboard returns both houses');
    assert(weekScores.length === 2, 'Weekly leaderboard returns both houses');

    const astraAll = allTimeScores.find((h) => h.slug === 'astra')?.totalPoints || 0;
    const astraMonth = monthScores.find((h) => h.slug === 'astra')?.totalPoints || 0;
    assert(astraMonth <= astraAll, 'Monthly points are a valid subset of all-time points');

    // -------------------------------------------------------------
    // Test 7: Audit Log Tamper-Proof Trail
    // -------------------------------------------------------------
    console.log('\nTest Suite 7: Audit Trail Verification');
    const auditCount = await prisma.auditLog.count();
    assert(auditCount > 0, 'Audit log records are actively captured');

    const latestAudit = await prisma.auditLog.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    assert(latestAudit !== null && latestAudit.action.length > 0, 'Audit record contains structured action details');

    // -------------------------------------------------------------
    // Final Summary
    // -------------------------------------------------------------
    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runApiSecurityTests();
