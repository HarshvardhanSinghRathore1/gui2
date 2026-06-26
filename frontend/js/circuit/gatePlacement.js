/* ============================================================
   gatePlacement.js — Drag-and-Drop Gate Placement
   ============================================================
   PURPOSE:
     Handles the entire drag-and-drop workflow:
     1. User drags a gate card from the palette
     2. Gate card is dragged over the circuit grid
     3. User drops the gate onto a specific cell
     4. Gate is created in the CircuitModel

   RESPONSIBILITIES:
     - Set up drag events on gate palette cards
     - Set up drop zone events on circuit grid cells
     - Validate drop positions (no overlapping gates)
     - Handle controlled gates (CX, CY, CZ, CCX):
       First drop = control qubit, second drop = target qubit
     - Handle SWAP gates: two targets needed
     - Handle parameterized gates: prompt for angle value
     - Snap-to-grid alignment

   DATA FLOW:
     Palette dragstart → User drags over grid →
     Grid cell dragover (highlight) → Grid cell drop →
     gatePlacement creates gate in CircuitModel →
     Model emits "circuit-changed" → Renderer re-renders

   INTERACTIONS:
     - Reads: GATE_DEFS from circuitModel.js
     - Writes to: CircuitModel.addGate()
     - Uses: Parameter modal for RX, RY, RZ, P gates
   ============================================================ */

import { GATE_DEFS } from '../models/circuitModel.js';

/**
 * GatePlacement — Manages drag-and-drop gate placement.
 */
export class GatePlacement {
  /**
   * @param {CircuitModel} model — The circuit data model
   * @param {CircuitRenderer} renderer — The circuit renderer
   */
  constructor(model, renderer) {
    /** @type {CircuitModel} */
    this.model = model;

    /** @type {CircuitRenderer} */
    this.renderer = renderer;

    // ── Drag State ──────────────────────────────────────────
    /** @type {string|null} Gate type being dragged */
    this._draggedGateType = null;

    /** @type {Object|null} Pending multi-qubit placement state */
    this._pendingPlacement = null;
    // For controlled gates: { type, column, control, ... }
    // For SWAP: { type, column, target1, ... }

    // ── Initialize ──────────────────────────────────────────
    this._setupGridDropZone();

    // Re-attach events when grid is re-rendered
    this.model.on('circuit-changed', () => {
      this._setupGridDropZone();
    });
  }

  // ── Palette Drag Source ─────────────────────────────────
  /**
   * Make a gate card draggable.
   * Called by gatePalette.js for each gate card.
   *
   * @param {HTMLElement} cardEl — The gate card DOM element
   * @param {string} gateType — Gate type string (e.g., "H", "CX")
   */
  setupDragSource(cardEl, gateType) {
    cardEl.setAttribute('draggable', 'true');

    cardEl.addEventListener('dragstart', (e) => {
      console.log('DRAGSTART:', gateType);
      this._draggedGateType = gateType;
      e.dataTransfer.setData('text/plain', gateType);
      e.dataTransfer.effectAllowed = 'copy';

      // Add visual feedback to the card
      cardEl.classList.add('dragging');

      // Create a custom drag image
      const ghost = document.createElement('div');
      ghost.className = 'gate-drag-ghost';
      ghost.textContent = GATE_DEFS[gateType]?.label || gateType;
      ghost.style.position = 'absolute';
      ghost.style.top = '-1000px';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 22, 22);

      // Clean up ghost after drag
      setTimeout(() => ghost.remove(), 0);
    });

    cardEl.addEventListener('dragend', () => {
      this._draggedGateType = null;
      cardEl.classList.remove('dragging');
      this._clearHighlights();
    });
  }

  // ── Grid Drop Zone ──────────────────────────────────────
  /**
   * Attach dragover/drop events to all circuit grid cells.
   */
  _setupGridDropZone() {
    const cells = document.querySelectorAll('.circuit-cell');

    cells.forEach(cell => {
      // Prevent default to allow drop
      cell.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        // Visual feedback
        this._clearHighlights();
        const col = parseInt(cell.dataset.col);
        const row = parseInt(cell.dataset.row);

        if (this._canDrop(col, row)) {
          cell.classList.add('drag-over');
        } else {
          cell.classList.add('invalid-drop');
        }
      });

      cell.addEventListener('dragleave', () => {
        cell.classList.remove('drag-over', 'invalid-drop');
      });

      cell.addEventListener('drop', (e) => {
        e.preventDefault();
        this._clearHighlights();

        const col = parseInt(cell.dataset.col);
        const row = parseInt(cell.dataset.row);
        const gateType = e.dataTransfer.getData('text/plain') || this._draggedGateType;
        console.log('DROP:', { gateType, col, row, textPlain: e.dataTransfer.getData('text/plain'), _draggedGateType: this._draggedGateType });

        if (!gateType) return;

        this._handleDrop(gateType, col, row);
        this._draggedGateType = null;
      });

      // Also allow click-to-place when in pending state
      cell.addEventListener('click', () => {
        const col = parseInt(cell.dataset.col);
        const row = parseInt(cell.dataset.row);
        console.log('CELL CLICK:', { col, row, hasPending: !!this._pendingPlacement, pending: this._pendingPlacement });
        if (this._pendingPlacement) {
          this._completePendingPlacement(col, row);
        }
      });
    });
  }

  // ── Drop Handling ───────────────────────────────────────
  /**
   * Handle a gate being dropped on a cell.
   * Routes to the correct handler based on gate type.
   *
   * @param {string} gateType — Gate type string
   * @param {number} col — Column index
   * @param {number} row — Qubit index
   */
  _handleDrop(gateType, col, row) {
    console.log('_handleDrop called:', { gateType, col, row, canDrop: this._canDrop(col, row) });
    if (!this._canDrop(col, row)) {
      console.log('Cannot drop at', col, row);
      return;
    }

    const def = GATE_DEFS[gateType];
    if (!def) {
      console.log('No definition for', gateType);
      return;
    }

    // ── Single-qubit gates ────────────────────────────────
    if (!def.hasControls && !def.isSwap && def.qubits === 1) {
      if (def.hasParams) {
        // Parameterized gate — show parameter modal
        this._promptForParameter(gateType, col, row);
      } else {
        // Simple single-qubit gate
        this.model.addGate({
          type: gateType,
          targets: [row],
          column: col,
        });
      }
      return;
    }

    // ── Controlled gates (CX, CY, CZ) ────────────────────
    if (def.hasControls && def.numControls === 1) {
      // First drop = control qubit
      this._pendingPlacement = {
        type: gateType,
        column: col,
        controls: [row],
        numTargetsNeeded: 1,
        targets: [],
      };
      this._showPendingMessage(`Click a target qubit for ${gateType}`);
      return;
    }

    // ── CCX (Toffoli) — 2 controls, 1 target ─────────────
    if (def.hasControls && def.numControls === 2) {
      this._pendingPlacement = {
        type: gateType,
        column: col,
        controls: [row],
        numControlsNeeded: 2,
        numTargetsNeeded: 1,
        targets: [],
        phase: 'control2', // next click is second control
      };
      this._showPendingMessage(`Click second control qubit for ${gateType}`);
      return;
    }

    // ── SWAP gate — 2 targets ─────────────────────────────
    if (def.isSwap) {
      this._pendingPlacement = {
        type: gateType,
        column: col,
        controls: [],
        targets: [row],
        numTargetsNeeded: 2,
      };
      this._showPendingMessage('Click second qubit for SWAP');
      return;
    }
  }

  /**
   * Complete a pending multi-qubit gate placement.
   */
  _completePendingPlacement(col, row) {
    console.log('_completePendingPlacement called:', { col, row, pending: this._pendingPlacement });
    const p = this._pendingPlacement;
    if (!p) return;

    // Don't allow same qubit
    if (p.controls.includes(row) || p.targets.includes(row)) {
      this._showPendingMessage('Cannot use the same qubit twice!');
      return;
    }

    // CCX: need second control first, then target
    if (p.phase === 'control2') {
      p.controls.push(row);
      p.phase = 'target';
      this._showPendingMessage(`Click target qubit for ${p.type}`);
      return;
    }

    // Add as target
    p.targets.push(row);

    // Check if we have enough targets
    if (p.targets.length >= p.numTargetsNeeded) {
      // Create the gate
      this.model.addGate({
        type: p.type,
        controls: p.controls,
        targets: p.targets,
        column: p.column,
      });
      this._pendingPlacement = null;
      this._hidePendingMessage();
    }
  }

  /**
   * Prompt the user for a parameter value (for RX, RY, RZ, P).
   */
  _promptForParameter(gateType, col, row) {
    const modal = document.getElementById('modal-param');
    const titleEl = document.getElementById('param-modal-title');
    const input = document.getElementById('param-input');
    const confirmBtn = document.getElementById('modal-param-confirm');
    const cancelBtn = document.getElementById('modal-param-cancel');

    titleEl.textContent = `${gateType} Gate — Enter Angle`;
    input.value = '';
    input.placeholder = 'Angle in radians (e.g., 1.5708 for π/2)';
    modal.style.display = 'flex';
    input.focus();

    const cleanup = () => {
      modal.style.display = 'none';
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      input.removeEventListener('keydown', onKeydown);
    };

    const onConfirm = () => {
      const theta = parseFloat(input.value);
      if (!isNaN(theta)) {
        this.model.addGate({
          type: gateType,
          targets: [row],
          column: col,
          params: { theta },
        });
      }
      cleanup();
    };

    const onCancel = () => cleanup();

    const onKeydown = (e) => {
      if (e.key === 'Enter') onConfirm();
      if (e.key === 'Escape') onCancel();
    };

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    input.addEventListener('keydown', onKeydown);
  }

  // ── Validation ──────────────────────────────────────────
  /**
   * Check if a gate can be dropped at the given cell.
   * @param {number} col — Column index
   * @param {number} row — Qubit index
   * @returns {boolean}
   */
  _canDrop(col, row) {
    // Cell must not be occupied
    return !this.model.isCellOccupied(col, row);
  }

  // ── Visual Helpers ──────────────────────────────────────
  /**
   * Clear all drag-over highlights.
   */
  _clearHighlights() {
    document.querySelectorAll('.drag-over, .invalid-drop').forEach(el => {
      el.classList.remove('drag-over', 'invalid-drop');
    });
  }

  /**
   * Show a pending placement message in the status bar.
   */
  _showPendingMessage(msg) {
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');
    if (statusText) statusText.textContent = msg;
    if (statusDot) {
      statusDot.style.background = 'var(--accent-orange)';
      statusDot.style.boxShadow = '0 0 6px rgba(255,136,68,0.5)';
    }
  }

  /**
   * Hide the pending placement message.
   */
  _hidePendingMessage() {
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');
    if (statusText) statusText.textContent = 'Ready';
    if (statusDot) {
      statusDot.style.background = '';
      statusDot.style.boxShadow = '';
    }
  }

  /**
   * Cancel any pending multi-qubit placement.
   */
  cancelPending() {
    this._pendingPlacement = null;
    this._hidePendingMessage();
  }
}
