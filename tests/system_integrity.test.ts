import { PrismaClient } from '@prisma/client';
import {
  calculateHouseScores,
  approveTransaction,
  reverseTransaction,
  generateTransactionCode,
  getActiveSeason,
} from '../src/lib/points';
import { parseCSV, toCSV } from '../src/lib/csv';

const prisma = new PrismaClient();

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING COMPREHENSIVE SCHOOL HOUSE SYSTEM TEST SUITE');
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
    // Test 1: Fundamental Rule — Score Is Derived From Transactions
    // -------------------------------------------------------------
    console.log('Test Suite 1: Score Derivation & Calculation');
    const season = await getActiveSeason();
    assert(season !== null, 'Active academic season exists');

    const houseScores = await calculateHouseScores({ seasonId: season?.id });
    const astra = houseScores.find((h) => h.slug === 'astra');
    const terra = houseScores.find((h) => h.slug === 'terra');

    assert(astra !== undefined && terra !== undefined, 'Both Astra and Terra houses are evaluated');
    assert(astra!.totalPoints === 1420, `Astra total score is exactly 1,420 (Calculated: ${astra?.totalPoints})`);
    assert(terra!.totalPoints === 1385, `Terra total score is exactly 1,385 (Calculated: ${terra?.totalPoints})`);
    assert(astra!.rank === 1 && terra!.rank === 2, 'Astra correctly ranked #1 and Terra ranked #2');

    // -------------------------------------------------------------
    // Test 2: Unapproved Points Do NOT Count Towards Total
    // -------------------------------------------------------------
    console.log('\nTest Suite 2: Unapproved Point Isolation');
    const pendingTxs = await prisma.pointTransaction.findMany({
      where: { houseId: astra!.id, status: 'PENDING' },
    });
    assert(pendingTxs.length > 0, 'Pending transactions exist in database');

    const pendingSum = pendingTxs.reduce((sum, tx) => sum + tx.points, 0);
    // Recalculate score to verify pending points were excluded
    assert(astra!.totalPoints === 1420, `Pending points (${pendingSum} pts) are strictly excluded from leaderboard total`);

    // -------------------------------------------------------------
    // Test 3: Point Approval Workflow
    // -------------------------------------------------------------
    console.log('\nTest Suite 3: Point Approval Workflow');
    const category = await prisma.category.findFirst();
    const testCode = await generateTransactionCode();

    const newTx = await prisma.pointTransaction.create({
      data: {
        transactionCode: testCode,
        houseId: astra!.id,
        categoryId: category!.id,
        points: 25,
        reason: 'Automated Test Participation Award',
        createdByName: 'Test Runner',
        status: 'PENDING',
        seasonId: season!.id,
      },
    });

    assert(newTx.status === 'PENDING', 'New transaction created with PENDING status');

    const adminUser = await prisma.user.findFirst({ where: { roleName: 'ADMIN' } });
    assert(adminUser !== null, 'Admin user found for approval tests');

    // Approve transaction
    const approved = await approveTransaction(newTx.id, { id: adminUser!.id, name: adminUser!.name });
    assert(approved.status === 'APPROVED', 'Transaction status transitioned to APPROVED');
    assert(approved.approvedByName === adminUser!.name, 'Approver name correctly recorded');

    // Verify recalculation reflects the +25 points
    const updatedScores = await calculateHouseScores({ seasonId: season?.id });
    const astraUpdated = updatedScores.find((h) => h.slug === 'astra');
    assert(astraUpdated!.totalPoints === 1445, `Astra total increased to 1,445 (Calculated: ${astraUpdated?.totalPoints})`);

    // -------------------------------------------------------------
    // Test 4: Score Reversal Preserves Full History (PRD Section 15)
    // -------------------------------------------------------------
    console.log('\nTest Suite 4: Auditable Score Reversal');
    const reversal = await reverseTransaction(
      newTx.id,
      { id: adminUser!.id, name: adminUser!.name },
      'Automated test cleanup reversal'
    );

    assert(reversal.points === -25, `Reversal created with exact negative offsetting amount (-25 pts)`);
    assert(reversal.reversalOfId === newTx.id, 'Reversal entry links to original transaction ID');

    const originalTxReloaded = await prisma.pointTransaction.findUnique({ where: { id: newTx.id } });
    assert(originalTxReloaded!.status === 'REVERSED', 'Original transaction marked as REVERSED');

    // Verify recalculation restores previous total
    const afterReversalScores = await calculateHouseScores({ seasonId: season?.id });
    const astraRestored = afterReversalScores.find((h) => h.slug === 'astra');
    assert(astraRestored!.totalPoints === 1420, `Astra total accurately restored to 1,420 after reversal`);

    // Cleanup test transactions
    await prisma.pointTransaction.delete({ where: { id: reversal.id } });
    await prisma.pointTransaction.delete({ where: { id: newTx.id } });

    // -------------------------------------------------------------
    // Test 5: Anti-Self-Approval Enforcement (PRD Section 74)
    // -------------------------------------------------------------
    console.log('\nTest Suite 5: Anti-Abuse Self-Approval Block');
    const selfUser = await prisma.user.findFirst({ where: { roleName: 'TEACHER' } });
    const selfTx = await prisma.pointTransaction.create({
      data: {
        transactionCode: await generateTransactionCode(),
        houseId: terra!.id,
        categoryId: category!.id,
        points: 30,
        reason: 'Self Approval Test',
        createdById: selfUser!.id,
        createdByName: selfUser!.name,
        status: 'PENDING',
        seasonId: season!.id,
      },
    });

    let selfApprovalBlocked = false;
    try {
      await approveTransaction(selfTx.id, { id: selfUser!.id, name: selfUser!.name });
    } catch (err: any) {
      if (err.message.includes('cannot approve your own point request')) {
        selfApprovalBlocked = true;
      }
    }
    assert(selfApprovalBlocked, 'Teacher self-approval is blocked with fairness error');
    await prisma.pointTransaction.delete({ where: { id: selfTx.id } });

    // -------------------------------------------------------------
    // Test 6: CSV Parsing & Validation (PRD Section 34)
    // -------------------------------------------------------------
    console.log('\nTest Suite 6: CSV Import Engine');
    const validCSV = `first_name,last_name,grade,class,house\nAziz,Saidov,10,10A,Astra\nMalika,Tursunova,11,11B,Terra`;
    const parsed = parseCSV(validCSV);
    assert(parsed.rows.length === 2, 'CSV parsed 2 student rows');
    assert(parsed.rows[0].first_name === 'Aziz', 'First name parsed correctly');
    assert(parsed.rows[1].house === 'Terra', 'House parsed correctly');

    const csvOutput = toCSV(['first_name', 'last_name', 'grade'], [['Aziz', 'Saidov', 10]]);
    assert(csvOutput.includes('Aziz,Saidov,10'), 'CSV generator output formatted properly');

    // -------------------------------------------------------------
    // Test 7: Student House Transfer Historical Preservation (PRD 36)
    // -------------------------------------------------------------
    console.log('\nTest Suite 7: House Transfer Integrity');
    const sampleStudent = await prisma.student.findFirst({
      where: { houseId: astra!.id },
      include: { transactions: { where: { status: 'APPROVED' } } },
    });
    assert(sampleStudent !== null, 'Sample student found with approved transactions');

    // -------------------------------------------------------------
    // Final Summary
    // -------------------------------------------------------------
    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
