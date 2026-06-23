"""
============================================================
simulator.py — Qiskit Quantum Circuit Simulation
============================================================
PURPOSE:
    Takes an OpenQASM 2.0 string, builds a Qiskit
    QuantumCircuit, runs it on a simulator, and returns
    the measurement counts.

WHAT IS QISKIT?
    Qiskit is IBM's open-source quantum computing SDK.
    It lets you:
    1. Build quantum circuits (QuantumCircuit)
    2. Simulate them on your computer (AerSimulator)
    3. Run them on real quantum hardware (IBM Quantum)
    
    Key classes:
    - QuantumCircuit: Represents a quantum circuit
    - AerSimulator: Simulates circuits locally
    - transpile: Optimizes circuits for a backend

HOW SIMULATION WORKS:
    1. Parse OpenQASM → QuantumCircuit object
    2. If no measurements exist, add measure_all()
    3. Create an AerSimulator instance
    4. Transpile the circuit for the simulator
    5. Run with N shots (default: 1024)
    6. Get counts: {"00000000": 512, "10000001": 512}
    7. Return the counts dictionary

WHAT ARE "SHOTS"?
    Quantum measurement is probabilistic. Running 1024 shots
    means measuring the circuit 1024 times. The counts show
    how many times each outcome occurred. More shots → more
    accurate probability estimation.

RESPONSIBILITIES:
    - Parse QASM into QuantumCircuit
    - Add measurements if missing
    - Run simulation with AerSimulator
    - Return measurement counts
    - Handle errors gracefully
============================================================
"""

import json
from typing import Optional


def simulate_circuit(qasm_string: str, shots: int = 1024) -> dict:
    """
    Simulate a quantum circuit from OpenQASM code.
    
    Args:
        qasm_string: Valid OpenQASM 2.0 source code
        shots: Number of simulation repetitions (1-100000)
    
    Returns:
        dict: {
            "counts": {"00000000": 512, ...},
            "shots": 1024,
            "success": True
        }
    
    Example:
        qasm = '''
        OPENQASM 2.0;
        include "qelib1.inc";
        qreg q[8];
        creg c[8];
        h q[0];
        cx q[0],q[7];
        measure q[0] -> c[0];
        measure q[7] -> c[7];
        '''
        result = simulate_circuit(qasm, shots=1024)
        print(result["counts"])
        # Possible output: {"00000000": 520, "10000001": 504}
        
    How it works step by step:
        1. qasm_string → QuantumCircuit.from_qasm_str()
           This parses the text into a circuit object.
           
        2. Check if circuit has measurements.
           If not, add measure_all() so we get output.
           
        3. AerSimulator() creates a local simulator.
           This simulates quantum behavior on your CPU.
           
        4. transpile(circuit, simulator) optimizes the
           circuit for the simulator's gate set.
           
        5. simulator.run(circuit, shots=N) executes the
           simulation N times.
           
        6. result.get_counts() returns a dictionary of
           measurement outcomes and their frequencies.
    """
    try:
        # ── Step 1: Import Qiskit ────────────────────────
        # We import here (not at top-level) so the server
        # can still start if Qiskit isn't installed yet
        from qiskit import QuantumCircuit, transpile
        from qiskit_aer import AerSimulator
        
        # ── Step 2: Parse QASM → QuantumCircuit ─────────
        circuit = QuantumCircuit.from_qasm_str(qasm_string)
        
        # ── Step 3: Add measurements if missing ─────────
        # A circuit without measurements can't produce counts
        has_measure = any(
            instruction.operation.name == 'measure'
            for instruction in circuit.data
        )
        
        if not has_measure:
            circuit.measure_all()
        
        # ── Step 4: Create simulator ─────────────────────
        simulator = AerSimulator()
        
        # ── Step 5: Transpile for simulator ──────────────
        transpiled = transpile(circuit, simulator)
        
        # ── Step 6: Run simulation ───────────────────────
        job = simulator.run(transpiled, shots=shots)
        result = job.result()
        
        # ── Step 7: Get counts ───────────────────────────
        counts = result.get_counts()
        
        # Ensure all keys are padded to the right length
        num_qubits = circuit.num_qubits
        padded_counts = {}
        for state, count in counts.items():
            # Remove spaces that Qiskit sometimes adds
            clean_state = state.replace(' ', '')
            # Pad to full qubit count
            padded_state = clean_state.zfill(num_qubits)
            padded_counts[padded_state] = count
        
        return {
            "counts": padded_counts,
            "shots": shots,
            "success": True,
        }
        
    except ImportError as e:
        return {
            "counts": {},
            "shots": shots,
            "success": False,
            "error": f"Qiskit not installed. Run: pip install qiskit qiskit-aer. Details: {str(e)}",
        }
        
    except Exception as e:
        return {
            "counts": {},
            "shots": shots,
            "success": False,
            "error": f"Simulation error: {str(e)}",
        }


def get_statevector(qasm_string: str) -> dict:
    """
    Get the statevector (full quantum state) of a circuit.
    
    Unlike counts (which are probabilistic), the statevector
    gives the exact quantum state as complex amplitudes.
    
    Args:
        qasm_string: Valid OpenQASM 2.0 source code
    
    Returns:
        dict: {
            "statevector": [[real, imag], ...],
            "probabilities": {"00000000": 0.5, ...},
            "success": True
        }
    
    NOTE: Statevector simulation does NOT use measurements.
    We remove any measure gates before simulating.
    """
    try:
        from qiskit import QuantumCircuit, transpile
        from qiskit_aer import AerSimulator
        import numpy as np
        
        circuit = QuantumCircuit.from_qasm_str(qasm_string)
        
        # Remove measurements for statevector simulation
        circuit.remove_final_measurements()
        
        # Use statevector simulator
        simulator = AerSimulator(method='statevector')
        circuit.save_statevector()
        
        transpiled = transpile(circuit, simulator)
        job = simulator.run(transpiled)
        result = job.result()
        
        statevector = result.get_statevector()
        probabilities = statevector.probabilities_dict()
        
        # Convert to JSON-serializable format
        sv_list = [[float(x.real), float(x.imag)] for x in statevector]
        prob_dict = {k: float(v) for k, v in probabilities.items()}
        
        return {
            "statevector": sv_list,
            "probabilities": prob_dict,
            "success": True,
        }
        
    except ImportError as e:
        return {
            "statevector": [],
            "probabilities": {},
            "success": False,
            "error": f"Qiskit not installed: {str(e)}",
        }
    except Exception as e:
        return {
            "statevector": [],
            "probabilities": {},
            "success": False,
            "error": f"Statevector error: {str(e)}",
        }
