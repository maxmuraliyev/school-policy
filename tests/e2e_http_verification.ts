async function testEndpoints() {
  const base = 'http://localhost:3000';
  const urls = [
    '/',
    '/houses',
    '/houses/astra',
    '/houses/terra',
    '/leaderboard',
    '/competitions',
    '/students',
    '/achievements',
    '/events',
    '/announcements',
    '/rules',
    '/about',
    '/login',
    '/api/leaderboard',
    '/api/houses',
    '/api/competitions',
    '/api/students',
    '/api/events',
    '/api/announcements'
  ];

  console.log('Testing public endpoints...');
  for (const path of urls) {
    const res = await fetch(base + path);
    console.log(`  [${res.status}] ${path}`);
    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }

  console.log('\nTesting Auth API flow...');
  const loginRes = await fetch(base + '/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  console.log(`  Login status: ${loginRes.status}`);
  const loginData = await loginRes.json();
  console.log(`  Logged in as: ${loginData.user?.name} (${loginData.user?.roleName})`);

  const cookie = loginRes.headers.get('set-cookie');
  console.log(`  Auth cookie received: ${!!cookie}`);

  console.log('\nTesting Leaderboard Data Output...');
  const leaderboardRes = await fetch(base + '/api/leaderboard');
  const lbData = await leaderboardRes.json();
  console.log(`  Season: ${lbData.season?.name}`);
  console.log(`  Houses: ${lbData.houses?.map((h: any) => `${h.name}: ${h.totalPoints} pts`).join(', ')}`);
  console.log(`  Top Contributors: ${lbData.contributors?.length} students`);
  console.log(`  Recent Transactions: ${lbData.recentTransactions?.length} transactions`);

  console.log('\nTesting Admin Protected Endpoints with Cookie...');
  const adminUrls = [
    '/admin',
    '/admin/points',
    '/admin/points/pending',
    '/admin/students',
    '/admin/students/import',
    '/admin/competitions',
    '/admin/achievements',
    '/admin/audit-logs',
    '/admin/analytics',
    '/admin/settings',
    '/api/admin/analytics',
    '/api/admin/audit-logs',
    '/api/admin/settings'
  ];

  for (const path of adminUrls) {
    const res = await fetch(base + path, {
      headers: { cookie: cookie || '' }
    });
    console.log(`  [${res.status}] ${path}`);
    if (!res.ok) throw new Error(`Failed to fetch admin route ${path}: ${res.status}`);
  }

  console.log('\nTesting dry-run CSV parsing on API...');
  const sampleCsv = `first_name,last_name,grade,class,house\nFarrukh,Karimov,9,9A,Astra\nNilufar,Alimova,10,10B,Terra`;
  const dryRunRes = await fetch(base + '/api/students/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookie || ''
    },
    body: JSON.stringify({ csvContent: sampleCsv, dryRun: true })
  });
  const dryRunData = await dryRunRes.json();
  console.log(`  Dry run parsed: ${dryRunData.validRows} valid rows, ${dryRunData.errors?.length || 0} errors`);

  console.log('\n======================================================');
  console.log('ALL E2E HTTP VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
}

testEndpoints().catch((err) => {
  console.error('E2E HTTP Verification Failed:', err);
  process.exit(1);
});
