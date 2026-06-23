/* ============================================================
   circuitRenderer.js — DOM-Based Circuit Rendering
   ============================================================
   PURPOSE:
     Reads the CircuitModel and renders the circuit as a DOM
     grid. Each qubit is a row, each time-step is a column.
     Gates appear as colored boxes. Controlled gates show
     control dots and vertical connection lines via SVG.

   RESPONSIBILITIES:
     - Create the grid of cells (8 rows × N columns)
     - Render qubit labels (q0–q7)
     - Place gate elements on occupied cells
     - Draw SVG lines for non-adjacent controlled gates
     - Update when the model emits "circuit-changed"
     - Show/hide the empty-state hint

   DATA FLOW:
     CircuitModel emits "circuit-changed"
       → circuitRenderer.render() is called
       → DOM is updated to reflect current model state

   INTERACTIONS:
     - Listens to: CircuitModel "circuit-changed"
     - Provides: DOM elements for gatePlacement.js drop targets
     - Reads: GATE_DEFS from circuitModel.js
   ============================================================ */

import { GATE_DEFS } from '../models/circuitModel.js';

// ── Constants ───────────────────────────────────────────────
const CELL_SIZE = 48;   // px — matches CSS grid cell size

/**
 * CircuitRenderer — Renders the circuit grid to the DOM.
 */
export class CircuitRenderer {
  /**
   * @param {CircuitModel} model — The circuit data model
   */
  constructor(model) {
    /** @type {CircuitModel} */
    this.model = model;

    // ── DOM References ──────────────────────────────────────
    this.container   = document.getElementById('circuit-container');
    this.gridEl      = document.getElementById('circuit-grid');
    this.labelsEl    = document.getElementById('qubit-labels');
    this.svgOverlay  = document.getElementById('circuit-svg-overlay');
    this.emptyHint   = document.getElementById('circuit-empty-hint');

    // ── State ───────────────────────────────────────────────
    /** @type {string|null} Currently selected gate ID */
    this.selectedGateId = null;

    // ── Bind to Model ───────────────────────────────────────
    this.model.on('circuit-changed', () => this.render());

    // ── Initial Render ──────────────────────────────────────
    this._renderQubitLabels();
    this.render();
  }

  // ── Qubit Labels ────────────────────────────────────────
  /**
   * Render the q0–q7 labels on the left edge.
   * Called once during initialization.
   */
  _renderQubitLabels() {
    this.labelsEl.innerHTML = '';
    for (let q = 0; q < this.model.numQubits; q++) {
      const label = document.createElement('div');
      label.className = 'qubit-label';
      label.innerHTML = `<span>q</span>${q}`;
      this.labelsEl.appendChild(label);
    }
  }

  // ── Main Render ─────────────────────────────────────────
  /**
   * Full re-render of the circuit grid.
   * Called whenever the model changes.
   */
  render() {
    this._renderGrid();
    this._renderGates();
    this._renderControlLines();
    this._updateEmptyHint();
  }

  // ── Grid Cells ──────────────────────────────────────────
  /**
   * Create the grid of empty cells (drop targets).
   * 8 rows (qubits) × numColumns columns.
   */
  _renderGrid() {
    this.gridEl.innerHTML = '';
    this.gridEl.style.gridTemplateColumns = `repeat(${this.model.numColumns}, ${CELL_SIZE}px)`;

    for (let col = 0; col < this.model.numColumns; col++) {
      for (let row = 0; row < this.model.numQubits; row++) {
        const cell = document.createElement('div');
        cell.className = 'circuit-cell';
        cell.dataset.col = col;
        cell.dataset.row = row;
        cell.id = `cell-${col}-${row}`;

        // CSS Grid placement: column-start / row-start
        cell.style.gridColumn = col + 1;
        cell.style.gridRow    = row + 1;

        this.gridEl.appendChild(cell);
      }
    }
  }

  // ── Gate Elements ───────────────────────────────────────
  /**
   * Place gate elements on their respective cells.
   */
  _renderGates() {
    for (const gate of this.model.gates) {
      const def = GATE_DEFS[gate.type];
      if (!def) continue;

      // Render target(s)
      for (const target of gate.targets) {
        const cell = this._getCell(gate.column, target);
        if (!cell) continue;

        const gateEl = document.createElement('div');
        gateEl.className = 'circuit-gate';
        gateEl.dataset.type = gate.type;
        gateEl.dataset.gateId = gate.id;
        gateEl.id = `gate-${gate.id}`;

        // Gate label
        let label = def.label;
        if (gate.type === 'MEASURE') {
          label = 'M';
        } else if (gate.type === 'SWAP') {
          label = '×';
        }

        // Show parameter value if present
        if (def.hasParams && gate.params.theta !== undefined) {
          const angle = gate.params.theta;
          // Show as fraction of π if close
          const piLabel = this._formatAngle(angle);
          gateEl.innerHTML = `<span>${label}</span><span style="font-size:9px;opacity:0.7;">${piLabel}</span>`;
          gateEl.style.flexDirection = 'column';
          gateEl.style.gap = '0';
        } else {
          gateEl.textContent = label;
        }

        // Selection highlight
        if (gate.id === this.selectedGateId) {
          gateEl.classList.add('selected');
        }

        // Click to select/delete
        gateEl.addEventListener('click', (e) => {
          e.stopPropagation();
          this._onGateClick(gate.id);
        });

        // Right-click to delete
        gateEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.model.removeGate(gate.id);
        });

        cell.appendChild(gateEl);
      }

      // Render control dots (for controlled gates)
      for (const control of gate.controls) {
        const cell = this._getCell(gate.column, control);
        if (!cell) continue;

        const dot = document.createElement('div');
        dot.className = 'control-dot';
        dot.dataset.gateId = gate.id;
        cell.appendChild(dot);
      }
    }
  }

  // ── Control Lines (SVG) ─────────────────────────────────
  /**
   * Draw vertical lines between control dots and target gates.
   * Uses SVG overlay for clean rendering across non-adjacent qubits.
   */
  _renderControlLines() {
    // Clear previous lines
    this.svgOverlay.innerHTML = '';

    // Size SVG to match grid
    const gridRect = this.gridEl.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    this.svgOverlay.setAttribute('width', this.gridEl.scrollWidth);
    this.svgOverlay.setAttribute('height', this.gridEl.scrollHeight);
    this.svgOverlay.style.left = this.gridEl.offsetLeft + 'px';
    this.svgOverlay.style.top = this.gridEl.offsetTop + 'px';

    for (const gate of this.model.gates) {
      if (gate.controls.length === 0) continue;

      // Find all qubits involved (controls + targets)
      const allQubits = [...gate.controls, ...gate.targets];
      const minQubit = Math.min(...allQubits);
      const maxQubit = Math.max(...allQubits);

      // Calculate pixel positions
      // Column center x = column * CELL_SIZE + CELL_SIZE/2
      // Qubit center y  = qubit * CELL_SIZE + CELL_SIZE/2
      const x = gate.column * CELL_SIZE + CELL_SIZE / 2;
      const y1 = minQubit * CELL_SIZE + CELL_SIZE / 2;
      const y2 = maxQubit * CELL_SIZE + CELL_SIZE / 2;

      // Draw vertical line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y2);
      this.svgOverlay.appendChild(line);

      // Draw control dots as SVG circles
      for (const control of gate.controls) {
        const cy = control * CELL_SIZE + CELL_SIZE / 2;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', 6);
        this.svgOverlay.appendChild(circle);
      }
    }
  }

  // ── Gate Click Handler ──────────────────────────────────
  /**
   * Handle clicking on a gate (select/deselect).
   * Double-click or clicking selected gate removes it.
   */
  _onGateClick(gateId) {
    if (this.selectedGateId === gateId) {
      // Clicking the already-selected gate → delete it
      this.model.removeGate(gateId);
      this.selectedGateId = null;
    } else {
      // Select this gate
      this.selectedGateId = gateId;
      this.render();
    }
  }

  /**
   * Deselect the currently selected gate.
   */
  deselectGate() {
    if (this.selectedGateId) {
      this.selectedGateId = null;
      this.render();
    }
  }

  // ── Empty State Hint ────────────────────────────────────
  _updateEmptyHint() {
    if (this.emptyHint) {
      this.emptyHint.style.display =
        this.model.gates.length === 0 ? 'block' : 'none';
    }
  }

  // ── Utility: Get Cell Element ───────────────────────────
  /**
   * @param {number} col
   * @param {number} row
   * @returns {HTMLElement|null}
   */
  _getCell(col, row) {
    return document.getElementById(`cell-${col}-${row}`);
  }

  // ── Utility: Format Angle ─────────────────────────────
  /**
   * Format a radian angle as a human-readable string.
   * @param {number} theta — Angle in radians
   * @returns {string}
   */
  _formatAngle(theta) {
    const PI = Math.PI;
    const fractions = [
      [PI, 'π'], [PI/2, 'π/2'], [PI/4, 'π/4'], [PI/3, 'π/3'],
      [PI/6, 'π/6'], [PI/8, 'π/8'],
      [2*PI, '2π'], [3*PI/2, '3π/2'], [3*PI/4, '3π/4'],
    ];
    for (const [val, label] of fractions) {
      if (Math.abs(theta - val) < 0.0001) return label;
      if (Math.abs(theta + val) < 0.0001) return '-' + label;
    }
    return theta.toFixed(2);
  }
}
