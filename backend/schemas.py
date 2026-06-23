"""
============================================================
schemas.py — Pydantic Data Validation Models
============================================================
PURPOSE:
    Defines the shape of all data that flows in and out of the
    FastAPI endpoints. Pydantic validates incoming data
    automatically and generates OpenAPI documentation.

WHAT IS PYDANTIC?
    Pydantic is a Python library that uses type hints to
    validate data. When a request arrives at FastAPI, Pydantic
    checks that the JSON body matches the schema defined here.
    If it doesn't match, FastAPI returns a 422 error with
    details about what's wrong.

RESPONSIBILITIES:
    - Define request body schemas (what the frontend sends)
    - Define response schemas (what the backend returns)
    - Provide default values and documentation
============================================================
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


# ── Request Schemas ──────────────────────────────────────────

class RunRequest(BaseModel):
    """
    Request body for POST /run
    
    The frontend sends the OpenQASM code and the number of
    simulation shots. The backend uses Qiskit to simulate
    the circuit and returns measurement counts.
    
    Example JSON:
    {
        "qasm": "OPENQASM 2.0;\\ninclude \\"qelib1.inc\\";\\nqreg q[8];\\ncreg c[8];\\nh q[0];\\ncx q[0],q[7];\\nmeasure q[0] -> c[0];\\nmeasure q[7] -> c[7];",
        "shots": 1024
    }
    """
    qasm: str = Field(..., description="OpenQASM 2.0 source code")
    shots: int = Field(default=1024, ge=1, le=100000, description="Number of simulation shots")


class SaveRequest(BaseModel):
    """
    Request body for POST /save
    
    The frontend sends the circuit name, QASM code, and the
    circuit model as a JSON string. All three are stored in
    the SQLite database.
    
    Example JSON:
    {
        "name": "Bell State",
        "qasm": "OPENQASM 2.0; ...",
        "model_json": "{\"numQubits\": 8, \"gates\": [...]}"
    }
    """
    name: str = Field(..., min_length=1, max_length=200, description="Circuit name")
    qasm: str = Field(..., description="OpenQASM 2.0 source code")
    model_json: str = Field(..., description="Circuit model as JSON string")


class GenerateQASMRequest(BaseModel):
    """
    Request body for POST /generate-qasm
    
    The frontend sends the circuit model JSON. The backend
    generates the corresponding OpenQASM code.
    """
    model_json: str = Field(..., description="Circuit model as JSON string")


class ParseQASMRequest(BaseModel):
    """
    Request body for POST /parse-qasm
    
    The frontend sends OpenQASM code. The backend parses it
    into a circuit model (array of gate objects).
    """
    qasm: str = Field(..., description="OpenQASM 2.0 source code")


# ── Response Schemas ─────────────────────────────────────────

class RunResponse(BaseModel):
    """
    Response body for POST /run
    
    Example JSON:
    {
        "counts": {"00000000": 512, "10000001": 512},
        "shots": 1024,
        "success": true
    }
    """
    counts: Dict[str, int] = Field(..., description="Measurement outcome counts")
    shots: int = Field(..., description="Number of shots used")
    success: bool = Field(default=True)
    error: Optional[str] = Field(default=None, description="Error message if simulation failed")


class SaveResponse(BaseModel):
    """
    Response body for POST /save
    """
    id: int = Field(..., description="Database ID of saved circuit")
    message: str = Field(default="Circuit saved successfully")


class CircuitResponse(BaseModel):
    """
    Response body for GET /load/:id
    """
    id: int
    name: str
    qasm: str
    model_json: str
    created_at: str


class CircuitListItem(BaseModel):
    """
    Individual item in the circuits list.
    """
    id: int
    name: str
    created_at: str


class GenerateQASMResponse(BaseModel):
    """
    Response body for POST /generate-qasm
    """
    qasm: str = Field(..., description="Generated OpenQASM code")


class ParseQASMResponse(BaseModel):
    """
    Response body for POST /parse-qasm
    """
    gates: List[Dict[str, Any]] = Field(..., description="Parsed gate objects")
    errors: List[str] = Field(default_factory=list, description="Parse errors")
    num_qubits: int = Field(default=8)


class HealthResponse(BaseModel):
    """
    Response body for GET /health
    """
    status: str = "ok"
    version: str = "1.0.0"
