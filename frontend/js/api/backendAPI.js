/* ============================================================
   backendAPI.js — FastAPI Backend Communication
   ============================================================
   PURPOSE:
     Provides fetch() wrappers for all FastAPI backend endpoints.
     Handles request/response formatting, error handling, and
     provides a clean API for the rest of the frontend.

   RESPONSIBILITIES:
     - POST /run          → Run quantum simulation
     - POST /save         → Save circuit to database
     - GET  /load/:id     → Load a specific circuit
     - GET  /circuits     → List all saved circuits
     - POST /generate-qasm → Generate QASM on server
     - POST /parse-qasm   → Parse QASM on server

   DATA FLOW:
     Frontend module calls backendAPI.runCircuit(qasm)
       → fetch() POST to /run with JSON body
       → Backend processes with Qiskit
       → Returns { counts, shots } JSON
       → backendAPI returns parsed response

   INTERACTIONS:
     - Called by: toolbar.js (Run, Save, Load)
     - Backend: FastAPI server (default: http://localhost:8000)
   ============================================================ */

/**
 * BackendAPI — Fetch wrappers for the FastAPI backend.
 */
export class BackendAPI {
  /**
   * @param {string} [baseUrl='http://localhost:8000'] — Backend URL
   */
  constructor(baseUrl = 'http://localhost:8000') {
    /** @type {string} */
    this.baseUrl = baseUrl;
  }

  // ── Helper: Make a fetch request ────────────────────────
  /**
   * Send an HTTP request to the backend.
   *
   * @param {string} endpoint — API path (e.g., '/run')
   * @param {Object} options — fetch options
   * @returns {Promise<Object>} — Parsed JSON response
   * @throws {Error} — If the request fails
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, mergedOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      // If it's a network error (backend not running), throw
      // a more descriptive error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Backend server is not running. Start it with: uvicorn main:app --reload');
      }
      throw error;
    }
  }

  // ── Run Simulation ──────────────────────────────────────
  /**
   * Run a quantum circuit simulation.
   *
   * @param {string} qasm — OpenQASM 2.0 source code
   * @param {number} [shots=1024] — Number of simulation shots
   * @returns {Promise<{ counts: Object, shots: number }>}
   *
   * @example
   *   const result = await api.runCircuit('OPENQASM 2.0; ...', 1024);
   *   console.log(result.counts); // { "00000000": 512, "10000001": 512 }
   */
  async runCircuit(qasm, shots = 1024) {
    return this._request('/run', {
      method: 'POST',
      body: JSON.stringify({ qasm, shots }),
    });
  }

  // ── Save Circuit ────────────────────────────────────────
  /**
   * Save a circuit to the database.
   *
   * @param {string} name — Circuit name
   * @param {string} qasm — OpenQASM source code
   * @param {Object} modelJson — Circuit model JSON
   * @returns {Promise<{ id: number, message: string }>}
   */
  async saveCircuit(name, qasm, modelJson) {
    return this._request('/save', {
      method: 'POST',
      body: JSON.stringify({
        name,
        qasm,
        model_json: JSON.stringify(modelJson),
      }),
    });
  }

  // ── Load Circuit ────────────────────────────────────────
  /**
   * Load a specific circuit by ID.
   *
   * @param {number} circuitId — Circuit database ID
   * @returns {Promise<{ id, name, qasm, model, created_at }>}
   */
  async loadCircuit(circuitId) {
    return this._request(`/load/${circuitId}`, {
      method: 'GET',
    });
  }

  // ── List Circuits ───────────────────────────────────────
  /**
   * Get a list of all saved circuits.
   *
   * @returns {Promise<Array<{ id, name, created_at }>>}
   */
  async listCircuits() {
    return this._request('/circuits', {
      method: 'GET',
    });
  }

  // ── Generate QASM (server-side) ─────────────────────────
  /**
   * Generate QASM from a circuit model on the server.
   *
   * @param {Object} modelJson — Circuit model JSON
   * @returns {Promise<{ qasm: string }>}
   */
  async generateQASM(modelJson) {
    return this._request('/generate-qasm', {
      method: 'POST',
      body: JSON.stringify({ model_json: JSON.stringify(modelJson) }),
    });
  }

  // ── Parse QASM (server-side) ────────────────────────────
  /**
   * Parse QASM into a circuit model on the server.
   *
   * @param {string} qasm — OpenQASM source code
   * @returns {Promise<{ gates: Array, errors: Array, numQubits: number }>}
   */
  async parseQASM(qasm) {
    return this._request('/parse-qasm', {
      method: 'POST',
      body: JSON.stringify({ qasm }),
    });
  }

  // ── Health Check ────────────────────────────────────────
  /**
   * Check if the backend server is running.
   * @returns {Promise<boolean>}
   */
  async isHealthy() {
    try {
      await this._request('/health', { method: 'GET' });
      return true;
    } catch {
      return false;
    }
  }
}
