# School House System — Product Requirements Document (PRD)

**Working project name:** School House System  
**Working house names:** Astra House and Terra House  
**Document type:** Product Requirements Document  
**Primary audience:** Student developer, school administration, teachers, project supervisors  
**Project status:** Concept approved in principle; software system to be designed and implemented  
**Version:** 1.0  
**Date:** October 2026  

---

# 1. Executive Summary

The School House System is a digital platform for managing a school-wide two-house competition between **Astra House** and **Terra House**.

The project is inspired by the general idea of school houses: students belong to one of two permanent groups, earn points for achievements and participation, compete in events, and contribute to their house throughout the academic year.

The website is not only a public leaderboard. It is intended to become the official digital infrastructure for the entire house system.

It should allow the school to:

- divide students between two houses;
- display current house scores;
- publish competitions and results;
- award points for verified achievements;
- track how every point was earned;
- manage students and house membership;
- manage house captains and teacher mentors;
- publish announcements and upcoming events;
- provide transparent public rankings;
- preserve the full scoring history;
- prevent unauthorized score manipulation;
- support future expansion if the school later adds more houses or features.

The key principle of the system is **transparency**.

A house's total score must not be manually typed as a single number. Instead, the system should store individual point transactions and calculate the total from them.

For example:

> Astra House +40 points  
> Reason: 1st place in School Mathematics Quiz  
> Student: Student Name  
> Category: Academics  
> Approved by: Teacher Name  
> Date: 12 October 2026

This creates an auditable system where students and teachers can understand why the score changed.

---

# 2. Problem Statement

Without a centralized digital system, a school house competition can quickly become difficult to manage.

Typical problems include:

- scores being stored manually in spreadsheets or notebooks;
- students not understanding how points are calculated;
- disputes about whether points were awarded fairly;
- duplicate point awards;
- forgotten competition results;
- lack of history;
- teachers editing totals without explanation;
- students losing interest because they cannot see progress;
- difficulty identifying who contributed to each house;
- difficulty organizing events and publishing results;
- no centralized place for house announcements and statistics.

The website should solve these problems by becoming the **single source of truth** for the house competition.

---

# 3. Product Vision

Create a transparent, engaging and reliable school platform where students can follow the competition between Astra and Terra, understand how their house earns points, participate in events, and see their own contributions to school life.

The long-term goal is not simply to display two scores.

The system should help create:

- stronger student participation;
- healthy competition;
- stronger school identity;
- leadership opportunities;
- recognition for different kinds of achievements;
- more involvement in academic and extracurricular activities;
- transparent school-wide event management.

---

# 4. Core Product Principles

## 4.1 Transparency

Every score change must have a visible reason.

The platform should answer:

- Who earned the points?
- For which house?
- How many points?
- Why?
- When?
- Who approved it?

---

## 4.2 Fairness

The system must not depend on one teacher manually deciding scores.

Rules should be configurable and published.

Score modifications must be logged.

---

## 4.3 Simplicity

Students should be able to understand the website without instructions.

The homepage should immediately answer:

1. Which house is leading?
2. What are the current scores?
3. Why did the scores recently change?
4. What competition is coming next?

---

## 4.4 Engagement

The website should feel active.

It should regularly show:

- new achievements;
- upcoming competitions;
- recent winners;
- house statistics;
- announcements;
- monthly progress.

---

## 4.5 Scalability

Although the first version contains only two houses, the system must not be technically restricted to exactly two.

The database should allow the school to create additional houses in the future.

---

## 4.6 Auditability

Important actions must leave a record.

Deleting or modifying a score should not erase the history.

---

# 5. Scope

## 5.1 Version 1 Scope

The first production version should include:

- Astra and Terra house pages;
- public leaderboard;
- point transaction history;
- student directory;
- student profiles;
- competition management;
- competition results;
- announcements;
- upcoming events;
- teacher/admin authentication;
- admin dashboard;
- student management;
- house assignment;
- scoring management;
- audit logs;
- responsive mobile design.

---

## 5.2 Out of Scope for Initial Version

The first version does **not** need:

- private student messaging;
- parent accounts;
- chat rooms;
- social-media-style feeds;
- real-time multiplayer games;
- online examination systems;
- complex AI recommendations;
- financial transactions;
- mobile applications;
- student-to-student direct messaging.

These can be considered later if they become necessary.

---

# 6. House Structure

## 6.1 Houses

Initial houses:

### Astra House

**Working identity:** ambition, strategy, curiosity, innovation  
**Working symbol:** Falcon  
**Working motto:** Aim Beyond  

### Terra House

**Working identity:** resilience, teamwork, discipline, leadership  
**Working symbol:** Wolf  
**Working motto:** Stronger Together  

All names, logos, mottos and colors must be editable from the admin panel.

They should not be permanently hard-coded into the application.

---

# 7. User Types

The platform should support several roles.

---

## 7.1 Public Visitor

Examples:

- student who is not logged in;
- parent;
- teacher;
- school guest.

Can:

- view house scores;
- view house pages;
- view competitions;
- view competition results;
- view approved student achievements;
- view announcements;
- view public student profiles;
- view leaderboard;
- view upcoming events.

Cannot:

- modify data;
- award points;
- edit students;
- access admin pages.

---

## 7.2 Student

Student login can be optional in Version 1.

If student accounts are enabled later, students may:

- view their own profile;
- view their personal contribution;
- submit achievement claims;
- register for competitions;
- view house-specific information.

Students must never be able to directly award themselves points.

---

## 7.3 Teacher

Can potentially:

- create achievements;
- submit point awards;
- create competitions;
- publish results;
- approve student submissions;
- edit certain content.

Permissions should depend on role configuration.

---

## 7.4 House Mentor

A teacher assigned to a house.

Can:

- manage limited house information;
- publish house announcements;
- review achievements;
- verify house activities;
- see internal house statistics.

Should not automatically have unrestricted site administration access.

---

## 7.5 House Captain

A student leadership role.

Can potentially:

- submit event proposals;
- post house announcements if approved;
- help register teams;
- view participation statistics.

Captains should not be able to edit scores directly.

---

## 7.6 Administrator

Can:

- manage all houses;
- manage students;
- manage staff;
- manage competitions;
- manage categories;
- approve points;
- reverse points;
- manage announcements;
- manage site settings;
- manage permissions;
- view audit logs.

---

## 7.7 Super Administrator

Highest-level account.

Can:

- create or remove administrators;
- modify system-wide permissions;
- change critical settings;
- recover deleted or archived data;
- manage authentication settings.

There should be very few Super Administrator accounts.

---

# 8. Public Website Information Architecture

Recommended public navigation:

- Home
- Houses
- Leaderboard
- Competitions
- Students
- Achievements
- Events
- Announcements
- About

Optional later:

- Statistics
- Gallery
- Rules
- Hall of Fame

---

# 9. Homepage Requirements

The homepage is the most important public page.

It should immediately communicate the current state of the competition.

---

## 9.1 Hero Section

Display:

- Astra logo/name;
- Astra current score;
- Terra logo/name;
- Terra current score;
- current leader;
- score difference;
- academic-year title.

Example:

**Astra 1,420 — 1,385 Terra**

A progress bar or visual comparison may be used.

---

## 9.2 Recent Score Activity

Display the latest point transactions.

Example:

- Astra +40 — Mathematics Quiz — 1st Place
- Terra +20 — Football Tournament — Runner-up
- Astra +15 — School Volunteering Event
- Terra +10 — Debate Participation

Each activity should link to its full details.

---

## 9.3 Upcoming Competition

Display:

- event name;
- date;
- category;
- location;
- registration status;
- participating houses;
- short description.

---

## 9.4 Latest Results

Show recently completed competitions.

Example:

**School Chess Championship**

1. Student A — Astra
2. Student B — Terra
3. Student C — Terra

Points awarded should be visible.

---

## 9.5 Latest Announcements

Examples:

- New competition announced
- House captain election
- Competition rules updated
- Monthly results published

---

## 9.6 House of the Month

Optional.

If used, the calculation method must be clear.

Do not manually declare a monthly winner without supporting data.

---

# 10. House Pages

Recommended URLs:

`/houses/astra`

`/houses/terra`

Each page should include:

- house name;
- logo;
- color;
- motto;
- description;
- current total score;
- rank;
- score this month;
- captain;
- vice-captain;
- teacher mentor;
- total members;
- recent achievements;
- upcoming house events;
- recent score transactions;
- top contributors;
- category performance;
- competition results.

---

# 11. Leaderboard

The leaderboard must not only show total points.

It should explain the score.

---

## 11.1 Main House Leaderboard

Example:

| Rank | House | Total Points |
|---|---|---:|
| 1 | Astra | 1,420 |
| 2 | Terra | 1,385 |

---

## 11.2 Category Breakdown

Suggested categories:

- Academics
- Sports
- Technology & Science
- Arts & Creativity
- Leadership
- Volunteering & Service
- School Events
- Special Challenges

Administrators must be able to create, rename, disable and reorder categories.

---

## 11.3 Time Filters

Leaderboard filters:

- all year;
- this month;
- this week;
- custom date range.

---

## 11.4 Student Contributors

Optional section:

- top contributors this month;
- top academic contributor;
- top service contributor;
- top sports contributor.

The system should avoid encouraging unhealthy competition around individual rankings.

Individual leaderboards should be used primarily for recognition, not humiliation.

---

# 12. Scoring System

The scoring architecture is one of the most important parts of the project.

---

## 12.1 Fundamental Rule

Never store the house's final score as the primary truth.

Incorrect architecture:

`astra.score = 1420`

Correct architecture:

Store every score event individually.

The house score is calculated from the sum of valid score transactions.

---

# 13. Point Transaction Model

Each score transaction should include:

- transaction ID;
- house ID;
- point amount;
- category;
- reason;
- description;
- student ID if applicable;
- team ID if applicable;
- competition ID if applicable;
- achievement ID if applicable;
- created by;
- approved by;
- date earned;
- date entered;
- status;
- evidence;
- notes.

Example:

```text
Transaction ID: PT-000198
House: Astra
Points: +40
Category: Academics
Reason: First place — Mathematics Quiz
Student: Student Name
Competition: Mathematics Quiz 2026
Approved by: Teacher Name
Date: 12 October 2026
Status: Approved
```

---

# 14. Transaction Status

Recommended statuses:

- Draft
- Pending Approval
- Approved
- Rejected
- Reversed

Only **Approved** transactions should count toward the leaderboard.

---

# 15. Score Reversal

Scores should not normally be permanently deleted.

If a mistake happens:

Original:

`+40 Astra`

Correction:

`-40 Astra — Reversal of transaction PT-000198`

This preserves history.

The system may visually mark the original transaction as reversed.

---

# 16. Point Rules

The school should be able to configure point templates.

Example only:

| Result | Points |
|---|---:|
| Participation | 5 |
| 3rd Place | 15 |
| 2nd Place | 25 |
| 1st Place | 40 |

External competitions could use different scales.

Example:

| Level | Example Points |
|---|---:|
| School | configurable |
| City | configurable |
| Regional | configurable |
| National | configurable |
| International | configurable |

Important:

These numbers should not be hard-coded.

Administrators should be able to update scoring rules.

---

# 17. Scoring Categories

Every point transaction should have a category.

Suggested initial categories:

### Academics

Examples:

- Olympiads
- subject competitions
- quizzes
- academic projects
- academic improvement

### Sports

Examples:

- football
- basketball
- volleyball
- athletics
- table tennis
- chess if categorized as sport by school

### Technology & Science

Examples:

- programming competitions
- robotics
- CTF
- hackathons
- science fairs
- engineering contests

### Arts & Creativity

Examples:

- design
- drawing
- music
- school performances
- writing
- photography

### Leadership

Examples:

- organizing events
- leading student teams
- successful house activities

### Volunteering & Service

Examples:

- school volunteering
- community projects
- mentoring
- event support

### School Events

Examples:

- school festivals
- special days
- inter-house challenges

---

# 18. Competition System

Competitions should be first-class objects in the platform.

Each competition should include:

- name;
- description;
- category;
- organizer;
- date;
- registration deadline;
- start time;
- end time;
- location;
- competition type;
- individual or team format;
- eligibility;
- rules;
- maximum participants;
- scoring rules;
- status;
- result;
- attachments;
- related announcements.

---

# 19. Competition Status

Recommended states:

- Draft
- Registration Open
- Registration Closed
- Ongoing
- Completed
- Cancelled
- Archived

---

# 20. Competition Types

The system should support:

- Astra vs Terra team competition;
- individual school competition;
- tournament;
- quiz;
- Olympiad;
- sports event;
- debate;
- technology challenge;
- creative competition;
- volunteering challenge;
- external competition.

---

# 21. Competition Registration

Optional for Version 1.

Possible workflow:

1. Admin creates competition.
2. Registration opens.
3. Students or captains submit participants.
4. Teacher approves registrations.
5. Registration closes.
6. Competition occurs.
7. Results are entered.
8. Points are generated.
9. Results are published.

---

# 22. Competition Results

Results page should show:

- competition name;
- date;
- participants;
- winners;
- rankings;
- house;
- points awarded;
- photos if available;
- short summary.

---

# 23. Students Module

The school should maintain a student directory.

Each student record should contain:

- student ID;
- first name;
- last name;
- grade;
- class;
- house;
- profile photo;
- status;
- joined school date;
- graduation year;
- optional short bio.

Sensitive information should not be publicly displayed.

Do not publicly expose:

- phone numbers;
- personal email;
- home addresses;
- passwords;
- disciplinary records;
- private school identifiers.

---

# 24. Student Profile

Public student profile could show:

- name;
- grade;
- house;
- approved profile photo;
- approved achievements;
- total house contribution;
- competitions participated in;
- leadership role;
- recent achievements.

Optional privacy configuration:

- public;
- school-only;
- hidden.

---

# 25. Student Contribution

A student's contribution should be calculated from approved transactions associated with them.

Example:

**Student Contribution to Astra**

- Academics: 80
- Technology: 50
- Volunteering: 25
- Total: 155

Team points require careful handling.

If a five-person Astra team earns 40 house points, the system should not accidentally count 40 points for each student when calculating house totals.

House points and individual contribution statistics should therefore be separate concepts.

---

# 26. Team Model

Some competitions are team-based.

A team should include:

- team ID;
- team name;
- house;
- competition;
- members;
- captain;
- result;
- points earned.

---

# 27. Achievements Module

Achievements are records of student accomplishments.

Example:

- Regional Informatics Olympiad — 2nd Place
- School Football Tournament — Winner
- Volunteer of the Month
- Science Fair Finalist

Achievement fields:

- title;
- description;
- student;
- team;
- level;
- organization;
- date;
- evidence;
- status;
- related points;
- approved by.

---

# 28. Achievement Verification

Suggested workflow:

1. Achievement submitted.
2. Evidence attached.
3. Teacher reviews it.
4. Teacher approves or rejects it.
5. If approved, points may be generated.
6. Achievement appears publicly if allowed.

Evidence could include:

- certificate;
- result sheet;
- teacher confirmation;
- official link;
- photograph.

---

# 29. Announcements

Announcements can be:

- school-wide;
- Astra-only;
- Terra-only;
- competition-related.

Fields:

- title;
- content;
- author;
- audience;
- publish date;
- expiry date;
- attachments;
- status.

---

# 30. Events Calendar

The site should include a simple event system.

Events may include:

- competitions;
- meetings;
- house activities;
- school ceremonies;
- deadlines;
- volunteer events.

Recommended views:

- upcoming events list;
- calendar view;
- event detail page.

---

# 31. Admin Dashboard

Recommended main dashboard widgets:

- Astra total;
- Terra total;
- current leader;
- pending point approvals;
- pending achievements;
- upcoming competitions;
- recently modified data;
- number of students;
- recent administrator actions.

---

# 32. Admin Navigation

Suggested:

- Dashboard
- Houses
- Students
- Staff
- Points
- Achievements
- Competitions
- Teams
- Events
- Announcements
- Categories
- Scoring Rules
- Users
- Roles
- Audit Logs
- Settings

---

# 33. Student Management

Administrators should be able to:

- create student;
- edit student;
- archive student;
- assign student to house;
- move student between houses;
- import students;
- export students;
- search;
- filter by grade/class/house.

---

# 34. Bulk Import

Strongly recommended.

School administrators may need to add hundreds of students.

Support CSV import.

Example columns:

```csv
first_name,last_name,grade,class,house
Ali,Karimov,10,10A,Astra
Madina,Rahimova,10,10A,Terra
```

The system should validate before import.

Errors should be shown before final confirmation.

---

# 35. House Assignment

House assignment methods may include:

- manual assignment;
- automatic balanced assignment;
- CSV import;
- existing school list.

Automatic assignment should attempt to balance:

- total students;
- grade distribution;
- class distribution.

Do not automatically balance based on private or sensitive personal attributes.

---

# 36. House Transfer

Moving a student to another house should require permission.

The system must record:

- old house;
- new house;
- reason;
- changed by;
- date.

Historical transactions should remain connected to the house they belonged to when the points were earned unless school policy says otherwise.

---

# 37. Role-Based Access Control

Use RBAC: Role-Based Access Control.

Example permissions:

```text
student.read
student.create
student.update
student.archive

point.create
point.approve
point.reverse

competition.create
competition.update
competition.publish

announcement.create
announcement.publish

user.manage
settings.manage
audit.read
```

Roles should be combinations of permissions.

---

# 38. Authentication

Admin authentication is mandatory.

Recommended:

- email/username + password;
- secure password hashing;
- session expiration;
- account lockout after repeated failed attempts;
- password reset system;
- optional two-factor authentication later.

Never store plaintext passwords.

Use a modern password hashing algorithm supported by the chosen framework.

---

# 39. Authorization

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

The backend must verify permissions for every sensitive action.

Hiding buttons in the frontend is not enough.

---

# 40. Audit Logs

Critical administrative actions must be logged.

Audit entry should contain:

- user;
- action;
- entity;
- entity ID;
- previous value;
- new value;
- timestamp;
- IP address if school policy permits;
- optional reason.

Example:

```text
Teacher A changed PT-000198
Points: 25 -> 40
Reason: Corrected competition result
Time: 14:34
```

---

# 41. Audit Log Events

Log:

- login;
- failed admin login;
- score creation;
- score approval;
- score rejection;
- score reversal;
- student house transfer;
- competition modification;
- permission change;
- administrator creation;
- deletion/archive actions;
- settings modifications.

---

# 42. Data Deletion Strategy

Prefer soft deletion.

Example:

`deleted_at = timestamp`

Instead of immediately removing a record.

This allows recovery.

Critical financial-style records such as score transactions should be archived or reversed rather than deleted.

---

# 43. Database Architecture

Recommended relational database.

Examples:

- PostgreSQL
- MySQL

PostgreSQL is a strong choice.

---

# 44. Main Database Tables

Recommended:

```text
houses
students
staff
users
roles
permissions
user_roles
role_permissions
categories
point_transactions
scoring_rules
competitions
competition_participants
competition_results
teams
team_members
achievements
events
announcements
attachments
audit_logs
settings
```

---

# 45. Houses Table

Suggested fields:

```text
id
name
slug
short_name
description
motto
logo_url
primary_color
secondary_color
is_active
created_at
updated_at
```

---

# 46. Students Table

Suggested fields:

```text
id
student_code
first_name
last_name
grade
class_name
house_id
photo_url
bio
profile_visibility
status
joined_at
graduation_year
created_at
updated_at
archived_at
```

---

# 47. Point Transactions Table

Suggested fields:

```text
id
house_id
student_id
team_id
competition_id
achievement_id
category_id
points
reason
description
earned_at
created_by
approved_by
status
reversal_of
created_at
approved_at
updated_at
```

---

# 48. Competitions Table

Suggested fields:

```text
id
title
slug
description
category_id
competition_type
format
organizer
venue
registration_open_at
registration_close_at
starts_at
ends_at
rules
status
created_by
created_at
updated_at
```

---

# 49. Achievements Table

Suggested fields:

```text
id
student_id
team_id
title
description
level
organization
achievement_date
evidence_url
status
approved_by
created_at
updated_at
```

---

# 50. Announcements Table

Suggested fields:

```text
id
title
slug
content
audience_type
house_id
author_id
status
published_at
expires_at
created_at
updated_at
```

---

# 51. Audit Logs Table

Suggested fields:

```text
id
user_id
action
entity_type
entity_id
old_data
new_data
reason
ip_address
user_agent
created_at
```

---

# 52. Recommended Backend Rules

All important business logic belongs on the server.

Examples:

The backend should verify:

- user has permission;
- house exists;
- student exists;
- point transaction is valid;
- competition result is approved;
- transaction cannot be approved twice;
- reversal does not duplicate;
- archived students cannot be edited normally.

---

# 53. API Design

Example REST API structure:

```text
GET    /api/houses
GET    /api/houses/:id
GET    /api/houses/:id/transactions

GET    /api/leaderboard

GET    /api/students
GET    /api/students/:id
POST   /api/students
PATCH  /api/students/:id

GET    /api/competitions
POST   /api/competitions
GET    /api/competitions/:id
PATCH  /api/competitions/:id

GET    /api/points
POST   /api/points
POST   /api/points/:id/approve
POST   /api/points/:id/reject
POST   /api/points/:id/reverse

GET    /api/achievements
POST   /api/achievements
POST   /api/achievements/:id/approve

GET    /api/announcements
POST   /api/announcements

GET    /api/events
POST   /api/events

GET    /api/admin/audit-logs
```

---

# 54. Recommended Frontend Pages

Public:

```text
/
/houses
/houses/:slug
/leaderboard
/competitions
/competitions/:slug
/students
/students/:id
/achievements
/events
/announcements
/announcements/:slug
/about
/rules
```

Admin:

```text
/admin
/admin/houses
/admin/students
/admin/students/import
/admin/points
/admin/points/pending
/admin/competitions
/admin/achievements
/admin/events
/admin/announcements
/admin/categories
/admin/scoring-rules
/admin/users
/admin/roles
/admin/audit-logs
/admin/settings
```

---

# 55. Search

Global search may search:

- students;
- competitions;
- achievements;
- announcements.

Admin search should additionally support:

- transaction ID;
- student code;
- house;
- date range;
- status.

---

# 56. Filtering

Useful filters:

## Students

- house;
- grade;
- class;
- status.

## Points

- house;
- category;
- student;
- date;
- status;
- competition.

## Competitions

- status;
- category;
- date;
- format.

---

# 57. Pagination

Do not load all records at once.

Use pagination for:

- students;
- transactions;
- achievements;
- audit logs;
- competitions.

---

# 58. Public Transparency

Public score history should show enough information to explain the leaderboard.

However, not every internal note should be public.

Public:

- house;
- points;
- reason;
- category;
- date;
- competition;
- approved student name if allowed.

Private:

- internal admin notes;
- IP address;
- teacher comments;
- security logs.

---

# 59. Homepage Design Direction

The visual design should emphasize competition.

Possible layout:

```text
------------------------------------------------
              SCHOOL HOUSE SYSTEM
------------------------------------------------

        ASTRA                   TERRA
        1,420                   1,385

              ASTRA LEADS +35

------------------------------------------------
Recent Activity
------------------------------------------------

Upcoming Competition

Latest Results

House Statistics

Announcements
```

---

# 60. Mobile Design

The majority of students may visit through phones.

Therefore:

- scores must be readable immediately;
- no wide tables without mobile alternatives;
- cards should stack vertically;
- navigation should be mobile-friendly;
- admin screens should remain usable on tablets.

---

# 61. Accessibility

Recommended:

- sufficient color contrast;
- text alternatives for icons;
- keyboard navigation;
- do not communicate house identity using color alone;
- accessible labels for forms.

---

# 62. Performance Requirements

Targets:

- public homepage should load quickly on normal mobile internet;
- leaderboard should return quickly;
- common API requests should normally complete under one second under school-scale usage;
- images should be optimized;
- caching may be used for public pages.

---

# 63. Expected Scale

Typical initial assumptions:

- hundreds to a few thousand students;
- two houses;
- thousands of score transactions per year;
- hundreds of events or achievements;
- dozens of administrators/teachers at most.

This does not require complex distributed infrastructure.

A clean monolithic application is sufficient.

---

# 64. Recommended Architecture

Simple architecture:

```text
Browser
   |
Frontend
   |
Backend API
   |
PostgreSQL Database
   |
File/Object Storage
```

Do not overengineer with microservices.

---

# 65. Suggested Technology Options

Possible stack:

### Option A

- Next.js
- TypeScript
- PostgreSQL
- Prisma
- Auth.js or equivalent
- Supabase/managed Postgres
- Vercel or similar hosting

### Option B

- React
- Node.js / Express
- PostgreSQL
- JWT or session authentication
- separate hosting

### Option C

- Django
- PostgreSQL
- Django Admin
- server-rendered or React frontend

For one student developer, choose the stack you can maintain confidently.

The product architecture matters more than using trendy technology.

---

# 66. Security Requirements

The project contains school data, so security must be treated seriously.

Mandatory:

- HTTPS;
- password hashing;
- authorization checks;
- server-side validation;
- protected admin routes;
- rate limiting for authentication;
- CSRF protection where relevant;
- SQL injection protection;
- safe file uploads;
- audit logs;
- regular backups;
- environment variables for secrets.

---

# 67. File Upload Security

If certificates/photos are uploaded:

Validate:

- allowed file types;
- maximum size;
- content type;
- filename;
- access permissions.

Do not execute uploaded files.

Prefer object storage.

---

# 68. Privacy

The public website should use minimum necessary student information.

The system should have configuration for student visibility.

A school administrator should decide what can be public.

Default principle:

> Private unless there is a clear reason to publish.

---

# 69. Backups

Recommended:

- automatic daily database backup;
- multiple recent restore points;
- export capability;
- test restore procedure.

A backup is useful only if restoration works.

---

# 70. Error Handling

The system should provide understandable errors.

Bad:

> Error 500.

Better:

> This point transaction could not be approved because it has already been reversed.

Backend logs should contain additional technical information.

---

# 71. Notifications

Optional Version 1 feature.

Potential notifications:

- new competition;
- result published;
- points approved;
- achievement approved;
- upcoming deadline.

Could later support:

- email;
- Telegram;
- push notifications.

Do not make external messaging a dependency for the first release.

---

# 72. Analytics

Admin analytics could include:

- points by category;
- monthly point growth;
- participation by grade;
- active students;
- most popular events;
- competitions completed;
- average participation;
- house participation balance.

The goal is to understand engagement, not only the final winner.

---

# 73. Fairness Analytics

Useful warning indicators:

- one student responsible for unusually high share of a house's points;
- one category dominating total scores;
- one teacher issuing unusually large numbers of points;
- repeated duplicate-looking transactions;
- one house receiving significantly more opportunities.

These do not automatically prove unfairness.

They are signals for review.

---

# 74. Anti-Abuse Controls

Recommended:

- approval workflow;
- audit history;
- duplicate detection;
- maximum point limits where appropriate;
- no self-approval;
- permission separation;
- reversible transactions.

Example:

A teacher who creates a major point award may require a second administrator to approve it.

---

# 75. Approval Levels

Possible rule:

- 1–20 points: teacher approval;
- 21–50 points: senior teacher/mentor approval;
- 51+ points: administrator approval.

These values should be configurable.

---

# 76. Competition Integrity

Competition results should be entered separately from point transactions.

Recommended process:

1. Enter official result.
2. Approve result.
3. Generate point transaction based on scoring rule.
4. Approve transaction if required.

This reduces manual errors.

---

# 77. Settings

Admin settings may include:

- school name;
- logo;
- current academic year;
- default timezone;
- houses;
- scoring mode;
- profile visibility;
- public leaderboard;
- registration settings;
- notification settings.

---

# 78. Academic Year

Scores should belong to an academic year.

Example:

`2026-2027`

Do not overwrite history when a new year starts.

Instead create a new season.

---

# 79. Seasons

Recommended table:

```text
seasons
```

Fields:

```text
id
name
starts_at
ends_at
status
```

Transactions and competitions belong to a season.

This allows:

- historical winners;
- old leaderboards;
- year-by-year statistics.

---

# 80. Hall of Fame

Future feature.

Could show:

- winning house by year;
- top competition results;
- major achievements;
- former captains.

---

# 81. House Cup

The website should support declaring the official annual winner.

The final result should be generated from approved transactions.

Administrator may finalize the season.

After finalization:

- scores become read-only;
- winner is recorded;
- season moves to archived status.

Changes after finalization require Super Administrator override with audit log.

---

# 82. MVP Definition

The MVP should include only what is necessary for the system to operate.

Required MVP:

- houses;
- students;
- public score display;
- point transactions;
- transaction approval;
- leaderboard;
- competitions;
- results;
- announcements;
- admin authentication;
- basic roles;
- audit logs.

Everything else can follow.

---

# 83. Phase 2 Features

After MVP is stable:

- student accounts;
- achievement submission;
- team registration;
- advanced statistics;
- monthly awards;
- events calendar;
- CSV import/export;
- house captains;
- house-specific announcements.

---

# 84. Phase 3 Features

Possible future expansion:

- Telegram notifications;
- QR event attendance;
- digital badges;
- certificates;
- live event scoreboards;
- hall of fame;
- annual reports;
- advanced analytics;
- API integration with school systems.

---

# 85. Recommended Development Order

Build in this order:

## Phase 1 — Foundation

1. database;
2. authentication;
3. roles and permissions;
4. houses;
5. students.

## Phase 2 — Scoring

6. categories;
7. point transactions;
8. approval flow;
9. leaderboard;
10. transaction history.

## Phase 3 — Competition

11. competitions;
12. participants;
13. results;
14. automatic point generation.

## Phase 4 — Content

15. announcements;
16. events;
17. achievements.

## Phase 5 — Administration

18. audit logs;
19. CSV import;
20. settings;
21. analytics.

## Phase 6 — Polish

22. mobile optimization;
23. accessibility;
24. performance;
25. testing;
26. deployment.

---

# 86. Testing Requirements

Testing should include:

### Unit Tests

Test:

- score calculations;
- permission checks;
- transaction status;
- reversal logic.

### Integration Tests

Test:

- create competition -> publish result -> generate points;
- create student -> assign house -> record achievement;
- admin approval workflows.

### End-to-End Tests

Test critical user flows in a browser.

---

# 87. Important Test Cases

## Score

- +40 approved -> house increases by 40.
- pending transaction -> no score change.
- rejected transaction -> no score change.
- reversed transaction -> previous effect removed.
- duplicate approval -> blocked.

## Permissions

- public visitor cannot edit.
- teacher cannot manage Super Admin.
- captain cannot award points.
- unauthorized API request returns error.

## House Transfer

- student history remains accurate.
- future activity uses new house.

---

# 88. Acceptance Criteria

The first production release is acceptable when:

- administrators can securely sign in;
- students can be created and assigned;
- Astra and Terra display correctly;
- administrators can create point transactions;
- points require proper approval;
- leaderboard calculates automatically;
- public users can inspect score history;
- competitions can be published;
- results can be stored;
- announcements can be published;
- unauthorized users cannot change data;
- audit logs record critical changes;
- website works on mobile;
- backups are configured.

---

# 89. Main User Flows

## Flow A — Student earns points

1. Student participates in event.
2. Teacher opens admin panel.
3. Teacher selects student.
4. Teacher selects house.
5. Teacher selects category.
6. Teacher selects competition.
7. Teacher enters result.
8. System suggests point value.
9. Teacher submits.
10. Authorized approver approves.
11. Transaction becomes active.
12. Leaderboard recalculates.
13. Activity appears publicly.

---

## Flow B — Competition creation

1. Teacher creates competition.
2. Adds date, category and rules.
3. Publishes competition.
4. Competition appears publicly.
5. Participants are registered.
6. Competition occurs.
7. Results are entered.
8. Results are approved.
9. Points are generated.
10. Result page is published.

---

## Flow C — Incorrect score

1. Administrator discovers incorrect transaction.
2. Opens transaction.
3. Chooses Reverse.
4. Provides reason.
5. System creates reversal.
6. Total recalculates.
7. Audit log records correction.

---

# 90. Admin UX Principles

Admin pages should prioritize correctness over decoration.

Useful features:

- confirmation dialogs;
- clear status labels;
- search;
- filters;
- bulk actions;
- undo where safe;
- visible audit history.

Dangerous actions should require confirmation.

---

# 91. Public UX Principles

Public site should prioritize:

- excitement;
- clarity;
- transparency.

Students should never need to understand database terms.

Instead of:

> Point Transaction 198 approved.

Show:

> Astra earned 40 points for winning the Mathematics Quiz.

---

# 92. Empty States

The system must handle early-stage empty data.

Examples:

> No competitions have been published yet.

> No achievements recorded this month.

> Score history will appear after the first approved activity.

This is better than blank screens.

---

# 93. Error States

Examples:

- competition not found;
- student archived;
- permission denied;
- file upload failed;
- network error.

Always give a useful next action where possible.

---

# 94. Branding

Do not finalize visual identity until school approval.

Configurable assets:

- school logo;
- Astra logo;
- Terra logo;
- colors;
- mottos;
- background graphics.

This allows the school to change branding without developer changes.

---

# 95. Logo and Color Considerations

Avoid relying on color alone.

Example:

Astra and Terra should also use:

- names;
- icons;
- symbols;
- logos.

This supports accessibility and prevents confusion.

---

# 96. Search Engine Visibility

Because this is a school website, not everything should necessarily be indexed by search engines.

Consider:

- public pages indexable;
- student profiles noindex if school prefers;
- admin pages blocked;
- private resources inaccessible.

---

# 97. Logging

Application logging should record:

- server errors;
- authentication issues;
- failed database operations;
- suspicious requests.

Do not log passwords or sensitive secrets.

---

# 98. Rate Limiting

Protect:

- login;
- password reset;
- file upload;
- public search API if abused.

---

# 99. Database Constraints

Use constraints where possible.

Examples:

- points cannot be null;
- house must exist;
- transaction status must be valid;
- email unique for administrators;
- slug unique for houses and competitions.

Do not rely only on frontend validation.

---

# 100. Transaction Integrity

Use database transactions for operations that modify multiple related records.

Example:

Publishing competition results and generating multiple point transactions should either fully succeed or fully fail.

Avoid partial updates.

---

# 101. Data Export

Administrators should eventually be able to export:

- students;
- points;
- competitions;
- achievements;
- final leaderboard.

CSV is enough initially.

---

# 102. Reports

Possible end-of-month report:

- total house scores;
- points earned this month;
- category breakdown;
- competitions held;
- student participation;
- major achievements.

Possible end-of-year report:

- final scores;
- winning house;
- total activities;
- major contributors;
- category performance;
- participation statistics.

---

# 103. Key Product Metrics

After launch, measure:

- percentage of students participating;
- number of competitions;
- number of approved achievements;
- monthly active visitors;
- number of scoring disputes;
- average approval time;
- participation balance between houses;
- category diversity.

Success is not simply high website traffic.

The project succeeds if student participation and transparency improve.

---

# 104. Risks

## Risk 1 — Score Manipulation

Mitigation:

- approval workflows;
- audit logs;
- permissions;
- reversals.

## Risk 2 — Student Privacy

Mitigation:

- minimal public data;
- profile visibility controls;
- school-approved policies.

## Risk 3 — One Category Dominates

Mitigation:

- configurable rules;
- category analysis;
- balanced competition calendar.

## Risk 4 — Low Participation

Mitigation:

- varied activities;
- regular competitions;
- visible recognition.

## Risk 5 — System Becomes Too Complex

Mitigation:

- strict MVP;
- phased development.

## Risk 6 — Developer Becomes Single Point of Failure

Mitigation:

- documentation;
- backups;
- administrator training;
- clean code;
- source control.

---

# 105. Operational Ownership

The school must decide who owns each responsibility.

Example:

| Responsibility | Suggested Owner |
|---|---|
| Technical system | Developer / IT |
| House policy | School administration |
| Competition approval | Teachers |
| Score verification | Assigned committee |
| Student data | Administration |
| Content | Teachers / student leaders |
| Account management | Super Admin |

Software cannot solve unclear organizational responsibility.

---

# 106. Source Control

Use Git.

Recommended:

- private repository during development;
- meaningful commits;
- main branch protected;
- environment secrets never committed.

---

# 107. Environments

Recommended:

### Development

Local testing.

### Staging

School staff test changes.

### Production

Official public website.

Do not test dangerous changes directly in production.

---

# 108. Deployment

Deployment should provide:

- HTTPS;
- environment variables;
- database backups;
- server logs;
- rollback capability.

---

# 109. Admin Training

Before official launch, train school staff to:

- create points;
- approve points;
- reverse mistakes;
- create competitions;
- publish results;
- manage students;
- read audit history.

Provide a short admin guide.

---

# 110. Launch Strategy

Recommended:

### Stage 1

Internal development.

### Stage 2

Teacher testing with dummy data.

### Stage 3

Import real students.

### Stage 4

Run one trial competition.

### Stage 5

Fix issues.

### Stage 6

Public school launch.

---

# 111. Pilot Recommendation

Even if the project is approved, the software should first be piloted.

Recommended:

- one or two competitions;
- limited administrators;
- real students;
- real scoring;
- collect feedback.

Fix workflow problems before full-year use.

---

# 112. Design Decision: Two Houses Today, Unlimited Tomorrow

Do not create database fields such as:

```text
astra_points
terra_points
```

Do not write logic like:

```javascript
if (house === "astra") ...
```

Instead use generic house IDs.

Example:

```text
houses
1 Astra
2 Terra
```

Every feature should work by house ID.

This keeps future expansion possible.

---

# 113. Design Decision: Points Are Events, Not Numbers

The core domain model is:

> A house score is the result of approved point events.

This single decision makes the system:

- transparent;
- auditable;
- correctable;
- reportable;
- easier to debug.

---

# 114. Design Decision: Competition Results and Points Are Separate

A competition result answers:

> Who won?

A point transaction answers:

> How did that result affect house scoring?

Keeping them separate allows scoring rules to change without rewriting competition history.

---

# 115. Design Decision: Roles Must Be Permission-Based

Do not hard-code permissions using only role names.

Better:

`Teacher` gets a list of permissions.

This allows the school to create roles such as:

- Sports Coordinator;
- Competition Manager;
- House Mentor;
- Content Editor.

---

# 116. Design Decision: Historical Data Must Survive

Do not reset the database each year.

Create seasons.

This allows future students to see:

- previous winners;
- previous scores;
- old competitions;
- historical achievements.

---

# 117. Suggested MVP User Stories

### Public Student

> As a student, I want to see the current score so I know which house is leading.

> As a student, I want to see why points were awarded so I trust the leaderboard.

> As a student, I want to see upcoming competitions so I can participate.

### Teacher

> As a teacher, I want to record a competition result so the correct points can be awarded.

> As a teacher, I want to submit an achievement for approval.

### Administrator

> As an administrator, I want to approve point transactions so unauthorized points cannot affect the score.

> As an administrator, I want to reverse incorrect transactions while preserving history.

---

# 118. Definition of Done for Core Features

A feature is not done only because its page exists.

For example, "Point System" is done when:

- backend validation exists;
- permissions exist;
- database record exists;
- approval works;
- leaderboard recalculates;
- audit log records it;
- mobile interface works;
- tests pass.

---

# 119. Open Decisions for School Administration

The software should be flexible because some policy details still require school decisions.

Questions:

1. How are students initially divided between houses?
2. Can a student ever change house?
3. Who can award points?
4. Who approves points?
5. What official scoring scale will be used?
6. Which achievements are eligible?
7. Will individual student points be public?
8. Will student photos be public?
9. Can students submit achievements themselves?
10. How are house captains selected?
11. Is there a monthly winner?
12. What reward does the annual winner receive?
13. What happens if houses finish with equal scores?
14. Can points ever be deducted for behavior?
15. Who resolves disputes?

The system should avoid making irreversible assumptions before these are answered.

---

# 120. Recommended Initial Policy Defaults

Until the school decides otherwise, a technically safe default is:

- only approved achievements generate points;
- ordinary discipline does not deduct house points;
- only administrators approve final scores;
- transactions are never silently deleted;
- every house point has a reason;
- student private information is hidden;
- scoring rules are configurable;
- annual scores are separated by season.

---

# 121. Final Product Summary

The School House System should be treated as a real school information platform rather than a decorative leaderboard.

The essential model is:

```text
Students
   |
Houses
   |
Activities / Competitions / Achievements
   |
Approved Point Transactions
   |
Leaderboard
```

Administration controls the workflow through roles, approvals and audit logs.

Students experience the system through:

- house identity;
- competitions;
- achievements;
- transparent scores;
- announcements;
- recognition.

The most important technical requirements are:

1. Never manually store the house total as the authoritative score.
2. Keep every point transaction.
3. Require proper permissions.
4. Maintain audit history.
5. Keep the architecture generic enough for more houses.
6. Protect student information.
7. Build the MVP first.
8. Separate school policy from technical implementation.
9. Make scoring rules configurable.
10. Preserve historical seasons.

If these principles are followed, the project can grow from a simple Astra-vs-Terra competition into a long-term digital system for student participation, school culture, competitions and recognition.

---

# Appendix A — Simplified Entity Relationship

```text
SEASON
  |
  +--- HOUSES
  |      |
  |      +--- STUDENTS
  |      |
  |      +--- POINT TRANSACTIONS
  |
  +--- COMPETITIONS
  |      |
  |      +--- PARTICIPANTS
  |      +--- RESULTS
  |      +--- TEAMS
  |
  +--- ACHIEVEMENTS
  |
  +--- EVENTS
  |
  +--- ANNOUNCEMENTS

USERS
  |
  +--- ROLES
  |      |
  |      +--- PERMISSIONS
  |
  +--- AUDIT LOGS
```

---

# Appendix B — Minimal MVP Database

If development must start very small, begin with:

```text
users
houses
students
categories
point_transactions
competitions
competition_results
announcements
audit_logs
seasons
```

Add other tables after the basic system works.

---

# Appendix C — Suggested First Sprint

### Sprint Goal

Create a functioning private prototype.

Tasks:

- create database;
- create Astra and Terra;
- create season;
- create admin authentication;
- create students table;
- create student CRUD;
- create point transaction CRUD;
- create approval flow;
- calculate leaderboard;
- create public homepage;
- display recent point activity.

At the end of the first sprint, an administrator should be able to add students, award verified points, and see Astra and Terra update automatically.

---

# Appendix D — Example Public Activity

```text
12 Oct 2026
Astra +40
Mathematics Quiz — 1st Place
Student: [Name]

11 Oct 2026
Terra +25
Football Tournament — 2nd Place
Team: Terra U16

10 Oct 2026
Astra +10
School Volunteer Activity
Student: [Name]
```

---

# Appendix E — Example Admin Approval Screen

```text
Pending Point Request

Student: [Name]
House: Astra
Category: Academics
Competition: Mathematics Quiz
Result: 1st Place
Suggested Points: 40
Evidence: Attached

[Approve] [Reject] [Edit]
```

---

# Appendix F — Product Priority Matrix

## Must Have

- authentication;
- houses;
- students;
- points;
- approval;
- leaderboard;
- competitions;
- results;
- audit logs.

## Should Have

- announcements;
- achievements;
- event calendar;
- imports;
- exports;
- analytics.

## Could Have

- student accounts;
- Telegram integration;
- badges;
- QR attendance;
- live scoreboards;
- hall of fame.

## Not Now

- chat;
- social feed;
- mobile app;
- AI recommendations;
- payment system.

---

**End of PRD**
