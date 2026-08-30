# Plan: Rewrite README.md for Solvi

## Overview

Replace the current end-user-facing `README.md` with a complete developer-facing document. The goal is to let a developer clone the repo, understand what Solvi is, install every dependency, and run the project (dev or production) without asking any questions. No screenshots, no contributing guide — purely technical and textual.

---

## Sub-Tasks

---

### Sub-Task 1 — Write the "About" and "Features" sections

**Intent:** Replace the old end-user description with a concise dev-facing overview of what Solvi is and what it does.

**Expected Outcomes:**
- The reader understands Solvi is a desktop CRM for high-touch service operations (salons, tutoring, etc.)
- Key capabilities are listed in bullet form: customer registration, activity/schedule management, budget validation, financial entries (in/out), notifications, offline mode, built-in authentication

**Todo List:**
1. Write `## About` — one paragraph describing Solvi as a lightweight desktop CRM targeting high-touch service operations
2. Write `## Features` — bullet list of the six main capabilities

**Relevant Context:**
- Existing description in `README.md` lines 1–14 (to be replaced, not extended)
- Feature areas visible in `frontend/src/views/`: `customer-page`, `home-page`, `inbox-page`, `notification-page`, `calendar-page`

**Status:** [ ] pending

---

### Sub-Task 2 — Write the "Tech Stack" section

**Intent:** Give developers a quick overview of every major technology before they touch the project.

**Expected Outcomes:**
- Reader knows the full stack: Python + pywebview for the desktop shell, SQLAlchemy + PostgreSQL for the DB, Bottle as the internal HTTP server, Vite + jQuery + Bootstrap for the frontend
- Platform constraint (Windows-only at this time) is clearly stated

**Todo List:**
1. Write `## Tech Stack` with two sub-lists: **Backend** and **Frontend**
2. Include exact versions sourced from `requirements.txt` and `frontend/package.json`
3. Add a note that the app is **Windows-only** (dev mode uses `CREATE_NEW_CONSOLE`)

**Relevant Context:**
- `requirements.txt` — key packages: `pywebview==6.2.1`, `SQLAlchemy==2.0.52`, `psycopg2==2.9.12`, `bottle==0.13.4`, `bcrypt==5.0.0`
- `frontend/package.json` — `vite ^8.1.5`, `jquery ^4.0.0`, `bootstrap ^5.3.8`, `jest ^30.4.2`

**Status:** [ ] pending

---

### Sub-Task 3 — Write the "Prerequisites" section

**Intent:** State exactly what must be installed on the developer's machine before cloning.

**Expected Outcomes:**
- Developers know they need Python 3, Node.js + npm, and PostgreSQL running before anything else

**Todo List:**
1. Write `## Prerequisites` listing: Python 3.x, Node.js (LTS), npm, PostgreSQL
2. Note that no specific minimum Python version is pinned in the project — recommend ≥ 3.11 based on dependency compatibility

**Relevant Context:**
- No `.python-version` file exists in the project
- `psycopg2==2.9.12` requires PostgreSQL client libraries on the host

**Status:** [ ] pending

---

### Sub-Task 4 — Write the "Environment Setup" section

**Intent:** Walk a developer through every step from cloning to having a working local database configuration.

**Expected Outcomes:**
- Developer can clone → install Python deps → install JS deps → configure `.env` and be ready to run in one linear flow

**Todo List:**
1. Write `## Environment Setup` with numbered steps:
   - Clone the repository
   - Create and activate a Python virtual environment
   - `pip install -r requirements.txt`
   - `cd frontend && npm install`
   - Copy `.env.example` to `.env` (or create `.env` manually) and fill in the required keys
2. Document every required `.env` key: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `DATABASE_URL`

**Relevant Context:**
- Environment keys sourced from `internal/config.py` (`DBConfig` dataclass)
- `python-dotenv==1.2.3` loads the file at startup

**Status:** [ ] pending

---

### Sub-Task 5 — Write the "Running the App" section

**Intent:** Show how to start the app in both dev and production modes.

**Expected Outcomes:**
- Developer knows `python main.py --dev` starts Vite automatically (with a 3-second wait) and points pywebview at `http://localhost:5173`
- Developer knows production requires building the frontend first, then running `python main.py`

**Todo List:**
1. Write `## Running the App` with two sub-sections: **Development** and **Production**
2. Dev: `python main.py --dev` — note it spawns `npm run dev` in a separate console and waits 3 seconds for Vite
3. Production: `cd frontend && npm run build` then `python main.py` — note that `frontend/dist/` must exist

**Relevant Context:**
- Dev mode logic in `app.py` / `internal/utils/server.py` — uses `CREATE_NEW_CONSOLE`, hardcoded 3-second sleep
- Vite outputs to `frontend/dist/` per `vite.config.js` (`outDir: 'dist'`)

**Status:** [ ] pending

---

### Sub-Task 6 — Write the "Running Tests" section

**Intent:** Let developers know how to validate their changes.

**Expected Outcomes:**
- Developer can run Python tests with `pytest` and JS tests with `npm test`

**Todo List:**
1. Write `## Running Tests` with two sub-sections: **Python** and **Frontend**
2. Python: `pytest` from root; single file: `pytest tests/<file>.py`
3. Frontend: `cd frontend && npm test`; single file command with `--experimental-vm-modules`

**Relevant Context:**
- Test runner config in `frontend/package.json` (`"test"` script already includes `--experimental-vm-modules`)
- Python tests live in `tests/`

**Status:** [ ] pending

---

### Sub-Task 7 — Write the "Project Structure" section

**Intent:** Orient new developers to the codebase layout so they know where to look for things.

**Expected Outcomes:**
- Annotated directory tree covering `main.py`, `app.py`, `internal/`, `frontend/src/`, `tests/`

**Todo List:**
1. Write `## Project Structure` with an annotated tree
2. Highlight the most important directories: `internal/api.py` (Python↔JS bridge), `internal/models/` (ORM entities), `frontend/src/components/`, `frontend/src/views/`, `frontend/src/utils/`

**Relevant Context:**
- Full structure from sub-agent exploration report above

**Status:** [ ] pending

---

### Sub-Task 8 — Write the "License" section

**Intent:** State the project license.

**Expected Outcomes:**
- A one-line `## License` section referencing Apache-2.0

**Todo List:**
1. Write `## License` — "This project is licensed under the Apache-2.0 License."

**Relevant Context:**
- `LICENSE` file exists at root; `frontend/package.json` declares `"license": "Apache-2.0"`

**Status:** [ ] pending

---

## Execution Notes

- All sub-tasks write to a single file: `README.md`
- Sub-tasks 1–8 should be applied sequentially, assembling the final document from top to bottom
- No Mermaid diagrams, no screenshots, no contributing section
