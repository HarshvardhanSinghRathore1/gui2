/* ============================================================
   qasmEditor.js — Right Panel QASM Editor
   ============================================================
   PURPOSE:
     Manages the OpenQASM code panel on the right side.
     - Auto-updates when the circuit model changes
     - Allows manual editing and applying QASM to the circuit

   RESPONSIBILITIES:
     - Listen to model changes → regenerate QASM → update textarea
     - Detect manual edits in the textarea
     - "Apply" button: parse textarea → update model
     - "Copy" button: copy QASM to clipboard
     - Show sync status (synced, modified, error)
     - Update line count display

   DATA FLOW:
     Model changes → qasmGenerator.generate() → textarea text
     User edits textarea → "Apply" → qasmParser.parse() → model.setGates()

   INTERACTIONS:
     - Listens to: CircuitModel "circuit-changed"
     - Uses: QASMGenerator to generate QASM
     - Uses: QASMParser to parse QASM
     - Updates: CircuitModel via setGates()
   ============================================================ */

/**
 * QASMEditor — Manages the QASM code panel.
 */
export class QASMEditor {
  /**
   * @param {CircuitModel} model
   * @param {QASMGenerator} generator
   * @param {QASMParser} parser
   */
  constructor(model, generator, parser) {
    /** @type {CircuitModel} */
    this.model = model;

    /** @type {QASMGenerator} */
    this.generator = generator;

    /** @type {QASMParser} */
    this.parser = parser;

    // ── DOM References ──────────────────────────────────
    this.textarea   = document.getElementById('qasm-textarea');
    this.btnCopy    = document.getElementById('btn-copy-qasm');
    this.btnApply   = document.getElementById('btn-apply-qasm');
    this.statusDot  = document.getElementById('qasm-status-dot');
    this.statusText = document.getElementById('qasm-status-text');
    this.lineCount  = document.getElementById('qasm-line-count');

    // ── State ───────────────────────────────────────────
    /** @type {boolean} Whether the textarea was manually edited */
    this._isManuallyEdited = false;

    /** @type {string} Last auto-generated QASM (to detect manual changes) */
    this._lastGeneratedQASM = '';

    // ── Bind Events ─────────────────────────────────────
    this._setupEventListeners();

    // ── Listen to Model ─────────────────────────────────
    this.model.on('circuit-changed', () => this._onModelChanged());

    // ── Initial Update ──────────────────────────────────
    this._onModelChanged();
  }

  // ── Event Listeners ─────────────────────────────────────
  _setupEventListeners() {
    // Detect manual edits
    this.textarea.addEventListener('input', () => {
      if (this.textarea.value !== this._lastGeneratedQASM) {
        this._isManuallyEdited = true;
        this._setStatus('modified', 'Modified — click Apply');
      }
      this._updateLineCount();
    });

    // Copy button
    this.btnCopy.addEventListener('click', () => this._copyToClipboard());

    // Apply button
    this.btnApply.addEventListener('click', () => this._applyQASM());
  }

  // ── Model Change Handler ────────────────────────────────
  /**
   * Called when the circuit model changes.
   * Regenerates QASM and updates the textarea.
   */
  _onModelChanged() {
    // Only auto-update if user hasn't manually edited
    if (this._isManuallyEdited) return;

    const qasm = this.generator.generate(this.model);
    this._lastGeneratedQASM = qasm;
    this.textarea.value = qasm;
    this._setStatus('synced', 'Synced');
    this._updateLineCount();
  }

  // ── Apply QASM to Circuit ──────────────────────────────
  /**
   * Parse the textarea content and update the circuit model.
   */
  _applyQASM() {
    const qasmText = this.textarea.value;

    // Parse the QASM
    const result = this.parser.parse(qasmText);

    if (result.errors.length > 0) {
      // Show first error
      this._setStatus('error', `Error: ${result.errors[0]}`);
      console.warn('QASM parse errors:', result.errors);
      return;
    }

    // Update the model
    this.model.setGates(result.gates);

    // Reset manual edit state
    this._isManuallyEdited = false;
    this._lastGeneratedQASM = this.textarea.value;
    this._setStatus('synced', 'Applied & Synced');
  }

  // ── Copy to Clipboard ──────────────────────────────────
  async _copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.textarea.value);
      this.btnCopy.textContent = '✅ Copied!';
      setTimeout(() => {
        this.btnCopy.textContent = '📋 Copy';
      }, 1500);
    } catch {
      // Fallback: select and copy
      this.textarea.select();
      document.execCommand('copy');
      this.btnCopy.textContent = '✅ Copied!';
      setTimeout(() => {
        this.btnCopy.textContent = '📋 Copy';
      }, 1500);
    }
  }

  // ── Status Display ──────────────────────────────────────
  /**
   * Update the sync status indicator.
   * @param {'synced'|'modified'|'error'} state
   * @param {string} text
   */
  _setStatus(state, text) {
    if (this.statusDot) {
      this.statusDot.className = `status-dot ${state}`;
    }
    if (this.statusText) {
      this.statusText.textContent = text;
    }
  }

  // ── Line Count ──────────────────────────────────────────
  _updateLineCount() {
    if (this.lineCount) {
      const lines = this.textarea.value.split('\n').length;
      this.lineCount.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Force a refresh of the QASM from the model.
   * Resets manual edit state.
   */
  forceRefresh() {
    this._isManuallyEdited = false;
    this._onModelChanged();
  }
}
