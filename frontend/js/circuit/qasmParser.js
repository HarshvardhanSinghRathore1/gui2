/* ============================================================
   qasmParser.js — OpenQASM 2.0 → Circuit Model
   ============================================================
   PURPOSE:
     Parses an OpenQASM 2.0 string and converts it back into
     an array of gate objects for the CircuitModel. This is
     the "Code → GUI" direction.

   RESPONSIBILITIES:
     - Parse the QASM header (version check)
     - Parse register declarations (qreg, creg)
     - Parse gate instructions into gate objects
     - Handle parameterized gates
     - Handle controlled gates
     - Handle SWAP, Measure, Reset
     - Assign column numbers (time-step ordering)
     - Report parsing errors

   DATA FLOW:
     OpenQASM 2.0 string
       → qasmParser.parse(qasmString)
       → Array of gate objects
       → model.setGates(gates)
       → Renderer re-renders

   HOW IT WORKS — STEP BY STEP:

     Input QASM:
       h q[0];
       cx q[0],q[7];

     Step 1: Tokenize each line
     Step 2: Match against known patterns
     Step 3: Create gate objects:
       { type: "H", targets: [0], column: 0 }
       { type: "CX", controls: [0], targets: [7], column: 1 }
     Step 4: Return the gates array
   ============================================================ */

/**
 * QASMParser — Converts OpenQASM 2.0 text to gate objects.
 */
export class QASMParser {
  constructor() {
    // ── Reverse mapping: QASM instruction → gate type ────
    this.instructionMap = {
      'h':       'H',
      'x':       'X',
      'y':       'Y',
      'z':       'Z',
      's':       'S',
      'sdg':     'SDG',
      't':       'T',
      'tdg':     'TDG',
      'p':       'P',
      'rx':      'RX',
      'ry':      'RY',
      'rz':      'RZ',
      'cx':      'CX',
      'cy':      'CY',
      'cz':      'CZ',
      'ccx':     'CCX',
      'swap':    'SWAP',
      'measure': 'MEASURE',
      'reset':   'RESET',
    };

    // ── Gate properties ──────────────────────────────────
    // How many qubits each gate uses, and which are controls
    this.gateProperties = {
      H:  { controls: 0, targets: 1 },
      X:  { controls: 0, targets: 1 },
      Y:  { controls: 0, targets: 1 },
      Z:  { controls: 0, targets: 1 },
      S:  { controls: 0, targets: 1 },
      SDG: { controls: 0, targets: 1 },
      T:  { controls: 0, targets: 1 },
      TDG: { controls: 0, targets: 1 },
      P:  { controls: 0, targets: 1, hasParams: true },
      RX: { controls: 0, targets: 1, hasParams: true },
      RY: { controls: 0, targets: 1, hasParams: true },
      RZ: { controls: 0, targets: 1, hasParams: true },
      CX: { controls: 1, targets: 1 },
      CY: { controls: 1, targets: 1 },
      CZ: { controls: 1, targets: 1 },
      CCX: { controls: 2, targets: 1 },
      SWAP: { controls: 0, targets: 2 },
      MEASURE: { controls: 0, targets: 1 },
      RESET: { controls: 0, targets: 1 },
    };
  }

  /**
   * Parse an OpenQASM 2.0 string into an array of gate objects.
   *
   * @param {string} qasmString — The QASM source code
   * @returns {{ gates: Array<Object>, errors: Array<string>, numQubits: number }}
   *
   * @example
   *   const result = parser.parse(`
   *     OPENQASM 2.0;
   *     include "qelib1.inc";
   *     qreg q[8];
   *     creg c[8];
   *     h q[0];
   *     cx q[0],q[7];
   *   `);
   *   // result.gates = [
   *   //   { type: "H", targets: [0], controls: [], column: 0, params: {} },
   *   //   { type: "CX", targets: [7], controls: [0], column: 1, params: {} },
   *   // ]
   */
  parse(qasmString) {
    const gates = [];
    const errors = [];
    let numQubits = 8;  // default
    let columnCounter = 0;

    // Track which qubits are used in each column to assign columns properly
    const columnUsage = [];  // columnUsage[col] = Set of qubit indices

    const lines = qasmString.split('\n');

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      let line = lines[lineNum].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('//') || line.startsWith('/*')) continue;

      // Remove trailing semicolons and whitespace
      line = line.replace(/;$/, '').trim();

      // ── Header lines ────────────────────────────────
      if (line.startsWith('OPENQASM')) continue;
      if (line.startsWith('include')) continue;

      // ── Register declarations ───────────────────────
      const qregMatch = line.match(/^qreg\s+\w+\[(\d+)\]/);
      if (qregMatch) {
        numQubits = parseInt(qregMatch[1]);
        continue;
      }
      if (line.startsWith('creg')) continue;

      // ── Barrier ─────────────────────────────────────
      if (line.startsWith('barrier')) continue;

      // ── Gate instructions ───────────────────────────
      const gateResult = this._parseGateInstruction(line, lineNum);
      if (gateResult.error) {
        errors.push(`Line ${lineNum + 1}: ${gateResult.error}`);
        continue;
      }
      if (gateResult.gate) {
        // Assign column: find the first column where none of the
        // involved qubits are already used
        const involvedQubits = [...gateResult.gate.controls, ...gateResult.gate.targets];
        let col = 0;
        while (true) {
          if (!columnUsage[col]) columnUsage[col] = new Set();
          const conflict = involvedQubits.some(q => columnUsage[col].has(q));
          if (!conflict) break;
          col++;
        }
        // Mark qubits as used in this column
        if (!columnUsage[col]) columnUsage[col] = new Set();
        involvedQubits.forEach(q => columnUsage[col].add(q));

        gateResult.gate.column = col;
        gates.push(gateResult.gate);
      }
    }

    return { gates, errors, numQubits };
  }

  /**
   * Parse a single gate instruction line.
   *
   * @param {string} line — The instruction (without semicolon)
   * @param {number} lineNum — Line number for error reporting
   * @returns {{ gate: Object|null, error: string|null }}
   *
   * SUPPORTED PATTERNS:
   *   "h q[0]"                → H on q0
   *   "rx(1.5708) q[0]"      → RX(1.5708) on q0
   *   "cx q[0],q[7]"         → CX: control q0, target q7
   *   "ccx q[0],q[1],q[2]"   → CCX: controls q0,q1, target q2
   *   "swap q[2],q[5]"       → SWAP q2, q5
   *   "measure q[0] -> c[0]" → Measure q0
   *   "reset q[3]"           → Reset q3
   */
  _parseGateInstruction(line, lineNum) {
    // ── Measure: "measure q[n] -> c[n]" ─────────────────
    const measureMatch = line.match(/^measure\s+q\[(\d+)\]\s*->\s*c\[(\d+)\]/);
    if (measureMatch) {
      return {
        gate: {
          type: 'MEASURE',
          controls: [],
          targets: [parseInt(measureMatch[1])],
          params: {},
        },
        error: null,
      };
    }

    // ── Reset: "reset q[n]" ─────────────────────────────
    const resetMatch = line.match(/^reset\s+q\[(\d+)\]/);
    if (resetMatch) {
      return {
        gate: {
          type: 'RESET',
          controls: [],
          targets: [parseInt(resetMatch[1])],
          params: {},
        },
        error: null,
      };
    }

    // ── Parameterized: "rx(theta) q[n]" ─────────────────
    const paramMatch = line.match(/^(\w+)\(([\d.e\-+]+)\)\s+(.+)/);
    if (paramMatch) {
      const instrName = paramMatch[1].toLowerCase();
      const theta = parseFloat(paramMatch[2]);
      const qubitsStr = paramMatch[3];

      const gateType = this.instructionMap[instrName];
      if (!gateType) {
        return { gate: null, error: `Unknown gate: ${instrName}` };
      }

      const qubits = this._parseQubitArgs(qubitsStr);
      if (!qubits) {
        return { gate: null, error: `Invalid qubit arguments: ${qubitsStr}` };
      }

      return {
        gate: {
          type: gateType,
          controls: [],
          targets: qubits,
          params: { theta },
        },
        error: null,
      };
    }

    // ── Standard: "gatename q[a],q[b],..." ──────────────
    const standardMatch = line.match(/^(\w+)\s+(.+)/);
    if (standardMatch) {
      const instrName = standardMatch[1].toLowerCase();
      const qubitsStr = standardMatch[2];

      const gateType = this.instructionMap[instrName];
      if (!gateType) {
        return { gate: null, error: `Unknown gate: ${instrName}` };
      }

      const qubits = this._parseQubitArgs(qubitsStr);
      if (!qubits) {
        return { gate: null, error: `Invalid qubit arguments: ${qubitsStr}` };
      }

      const props = this.gateProperties[gateType];
      if (!props) {
        return { gate: null, error: `Unknown gate properties: ${gateType}` };
      }

      // Split qubits into controls and targets
      const controls = qubits.slice(0, props.controls);
      const targets = qubits.slice(props.controls);

      return {
        gate: {
          type: gateType,
          controls,
          targets,
          params: {},
        },
        error: null,
      };
    }

    return { gate: null, error: `Could not parse: ${line}` };
  }

  /**
   * Parse qubit arguments like "q[0],q[7]" into [0, 7].
   *
   * @param {string} str — Qubit arguments string
   * @returns {number[]|null} — Array of qubit indices, or null on error
   */
  _parseQubitArgs(str) {
    const matches = str.match(/q\[(\d+)\]/g);
    if (!matches) return null;

    return matches.map(m => {
      const numMatch = m.match(/\[(\d+)\]/);
      return numMatch ? parseInt(numMatch[1]) : NaN;
    }).filter(n => !isNaN(n));
  }
}
