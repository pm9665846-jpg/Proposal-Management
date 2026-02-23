# Visit & Proposal Management System

A full-stack **Visit & Proposal Management System** built with Next.js 14, Tailwind CSS, and MySQL. Supports role-based access (Admin and User), visit planning, client management, proposal tracking, and reports.

## Features

- **Authentication**: Secure login for Admin and Users with session management (NextAuth.js).
- **Admin**: Full control — user CRUD, visit assignment, client CRUD, dashboard with charts, reports.
- **Users**: Update only visits assigned to them; add/update meeting notes, status, follow-up date, and proposal response.
- **Visit Planning**: Admin assigns visits with date, client, and assignee.
- **Client Details**: Name, address, phone, email, Google Map link.
- **Proposal Tracking**: Proposal date, response status (Accepted / Rejected / Pending).
- **Reports & Analytics**: Employee-wise visit counts, proposal response breakdown, performance summary.
- **UI**: Responsive Tailwind CSS, status badges, forms with validation (Zod).

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Recharts, Lucide icons.
- **Backend**: Next.js API routes, Prisma ORM.
- **Database**: MySQL.
- **Auth**: NextAuth.js (Credentials provider, JWT session).

## Prerequisites

- Node.js 18+
- MySQL 8+ (local or remote)
- npm or yarn

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret"
```

Generate a secret: `openssl rand -base64 32`.

### 3. Database

Create the MySQL database, then run:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed Data

After `npm run db:seed` you can log in with:

| Role  | Email             | Password  |
|-------|-------------------|-----------|
| Admin | admin@example.com | admin123  |
| User  | john@example.com | user123   |
| User  | jane@example.com  | user123   |

Seed also creates sample clients, visits, and one proposal.

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `npm run db:generate` — Generate Prisma client
- `npm run db:push` — Push schema to MySQL (no migrations)
- `npm run db:seed` — Run seed script
- `npm run db:studio` — Open Prisma Studio

## Project Structure

```
src/
  app/
    (dashboard)/     # Protected layout with sidebar
      dashboard/     # Admin dashboard (stats + charts)
      users/         # User management (Admin only)
      clients/       # Clients CRUD (Admin only)
      visits/        # Visit planning – assign visits (Admin only)
      my-visits/     # List and update own visits
      proposals/     # Proposal list, new, detail/edit
      reports/       # Reports & analytics (Admin only)
    api/             # API routes (auth, users, clients, visits, proposals, dashboard)
    login/           # Login page
  components/        # Sidebar, StatusBadge, Providers
  lib/                # db, auth, auth-guard
  types/              # next-auth.d.ts
prisma/
  schema.prisma      # MySQL schema
  seed.ts            # Seed script
```

## Deployment

- Set `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` in the hosting environment.
- Use `npm run build` and `npm run start`, or connect your repo to Vercel and configure env vars.
- For MySQL, use a managed service (e.g. PlanetScale, AWS RDS) or your host’s MySQL.

## License

MIT
