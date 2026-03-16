# Barin Sports Marketing Calendar

Internal web app for replacing the Excel-based marketing calendar workflow.

## Overview

This project is a Next.js app for:

- importing the `Pipeline(All)` sheet from the legacy Excel workbook
- managing tasks in a web-based pipeline
- visualizing task milestones in a calendar
- handling internal user access with admin approval

## Stack

- Next.js 16 (App Router, TypeScript)
- shadcn/ui + Tailwind CSS
- MySQL
- Prisma ORM
- Auth.js credentials auth
- Vitest

## Current Product Features

- Dashboard homepage with pipeline/import summaries
- Calendar view with hover details for each task milestone
- Pipeline view with create, edit, delete, notes, and task-code auto-suggestion
- Excel import with dry-run support
- Dark mode
- Registration flow with admin approval
- Admin user management page

## Roles

- `admin`
  - full write access
  - can approve users
  - can change user roles and access state
- `editor`
  - can create, edit, delete tasks
  - can import Excel files
- `viewer`
  - read-only access

## Registration and Approval Flow

- New users register at `/register`
- Only `@barinsports.com` emails are accepted
- New accounts are created as:
  - role: `viewer`
  - access: `pending`
- Pending users cannot sign in until an admin approves them
- Admin approval happens at `/admin/users`

## Prerequisites

- Node.js 20+
- MySQL 8+
- npm

## Environment Setup

Copy the example env file:

```bash
cp .env.example .env
```

Set at least:

```env
DATABASE_URL="mysql://user:password@localhost:3306/barin_sports_calendar"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-long-random-string"
```

Generate a secret with:

```bash
openssl rand -base64 32
```

## Database Setup

Create the database if it does not exist:

```sql
CREATE DATABASE barin_sports_calendar;
```

Then run:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

If you pull new schema changes later, rerun:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Local Development

Start the app:

```bash
npm run dev
```

Open:

- [http://localhost:3000](http://localhost:3000)

## Seeded Local Users

If you keep the default seed env values, these accounts are created:

- `admin@local.test` / `ChangeMe123!`
- `editor@local.test` / `ChangeMe123!`
- `viewer@local.test` / `ChangeMe123!`

Change these immediately outside local development.

## Creating or Updating Users From CLI

```bash
npm run user:create -- user@barinsports.com StrongPassword123! viewer "User Name"
```

Allowed roles:

- `admin`
- `editor`
- `viewer`

## Main Routes

- `/`
  - dashboard
- `/calendar`
  - milestone calendar
- `/pipeline`
  - task pipeline management
- `/import`
  - Excel import flow
- `/register`
  - self-registration
- `/register/pending`
  - waiting-for-approval page
- `/admin/users`
  - admin-only user management

## API Routes

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/import/excel`

## Excel Import Rules

- Only the `Pipeline(All)` worksheet is parsed
- The app ignores derived monthly sheets
- `Task ID` is treated as the unique task code
- Re-importing the same workbook updates existing tasks instead of duplicating them
- `Phase/Rule` is no longer required for import

Required workbook columns:

- `Topic`
- `Type`
- `Start Date`
- `Delivery Due`
- `Publish Date`
- `Task ID`
- `Owner`
- `Work Link`
- `Status`
- `Notes`

## Useful Commands

```bash
npm run dev
npm run lint
npm run build
npm test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
```

## Testing

Run the full test suite:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

Run production build validation:

```bash
npm run build
```

## Repository

GitHub repository:

- [Pugyov/barin-sports-calendar](https://github.com/Pugyov/barin-sports-calendar)
