/* ============================================================
   app.js — Application Entry Point
   ============================================================
   PURPOSE:
     This is the main entry point that bootstraps the entire
     Quantum Studio application. It creates instances of all
     modules and wires them together.

   RESPONSIBILITIES:
     - Import all modules
     - Create the CircuitModel (data)
     - Create the CircuitRenderer (view)
     - Create the GatePlacement (drag-and-drop)
     - Create the GatePalette (sidebar)
     - Create the QASMGenerator and QASMParser
     - Create the QASMEditor (right panel)
     - Create the ProbabilityChart (bottom panel)
     - Create the BackendAPI (server communication)
     - Create the Toolbar (top actions)
     - Check backend connectivity on startup

   BOOTSTRAP ORDER:
     1. CircuitModel — Must be first (everything depends on it)
     2. QASMGenerator, QASMParser — Stateless converters
     3. BackendAPI — Network layer
     4. ProbabilityChart — Bottom panel (used by toolbar)
     5. CircuitRenderer — Renders the model to DOM
     6. GatePlacement — Needs model + renderer
     7. GatePalette — Needs placement (for drag sources)
     8. QASMEditor — Needs model + generator + parser
     9. Toolbar — Needs everything above

   DATA FLOW OVERVIEW:
     ┌──────────────┐
     │  GatePalette  │──drag──→┌──────────────┐
     └──────────────┘          │GatePlacement  │──addGate──→┌──────────────┐
                               └──────────────┘             │ CircuitModel │
     ┌──────────────┐                                       │  (THE HEART) │
     │   Toolbar     │──undo/redo/clear──────────────────→  │              │
     └──────────────┘                                       └──────┬───────┘
                                                                   │
                                          circuit-changed event    │
                                ┌──────────────────────────────────┘
                                ▼                    ▼                    ▼
                     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
                     │  Renderer    │    │ QASMEditor   │    │ QASMGenerator│
                     │  (re-draw)   │    │ (update text)│    │ (gen QASM)   │
                     └──────────────┘    └──────────────┘    └──────────────┘
   ============================================================ */

// ── Imports ─────────────────────────────────────────────────
import { CircuitModel }     from './models/circuitModel.js';
import { CircuitRenderer }  from './circuit/circuitRenderer.js';
import { GatePlacement }    from './circuit/gatePlacement.js';
import { QASMGenerator }    from './circuit/qasmGenerator.js';
import { QASMParser }       from './circuit/qasmParser.js';
import { GatePalette }      from './ui/gatePalette.js';
import { Toolbar }          from './ui/toolbar.js';
import { QASMEditor }       from './ui/qasmEditor.js';
import { ProbabilityChart } from './ui/probabilityChart.js';
import { BackendAPI }       from './api/backendAPI.js';

// ── Application Bootstrap ───────────────────────────────────
class QuantumStudioApp {
  constructor() {
    console.log('%c⚛ Quantum Studio', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
    console.log('%cInitializing...', 'color: #a0a0c0;');

    // ── Step 1: Core Data Model ─────────────────────────
    this.model = new CircuitModel();
    console.log('  ✓ CircuitModel created');

    // ── Step 2: Stateless Converters ────────────────────
    this.qasmGenerator = new QASMGenerator();
    this.qasmParser = new QASMParser();
    console.log('  ✓ QASM Generator & Parser created');

    // ── Step 3: Backend API ─────────────────────────────
    this.backendAPI = new BackendAPI('http://localhost:8000');
    console.log('  ✓ BackendAPI created');

    // ── Step 4: Probability Chart ───────────────────────
    this.chart = new ProbabilityChart();
    console.log('  ✓ ProbabilityChart created');

    // ── Step 5: Circuit Renderer ────────────────────────
    this.renderer = new CircuitRenderer(this.model);
    console.log('  ✓ CircuitRenderer created');

    // ── Step 6: Gate Placement ──────────────────────────
    this.placement = new GatePlacement(this.model, this.renderer);
    console.log('  ✓ GatePlacement created');

    // ── Step 7: Gate Palette ────────────────────────────
    this.palette = new GatePalette(this.placement);
    console.log('  ✓ GatePalette created');

    // ── Step 8: QASM Editor ─────────────────────────────
    this.qasmEditor = new QASMEditor(
      this.model,
      this.qasmGenerator,
      this.qasmParser
    );
    console.log('  ✓ QASMEditor created');

    // ── Step 9: Toolbar ─────────────────────────────────
    this.toolbar = new Toolbar(
      this.model,
      this.qasmGenerator,
      this.backendAPI,
      this.chart
    );
    console.log('  ✓ Toolbar created');

    // ── Step 10: Check Backend ──────────────────────────
    this._checkBackendConnection();

    // ── Done! ───────────────────────────────────────────
    console.log('%c⚛ Quantum Studio Ready!', 'color: #00dd88; font-size: 14px; font-weight: bold;');
  }

  /**
   * Check if the backend server is reachable.
   * Updates the status indicator accordingly.
   */
  async _checkBackendConnection() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    try {
      const healthy = await this.backendAPI.isHealthy();
      if (healthy) {
        if (statusDot) statusDot.className = 'toolbar-status-dot';
        if (statusText) statusText.textContent = 'Connected';
        console.log('  ✓ Backend connected');
      } else {
        throw new Error('Not healthy');
      }
    } catch {
      if (statusDot) statusDot.className = 'toolbar-status-dot disconnected';
      if (statusText) statusText.textContent = 'Offline mode';
      console.log('  ⚠ Backend offline — running in local mode');
    }
  }
}

// ── Initialize on DOM Ready ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  window.quantumStudio = new QuantumStudioApp();
});
