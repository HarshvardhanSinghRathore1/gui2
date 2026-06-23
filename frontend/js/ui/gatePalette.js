/* ============================================================
   gatePalette.js — Sidebar Gate Card Renderer
   ============================================================
   PURPOSE:
     Renders the gate palette in the left sidebar. Gates are
     organized by category (Single, Rotation, Controlled,
     Special, Advanced). Each gate is a draggable card.

   RESPONSIBILITIES:
     - Render gate cards grouped by category
     - Set up drag sources on each card
     - Wire up to GatePlacement for drag-and-drop

   DATA FLOW:
     GATE_DEFS (static data)
       → gatePalette.render()
       → DOM cards in #gate-palette
       → GatePlacement.setupDragSource() on each card

   INTERACTIONS:
     - Reads: GATE_DEFS from circuitModel.js
     - Calls: GatePlacement.setupDragSource() for each card
   ============================================================ */

import { GATE_DEFS } from '../models/circuitModel.js';

/**
 * GatePalette — Renders the gate palette sidebar.
 */
export class GatePalette {
  /**
   * @param {GatePlacement} placement — The gate placement handler
   */
  constructor(placement) {
    /** @type {GatePlacement} */
    this.placement = placement;

    /** @type {HTMLElement} */
    this.container = document.getElementById('gate-palette');

    // ── Gate Categories (display order) ─────────────────
    this.categories = [
      {
        title: 'Single Qubit',
        gates: ['H', 'X', 'Y', 'Z', 'S', 'SDG', 'T', 'TDG', 'P'],
      },
      {
        title: 'Rotation',
        gates: ['RX', 'RY', 'RZ'],
      },
      {
        title: 'Controlled',
        gates: ['CX', 'CY', 'CZ'],
      },
      {
        title: 'Special',
        gates: ['SWAP', 'MEASURE', 'RESET'],
      },
      {
        title: 'Advanced',
        gates: ['CCX', 'QFT', 'IQFT'],
      },
    ];

    // ── Render ───────────────────────────────────────────
    this.render();
  }

  /**
   * Render all gate categories and cards into the sidebar.
   */
  render() {
    this.container.innerHTML = '';

    for (const category of this.categories) {
      // ── Category container ────────────────────────────
      const categoryEl = document.createElement('div');
      categoryEl.className = 'gate-category';

      // ── Category title ────────────────────────────────
      const titleEl = document.createElement('div');
      titleEl.className = 'gate-category-title';
      titleEl.textContent = category.title;
      categoryEl.appendChild(titleEl);

      // ── Gate grid ─────────────────────────────────────
      const gridEl = document.createElement('div');
      gridEl.className = 'gate-grid';

      for (const gateType of category.gates) {
        const def = GATE_DEFS[gateType];
        if (!def) continue;

        // ── Gate card ─────────────────────────────────
        const card = document.createElement('div');
        card.className = 'gate-card';
        card.dataset.gate = gateType;
        card.id = `palette-${gateType}`;

        // Gate icon (the letter)
        const iconEl = document.createElement('div');
        iconEl.className = 'gate-icon';
        iconEl.textContent = def.label;
        card.appendChild(iconEl);

        // Gate label (small text below)
        const labelEl = document.createElement('div');
        labelEl.className = 'gate-label';
        labelEl.textContent = gateType;
        card.appendChild(labelEl);

        // Tooltip with description
        const tooltip = document.createElement('div');
        tooltip.className = 'gate-tooltip';
        tooltip.textContent = this._getGateDescription(gateType);
        card.appendChild(tooltip);

        // Make draggable
        this.placement.setupDragSource(card, gateType);

        gridEl.appendChild(card);
      }

      categoryEl.appendChild(gridEl);
      this.container.appendChild(categoryEl);
    }
  }

  /**
   * Get a short description for a gate type.
   * Used in the tooltip on hover.
   *
   * @param {string} gateType
   * @returns {string}
   */
  _getGateDescription(gateType) {
    const descriptions = {
      H:       'Hadamard — Creates superposition',
      X:       'Pauli-X — Bit flip (NOT)',
      Y:       'Pauli-Y — Bit + phase flip',
      Z:       'Pauli-Z — Phase flip',
      S:       'S gate — √Z phase',
      SDG:     'S† gate — Inverse S',
      T:       'T gate — π/8 phase',
      TDG:     'T† gate — Inverse T',
      P:       'Phase gate — Custom phase rotation',
      RX:      'X-axis rotation',
      RY:      'Y-axis rotation',
      RZ:      'Z-axis rotation',
      CX:      'CNOT — Controlled NOT',
      CY:      'Controlled Y',
      CZ:      'Controlled Z',
      SWAP:    'Swap two qubits',
      MEASURE: 'Measure qubit',
      RESET:   'Reset to |0⟩',
      CCX:     'Toffoli — Double controlled NOT',
      QFT:     'Quantum Fourier Transform',
      IQFT:    'Inverse QFT',
    };
    return descriptions[gateType] || gateType;
  }
}
