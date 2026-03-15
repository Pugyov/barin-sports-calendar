# Barin Marketing Calendar

Web-based internal calendar app replacing the Excel workflow.

## Stack

- Next.js (App Router, TypeScript)
- shadcn/ui + Tailwind CSS
- MySQL + Prisma ORM
- Auth.js Credentials (email/password)
- Vitest for unit/integration tests

## Quick Start

1. Copy env file:

```bash
cp .env.example .env
```

2. Update `.env` values, especially `DATABASE_URL` and `NEXTAUTH_SECRET`.
3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Default Seed Accounts

If you keep the default seed env values, these users are created:

- `admin@local.test` / `ChangeMe123!`
- `editor@local.test` / `ChangeMe123!`
- `viewer@local.test` / `ChangeMe123!`

Change passwords immediately for non-local environments.

## Create or Update a User

```bash
npm run user:create -- user@company.com StrongPassword123! admin
```

Allowed roles: `admin`, `editor`, `viewer`.

## API

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/import/excel`

## Import Flow

- Upload workbook on `/import`.
- Only `Pipeline(All)` is parsed.
- Dry-run validates without DB writes.
- Commit mode upserts by `Task ID`.
