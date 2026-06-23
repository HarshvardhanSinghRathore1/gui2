"""
============================================================
models.py — SQLite Table Definitions & Helpers
============================================================
PURPOSE:
    Contains the SQL statements for creating database tables
    and helper functions for common database patterns.

WHAT IS SQLite?
    SQLite is a lightweight database that stores everything
    in a single file (quantum_studio.db). Unlike PostgreSQL
    or MySQL, it doesn't need a separate server process.
    Python has built-in support via the `sqlite3` module.

DATABASE SCHEMA:
    ┌──────────────────────────────────────────────────────┐
    │ circuits                                              │
    ├──────────┬──────────┬───────────────────────────────┤
    │ id       │ INTEGER  │ Primary key, auto-increment    │
    │ name     │ TEXT     │ Circuit name (e.g., "Bell")    │
    │ qasm     │ TEXT     │ OpenQASM 2.0 source code       │
    │ model_json│ TEXT    │ Circuit model as JSON string    │
    │ created_at│ TEXT    │ ISO timestamp                   │
    └──────────┴──────────┴───────────────────────────────┘

    ┌──────────────────────────────────────────────────────┐
    │ jobs                                                  │
    ├──────────┬──────────┬───────────────────────────────┤
    │ id       │ INTEGER  │ Primary key, auto-increment    │
    │ circuit_id│ INTEGER │ FK → circuits.id               │
    │ status   │ TEXT     │ "pending"/"running"/"complete" │
    │ created_at│ TEXT    │ ISO timestamp                   │
    └──────────┴──────────┴───────────────────────────────┘

    ┌──────────────────────────────────────────────────────┐
    │ results                                               │
    ├──────────────┬──────────┬────────────────────────────┤
    │ id           │ INTEGER  │ Primary key, auto-increment │
    │ job_id       │ INTEGER  │ FK → jobs.id                │
    │ counts_json  │ TEXT     │ Measurement counts JSON      │
    │ statevector  │ TEXT     │ Statevector data (optional)  │
    │ created_at   │ TEXT     │ ISO timestamp                │
    └──────────────┴──────────┴────────────────────────────┘
============================================================
"""

# ── SQL: Create Tables ───────────────────────────────────────

CREATE_CIRCUITS_TABLE = """
CREATE TABLE IF NOT EXISTS circuits (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    qasm        TEXT NOT NULL,
    model_json  TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
"""

CREATE_JOBS_TABLE = """
CREATE TABLE IF NOT EXISTS jobs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    circuit_id  INTEGER NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (circuit_id) REFERENCES circuits(id)
);
"""

CREATE_RESULTS_TABLE = """
CREATE TABLE IF NOT EXISTS results (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id          INTEGER NOT NULL,
    counts_json     TEXT NOT NULL,
    statevector_json TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);
"""

# ── SQL: Common Queries ──────────────────────────────────────

INSERT_CIRCUIT = """
INSERT INTO circuits (name, qasm, model_json, created_at)
VALUES (?, ?, ?, datetime('now'));
"""

SELECT_CIRCUIT_BY_ID = """
SELECT id, name, qasm, model_json, created_at
FROM circuits
WHERE id = ?;
"""

SELECT_ALL_CIRCUITS = """
SELECT id, name, created_at
FROM circuits
ORDER BY created_at DESC;
"""

INSERT_JOB = """
INSERT INTO jobs (circuit_id, status, created_at)
VALUES (?, 'pending', datetime('now'));
"""

UPDATE_JOB_STATUS = """
UPDATE jobs SET status = ? WHERE id = ?;
"""

INSERT_RESULT = """
INSERT INTO results (job_id, counts_json, statevector_json, created_at)
VALUES (?, ?, ?, datetime('now'));
"""

SELECT_RESULT_BY_JOB = """
SELECT id, job_id, counts_json, statevector_json, created_at
FROM results
WHERE job_id = ?;
"""
