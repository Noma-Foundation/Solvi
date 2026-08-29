# Solvi

## About

**Solvi** is a lightweight desktop CRM built for high-touch service operations — such as salons, tutoring sessions, and any business where appointments, client history, and financial follow-up matter. It runs fully offline as a native Windows application, exposing a web-based UI through a pywebview shell backed by a local or networked PostgreSQL database.

Solvi is an **internal operations tool**, not a client-facing portal. Its purpose is to centralise the team's workflow: tracking customers, scheduling and validating activities, managing budgets, recording financial entries, and surfacing notifications — all without requiring a constant internet connection.

## Features

- **Customer management** — register, search, and manage client profiles
- **Activity scheduling** — define and validate service appointments and sessions
- **Budget validation** — review and approve estimates before execution
- **Financial entries** — record income and expense transactions per service order
- **Notifications / Inbox** — receive and act on internal alerts and updates
- **Offline-first** — built-in authentication and local database remove the need for constant internet access

---

## Tech Stack

### Backend
| Package | Version | Role |
|---|---|---|
| Python | ≥ 3.11 | Runtime |
| pywebview | 6.2.1 | Native desktop window / JS↔Python bridge |
| SQLAlchemy | 2.0.52 | ORM and database session management |
| psycopg2 | 2.9.12 | PostgreSQL driver |
| Bottle | 0.13.4 | Internal HTTP server (dev asset serving) |
| bcrypt | 5.0.0 | Password hashing |
| python-dotenv | 1.2.3 | `.env` configuration loader |

### Frontend
| Package | Version | Role |
|---|---|---|
| Vite | ^8.1.5 | Build tool and dev server |
| jQuery | ^4.0.0 | DOM manipulation |
| Bootstrap | ^5.3.8 | UI component library |
| Jest | ^30.4.2 | JavaScript test runner |

> **Platform:** Solvi is currently **Windows-only**. The dev mode launcher uses the Windows-specific `CREATE_NEW_CONSOLE` flag to spawn the Vite process in a separate console window.

---

## Prerequisites

Make sure the following are installed on your machine before continuing:

- **Python ≥ 3.11** — [python.org](https://www.python.org/downloads/)
- **Node.js LTS + npm** — [nodejs.org](https://nodejs.org/)
- **PostgreSQL** (running locally or accessible over the network) — [postgresql.org](https://www.postgresql.org/download/)

---

## Environment Setup

### 1. Clone the repository

```bash
git clone https://github.com/Solvi-Software/Solvi.git
cd Solvi
```

### 2. Create and activate a Python virtual environment

```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 5. Configure environment variables

Create a `.env` file in the project root with the following keys:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=solvi
DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/solvi 
```

> All six keys are required. `DATABASE_URL` must be consistent with the individual `DB_*` values.

---

## Running the App

### Development mode

```bash
python main.py --dev
```

Passing `--dev` automatically spawns `npm run dev` in a new console window, waits 3 seconds for Vite to start, then opens the pywebview window pointing at `http://localhost:5173`. You do not need to start Vite manually.

### Production mode

Build the frontend first, then launch the app:

```bash
cd frontend
npm run build
cd ..
python main.py
```

In production mode, pywebview loads `frontend/dist/index.html` as a local file. The `frontend/dist/` directory must exist before running the app.

---

## Running Tests

### Python

Run the full test suite from the project root:

```bash
pytest
```

Run a single test file:

```bash
pytest tests/test_auth_api.py
```

Run a single test by name:

```bash
pytest tests/test_auth_api.py::test_auth_user_returns_true_on_successful_authentication
```

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
