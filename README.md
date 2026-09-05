# Solvi

## About

**Solvi** is a lightweight desktop CRM built for high-touch service operations — such as salons, tutoring sessions, and any business where appointments, client history, and financial follow-up matter.

Solvi is an **internal operations tool**, not a client-facing portal. Its purpose is to centralise the team's workflow: tracking customers, scheduling and validating activities, managing budgets, recording financial entries, and surfacing notifications.

## Features

- **Customer management** — register, search, and manage client profiles
- **Activity scheduling** — define and validate service appointments and sessions
- **Budget validation** — review and approve estimates before execution
- **Financial entries** — record income and expense transactions per service order
- **Notifications / Inbox** — receive and act on internal alerts and updates

---

## Tech Stack

### Backend
| Package | Version | Role |
|---|---|---|
| Node.js | LTS | Runtime |
| Hono | ^4.13.5 | HTTP framework |
| Kysely | ^0.29.5 | SQL query builder |
| pg | ^8.23.0 | PostgreSQL driver |

### Frontend
| Package | Version | Role |
|---|---|---|
| Vite | ^8.1.5 | Build tool and dev server |
| jQuery | ^4.0.0 | DOM manipulation |
| Bootstrap | ^5.3.8 | UI component library |
| Jest | ^30.4.2 | JavaScript test runner |

---

## Prerequisites

- **Node.js LTS + npm** — [nodejs.org](https://nodejs.org/)
- **PostgreSQL** (running locally or accessible over the network) — [postgresql.org](https://www.postgresql.org/download/)

---

## Environment Setup

### 1. Clone the repository

```bash
git clone https://github.com/Solvi-Software/Solvi.git
cd Solvi
```

### 2. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Configure environment variables

Create a `.env` file inside `backend/` with the following key:

```env
DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/solvi
```

---

## Running the App

### Backend

```bash
cd backend
npm run dev    # starts Hono server on http://localhost:3000 with --watch
```

### Frontend

```bash
cd frontend
npm run dev    # starts Vite dev server on http://localhost:5173
```

The Vite dev server proxies all `/api` requests to `http://localhost:3000`, so both processes must be running simultaneously in development.

### Production build

```bash
cd frontend
npm run build
```

Outputs to `frontend/dist/`. Serve the backend (`npm start`) and point a static file server at `frontend/dist/`.

---

## Running Tests

### Frontend

Run all JS tests from the `frontend/` directory:

```bash
cd frontend
npm test
```

Run a single test file:

```bash
cd frontend
node --experimental-vm-modules ./node_modules/jest/bin/jest.js src/tests/<test-file>.test.js
```

---

## License

This project is licensed under the [Apache-2.0 License](LICENSE).
