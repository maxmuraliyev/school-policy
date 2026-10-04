async function verifyPages() {
  const baseUrl = 'http://localhost:3000';
  const routes = [
    '/',
    '/leaderboard',
    '/houses',
    '/houses/astra',
    '/houses/terra',
    '/competitions',
    '/competitions/autumn-football-derby-2026',
    '/students',
    '/students/cmutlbg6p001otwhc2gvfxwsa',
    '/achievements',
    '/events',
    '/announcements',
    '/rules',
    '/about',
    '/login',
    '/api/houses',
    '/api/leaderboard',
    '/api/points?limit=10',
    '/api/competitions',
  ];

  console.log('Testing all frontend routes on ' + baseUrl + '...');
  let failed = 0;

  for (const route of routes) {
    try {
      const res = await fetch(`${baseUrl}${route}`);
      if (res.ok) {
        console.log(`  ✓ 200 OK: ${route}`);
      } else {
        console.error(`  ✗ FAIL ${res.status}: ${route}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`  ✗ ERROR connecting to ${route}:`, err.message);
      failed++;
    }
  }

  if (failed === 0) {
    console.log(`\nALL ${routes.length} ROUTES VERIFIED 200 OK!`);
    process.exit(0);
  } else {
    console.error(`\n${failed} routes failed!`);
    process.exit(1);
  }
}

verifyPages();
