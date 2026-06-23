/* ============================================================
   circuitModel.js — Core Data Model
   ============================================================
   PURPOSE:
     This is the HEART of the entire application. Every gate
     placed on the circuit lives here as a JavaScript object.
     The UI reads from this model. The QASM generator reads
     from this model. The simulator reads from this model.
     Everything flows through circuitModel.

   RESPONSIBILITIES:
     - Store all gates in the circuit
     - Provide add/remove/move/update operations
     - Maintain undo/redo history
     - Emit "circuit-changed" events so the UI stays in sync
     - Track the number of columns (dynamic)

   DATA FLOW:
     User drops gate → gatePlacement.js calls model.addGate()
     → model stores gate → model emits "circuit-changed"
     → circuitRenderer.js re-renders → qasmGenerator.js updates QASM

   GATE OBJECT STRUCTURE:
     {
       id:       "gate_1687456789_0",   // unique identifier
       type:     "CX",                   // gate type (H, X, CX, etc.)
       controls: [0],                    // control qubit indices (for controlled gates)
       targets:  [7],                    // target qubit indices
       column:   5,                      // time-step column (0-indexed)
       params:   { theta: 1.5708 }       // parameters (for RX, RY, RZ, P gates)
     }

     FIELD EXPLANATIONS:
       id       — A unique string so we can identify, select, and remove
                   individual gates. Generated using timestamp + counter.
       type     — The gate type string (uppercase). Maps directly to
                   QASM instructions: "H" → h, "CX" → cx, etc.
       controls — Array of qubit indices that act as controls.
                   Empty for single-qubit gates like H, X.
                   [0] for CX with control on q0.
                   [0, 1] for CCX with controls on q0, q1.
       targets  — Array of qubit indices that the gate acts on.
                   [3] for H on q3.
                   [7] for CX target on q7.
                   [2, 5] for SWAP between q2 and q5.
       column   — The time-step column in the circuit grid.
                   Column 0 is the leftmost. Columns grow rightward.
       params   — Object holding gate parameters.
                   Empty {} for most gates.
                   { theta: 1.5708 } for RX(π/2).
   ============================================================ */

// ── Constants ───────────────────────────────────────────────
const NUM_QUBITS = 8;
const INITIAL_COLUMNS = 12;
const MAX_UNDO_STACK = 50;

// ── Gate Definitions (metadata) ─────────────────────────────
// This table tells us which gates need controls, targets, params
export const GATE_DEFS = {
  // Single-qubit gates (no controls, one target)
  H:       { label: 'H',    qubits: 1, hasControls: false, hasParams: false, category: 'single' },
  X:       { label: 'X',    qubits: 1, hasControls: false, hasParams: false, category: 'single' },
  Y:       { label: 'Y',    qubits: 1, hasControls: false, hasParams: false, category: 'single' },
  Z:       { label: 'Z',    qubits: 1, hasControls: false, hasParams: false, category: 'single' },
  S:       { label: 'S',    qubits: 1, hasControls: false, hasParams: false, category: 'single' },
  SDG:     { label: 'S†',   qubits: 1, hasControls: false, hasParams: false, category: 'single' },
  T:       { label: 'T',    qubits: 1, hasControls: false, hasParams: false, category: 'single' },
  TDG:     { label: 'T†',   qubits: 1, hasControls: false, hasParams: false, category: 'single' },
  P:       { label: 'P',    qubits: 1, hasControls: false, hasParams: true,  category: 'single', paramNames: ['theta'] },

  // Rotation gates (single-qubit, parameterized)
  RX:      { label: 'RX',   qubits: 1, hasControls: false, hasParams: true,  category: 'rotation', paramNames: ['theta'] },
  RY:      { label: 'RY',   qubits: 1, hasControls: false, hasParams: true,  category: 'rotation', paramNames: ['theta'] },
  RZ:      { label: 'RZ',   qubits: 1, hasControls: false, hasParams: true,  category: 'rotation', paramNames: ['theta'] },

  // Controlled gates (one control, one target)
  CX:      { label: 'CX',   qubits: 2, hasControls: true,  hasParams: false, category: 'controlled', numControls: 1 },
  CY:      { label: 'CY',   qubits: 2, hasControls: true,  hasParams: false, category: 'controlled', numControls: 1 },
  CZ:      { label: 'CZ',   qubits: 2, hasControls: true,  hasParams: false, category: 'controlled', numControls: 1 },

  // Special gates
  SWAP:    { label: '×',    qubits: 2, hasControls: false, hasParams: false, category: 'special', isSwap: true },
  MEASURE: { label: 'M',    qubits: 1, hasControls: false, hasParams: false, category: 'special' },
  RESET:   { label: '|0⟩',  qubits: 1, hasControls: false, hasParams: false, category: 'special' },

  // Advanced gates
  CCX:     { label: 'CCX',  qubits: 3, hasControls: true,  hasParams: false, category: 'advanced', numControls: 2 },
  QFT:     { label: 'QFT',  qubits: 1, hasControls: false, hasParams: false, category: 'advanced' },
  IQFT:    { label: 'IQFT', qubits: 1, hasControls: false, hasParams: false, category: 'advanced' },
};

// ── CircuitModel Class ──────────────────────────────────────
export class CircuitModel {
  constructor() {
    /** @type {Array<Object>} All gates in the circuit */
    this.gates = [];

    /** @type {number} Number of qubits (fixed at 8) */
    this.numQubits = NUM_QUBITS;

    /** @type {number} Number of columns currently visible */
    this.numColumns = INITIAL_COLUMNS;

    /** @type {Array<Array<Object>>} Undo stack — each entry is a snapshot */
    this.undoStack = [];

    /** @type {Array<Array<Object>>} Redo stack */
    this.redoStack = [];

    /** @type {number} Counter for generating unique IDs */
    this._idCounter = 0;

    /** @type {EventTarget} Custom event dispatcher */
    this._eventTarget = new EventTarget();
  }

  // ── Event System ────────────────────────────────────────
  /**
   * Listen for model changes.
   * @param {string} event - Event name (e.g., "circuit-changed")
   * @param {Function} callback - Handler function
   */
  on(event, callback) {
    this._eventTarget.addEventListener(event, callback);
  }

  /**
   * Remove an event listener.
   */
  off(event, callback) {
    this._eventTarget.removeEventListener(event, callback);
  }

  /**
   * Emit a custom event.
   * @param {string} event - Event name
   * @param {Object} detail - Data to pass with the event
   */
  _emit(event, detail = {}) {
    this._eventTarget.dispatchEvent(
      new CustomEvent(event, { detail })
    );
  }

  // ── ID Generation ───────────────────────────────────────
  /**
   * Generate a unique gate ID.
   * @returns {string} Unique ID like "gate_1687456789_3"
   */
  _generateId() {
    return `gate_${Date.now()}_${this._idCounter++}`;
  }

  // ── Undo/Redo ───────────────────────────────────────────
  /**
   * Save current state to the undo stack.
   * Called before every mutation.
   */
  _saveSnapshot() {
    // Deep-clone the gates array
    const snapshot = JSON.parse(JSON.stringify(this.gates));
    this.undoStack.push(snapshot);

    // Limit stack size
    if (this.undoStack.length > MAX_UNDO_STACK) {
      this.undoStack.shift();
    }

    // Any new action clears the redo stack
    this.redoStack = [];
  }

  /**
   * Undo the last action.
   * @returns {boolean} True if undo was performed
   */
  undo() {
    if (this.undoStack.length === 0) return false;

    // Save current state to redo stack
    this.redoStack.push(JSON.parse(JSON.stringify(this.gates)));

    // Restore previous state
    this.gates = this.undoStack.pop();
    this._updateColumnCount();
    this._emit('circuit-changed', { action: 'undo' });
    return true;
  }

  /**
   * Redo the last undone action.
   * @returns {boolean} True if redo was performed
   */
  redo() {
    if (this.redoStack.length === 0) return false;

    // Save current state to undo stack
    this.undoStack.push(JSON.parse(JSON.stringify(this.gates)));

    // Restore redo state
    this.gates = this.redoStack.pop();
    this._updateColumnCount();
    this._emit('circuit-changed', { action: 'redo' });
    return true;
  }

  /** @returns {boolean} Whether undo is available */
  canUndo() { return this.undoStack.length > 0; }

  /** @returns {boolean} Whether redo is available */
  canRedo() { return this.redoStack.length > 0; }

  // ── Gate Operations ─────────────────────────────────────

  /**
   * Add a gate to the circuit.
   *
   * @param {Object} gateData - Gate data (without id)
   * @param {string} gateData.type - Gate type (e.g., "H", "CX")
   * @param {number[]} gateData.targets - Target qubit indices
   * @param {number[]} [gateData.controls] - Control qubit indices
   * @param {number} gateData.column - Column index
   * @param {Object} [gateData.params] - Gate parameters
   * @returns {Object} The created gate object (with id)
   *
   * @example
   *   model.addGate({ type: 'H', targets: [0], column: 0 });
   *   model.addGate({ type: 'CX', controls: [0], targets: [7], column: 1 });
   *   model.addGate({ type: 'RX', targets: [2], column: 3, params: { theta: 1.5708 } });
   */
  addGate(gateData) {
    this._saveSnapshot();

    const gate = {
      id:       this._generateId(),
      type:     gateData.type,
      controls: gateData.controls || [],
      targets:  gateData.targets || [],
      column:   gateData.column,
      params:   gateData.params || {},
    };

    this.gates.push(gate);
    this._updateColumnCount();
    this._emit('circuit-changed', { action: 'add', gate });
    return gate;
  }

  /**
   * Remove a gate by its ID.
   * @param {string} gateId - The gate's unique ID
   * @returns {boolean} True if gate was found and removed
   */
  removeGate(gateId) {
    const index = this.gates.findIndex(g => g.id === gateId);
    if (index === -1) return false;

    this._saveSnapshot();
    const [removed] = this.gates.splice(index, 1);
    this._updateColumnCount();
    this._emit('circuit-changed', { action: 'remove', gate: removed });
    return true;
  }

  /**
   * Move a gate to a new position (column and/or qubit).
   * @param {string} gateId - The gate's unique ID
   * @param {number} newColumn - New column index
   * @param {number[]} newTargets - New target qubit indices
   * @param {number[]} [newControls] - New control qubit indices
   * @returns {boolean} True if gate was moved
   */
  moveGate(gateId, newColumn, newTargets, newControls) {
    const gate = this.gates.find(g => g.id === gateId);
    if (!gate) return false;

    this._saveSnapshot();
    gate.column = newColumn;
    gate.targets = newTargets;
    if (newControls !== undefined) {
      gate.controls = newControls;
    }
    this._updateColumnCount();
    this._emit('circuit-changed', { action: 'move', gate });
    return true;
  }

  /**
   * Update gate parameters (e.g., rotation angle).
   * @param {string} gateId - The gate's unique ID
   * @param {Object} params - New parameters
   * @returns {boolean} True if gate was updated
   */
  updateGateParams(gateId, params) {
    const gate = this.gates.find(g => g.id === gateId);
    if (!gate) return false;

    this._saveSnapshot();
    gate.params = { ...gate.params, ...params };
    this._emit('circuit-changed', { action: 'update', gate });
    return true;
  }

  /**
   * Get a gate by its ID.
   * @param {string} gateId
   * @returns {Object|null}
   */
  getGate(gateId) {
    return this.gates.find(g => g.id === gateId) || null;
  }

  /**
   * Get all gates at a specific cell (column, qubit).
   * Checks both controls and targets arrays.
   * @param {number} column
   * @param {number} qubit
   * @returns {Array<Object>}
   */
  getGatesAt(column, qubit) {
    return this.gates.filter(g =>
      g.column === column &&
      (g.targets.includes(qubit) || g.controls.includes(qubit))
    );
  }

  /**
   * Get all gates in a specific column.
   * @param {number} column
   * @returns {Array<Object>}
   */
  getGatesInColumn(column) {
    return this.gates.filter(g => g.column === column);
  }

  /**
   * Check if a cell is occupied by any gate.
   * @param {number} column
   * @param {number} qubit
   * @returns {boolean}
   */
  isCellOccupied(column, qubit) {
    return this.getGatesAt(column, qubit).length > 0;
  }

  /**
   * Clear all gates from the circuit.
   */
  clearAll() {
    if (this.gates.length === 0) return;

    this._saveSnapshot();
    this.gates = [];
    this.numColumns = INITIAL_COLUMNS;
    this._emit('circuit-changed', { action: 'clear' });
  }

  /**
   * Replace the entire gates array (used by QASM parser).
   * @param {Array<Object>} gates - New gates array
   */
  setGates(gates) {
    this._saveSnapshot();
    this.gates = gates.map(g => ({
      id:       g.id || this._generateId(),
      type:     g.type,
      controls: g.controls || [],
      targets:  g.targets || [],
      column:   g.column,
      params:   g.params || {},
    }));
    this._updateColumnCount();
    this._emit('circuit-changed', { action: 'set' });
  }

  /**
   * Get all gates sorted by column (for QASM generation).
   * @returns {Array<Object>}
   */
  getGatesSortedByColumn() {
    return [...this.gates].sort((a, b) => a.column - b.column);
  }

  /**
   * Get the maximum column index used.
   * @returns {number}
   */
  getMaxColumn() {
    if (this.gates.length === 0) return -1;
    return Math.max(...this.gates.map(g => g.column));
  }

  /**
   * Update numColumns to ensure we always have room for more gates.
   */
  _updateColumnCount() {
    const maxUsed = this.getMaxColumn();
    this.numColumns = Math.max(INITIAL_COLUMNS, maxUsed + 4);
  }

  /**
   * Export the model as a plain JSON-serializable object.
   * Used for saving circuits.
   * @returns {Object}
   */
  toJSON() {
    return {
      numQubits: this.numQubits,
      gates: JSON.parse(JSON.stringify(this.gates)),
    };
  }

  /**
   * Import from a JSON object (used for loading circuits).
   * @param {Object} data
   */
  fromJSON(data) {
    this.numQubits = data.numQubits || NUM_QUBITS;
    this.setGates(data.gates || []);
  }
}
