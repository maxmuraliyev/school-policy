import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding School House System Database ---');

  // Clear existing data in correct foreign key order
  await prisma.auditLog.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.competitionResult.deleteMany();
  await prisma.competitionParticipant.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.event.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.scoringRule.deleteMany();
  await prisma.category.deleteMany();
  await prisma.house.deleteMany();
  await prisma.season.deleteMany();
  await prisma.setting.deleteMany();

  // 1. Season
  const season = await prisma.season.create({
    data: {
      name: '2026-2027',
      startsAt: new Date('2026-09-01T08:00:00Z'),
      endsAt: new Date('2027-06-30T18:00:00Z'),
      status: 'ACTIVE',
    },
  });

  // 2. Settings
  await prisma.setting.createMany({
    data: [
      { key: 'school_name', value: 'Horizon International Academy', description: 'Official institution name', category: 'general' },
      { key: 'current_academic_year', value: '2026-2027', description: 'Active academic year', category: 'general' },
      { key: 'trophy_title', value: 'The Founders Silver & Gold Cup', description: 'Name of the annual trophy', category: 'general' },
      { key: 'self_approval_allowed', value: 'false', description: 'Allow creators to approve their own transactions', category: 'scoring' },
      { key: 'senior_approval_threshold', value: '50', description: 'Transactions over this amount require Admin approval', category: 'scoring' },
      { key: 'public_leaderboard_enabled', value: 'true', description: 'Show live leaderboard to public visitors', category: 'privacy' },
      { key: 'student_profiles_visibility', value: 'PUBLIC', description: 'Default student visibility (PUBLIC/SCHOOL_ONLY)', category: 'privacy' },
    ],
  });

  // 3. Houses
  const astra = await prisma.house.create({
    data: {
      name: 'Astra House',
      slug: 'astra',
      shortName: 'Astra',
      description: 'Dedicated to intellectual curiosity, analytical strategy, innovation, and aiming beyond ordinary frontiers.',
      motto: 'Aim Beyond',
      symbol: 'Falcon',
      logoUrl: '/houses/astra-crest.svg',
      primaryColor: '#6366F1', // Indigo
      secondaryColor: '#312E81', // Deep Midnight Indigo
      accentColor: '#38BDF8', // Cyan
      bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
      mentorName: 'Dr. Alistair Vance',
      mentorTitle: 'Head of Sciences & Astra House Master',
      captainName: 'Marcus Chen',
      viceCaptainName: 'Elena Rostova',
      isActive: true,
    },
  });

  const terra = await prisma.house.create({
    data: {
      name: 'Terra House',
      slug: 'terra',
      shortName: 'Terra',
      description: 'Rooted in unshakeable resilience, fellowship, relentless discipline, and community-centered leadership.',
      motto: 'Stronger Together',
      symbol: 'Wolf',
      logoUrl: '/houses/terra-crest.svg',
      primaryColor: '#10B981', // Emerald
      secondaryColor: '#064E3B', // Deep Forest Emerald
      accentColor: '#F59E0B', // Amber Gold
      bgGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%)',
      mentorName: 'Sarah Jenkins, M.Ed.',
      mentorTitle: 'Athletic Director & Terra House Mistress',
      captainName: 'Amara Diallo',
      viceCaptainName: 'Kai Takahashi',
      isActive: true,
    },
  });

  // 4. Categories
  const categoriesData = [
    { name: 'Academics', slug: 'academics', description: 'Subject Olympiads, quizzes, research papers, and academic excellence', icon: 'BookOpen', color: '#3B82F6', displayOrder: 1 },
    { name: 'Sports & Athletics', slug: 'sports', description: 'Football, basketball, volleyball, athletics tournaments, and fitness', icon: 'Trophy', color: '#10B981', displayOrder: 2 },
    { name: 'Technology & Science', slug: 'technology-science', description: 'Hackathons, programming, robotics, CTFs, and science fairs', icon: 'Cpu', color: '#8B5CF6', displayOrder: 3 },
    { name: 'Arts & Creativity', slug: 'arts-creativity', description: 'Visual arts, music, theatrical performance, debate, and media', icon: 'Palette', color: '#EC4899', displayOrder: 4 },
    { name: 'Leadership & Initiative', slug: 'leadership', description: 'Student governance, organizing school events, peer mentoring', icon: 'Compass', color: '#F59E0B', displayOrder: 5 },
    { name: 'Volunteering & Service', slug: 'volunteering-service', description: 'Community outreach, charity drives, and environmental service', icon: 'HeartHandshake', color: '#14B8A6', displayOrder: 6 },
    { name: 'School Events', slug: 'school-events', description: 'Festivals, inter-house assemblies, spirit rallies, and traditions', icon: 'Calendar', color: '#6366F1', displayOrder: 7 },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categoriesData) {
    const created = await prisma.category.create({ data: c });
    catMap[c.slug] = created.id;
  }

  // 5. Scoring Rules
  await prisma.scoringRule.createMany({
    data: [
      { name: '1st Place — School Competition', level: 'SCHOOL', place: '1ST', defaultPoints: 40, description: 'Gold or First Place finish in school event' },
      { name: '2nd Place — School Competition', level: 'SCHOOL', place: '2ND', defaultPoints: 25, description: 'Silver or Second Place finish in school event' },
      { name: '3rd Place — School Competition', level: 'SCHOOL', place: '3RD', defaultPoints: 15, description: 'Bronze or Third Place finish in school event' },
      { name: 'Official Participation / Effort', level: 'SCHOOL', place: 'PARTICIPATION', defaultPoints: 5, description: 'Verified entry and participation' },
      { name: 'City / Regional Champion', level: 'REGIONAL', place: '1ST', defaultPoints: 60, description: 'Representing school at regional level' },
      { name: 'National Olympiad Medalist', level: 'NATIONAL', place: '1ST', defaultPoints: 80, description: 'National level academic or athletic medal' },
      { name: 'International Honor / Award', level: 'INTERNATIONAL', place: '1ST', defaultPoints: 100, description: 'International recognition for student excellence' },
      { name: 'Community Volunteering Milestone', level: 'SCHOOL', place: 'CUSTOM', defaultPoints: 20, description: 'Completed verified 10+ hours service project' },
    ],
  });

  // 6. Permissions and Roles
  const permissionsData = [
    { code: 'student.read', name: 'View Students', category: 'students' },
    { code: 'student.create', name: 'Create Student', category: 'students' },
    { code: 'student.update', name: 'Update Student', category: 'students' },
    { code: 'student.archive', name: 'Archive Student', category: 'students' },
    { code: 'student.transfer', name: 'Transfer House', category: 'students' },
    { code: 'point.read', name: 'View Transactions', category: 'points' },
    { code: 'point.create', name: 'Create Point Request', category: 'points' },
    { code: 'point.approve', name: 'Approve Points', category: 'points' },
    { code: 'point.reverse', name: 'Reverse Points', category: 'points' },
    { code: 'competition.create', name: 'Create Competition', category: 'competitions' },
    { code: 'competition.update', name: 'Update Competition', category: 'competitions' },
    { code: 'competition.results', name: 'Publish Results', category: 'competitions' },
    { code: 'achievement.create', name: 'Submit Achievement', category: 'achievements' },
    { code: 'achievement.approve', name: 'Verify Achievement', category: 'achievements' },
    { code: 'announcement.create', name: 'Post Announcement', category: 'announcements' },
    { code: 'event.manage', name: 'Manage Events', category: 'events' },
    { code: 'user.manage', name: 'Manage Staff & Roles', category: 'system' },
    { code: 'settings.manage', name: 'Manage Settings', category: 'system' },
    { code: 'audit.read', name: 'Inspect Audit Logs', category: 'system' },
  ];

  const permRecords = [];
  for (const p of permissionsData) {
    const perm = await prisma.permission.create({ data: p });
    permRecords.push(perm);
  }

  const superAdminRole = await prisma.role.create({
    data: { name: 'SUPER_ADMIN', displayName: 'Super Administrator', description: 'Unrestricted system control, settings, and user governance', isSystem: true },
  });
  const adminRole = await prisma.role.create({
    data: { name: 'ADMIN', displayName: 'School Administrator', description: 'Points approval, student roster, competitions, and audit tracking', isSystem: true },
  });
  const teacherRole = await prisma.role.create({
    data: { name: 'TEACHER', displayName: 'Faculty Member', description: 'Can propose point requests, create competitions, and manage activities', isSystem: true },
  });
  const mentorRole = await prisma.role.create({
    data: { name: 'HOUSE_MENTOR', displayName: 'House Mentor', description: 'Assigned to a house; publishes house updates and verifies activities', isSystem: true },
  });
  const captainRole = await prisma.role.create({
    data: { name: 'HOUSE_CAPTAIN', displayName: 'Student House Captain', description: 'Student leadership, monitors roster engagement, proposes events', isSystem: true },
  });

  // Assign all permissions to SUPER_ADMIN & ADMIN
  for (const p of permRecords) {
    await prisma.rolePermission.create({ data: { roleId: superAdminRole.id, permissionId: p.id } });
    if (p.code !== 'user.manage') {
      await prisma.rolePermission.create({ data: { roleId: adminRole.id, permissionId: p.id } });
    }
  }

  // Teacher permissions
  const teacherCodes = ['student.read', 'point.read', 'point.create', 'competition.create', 'competition.update', 'competition.results', 'achievement.create', 'achievement.approve', 'announcement.create', 'event.manage'];
  for (const p of permRecords.filter((x) => teacherCodes.includes(x.code))) {
    await prisma.rolePermission.create({ data: { roleId: teacherRole.id, permissionId: p.id } });
    await prisma.rolePermission.create({ data: { roleId: mentorRole.id, permissionId: p.id } });
  }

  // Captain permissions
  const captainCodes = ['student.read', 'point.read', 'achievement.create'];
  for (const p of permRecords.filter((x) => captainCodes.includes(x.code))) {
    await prisma.rolePermission.create({ data: { roleId: captainRole.id, permissionId: p.id } });
  }

  // 7. Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const teacherPasswordHash = await bcrypt.hash('teacher123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@schoolhouse.edu',
      passwordHash,
      name: 'Eleanor Sterling',
      roleName: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@schoolhouse.edu',
      passwordHash,
      name: 'Principal Arthur Davies',
      roleName: 'ADMIN',
      isActive: true,
    },
  });

  const teacherVance = await prisma.user.create({
    data: {
      username: 'teacher_vance',
      email: 'a.vance@schoolhouse.edu',
      passwordHash: teacherPasswordHash,
      name: 'Dr. Alistair Vance',
      roleName: 'TEACHER',
      houseId: astra.id,
      isActive: true,
    },
  });

  const teacherJenkins = await prisma.user.create({
    data: {
      username: 'teacher_jenkins',
      email: 's.jenkins@schoolhouse.edu',
      passwordHash: teacherPasswordHash,
      name: 'Sarah Jenkins',
      roleName: 'HOUSE_MENTOR',
      houseId: terra.id,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      username: 'captain_astra',
      email: 'marcus.chen@student.schoolhouse.edu',
      passwordHash: teacherPasswordHash,
      name: 'Marcus Chen',
      roleName: 'HOUSE_CAPTAIN',
      houseId: astra.id,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      username: 'captain_terra',
      email: 'amara.diallo@student.schoolhouse.edu',
      passwordHash: teacherPasswordHash,
      name: 'Amara Diallo',
      roleName: 'HOUSE_CAPTAIN',
      houseId: terra.id,
      isActive: true,
    },
  });

  // 8. Students (24 students, 12 Astra, 12 Terra, balanced across grades 9, 10, 11)
  const astraStudentsData = [
    { studentCode: 'STU-1001', firstName: 'Marcus', lastName: 'Chen', grade: 11, className: '11A', bio: 'Astra House Captain. Passionate about competitive robotics and algorithms.' },
    { studentCode: 'STU-1002', firstName: 'Elena', lastName: 'Rostova', grade: 11, className: '11B', bio: 'Astra Vice-Captain. Mathematics Olympiad state finalist.' },
    { studentCode: 'STU-1003', firstName: 'David', lastName: 'Kim', grade: 10, className: '10A', bio: 'Lead programmer for the high school autonomous rover club.' },
    { studentCode: 'STU-1004', firstName: 'Sophia', lastName: 'Patel', grade: 10, className: '10B', bio: 'Science fair gold medalist studying renewable energy models.' },
    { studentCode: 'STU-1005', firstName: 'Liam', lastName: 'O’Connor', grade: 11, className: '11A', bio: 'Chess champion and lead strategist for the debate team.' },
    { studentCode: 'STU-1006', firstName: 'Zoe', lastName: 'Kowalski', grade: 9, className: '9A', bio: 'Freshman coder and winner of junior logic bowl.' },
    { studentCode: 'STU-1007', firstName: 'Tariq', lastName: 'Mansour', grade: 9, className: '9B', bio: 'Passionate about astrophysics and school astronomy club.' },
    { studentCode: 'STU-1008', firstName: 'Chloe', lastName: 'Bennett', grade: 10, className: '10A', bio: 'Editor of the school scientific journal and active volunteer.' },
    { studentCode: 'STU-1009', firstName: 'Felix', lastName: 'Muller', grade: 11, className: '11B', bio: 'Varsity cross-country runner representing Astra in athletics.' },
    { studentCode: 'STU-1010', firstName: 'Maya', lastName: 'Lin', grade: 9, className: '9A', bio: 'Visual artist and digital illustrator for the creative festival.' },
    { studentCode: 'STU-1011', firstName: 'Alexander', lastName: 'Wright', grade: 10, className: '10B', bio: 'Model UN delegate and youth parliament participant.' },
    { studentCode: 'STU-1012', firstName: 'Hana', lastName: 'Tanaka', grade: 11, className: '11A', bio: 'Cellist in the school orchestra and bio-chemistry researcher.' },
  ];

  const terraStudentsData = [
    { studentCode: 'STU-1013', firstName: 'Amara', lastName: 'Diallo', grade: 11, className: '11A', bio: 'Terra House Captain. Track & field sprint champion and peer counselor.' },
    { studentCode: 'STU-1014', firstName: 'Kai', lastName: 'Takahashi', grade: 11, className: '11B', bio: 'Terra Vice-Captain. Captain of the Varsity Football squad.' },
    { studentCode: 'STU-1015', firstName: 'Isabella', lastName: 'Garcia', grade: 10, className: '10A', bio: 'Dedicated community service organizer and environmental steward.' },
    { studentCode: 'STU-1016', firstName: 'Jonas', lastName: 'Larsson', grade: 10, className: '10B', bio: 'Basketball point guard and team leadership mentor.' },
    { studentCode: 'STU-1017', firstName: 'Fatima', lastName: 'Al-Zahra', grade: 11, className: '11A', bio: 'Public debate winner and mock trial defense advocate.' },
    { studentCode: 'STU-1018', firstName: 'Mateo', lastName: 'Silva', grade: 9, className: '9A', bio: 'Freshman swimming champion and junior varsity leader.' },
    { studentCode: 'STU-1019', firstName: 'Aria', lastName: 'Novak', grade: 9, className: '9B', bio: 'Vocal soloist and coordinator of charity food drives.' },
    { studentCode: 'STU-1020', firstName: 'Ethan', lastName: 'Walker', grade: 10, className: '10A', bio: 'Table tennis champion and volunteer math tutor.' },
    { studentCode: 'STU-1021', firstName: 'Leila', lastName: 'Khoury', grade: 11, className: '11B', bio: 'Lead organizer of the inter-house autumn environmental cleanup.' },
    { studentCode: 'STU-1022', firstName: 'Lucas', lastName: 'Moretti', grade: 9, className: '9A', bio: 'Volleyball varsity starter and junior robotics enthusiast.' },
    { studentCode: 'STU-1023', firstName: 'Nia', lastName: 'Abebe', grade: 10, className: '10B', bio: 'Winner of the regional drama and spoken word championship.' },
    { studentCode: 'STU-1024', firstName: 'Gabriel', lastName: 'Santos', grade: 11, className: '11A', bio: 'Triathlete and leader of the outdoor expeditions club.' },
  ];

  const astraStudents = [];
  for (const s of astraStudentsData) {
    const student = await prisma.student.create({
      data: {
        ...s,
        houseId: astra.id,
        photoUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      },
    });
    astraStudents.push(student);
  }

  const terraStudents = [];
  for (const s of terraStudentsData) {
    const student = await prisma.student.create({
      data: {
        ...s,
        houseId: terra.id,
        photoUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`,
      },
    });
    terraStudents.push(student);
  }

  // 9. Competitions
  const comp1 = await prisma.competition.create({
    data: {
      title: 'Horizon STEM & AI Innovation Hackathon',
      slug: 'horizon-stem-hackathon-2026',
      description: 'Annual inter-house 48-hour engineering and algorithmic challenge to build impactful software solutions for community challenges.',
      categoryId: catMap['technology-science'],
      competitionType: 'TECH',
      format: 'TEAM',
      organizer: 'Faculty of Computer Science',
      venue: 'Turing Technology Hall & Lab 3',
      startsAt: new Date('2026-09-18T09:00:00Z'),
      endsAt: new Date('2026-09-20T17:00:00Z'),
      rules: 'Teams of up to 4 members. Projects must be open-sourced and presented to an external jury of industry engineers.',
      status: 'COMPLETED',
      maxParticipants: 40,
      seasonId: season.id,
      createdById: teacherVance.id,
    },
  });

  const comp2 = await prisma.competition.create({
    data: {
      title: 'Autumn Inter-House Football Derby',
      slug: 'autumn-football-derby-2026',
      description: 'The premier sporting event of the first semester: Astra Falcons vs. Terra Wolves on the Grand Pitch.',
      categoryId: catMap['sports'],
      competitionType: 'SPORTS',
      format: 'TEAM',
      organizer: 'Department of Athletics',
      venue: 'Main Stadium Athletics Arena',
      startsAt: new Date('2026-09-25T14:30:00Z'),
      endsAt: new Date('2026-09-25T17:00:00Z'),
      rules: 'FIFA standard high-school regulations. Two 40-minute halves followed by penalty shootout if tied.',
      status: 'COMPLETED',
      maxParticipants: 32,
      seasonId: season.id,
      createdById: teacherJenkins.id,
    },
  });

  const comp3 = await prisma.competition.create({
    data: {
      title: 'School Mathematics & Logic Olympiad',
      slug: 'school-mathematics-olympiad-2026',
      description: 'Rigorous individual testing in combinatorics, number theory, Euclidean geometry, and logical deduction.',
      categoryId: catMap['academics'],
      competitionType: 'OLYMPIAD',
      format: 'INDIVIDUAL',
      organizer: 'Mathematics Department',
      venue: 'Great Examination Hall',
      startsAt: new Date('2026-10-02T10:00:00Z'),
      endsAt: new Date('2026-10-02T13:00:00Z'),
      rules: 'Individual paper with 8 advanced problem statements. No computational calculators allowed.',
      status: 'COMPLETED',
      maxParticipants: 60,
      seasonId: season.id,
      createdById: teacherVance.id,
    },
  });

  const comp4 = await prisma.competition.create({
    data: {
      title: 'All-School Debate Championship: Ethics of Artificial Intelligence',
      slug: 'all-school-debate-championship-2026',
      description: 'Parliamentary-style debate tournament exploring autonomous systems, privacy rights, and the future of human labor.',
      categoryId: catMap['leadership'],
      competitionType: 'DEBATE',
      format: 'TEAM',
      organizer: 'Humanities & Rhetoric Society',
      venue: 'Socrates Auditorium',
      startsAt: new Date('2026-10-12T15:00:00Z'),
      endsAt: new Date('2026-10-13T18:00:00Z'),
      registrationOpenAt: new Date('2026-10-01T08:00:00Z'),
      registrationCloseAt: new Date('2026-10-10T23:59:59Z'),
      rules: 'Oxford-style 3-member teams. 7-minute opening arguments, cross-examination, and rebuttal phases.',
      status: 'REGISTRATION_OPEN',
      maxParticipants: 24,
      seasonId: season.id,
      createdById: admin.id,
    },
  });

  const comp5 = await prisma.competition.create({
    data: {
      title: 'Annual Autumn Charity Gala & Food Drive',
      slug: 'autumn-charity-gala-food-drive-2026',
      description: 'House-wide initiative collecting essential goods, organizing donation packages, and volunteering at city food banks.',
      categoryId: catMap['volunteering-service'],
      competitionType: 'SERVICE',
      format: 'TEAM',
      organizer: 'Student Welfare & Service Committee',
      venue: 'Central Campus Pavilion',
      startsAt: new Date('2026-10-05T08:00:00Z'),
      endsAt: new Date('2026-10-20T18:00:00Z'),
      rules: 'Points awarded per verified weight of dry goods collected and documented hours of volunteer shifts completed.',
      status: 'ONGOING',
      seasonId: season.id,
      createdById: teacherJenkins.id,
    },
  });

  // 10. Teams & Participants for completed competitions
  const astraHackTeam = await prisma.team.create({
    data: {
      name: 'Astra Cyber Falcon',
      houseId: astra.id,
      competitionId: comp1.id,
      captainId: astraStudents[0].id,
    },
  });
  await prisma.teamMember.createMany({
    data: [
      { teamId: astraHackTeam.id, studentId: astraStudents[0].id, role: 'CAPTAIN' },
      { teamId: astraHackTeam.id, studentId: astraStudents[2].id, role: 'MEMBER' },
      { teamId: astraHackTeam.id, studentId: astraStudents[3].id, role: 'MEMBER' },
    ],
  });

  const terraHackTeam = await prisma.team.create({
    data: {
      name: 'Terra Vanguard',
      houseId: terra.id,
      competitionId: comp1.id,
      captainId: terraStudents[0].id,
    },
  });
  await prisma.teamMember.createMany({
    data: [
      { teamId: terraHackTeam.id, studentId: terraStudents[0].id, role: 'CAPTAIN' },
      { teamId: terraHackTeam.id, studentId: terraStudents[2].id, role: 'MEMBER' },
      { teamId: terraHackTeam.id, studentId: terraStudents[4].id, role: 'MEMBER' },
    ],
  });

  // Competition Results
  await prisma.competitionResult.createMany({
    data: [
      // Hackathon
      { competitionId: comp1.id, teamId: astraHackTeam.id, houseId: astra.id, rank: 1, scoreText: '1st Place — Jury Score 96/100', pointsAwarded: 50, status: 'OFFICIAL', notes: 'Autonomous drone disaster assessment system' },
      { competitionId: comp1.id, teamId: terraHackTeam.id, houseId: terra.id, rank: 2, scoreText: '2nd Place — Jury Score 92/100', pointsAwarded: 35, status: 'OFFICIAL', notes: 'Community solar energy distribution portal' },
      // Football Derby
      { competitionId: comp2.id, houseId: terra.id, rank: 1, scoreText: 'Won 3 - 2 (Full Time)', pointsAwarded: 45, status: 'OFFICIAL', notes: 'Deciding goal scored by Kai Takahashi in 78th minute' },
      { competitionId: comp2.id, houseId: astra.id, rank: 2, scoreText: 'Runner-up 2 - 3', pointsAwarded: 25, status: 'OFFICIAL', notes: 'Tenacious defense led by Felix Muller' },
      // Math Olympiad
      { competitionId: comp3.id, studentId: astraStudents[1].id, houseId: astra.id, rank: 1, scoreText: 'Perfect Score 80/80', pointsAwarded: 40, status: 'OFFICIAL', notes: 'Elena Rostova claimed first prize' },
      { competitionId: comp3.id, studentId: terraStudents[4].id, houseId: terra.id, rank: 2, scoreText: 'Score 74/80', pointsAwarded: 25, status: 'OFFICIAL', notes: 'Fatima Al-Zahra claimed second prize' },
      { competitionId: comp3.id, studentId: astraStudents[4].id, houseId: astra.id, rank: 3, scoreText: 'Score 68/80', pointsAwarded: 15, status: 'OFFICIAL', notes: 'Liam O’Connor claimed third prize' },
    ],
  });

  // 11. Point Transactions
  // We want Astra: 1,420 and Terra: 1,385!
  // Let's create transactions that sum up exactly to Astra = 1,420 and Terra = 1,385.
  // Astra components (sum = 1420):
  // 50 (Hackathon 1st), 25 (Football 2nd), 40 (Math 1st), 15 (Math 3rd) -> 130
  // Plus historical foundation events:
  // 350 (Summer Inter-House Sciences), 220 (Cross-Country), 240 (Robotics), 180 (Creative Arts), 160 (Model UN), 140 (Service) -> 130 + 1290 = 1420!
  // Terra components (sum = 1385):
  // 35 (Hackathon 2nd), 45 (Football 1st), 25 (Math 2nd) -> 105
  // Plus historical foundation events:
  // 380 (Athletics Championship), 260 (Community Food Bank), 210 (Debate & Rhetoric), 190 (Eco Initiative), 130 (Volleyball), 110 (Chess) -> 105 + 1280 = 1385!

  const transactionsData = [
    // --- Astra Approved Transactions ---
    {
      transactionCode: 'PT-000101',
      houseId: astra.id,
      studentId: astraStudents[0].id,
      teamId: astraHackTeam.id,
      competitionId: comp1.id,
      categoryId: catMap['technology-science'],
      points: 50,
      reason: '1st Place — Horizon STEM & AI Hackathon',
      description: 'Team Astra Cyber Falcon built an autonomous search-and-rescue mapping system with computer vision.',
      earnedAt: new Date('2026-09-20T16:30:00Z'),
      createdByName: 'Dr. Alistair Vance',
      createdById: teacherVance.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-21T09:00:00Z'),
      evidenceUrl: 'https://github.com/horizon-hackathon/astra-cyber-falcon',
    },
    {
      transactionCode: 'PT-000102',
      houseId: astra.id,
      studentId: astraStudents[1].id,
      competitionId: comp3.id,
      categoryId: catMap['academics'],
      points: 40,
      reason: '1st Place — School Mathematics & Logic Olympiad',
      description: 'Flawless performance solving all 8 combinatorial and geometric proofs.',
      earnedAt: new Date('2026-10-02T14:00:00Z'),
      createdByName: 'Dr. Alistair Vance',
      createdById: teacherVance.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-10-02T16:00:00Z'),
    },
    {
      transactionCode: 'PT-000103',
      houseId: astra.id,
      studentId: astraStudents[8].id,
      competitionId: comp2.id,
      categoryId: catMap['sports'],
      points: 25,
      reason: 'Runner-up — Autumn Football Derby',
      description: 'Tenacious team performance in a hard-fought 2-3 derby match.',
      earnedAt: new Date('2026-09-25T17:30:00Z'),
      createdByName: 'Sarah Jenkins',
      createdById: teacherJenkins.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-26T10:00:00Z'),
    },
    {
      transactionCode: 'PT-000104',
      houseId: astra.id,
      studentId: astraStudents[4].id,
      competitionId: comp3.id,
      categoryId: catMap['academics'],
      points: 15,
      reason: '3rd Place — School Mathematics & Logic Olympiad',
      description: 'Strong mathematical modeling and algebra performance.',
      earnedAt: new Date('2026-10-02T14:00:00Z'),
      createdByName: 'Dr. Alistair Vance',
      createdById: teacherVance.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-10-02T16:00:00Z'),
    },
    {
      transactionCode: 'PT-000105',
      houseId: astra.id,
      studentId: astraStudents[2].id,
      categoryId: catMap['technology-science'],
      points: 240,
      reason: 'National Youth Robotics Championship — Gold Trophy',
      description: 'Astra robotics squad clinched gold in autonomous precision engineering.',
      earnedAt: new Date('2026-09-12T18:00:00Z'),
      createdByName: 'Dr. Alistair Vance',
      createdById: teacherVance.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-13T10:00:00Z'),
    },
    {
      transactionCode: 'PT-000106',
      houseId: astra.id,
      studentId: astraStudents[3].id,
      categoryId: catMap['academics'],
      points: 350,
      reason: 'Inter-House Academic Decathlon Cumulative Victory',
      description: 'Astra house secured dominant scores across physics, chemistry, literature, and history decathlon.',
      earnedAt: new Date('2026-09-08T17:00:00Z'),
      createdByName: 'Dr. Alistair Vance',
      createdById: teacherVance.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-09T09:00:00Z'),
    },
    {
      transactionCode: 'PT-000107',
      houseId: astra.id,
      studentId: astraStudents[8].id,
      categoryId: catMap['sports'],
      points: 220,
      reason: 'Regional Cross-Country Relay Championship',
      description: 'Astra runners broke the regional sprint relay course record.',
      earnedAt: new Date('2026-09-15T15:00:00Z'),
      createdByName: 'Sarah Jenkins',
      createdById: teacherJenkins.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-16T11:00:00Z'),
    },
    {
      transactionCode: 'PT-000108',
      houseId: astra.id,
      studentId: astraStudents[9].id,
      categoryId: catMap['arts-creativity'],
      points: 180,
      reason: 'Inter-House Creative Media & Short Film Showcase',
      description: 'Produced an inspiring documentary on sustainable urban living.',
      earnedAt: new Date('2026-09-22T19:00:00Z'),
      createdByName: 'Dr. Alistair Vance',
      createdById: teacherVance.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-23T10:00:00Z'),
    },
    {
      transactionCode: 'PT-000109',
      houseId: astra.id,
      studentId: astraStudents[10].id,
      categoryId: catMap['leadership'],
      points: 160,
      reason: 'Best Delegation Award — International Model UN',
      description: 'Outstanding diplomatic consensus-building and parliamentary leadership.',
      earnedAt: new Date('2026-09-28T18:00:00Z'),
      createdByName: 'Principal Arthur Davies',
      createdById: admin.id,
      approvedByName: 'Eleanor Sterling',
      approvedById: superAdmin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-29T10:00:00Z'),
    },
    {
      transactionCode: 'PT-000110',
      houseId: astra.id,
      studentId: astraStudents[7].id,
      categoryId: catMap['volunteering-service'],
      points: 140,
      reason: 'Youth Digital Literacy Mentorship Initiative',
      description: '140 hours of teaching elementary schoolers coding and internet safety.',
      earnedAt: new Date('2026-10-01T16:00:00Z'),
      createdByName: 'Dr. Alistair Vance',
      createdById: teacherVance.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-10-01T17:30:00Z'),
    },

    // --- Terra Approved Transactions ---
    {
      transactionCode: 'PT-000111',
      houseId: terra.id,
      studentId: terraStudents[1].id,
      competitionId: comp2.id,
      categoryId: catMap['sports'],
      points: 45,
      reason: '1st Place — Autumn Football Derby Champions',
      description: 'Thrilling 3-2 victory for Terra Wolves in the annual inter-house rivalry clash.',
      earnedAt: new Date('2026-09-25T17:30:00Z'),
      createdByName: 'Sarah Jenkins',
      createdById: teacherJenkins.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-26T10:00:00Z'),
    },
    {
      transactionCode: 'PT-000112',
      houseId: terra.id,
      studentId: terraStudents[0].id,
      teamId: terraHackTeam.id,
      competitionId: comp1.id,
      categoryId: catMap['technology-science'],
      points: 35,
      reason: '2nd Place — Horizon STEM & AI Hackathon',
      description: 'Terra Vanguard engineered an intuitive neighborhood micro-grid energy sharing platform.',
      earnedAt: new Date('2026-09-20T16:30:00Z'),
      createdByName: 'Dr. Alistair Vance',
      createdById: teacherVance.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-21T09:00:00Z'),
    },
    {
      transactionCode: 'PT-000113',
      houseId: terra.id,
      studentId: terraStudents[4].id,
      competitionId: comp3.id,
      categoryId: catMap['academics'],
      points: 25,
      reason: '2nd Place — School Mathematics & Logic Olympiad',
      description: 'Impressive proofs in geometric symmetry and discrete math.',
      earnedAt: new Date('2026-10-02T14:00:00Z'),
      createdByName: 'Dr. Alistair Vance',
      createdById: teacherVance.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-10-02T16:00:00Z'),
    },
    {
      transactionCode: 'PT-000114',
      houseId: terra.id,
      studentId: terraStudents[0].id,
      categoryId: catMap['sports'],
      points: 380,
      reason: 'All-City High School Athletics Meet — House Championship',
      description: 'Terra athletes dominated track sprints, long jump, shot put, and distance hurdles.',
      earnedAt: new Date('2026-09-10T18:00:00Z'),
      createdByName: 'Sarah Jenkins',
      createdById: teacherJenkins.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-11T09:00:00Z'),
    },
    {
      transactionCode: 'PT-000115',
      houseId: terra.id,
      studentId: terraStudents[2].id,
      categoryId: catMap['volunteering-service'],
      points: 260,
      reason: 'Regional Food Bank Drive — 1.5 Tons Collected',
      description: 'Extraordinary community coordination delivering dry goods and assistance.',
      earnedAt: new Date('2026-09-14T17:00:00Z'),
      createdByName: 'Sarah Jenkins',
      createdById: teacherJenkins.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-15T10:00:00Z'),
    },
    {
      transactionCode: 'PT-000116',
      houseId: terra.id,
      studentId: terraStudents[4].id,
      categoryId: catMap['leadership'],
      points: 210,
      reason: 'State Oratory & Parliamentary Debate Grand Final',
      description: 'Terra rhetoric squad swept unanimous affirmative ballots.',
      earnedAt: new Date('2026-09-19T18:00:00Z'),
      createdByName: 'Sarah Jenkins',
      createdById: teacherJenkins.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-20T11:00:00Z'),
    },
    {
      transactionCode: 'PT-000117',
      houseId: terra.id,
      studentId: terraStudents[8].id,
      categoryId: catMap['volunteering-service'],
      points: 190,
      reason: 'Campus Ecological Stewardship & Tree Planting Campaign',
      description: 'Planted 250 native saplings and revitalized campus biodiversity garden.',
      earnedAt: new Date('2026-09-24T16:00:00Z'),
      createdByName: 'Sarah Jenkins',
      createdById: teacherJenkins.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-25T09:00:00Z'),
    },
    {
      transactionCode: 'PT-000118',
      houseId: terra.id,
      studentId: terraStudents[9].id,
      categoryId: catMap['sports'],
      points: 130,
      reason: 'Inter-House Volleyball Tournament Gold',
      description: 'Undefeated match run across five rounds of competitive volleyball.',
      earnedAt: new Date('2026-09-27T17:00:00Z'),
      createdByName: 'Sarah Jenkins',
      createdById: teacherJenkins.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-28T09:30:00Z'),
    },
    {
      transactionCode: 'PT-000119',
      houseId: terra.id,
      studentId: terraStudents[7].id,
      categoryId: catMap['academics'],
      points: 110,
      reason: 'High School Masters Chess Tournament — Silver Medal',
      description: 'Master-level classical chess tactics in a 7-round Swiss tournament.',
      earnedAt: new Date('2026-09-30T16:00:00Z'),
      createdByName: 'Sarah Jenkins',
      createdById: teacherJenkins.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-10-01T09:00:00Z'),
    },
  ];

  for (const t of transactionsData) {
    await prisma.pointTransaction.create({
      data: {
        ...t,
        seasonId: season.id,
      },
    });
  }

  // --- Seed an auditable transaction reversal (PRD Section 15 & 40) ---
  const mistakeTx = await prisma.pointTransaction.create({
    data: {
      transactionCode: 'PT-000120',
      houseId: astra.id,
      studentId: astraStudents[5].id,
      categoryId: catMap['technology-science'],
      points: 40,
      reason: 'Junior Logic Bowl — First Place [Typo Error]',
      description: 'Awarded 40 points erroneously instead of 20 points.',
      earnedAt: new Date('2026-09-29T11:00:00Z'),
      createdByName: 'Dr. Alistair Vance',
      createdById: teacherVance.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'REVERSED',
      approvedAt: new Date('2026-09-29T11:30:00Z'),
      seasonId: season.id,
    },
  });

  const reversalTx = await prisma.pointTransaction.create({
    data: {
      transactionCode: 'PT-000121',
      houseId: astra.id,
      studentId: astraStudents[5].id,
      categoryId: catMap['technology-science'],
      points: -40,
      reason: 'Reversal of PT-000120 — Score entry correction',
      description: 'Administrative score reversal. Correction requested by Dr. Vance.',
      earnedAt: new Date('2026-09-29T14:00:00Z'),
      createdByName: 'Principal Arthur Davies',
      createdById: admin.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      reversalOfId: mistakeTx.id,
      approvedAt: new Date('2026-09-29T14:05:00Z'),
      seasonId: season.id,
    },
  });

  // Then add the corrected transaction
  await prisma.pointTransaction.create({
    data: {
      transactionCode: 'PT-000122',
      houseId: astra.id,
      studentId: astraStudents[5].id,
      categoryId: catMap['technology-science'],
      points: 0, // already counted in total
      reason: 'Junior Logic Bowl — Verified Participation',
      description: 'Audited record adjustment.',
      earnedAt: new Date('2026-09-29T14:10:00Z'),
      createdByName: 'Dr. Alistair Vance',
      createdById: teacherVance.id,
      approvedByName: 'Principal Arthur Davies',
      approvedById: admin.id,
      status: 'APPROVED',
      approvedAt: new Date('2026-09-29T14:15:00Z'),
      seasonId: season.id,
    },
  });

  // --- Seed Pending Transactions for the Admin Approval Queue (PRD Section 14) ---
  await prisma.pointTransaction.createMany({
    data: [
      {
        transactionCode: 'PT-000123',
        houseId: astra.id,
        studentId: astraStudents[6].id,
        categoryId: catMap['technology-science'],
        points: 30,
        reason: 'Amateur Astronomy Spectroscopy Project Award',
        description: 'Tariq Mansour verified spectroscopic measurements of variable stars. Submitted with observation logs.',
        earnedAt: new Date('2026-10-03T15:00:00Z'),
        createdByName: 'Dr. Alistair Vance',
        createdById: teacherVance.id,
        status: 'PENDING',
        evidenceUrl: 'https://schoolhouse.edu/evidence/astro-spectroscopy-2026.pdf',
        internalNotes: 'Requires second teacher sign-off according to 30-pt threshold.',
        seasonId: season.id,
      },
      {
        transactionCode: 'PT-000124',
        houseId: terra.id,
        studentId: terraStudents[5].id,
        categoryId: catMap['sports'],
        points: 25,
        reason: 'Junior Varsity Swimming Meet — 100m Butterfly Gold',
        description: 'Mateo Silva won 1st place in the junior league invitational.',
        earnedAt: new Date('2026-10-03T17:30:00Z'),
        createdByName: 'Sarah Jenkins',
        createdById: teacherJenkins.id,
        status: 'PENDING',
        evidenceUrl: 'https://schoolhouse.edu/evidence/swim-meet-times.pdf',
        internalNotes: 'Official timesheet confirmed by Athletics Dept.',
        seasonId: season.id,
      },
      {
        transactionCode: 'PT-000125',
        houseId: terra.id,
        studentId: terraStudents[3].id,
        categoryId: catMap['leadership'],
        points: 20,
        reason: 'Campus Peer Tutoring Initiative — 15 Hours Completed',
        description: 'Jonas Larsson organized weekly algebra and physics peer review sessions.',
        earnedAt: new Date('2026-10-04T09:00:00Z'),
        createdByName: 'Sarah Jenkins',
        createdById: teacherJenkins.id,
        status: 'PENDING',
        evidenceUrl: 'https://schoolhouse.edu/evidence/tutoring-timesheet.pdf',
        seasonId: season.id,
      },
    ],
  });

  // 12. Verified Achievements
  await prisma.achievement.createMany({
    data: [
      {
        studentId: astraStudents[1].id,
        houseId: astra.id,
        title: 'International Mathematics Tournament Finalist',
        description: 'Selected in top 1% nationwide for the Olympiad training camp.',
        categoryId: catMap['academics'],
        level: 'NATIONAL',
        organization: 'National Council of Mathematics Educators',
        achievementDate: new Date('2026-09-28'),
        evidenceUrl: 'https://ncme.org/certificates/er-2026-88',
        status: 'APPROVED',
        pointsAwarded: 40,
        approvedById: admin.id,
      },
      {
        studentId: terraStudents[0].id,
        houseId: terra.id,
        title: 'State High School 400m Sprint Record',
        description: 'Set new state championship record of 54.2 seconds.',
        categoryId: catMap['sports'],
        level: 'REGIONAL',
        organization: 'State Interscholastic Athletic Association',
        achievementDate: new Date('2026-09-12'),
        evidenceUrl: 'https://siaa.org/results/2026/track-400m',
        status: 'APPROVED',
        pointsAwarded: 45,
        approvedById: admin.id,
      },
      {
        studentId: astraStudents[0].id,
        houseId: astra.id,
        title: 'Autonomous Drone Navigation Patent Pending',
        description: 'Co-authored publication and patent application for search-and-rescue mapping algorithm.',
        categoryId: catMap['technology-science'],
        level: 'NATIONAL',
        organization: 'Youth Inventors Foundation',
        achievementDate: new Date('2026-09-21'),
        status: 'APPROVED',
        pointsAwarded: 50,
        approvedById: admin.id,
      },
      {
        studentId: terraStudents[2].id,
        houseId: terra.id,
        title: 'President’s Volunteer Service Gold Medal',
        description: 'Exceeded 200 hours of community food security and shelter assistance.',
        categoryId: catMap['volunteering-service'],
        level: 'NATIONAL',
        organization: 'National Volunteer Service Commission',
        achievementDate: new Date('2026-09-18'),
        status: 'APPROVED',
        pointsAwarded: 30,
        approvedById: admin.id,
      },
    ],
  });

  // 13. Events Calendar
  await prisma.event.createMany({
    data: [
      {
        title: 'Inter-House Debate Championship Round 1',
        description: 'Preliminary rounds for Oxford-style ethics of AI debate tournament.',
        eventType: 'COMPETITION',
        categoryId: catMap['leadership'],
        venue: 'Socrates Auditorium',
        startsAt: new Date('2026-10-12T15:00:00Z'),
        endsAt: new Date('2026-10-12T18:00:00Z'),
        isPublic: true,
        seasonId: season.id,
      },
      {
        title: 'Astra Falcon Strategy Assembly',
        description: 'Mandatory meeting for all Astra students to coordinate second-quarter event entries.',
        eventType: 'HOUSE_ACTIVITY',
        categoryId: catMap['leadership'],
        houseId: astra.id,
        venue: 'Newton Lecture Theatre',
        startsAt: new Date('2026-10-08T16:00:00Z'),
        endsAt: new Date('2026-10-08T17:15:00Z'),
        isPublic: true,
        seasonId: season.id,
      },
      {
        title: 'Terra Wolves Community Drive Packaging Day',
        description: 'Volunteering work session boxing dry goods for city distribution.',
        eventType: 'HOUSE_ACTIVITY',
        categoryId: catMap['volunteering-service'],
        houseId: terra.id,
        venue: 'Campus Recreation Hub',
        startsAt: new Date('2026-10-10T10:00:00Z'),
        endsAt: new Date('2026-10-10T14:00:00Z'),
        isPublic: true,
        seasonId: season.id,
      },
      {
        title: 'Mid-Semester House Cup Standings Review',
        description: 'Formal school assembly announcing official mid-semester points and recognized contributors.',
        eventType: 'CEREMONY',
        venue: 'Main Sports Complex & Arena',
        startsAt: new Date('2026-10-25T11:00:00Z'),
        endsAt: new Date('2026-10-25T12:30:00Z'),
        isPublic: true,
        seasonId: season.id,
      },
    ],
  });

  // 14. Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: '2026–2027 House Cup Battle is Officially Live!',
        slug: 'house-cup-battle-officially-live-2026',
        content: `Welcome to the official digital portal for the Horizon International Academy School House System!

This year, **Astra House** (*Aim Beyond*) and **Terra House** (*Stronger Together*) enter their most dynamic competition yet. Every single point change on this website is tied to verified achievements, Olympiad victories, sports derbies, and selfless community volunteering.

Browse the live leaderboard, explore upcoming competitions, and see how individual students contribute to their houses. May the best house win!`,
        audienceType: 'ALL',
        authorName: 'Principal Arthur Davies',
        authorId: admin.id,
        status: 'PUBLISHED',
        isPinned: true,
        publishedAt: new Date('2026-09-01T08:00:00Z'),
      },
      {
        title: 'Astra Strategy Briefing: Debate & Robotics Entries Needed',
        slug: 'astra-strategy-briefing-october-2026',
        content: `Falcons! We hold a 35-point lead (1,420 vs 1,385), but the upcoming Oxford Debate and Community Drive can shift the standings quickly. 

Join Dr. Vance and House Captain Marcus Chen this Thursday at 16:00 in Newton Hall to finalize team rosters. Bring your ideas and competitive fire!`,
        audienceType: 'ASTRA',
        houseId: astra.id,
        authorName: 'Dr. Alistair Vance',
        authorId: teacherVance.id,
        status: 'PUBLISHED',
        isPinned: false,
        publishedAt: new Date('2026-10-03T12:00:00Z'),
      },
      {
        title: 'Terra Wolves: Community Drive Mobilization & Rally',
        slug: 'terra-wolves-community-drive-rally',
        content: `Wolves! Following our thrilling 3-2 victory in the Autumn Football Derby, we are just 35 points behind Astra. 

The Autumn Charity Gala & Food Drive is Terra's signature home ground. We are organizing shifts for packing and logistics this Saturday at 10:00 AM. Let's show the strength of our unity!`,
        audienceType: 'TERRA',
        houseId: terra.id,
        authorName: 'Sarah Jenkins',
        authorId: teacherJenkins.id,
        status: 'PUBLISHED',
        isPinned: false,
        publishedAt: new Date('2026-10-03T14:30:00Z'),
      },
    ],
  });

  // 15. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userName: 'Eleanor Sterling',
        userId: superAdmin.id,
        action: 'SYSTEM_INITIALIZATION',
        entityType: 'Season',
        entityId: season.id,
        newData: JSON.stringify({ season: '2026-2027', status: 'ACTIVE', houses: ['Astra', 'Terra'] }),
        reason: 'Initialized production house competition season',
        ipAddress: '127.0.0.1',
      },
      {
        userName: 'Principal Arthur Davies',
        userId: admin.id,
        action: 'POINT_APPROVE',
        entityType: 'PointTransaction',
        entityId: 'PT-000101',
        newData: JSON.stringify({ points: 50, house: 'Astra', reason: '1st Place — STEM Hackathon' }),
        reason: 'Verified hackathon jury evaluation sheets',
        ipAddress: '192.168.1.10',
      },
      {
        userName: 'Principal Arthur Davies',
        userId: admin.id,
        action: 'POINT_REVERSE',
        entityType: 'PointTransaction',
        entityId: mistakeTx.id,
        oldData: JSON.stringify({ points: 40, status: 'APPROVED' }),
        newData: JSON.stringify({ points: -40, status: 'REVERSED', reversalId: reversalTx.id }),
        reason: 'Typo correction per Dr. Vance report',
        ipAddress: '192.168.1.10',
      },
      {
        userName: 'Principal Arthur Davies',
        userId: admin.id,
        action: 'COMPETITION_RESULT',
        entityType: 'Competition',
        entityId: comp2.id,
        newData: JSON.stringify({ result: 'Terra won 3-2 against Astra', pointsAwarded: { terra: 45, astra: 25 } }),
        reason: 'Official referee match card verified',
        ipAddress: '192.168.1.10',
      },
    ],
  });

  console.log('Seeding completed successfully!');
  console.log('Summary:');
  console.log('- Season: 2026-2027');
  console.log('- Houses: Astra (Falcon) and Terra (Wolf)');
  console.log('- Categories: 7 core categories');
  console.log('- Users: superadmin, admin, teacher_vance, teacher_jenkins, captain_astra, captain_terra');
  console.log('- Students: 24 active students (12 Astra, 12 Terra)');
  console.log('- Competitions: 5 competitions (3 completed with results, 1 registration open, 1 ongoing)');
  console.log('- Point transactions: 19 approved/active, 3 pending, 1 reversed with audit record');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
