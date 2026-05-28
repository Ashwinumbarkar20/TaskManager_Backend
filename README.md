# Task Manager Backend API

Backend API for a task management system with authentication, role-based access, admin analytics, and task CRUD with filtering/pagination.

## Features

- User auth: register, login, current profile
- JWT-based protected routes
- Zod validation middleware for body/query/params
- Task CRUD with:
  - status filter
  - priority filter
  - search
  - pagination
  - sorting
- Admin APIs:
  - dashboard stats (users/tasks/status-wise counts)
  - list users (search/filter/pagination)
  - activate/deactivate user
- Common response format helpers
- Docker support

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Validation with `zod`

## Project Structure

```txt
config/
controllers/
middlewares/
models/
routes/
schemas/
utils/
index.js
```

## Prerequisites

- Node.js 18+
- MongoDB instance

## Environment Variables

Create a `.env` file in project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/task_manager
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

## Installation & Run

```bash
npm install
npm run dev
```

Production:

```bash
npm start
```

## Seed Admin User

Add these env vars:

```env
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

Run:

```bash
npm run seed:admin
```

This command creates an admin if not present, or promotes/updates the existing user with the same email.

## Docker

Build image:

```bash
docker build -t task-manager-backend .
```

Run container:

```bash
docker run -p 5000:5000 --env-file .env task-manager-backend
```

## Base URL

`/api`

## API Endpoints

### Health

- `GET /health`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (protected)

### Tasks (Protected)

- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

Task list query params (`GET /tasks`):

- `search` (string)
- `status` (`pending | in_progress | completed`)
- `priority` (`low | medium | high`)
- `page` (number, default: `1`)
- `limit` (number, default: `10`, max: `100`)
- `sortBy` (`createdAt | updatedAt | dueDate | title | priority | status`)
- `sortOrder` (`asc | desc`, default: `desc`)

### Admin (Protected + Admin Only)

- `GET /admin/dashboard`
- `GET /admin/users`
- `PATCH /admin/users/:userId/status`

Admin users query params:

- `search` (name/email)
- `isActive` (`true | false`)
- `page`
- `limit`

Request body for user status update:

```json
{
  "isActive": false
}
```

## Response Format

Success:

```json
{
  "success": true,
  "message": "Some success message",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

## Notes

- Create at least one admin user by setting `role: "admin"` in database.
- Deactivated users cannot access protected routes or login.
