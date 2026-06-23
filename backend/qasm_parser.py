"""
============================================================
qasm_parser.py — Server-Side QASM Parser
============================================================
PURPOSE:
    Parses an OpenQASM 2.0 string into a list of gate objects
    (circuit model). This mirrors the frontend's qasmParser.js
    but runs on the server for validation and verification.

RESPONSIBILITIES:
    - Parse QASM header and register declarations
    - Parse gate instructions into gate dictionaries
    - Handle parameterized, controlled, and special gates
    - Assign column numbers for visualization
    - Report parsing errors
============================================================
"""

import re
import json
from typing import List, Dict, Any, Tuple, Optional


# ── Instruction Name to Gate Type ────────────────────────────
INSTRUCTION_MAP = {
    "h":       "H",
    "x":       "X",
    "y":       "Y",
    "z":       "Z",
    "s":       "S",
    "sdg":     "SDG",
    "t":       "T",
    "tdg":     "TDG",
    "p":       "P",
    "rx":      "RX",
    "ry":      "RY",
    "rz":      "RZ",
    "cx":      "CX",
    "cy":      "CY",
    "cz":      "CZ",
    "ccx":     "CCX",
    "swap":    "SWAP",
    "measure": "MEASURE",
    "reset":   "RESET",
}

# ── Gate Properties (controls count) ─────────────────────────
GATE_CONTROLS = {
    "H": 0, "X": 0, "Y": 0, "Z": 0,
    "S": 0, "SDG": 0, "T": 0, "TDG": 0, "P": 0,
    "RX": 0, "RY": 0, "RZ": 0,
    "CX": 1, "CY": 1, "CZ": 1,
    "CCX": 2,
    "SWAP": 0, "MEASURE": 0, "RESET": 0,
}


def parse_qasm(qasm_string: str) -> Dict[str, Any]:
    """
    Parse OpenQASM 2.0 into a circuit model.
    
    Args:
        qasm_string: Valid OpenQASM 2.0 source code
    
    Returns:
        dict: {
            "gates": [
                {"type": "H", "targets": [0], "controls": [], "column": 0, "params": {}},
                ...
            ],
            "errors": ["Line 5: Unknown gate: foo"],
            "num_qubits": 8
        }
    """
    gates = []
    errors = []
    num_qubits = 8
    
    # Track which qubits are used in each column
    column_usage: List[set] = []
    
    lines = qasm_string.strip().split("\n")
    
    for line_num, raw_line in enumerate(lines, start=1):
        line = raw_line.strip()
        
        # Skip empty lines and comments
        if not line or line.startswith("//") or line.startswith("/*"):
            continue
        
        # Remove trailing semicolons
        line = line.rstrip(";").strip()
        
        # ── Header ──────────────────────────────────────
        if line.startswith("OPENQASM") or line.startswith("include"):
            continue
        
        # ── Register declarations ────────────────────────
        qreg_match = re.match(r"qreg\s+\w+\[(\d+)\]", line)
        if qreg_match:
            num_qubits = int(qreg_match.group(1))
            continue
        if line.startswith("creg"):
            continue
        if line.startswith("barrier"):
            continue
        
        # ── Parse gate instruction ───────────────────────
        gate, error = _parse_instruction(line)
        
        if error:
            errors.append(f"Line {line_num}: {error}")
            continue
        
        if gate:
            # Assign column
            involved = gate["controls"] + gate["targets"]
            col = _find_column(column_usage, involved)
            gate["column"] = col
            gates.append(gate)
    
    return {
        "gates": gates,
        "errors": errors,
        "num_qubits": num_qubits,
    }


def _parse_instruction(line: str) -> Tuple[Optional[Dict], Optional[str]]:
    """Parse a single QASM instruction line."""
    
    # ── Measure: "measure q[n] -> c[n]" ──────────────────
    measure_match = re.match(r"measure\s+q\[(\d+)\]\s*->\s*c\[(\d+)\]", line)
    if measure_match:
        return {
            "type": "MEASURE",
            "controls": [],
            "targets": [int(measure_match.group(1))],
            "params": {},
        }, None
    
    # ── Reset: "reset q[n]" ──────────────────────────────
    reset_match = re.match(r"reset\s+q\[(\d+)\]", line)
    if reset_match:
        return {
            "type": "RESET",
            "controls": [],
            "targets": [int(reset_match.group(1))],
            "params": {},
        }, None
    
    # ── Parameterized: "rx(theta) q[n]" ──────────────────
    param_match = re.match(r"(\w+)\(([\d.eE\-+]+)\)\s+(.+)", line)
    if param_match:
        instr_name = param_match.group(1).lower()
        theta = float(param_match.group(2))
        qubits_str = param_match.group(3)
        
        gate_type = INSTRUCTION_MAP.get(instr_name)
        if not gate_type:
            return None, f"Unknown gate: {instr_name}"
        
        qubits = _parse_qubits(qubits_str)
        if qubits is None:
            return None, f"Invalid qubit arguments: {qubits_str}"
        
        return {
            "type": gate_type,
            "controls": [],
            "targets": qubits,
            "params": {"theta": theta},
        }, None
    
    # ── Standard: "gate q[a],q[b],..." ───────────────────
    standard_match = re.match(r"(\w+)\s+(.+)", line)
    if standard_match:
        instr_name = standard_match.group(1).lower()
        qubits_str = standard_match.group(2)
        
        gate_type = INSTRUCTION_MAP.get(instr_name)
        if not gate_type:
            return None, f"Unknown gate: {instr_name}"
        
        qubits = _parse_qubits(qubits_str)
        if qubits is None:
            return None, f"Invalid qubit arguments: {qubits_str}"
        
        num_controls = GATE_CONTROLS.get(gate_type, 0)
        controls = qubits[:num_controls]
        targets = qubits[num_controls:]
        
        return {
            "type": gate_type,
            "controls": controls,
            "targets": targets,
            "params": {},
        }, None
    
    return None, f"Could not parse: {line}"


def _parse_qubits(qubits_str: str) -> Optional[List[int]]:
    """Parse qubit arguments like 'q[0],q[7]' into [0, 7]."""
    matches = re.findall(r"q\[(\d+)\]", qubits_str)
    if not matches:
        return None
    return [int(m) for m in matches]


def _find_column(column_usage: List[set], qubits: List[int]) -> int:
    """Find the first column where none of the qubits are used."""
    col = 0
    while True:
        if col >= len(column_usage):
            column_usage.append(set())
        if not any(q in column_usage[col] for q in qubits):
            for q in qubits:
                column_usage[col].add(q)
            return col
        col += 1
