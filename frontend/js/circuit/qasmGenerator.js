/* ============================================================
   qasmGenerator.js — Circuit Model → OpenQASM 2.0
   ============================================================
   PURPOSE:
     Converts the CircuitModel's gates array into a valid
     OpenQASM 2.0 string. This is the "GUI → Code" direction.

   RESPONSIBILITIES:
     - Generate the QASM header (version, include)
     - Declare quantum and classical registers
     - Convert each gate object to a QASM instruction
     - Handle parameterized gates (RX, RY, RZ, P)
     - Handle controlled gates (CX, CY, CZ, CCX)
     - Handle special gates (SWAP, Measure, Reset)
     - Sort gates by column (time-step) order

   DATA FLOW:
     CircuitModel.gates
       → qasmGenerator.generate(model)
       → OpenQASM 2.0 string

   HOW IT WORKS — STEP BY STEP:

     1. GUI: User places an H gate on q0
     2. Model: { type: "H", targets: [0], column: 0 }
     3. Generator reads the model
     4. Output: "h q[0];"

     For controlled gates:
     1. GUI: User places CX with control q0, target q7
     2. Model: { type: "CX", controls: [0], targets: [7], column: 1 }
     3. Generator reads controls and targets
     4. Output: "cx q[0],q[7];"
   ============================================================ */

/**
 * QASMGenerator — Converts a CircuitModel to OpenQASM 2.0.
 */
export class QASMGenerator {
  constructor() {
    // Mapping from gate type to QASM instruction name
    this.gateMap = {
      H:       'h',
      X:       'x',
      Y:       'y',
      Z:       'z',
      S:       's',
      SDG:     'sdg',
      T:       't',
      TDG:     'tdg',
      P:       'p',
      RX:      'rx',
      RY:      'ry',
      RZ:      'rz',
      CX:      'cx',
      CY:      'cy',
      CZ:      'cz',
      CCX:     'ccx',
      SWAP:    'swap',
      MEASURE: 'measure',
      RESET:   'reset',
    };
  }

  /**
   * Generate a complete OpenQASM 2.0 string from the model.
   *
   * @param {CircuitModel} model — The circuit data model
   * @returns {string} — Valid OpenQASM 2.0 source code
   *
   * @example
   *   const qasm = generator.generate(model);
   *   // Returns:
   *   // OPENQASM 2.0;
   *   // include "qelib1.inc";
   *   // qreg q[8];
   *   // creg c[8];
   *   // h q[0];
   *   // cx q[0],q[7];
   */
  generate(model) {
    const lines = [];

    // ── Header ──────────────────────────────────────────
    lines.push('OPENQASM 2.0;');
    lines.push('include "qelib1.inc";');
    lines.push('');

    // ── Register Declarations ───────────────────────────
    lines.push(`qreg q[${model.numQubits}];`);
    lines.push(`creg c[${model.numQubits}];`);
    lines.push('');

    // ── Gate Instructions ───────────────────────────────
    // Sort gates by column so they appear in time order
    const sortedGates = model.getGatesSortedByColumn();

    for (const gate of sortedGates) {
      const instruction = this._gateToQASM(gate);
      if (instruction) {
        lines.push(instruction);
      }
    }

    // ── Trailing Newline ────────────────────────────────
    lines.push('');
    return lines.join('\n');
  }

  /**
   * Convert a single gate object to a QASM instruction string.
   *
   * @param {Object} gate — Gate object from the model
   * @returns {string|null} — QASM instruction or null if unknown
   *
   * EXAMPLES:
   *
   *   { type: "H", targets: [0] }
   *   → "h q[0];"
   *
   *   { type: "CX", controls: [0], targets: [7] }
   *   → "cx q[0],q[7];"
   *
   *   { type: "RX", targets: [2], params: { theta: 1.5708 } }
   *   → "rx(1.5708) q[2];"
   *
   *   { type: "CCX", controls: [0, 1], targets: [2] }
   *   → "ccx q[0],q[1],q[2];"
   *
   *   { type: "SWAP", targets: [2, 5] }
   *   → "swap q[2],q[5];"
   *
   *   { type: "MEASURE", targets: [0] }
   *   → "measure q[0] -> c[0];"
   *
   *   { type: "RESET", targets: [3] }
   *   → "reset q[3];"
   */
  _gateToQASM(gate) {
    const qasmName = this.gateMap[gate.type];
    if (!qasmName) {
      // Handle QFT and IQFT as gate sequences
      if (gate.type === 'QFT') return this._generateQFT(gate);
      if (gate.type === 'IQFT') return this._generateIQFT(gate);
      return null;
    }

    // ── Measure: special syntax ─────────────────────────
    if (gate.type === 'MEASURE') {
      const t = gate.targets[0];
      return `measure q[${t}] -> c[${t}];`;
    }

    // ── Reset: simple syntax ────────────────────────────
    if (gate.type === 'RESET') {
      return `reset q[${gate.targets[0]}];`;
    }

    // ── Parameterized gates: rx(theta) q[n]; ────────────
    if (gate.params && gate.params.theta !== undefined) {
      const t = gate.targets[0];
      return `${qasmName}(${gate.params.theta}) q[${t}];`;
    }

    // ── Controlled gates: cx q[c],q[t]; ─────────────────
    if (gate.controls.length > 0) {
      const allQubits = [...gate.controls, ...gate.targets];
      const qubitArgs = allQubits.map(q => `q[${q}]`).join(',');
      return `${qasmName} ${qubitArgs};`;
    }

    // ── SWAP: swap q[a],q[b]; ───────────────────────────
    if (gate.type === 'SWAP') {
      const qubitArgs = gate.targets.map(q => `q[${q}]`).join(',');
      return `${qasmName} ${qubitArgs};`;
    }

    // ── Single-qubit gates: h q[n]; ─────────────────────
    if (gate.targets.length === 1) {
      return `${qasmName} q[${gate.targets[0]}];`;
    }

    // ── Multi-target (shouldn't normally happen) ────────
    return gate.targets.map(t => `${qasmName} q[${t}];`).join('\n');
  }

  /**
   * Generate QFT decomposition as a comment + gate sequence.
   * QFT on qubit n uses H and controlled phase gates.
   * For simplicity, we emit it as a comment block.
   */
  _generateQFT(gate) {
    const t = gate.targets[0];
    return `// QFT on q[${t}]\nh q[${t}];`;
  }

  /**
   * Generate Inverse QFT decomposition.
   */
  _generateIQFT(gate) {
    const t = gate.targets[0];
    return `// IQFT on q[${t}]\nh q[${t}];`;
  }
}
