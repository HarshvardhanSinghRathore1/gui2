"""
============================================================
main.py — FastAPI Application Server
============================================================
PURPOSE:
    This is the main entry point for the backend server.
    It defines all API endpoints and wires them to the
    simulator, database, and QASM modules.

WHAT IS FastAPI?
    FastAPI is a modern Python web framework that:
    - Automatically validates request data (via Pydantic)
    - Generates interactive API docs (Swagger UI at /docs)
    - Supports async/await for high performance
    - Uses type hints for everything
    
    To run this server:
        cd backend
        pip install -r requirements.txt
        uvicorn main:app --reload --port 8000
    
    Then open http://localhost:8000/docs to see all endpoints.

ENDPOINTS:
    GET  /health         → Health check
    POST /run            → Run quantum simulation
    POST /save           → Save circuit to database
    GET  /load/{id}      → Load a specific circuit
    GET  /circuits        → List all saved circuits
    POST /generate-qasm  → Generate QASM from model
    POST /parse-qasm     → Parse QASM into model

CORS:
    CORS (Cross-Origin Resource Sharing) is enabled to allow
    the frontend (running on a different port/origin) to
    make API requests to this server.
============================================================
"""

import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from schemas import (
    RunRequest, RunResponse,
    SaveRequest, SaveResponse,
    CircuitResponse, CircuitListItem,
    GenerateQASMRequest, GenerateQASMResponse,
    ParseQASMRequest, ParseQASMResponse,
    HealthResponse,
)
from simulator import simulate_circuit, get_statevector
from database import init_db, save_circuit, load_circuit, list_circuits
from qasm_generator import generate_qasm
from qasm_parser import parse_qasm


# ── Create FastAPI App ───────────────────────────────────────
app = FastAPI(
    title="Quantum Studio API",
    description="Backend API for the Quantum Studio circuit editor. "
                "Provides quantum simulation via Qiskit, circuit storage, "
                "and OpenQASM generation/parsing.",
    version="1.0.0",
)

# ── CORS Middleware ──────────────────────────────────────────
# Allow the frontend to make requests from any origin.
# In production, you'd restrict this to your frontend's domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],          # Allow all HTTP methods
    allow_headers=["*"],          # Allow all headers
)


# ── Startup Event ────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    """
    Called when the server starts.
    Initializes the SQLite database (creates tables if needed).
    """
    init_db()
    print("Quantum Studio API is running!")
    print("  -> Docs: http://localhost:8000/docs")
    print("  -> Health: http://localhost:8000/health")


# ══════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════

# ── Health Check ─────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """
    Check if the server is running.
    
    Used by the frontend to determine if it should work in
    online mode (with backend) or offline mode (local-only).
    
    Returns:
        {"status": "ok", "version": "1.0.0"}
    """
    return HealthResponse()


# ── Run Simulation ───────────────────────────────────────────
@app.post("/run", response_model=RunResponse, tags=["Simulation"])
async def run_simulation(request: RunRequest):
    """
    Run a quantum circuit simulation.
    
    Accepts OpenQASM 2.0 code and runs it on the Qiskit
    AerSimulator with the specified number of shots.
    
    Example request:
    ```json
    {
        "qasm": "OPENQASM 2.0;\\ninclude \\"qelib1.inc\\";\\nqreg q[8];\\ncreg c[8];\\nh q[0];\\ncx q[0],q[7];\\nmeasure q[0] -> c[0];\\nmeasure q[7] -> c[7];",
        "shots": 1024
    }
    ```
    
    Example response:
    ```json
    {
        "counts": {"00000000": 520, "10000001": 504},
        "shots": 1024,
        "success": true
    }
    ```
    """
    result = simulate_circuit(request.qasm, request.shots)
    
    if not result.get("success", False):
        return RunResponse(
            counts={},
            shots=request.shots,
            success=False,
            error=result.get("error", "Unknown error"),
        )
    
    return RunResponse(
        counts=result["counts"],
        shots=result["shots"],
        success=True,
    )


# ── Save Circuit ─────────────────────────────────────────────
@app.post("/save", response_model=SaveResponse, tags=["Circuits"])
async def save_circuit_endpoint(request: SaveRequest):
    """
    Save a circuit to the SQLite database.
    
    Stores the circuit name, OpenQASM code, and the full
    circuit model (gates, qubits) as JSON.
    
    Example request:
    ```json
    {
        "name": "Bell State",
        "qasm": "OPENQASM 2.0; ...",
        "model_json": "{\"numQubits\": 8, \"gates\": [...]}"
    }
    ```
    """
    try:
        circuit_id = save_circuit(
            name=request.name,
            qasm=request.qasm,
            model_json=request.model_json,
        )
        return SaveResponse(id=circuit_id, message=f"Circuit '{request.name}' saved successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save: {str(e)}")


# ── Load Circuit ─────────────────────────────────────────────
@app.get("/load/{circuit_id}", response_model=CircuitResponse, tags=["Circuits"])
async def load_circuit_endpoint(circuit_id: int):
    """
    Load a specific circuit by its database ID.
    
    Returns the circuit name, QASM code, model JSON, and
    creation timestamp.
    """
    circuit = load_circuit(circuit_id)
    
    if not circuit:
        raise HTTPException(status_code=404, detail=f"Circuit {circuit_id} not found")
    
    return CircuitResponse(
        id=circuit["id"],
        name=circuit["name"],
        qasm=circuit["qasm"],
        model_json=circuit["model_json"],
        created_at=circuit["created_at"],
    )


# ── List Circuits ────────────────────────────────────────────
@app.get("/circuits", response_model=list[CircuitListItem], tags=["Circuits"])
async def list_circuits_endpoint():
    """
    List all saved circuits.
    
    Returns an array of circuit summaries (id, name, date).
    The full circuit data is loaded separately via /load/:id.
    """
    circuits = list_circuits()
    return [
        CircuitListItem(
            id=c["id"],
            name=c["name"],
            created_at=c["created_at"],
        )
        for c in circuits
    ]


# ── Generate QASM ───────────────────────────────────────────
@app.post("/generate-qasm", response_model=GenerateQASMResponse, tags=["QASM"])
async def generate_qasm_endpoint(request: GenerateQASMRequest):
    """
    Generate OpenQASM 2.0 from a circuit model JSON.
    
    This is the server-side equivalent of the frontend's
    qasmGenerator.js. Useful for validation.
    """
    try:
        qasm = generate_qasm(request.model_json)
        return GenerateQASMResponse(qasm=qasm)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate QASM: {str(e)}")


# ── Parse QASM ──────────────────────────────────────────────
@app.post("/parse-qasm", response_model=ParseQASMResponse, tags=["QASM"])
async def parse_qasm_endpoint(request: ParseQASMRequest):
    """
    Parse OpenQASM 2.0 into a circuit model.
    
    This is the server-side equivalent of the frontend's
    qasmParser.js. Returns gate objects and any parse errors.
    """
    try:
        result = parse_qasm(request.qasm)
        return ParseQASMResponse(
            gates=result["gates"],
            errors=result["errors"],
            num_qubits=result["num_qubits"],
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse QASM: {str(e)}")


# ── Run Server ──────────────────────────────────────────────
# When running directly: python main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
