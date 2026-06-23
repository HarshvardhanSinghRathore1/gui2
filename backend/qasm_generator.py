"""
============================================================
qasm_generator.py — Server-Side QASM Generation
============================================================
PURPOSE:
    Converts a circuit model JSON (from the frontend) into
    a valid OpenQASM 2.0 string. This mirrors the frontend's
    qasmGenerator.js but runs on the server for validation.

RESPONSIBILITIES:
    - Parse circuit model JSON
    - Generate OpenQASM 2.0 header
    - Convert each gate object to QASM instruction
    - Handle all gate types (single, controlled, param, special)
============================================================
"""

import json
from typing import List, Dict, Any


# ── Gate Type to QASM Instruction Mapping ────────────────────
GATE_MAP = {
    "H":       "h",
    "X":       "x",
    "Y":       "y",
    "Z":       "z",
    "S":       "s",
    "SDG":     "sdg",
    "T":       "t",
    "TDG":     "tdg",
    "P":       "p",
    "RX":      "rx",
    "RY":      "ry",
    "RZ":      "rz",
    "CX":      "cx",
    "CY":      "cy",
    "CZ":      "cz",
    "CCX":     "ccx",
    "SWAP":    "swap",
    "MEASURE": "measure",
    "RESET":   "reset",
}


def generate_qasm(model_json_str: str) -> str:
    """
    Generate OpenQASM 2.0 from a circuit model JSON string.
    
    Args:
        model_json_str: JSON string of the circuit model
            Expected format:
            {
                "numQubits": 8,
                "gates": [
                    {"type": "H", "targets": [0], "controls": [], "column": 0, "params": {}},
                    {"type": "CX", "targets": [7], "controls": [0], "column": 1, "params": {}},
                ]
            }
    
    Returns:
        str: Valid OpenQASM 2.0 source code
    """
    model = json.loads(model_json_str)
    num_qubits = model.get("numQubits", 8)
    gates = model.get("gates", [])
    
    lines = []
    
    # ── Header ───────────────────────────────────────────
    lines.append("OPENQASM 2.0;")
    lines.append('include "qelib1.inc";')
    lines.append("")
    
    # ── Registers ────────────────────────────────────────
    lines.append(f"qreg q[{num_qubits}];")
    lines.append(f"creg c[{num_qubits}];")
    lines.append("")
    
    # ── Sort gates by column ─────────────────────────────
    sorted_gates = sorted(gates, key=lambda g: g.get("column", 0))
    
    # ── Generate instructions ────────────────────────────
    for gate in sorted_gates:
        instruction = _gate_to_qasm(gate)
        if instruction:
            lines.append(instruction)
    
    lines.append("")
    return "\n".join(lines)


def _gate_to_qasm(gate: Dict[str, Any]) -> str | None:
    """Convert a single gate object to a QASM instruction."""
    gate_type = gate.get("type", "")
    targets = gate.get("targets", [])
    controls = gate.get("controls", [])
    params = gate.get("params", {})
    
    qasm_name = GATE_MAP.get(gate_type)
    if not qasm_name:
        return None
    
    # ── Measure ──────────────────────────────────────────
    if gate_type == "MEASURE" and targets:
        t = targets[0]
        return f"measure q[{t}] -> c[{t}];"
    
    # ── Reset ────────────────────────────────────────────
    if gate_type == "RESET" and targets:
        return f"reset q[{targets[0]}];"
    
    # ── Parameterized ────────────────────────────────────
    if "theta" in params and targets:
        return f"{qasm_name}({params['theta']}) q[{targets[0]}];"
    
    # ── Controlled ───────────────────────────────────────
    if controls:
        all_qubits = controls + targets
        qubit_args = ",".join(f"q[{q}]" for q in all_qubits)
        return f"{qasm_name} {qubit_args};"
    
    # ── SWAP ─────────────────────────────────────────────
    if gate_type == "SWAP" and len(targets) >= 2:
        qubit_args = ",".join(f"q[{q}]" for q in targets)
        return f"{qasm_name} {qubit_args};"
    
    # ── Single-qubit ─────────────────────────────────────
    if targets:
        return f"{qasm_name} q[{targets[0]}];"
    
    return None
