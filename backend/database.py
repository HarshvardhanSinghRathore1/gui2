"""
============================================================
database.py — SQLite Database Connection & Operations
============================================================
PURPOSE:
    Manages the SQLite database connection, table creation,
    and provides helper functions for CRUD operations on
    circuits, jobs, and results.

WHAT IS sqlite3?
    Python's built-in sqlite3 module lets you work with
    SQLite databases without installing anything extra.
    
    Key concepts:
    - Connection: Opens/creates the database file
    - Cursor: Executes SQL statements
    - Commit: Saves changes to disk
    - Close: Releases the database file

HOW IT WORKS:
    1. On startup, init_db() creates the database file
       (quantum_studio.db) and runs CREATE TABLE statements.
    2. Each API endpoint calls database functions to read
       or write data.
    3. We use Python's `with` statement to ensure connections
       are always properly closed.

RESPONSIBILITIES:
    - Initialize database and create tables
    - Save circuits (INSERT)
    - Load circuits (SELECT)
    - List all circuits (SELECT)
    - Save jobs and results
============================================================
"""

import sqlite3
import os
import json
from models import (
    CREATE_CIRCUITS_TABLE,
    CREATE_JOBS_TABLE,
    CREATE_RESULTS_TABLE,
    INSERT_CIRCUIT,
    SELECT_CIRCUIT_BY_ID,
    SELECT_ALL_CIRCUITS,
    INSERT_JOB,
    UPDATE_JOB_STATUS,
    INSERT_RESULT,
    SELECT_RESULT_BY_JOB,
)

# ── Database File Path ───────────────────────────────────────
# The database file is created in the same directory as this script
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "quantum_studio.db")


def get_connection():
    """
    Create a new database connection.
    
    Each function call gets its own connection because SQLite
    doesn't handle concurrent connections well. For a production
    app, you'd use a connection pool.
    
    Returns:
        sqlite3.Connection: A new database connection
        
    Example:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM circuits")
        rows = cursor.fetchall()
        conn.close()
    """
    conn = sqlite3.connect(DB_PATH)
    # Enable foreign key support
    conn.execute("PRAGMA foreign_keys = ON")
    # Return rows as dictionaries instead of tuples
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Initialize the database by creating all tables.
    
    Called once when the FastAPI server starts.
    Safe to call multiple times — CREATE TABLE IF NOT EXISTS
    won't create duplicate tables.
    """
    conn = get_connection()
    try:
        conn.execute(CREATE_CIRCUITS_TABLE)
        conn.execute(CREATE_JOBS_TABLE)
        conn.execute(CREATE_RESULTS_TABLE)
        conn.commit()
        print(f"✓ Database initialized at: {DB_PATH}")
    finally:
        conn.close()


# ── Circuit Operations ───────────────────────────────────────

def save_circuit(name: str, qasm: str, model_json: str) -> int:
    """
    Save a circuit to the database.
    
    Args:
        name: Circuit name (e.g., "Bell State")
        qasm: OpenQASM 2.0 source code
        model_json: Circuit model as a JSON string
    
    Returns:
        int: The auto-generated ID of the saved circuit
    
    Example:
        circuit_id = save_circuit(
            name="My Circuit",
            qasm="OPENQASM 2.0; ...",
            model_json='{"numQubits": 8, "gates": []}'
        )
        print(f"Saved with ID: {circuit_id}")
    """
    conn = get_connection()
    try:
        cursor = conn.execute(INSERT_CIRCUIT, (name, qasm, model_json))
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def load_circuit(circuit_id: int) -> dict | None:
    """
    Load a circuit by its ID.
    
    Args:
        circuit_id: The circuit's database ID
    
    Returns:
        dict: Circuit data, or None if not found
        
    Example:
        circuit = load_circuit(1)
        if circuit:
            print(circuit['name'])     # "Bell State"
            print(circuit['qasm'])     # "OPENQASM 2.0; ..."
    """
    conn = get_connection()
    try:
        cursor = conn.execute(SELECT_CIRCUIT_BY_ID, (circuit_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
    finally:
        conn.close()


def list_circuits() -> list[dict]:
    """
    List all saved circuits (name and date only).
    
    Returns:
        list[dict]: List of circuits with id, name, created_at
        
    Example:
        circuits = list_circuits()
        for c in circuits:
            print(f"{c['id']}: {c['name']} ({c['created_at']})")
    """
    conn = get_connection()
    try:
        cursor = conn.execute(SELECT_ALL_CIRCUITS)
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


# ── Job Operations ───────────────────────────────────────────

def create_job(circuit_id: int) -> int:
    """
    Create a new simulation job.
    
    Args:
        circuit_id: ID of the circuit to simulate
    
    Returns:
        int: The job ID
    """
    conn = get_connection()
    try:
        cursor = conn.execute(INSERT_JOB, (circuit_id,))
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def update_job_status(job_id: int, status: str):
    """
    Update the status of a job.
    
    Args:
        job_id: The job's database ID
        status: New status ("pending", "running", "complete", "error")
    """
    conn = get_connection()
    try:
        conn.execute(UPDATE_JOB_STATUS, (status, job_id))
        conn.commit()
    finally:
        conn.close()


# ── Result Operations ────────────────────────────────────────

def save_result(job_id: int, counts_json: str, statevector_json: str = None) -> int:
    """
    Save simulation results.
    
    Args:
        job_id: The job's database ID
        counts_json: Measurement counts as JSON string
        statevector_json: Optional statevector data as JSON string
    
    Returns:
        int: The result ID
    """
    conn = get_connection()
    try:
        cursor = conn.execute(INSERT_RESULT, (job_id, counts_json, statevector_json))
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def get_result(job_id: int) -> dict | None:
    """
    Get simulation results for a job.
    
    Args:
        job_id: The job's database ID
    
    Returns:
        dict: Result data, or None if not found
    """
    conn = get_connection()
    try:
        cursor = conn.execute(SELECT_RESULT_BY_JOB, (job_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
    finally:
        conn.close()
