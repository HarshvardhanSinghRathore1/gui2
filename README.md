# ⚛ Quantum Studio — Complete Beginner's Guide & Course

> **An 8-qubit quantum circuit editor inspired by IBM Quantum Composer.**
> Build professional quantum circuits with drag-and-drop, simulate them with Qiskit, and learn quantum computing along the way.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Prerequisites & Quick Start](#2-prerequisites--quick-start)
3. [Project Structure](#3-project-structure)
4. [Technology Primer](#4-technology-primer)
   - [What is HTML?](#what-is-html)
   - [What is CSS?](#what-is-css)
   - [What is JavaScript?](#what-is-javascript)
   - [What is FastAPI?](#what-is-fastapi)
   - [What is Qiskit?](#what-is-qiskit)
   - [What is OpenQASM?](#what-is-openqasm)
5. [Frontend Foundations](#5-frontend-foundations)
   - [HTML Deep Dive](#html-deep-dive)
   - [CSS Deep Dive](#css-deep-dive)
   - [JavaScript Deep Dive](#javascript-deep-dive)
6. [Component Deep-Dives](#6-component-deep-dives)
   - [index.html](#indexhtml)
   - [main.css](#maincss)
   - [toolbar.js](#toolbarjs)
   - [gatePalette.js](#gatepalettejs)
   - [circuitRenderer.js](#circuitrendererjs)
   - [gatePlacement.js](#gateplacementjs)
   - [qasmGenerator.js](#qasmgeneratorjs)
   - [qasmParser.js](#qasmparserjs)
   - [probabilityChart.js](#probabilitychartjs)
   - [backendAPI.js](#backendapijs)
7. [Circuit Model Explained](#7-circuit-model-explained)
8. [Non-Adjacent Controlled Gates](#8-non-adjacent-controlled-gates)
9. [QASM Generator Flow](#9-qasm-generator-flow)
10. [QASM Parser Flow](#10-qasm-parser-flow)
11. [Backend Deep-Dive](#11-backend-deep-dive)
12. [Database Schema](#12-database-schema)
13. [Qiskit Integration](#13-qiskit-integration)
14. [Development Roadmap](#14-development-roadmap)
15. [Glossary](#15-glossary)

---

## 1. Introduction

**Quantum Studio** is a browser-based quantum circuit editor that lets you:

- **Drag and drop** quantum gates onto an 8-qubit circuit
- **Visualize** non-adjacent controlled gates with connection lines
- **Generate OpenQASM** code in real-time as you build circuits
- **Parse OpenQASM** code back into visual circuits
- **Simulate** circuits using IBM's Qiskit framework
- **See probability distributions** of quantum measurement outcomes
- **Save and load** circuits for later use

### Why This Project?

Learning quantum computing is hard. Learning web development is also hard. This project teaches you **both** at the same time by building something real and useful. Every line of code is documented. Every concept is explained.

### What Does "Inspired by IBM Quantum Composer" Mean?

IBM Quantum Composer is a professional tool used by researchers and students to build quantum circuits visually. Our Quantum Studio has the same core features:

- Horizontal qubit wires
- Drag-and-drop gate placement
- Real-time QASM generation
- Simulation results visualization

---

## 2. Prerequisites & Quick Start

### What You Need

- **A web browser** (Chrome, Firefox, Edge — any modern browser)
- **Python 3.10+** (for the backend and Qiskit)
- **A text editor** (VS Code recommended)

### Quick Start

```bash
# 1. Clone or download the project
cd quantum-studio

# 2. Start the frontend (any simple HTTP server)
cd frontend
python -m http.server 3000
# Open http://localhost:3000

# 3. In a new terminal, start the backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

> **Note:** The frontend works even without the backend! It runs in "offline mode" with mock simulation results. The backend adds real Qiskit simulation and database storage.

---

## 3. Project Structure

```
quantum-studio/
│
├── README.md                    ← You are here
│
├── frontend/                    ← Everything the browser loads
│   │
│   ├── index.html               ← The single HTML page
│   │
│   ├── css/                     ← All stylesheets
│   │   ├── main.css             ← Design tokens, reset, theme
│   │   ├── layout.css           ← CSS Grid layout
│   │   ├── toolbar.css          ← Top toolbar styles
│   │   ├── gates.css            ← Gate palette cards
│   │   ├── circuit.css          ← Circuit grid and wires
│   │   ├── qasm.css             ← QASM editor panel
│   │   └── chart.css            ← Probability chart
│   │
│   └── js/                      ← All JavaScript modules
│       ├── app.js               ← Entry point (bootstraps everything)
│       │
│       ├── models/
│       │   └── circuitModel.js  ← THE HEART — gate data storage
│       │
│       ├── circuit/
│       │   ├── circuitRenderer.js ← Renders model to DOM
│       │   ├── gatePlacement.js   ← Drag-and-drop logic
│       │   ├── qasmGenerator.js   ← Model → QASM text
│       │   └── qasmParser.js      ← QASM text → Model
│       │
│       ├── ui/
│       │   ├── toolbar.js         ← Button handlers
│       │   ├── gatePalette.js     ← Sidebar gate cards
│       │   ├── qasmEditor.js      ← Right panel QASM editor
│       │   └── probabilityChart.js← Chart.js integration
│       │
│       └── api/
│           └── backendAPI.js      ← Fetch wrappers for FastAPI
│
└── backend/                     ← Python server
    ├── main.py                  ← FastAPI app & endpoints
    ├── simulator.py             ← Qiskit simulation
    ├── database.py              ← SQLite operations
    ├── qasm_parser.py           ← Server-side QASM parser
    ├── qasm_generator.py        ← Server-side QASM generator
    ├── models.py                ← SQL table definitions
    ├── schemas.py               ← Pydantic validation models
    └── requirements.txt         ← Python dependencies
```

---

## 4. Technology Primer

### What is HTML?

**HTML** (HyperText Markup Language) is the skeleton of every web page. It defines the **structure** — what elements exist on the page.

```html
<!-- This is an HTML element -->
<button id="btn-run" class="toolbar-btn">
  Run
</button>
```

Key concepts:
- **Elements** are defined by tags: `<div>`, `<button>`, `<input>`
- **Attributes** give elements metadata: `id="btn-run"`, `class="toolbar-btn"`
- **Nesting** creates parent-child relationships
- The browser reads HTML top-to-bottom and builds a tree (the DOM)

### What is CSS?

**CSS** (Cascading Style Sheets) makes HTML look beautiful. It controls **colors, sizes, fonts, layouts, and animations**.

```css
/* This CSS rule styles all elements with class "toolbar-btn" */
.toolbar-btn {
  background: linear-gradient(135deg, #00d4ff, #4488ff);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  transition: transform 0.15s ease;
}

.toolbar-btn:hover {
  transform: translateY(-1px);  /* lifts up slightly on hover */
}
```

Key concepts:
- **Selectors** target elements: `.class`, `#id`, `element`
- **Properties** change appearance: `color`, `background`, `padding`
- **Flexbox** and **Grid** control layout
- **Transitions** and **animations** add motion

### What is JavaScript?

**JavaScript** makes web pages interactive. It handles **user input, data manipulation, and dynamic updates**.

```javascript
// When user clicks "Run", simulate the circuit
document.getElementById('btn-run').addEventListener('click', () => {
  const qasm = qasmGenerator.generate(model);
  backendAPI.runCircuit(qasm).then(result => {
    chart.updateResults(result.counts);
  });
});
```

Key concepts:
- **Variables** store data: `let`, `const`
- **Functions** are reusable blocks of code
- **Objects** group related data: `{ type: "H", target: 0 }`
- **Arrays** are ordered lists: `[gate1, gate2, gate3]`
- **Events** respond to user actions: clicks, drags, key presses
- **Modules** split code into files: `import`, `export`

### What is FastAPI?

**FastAPI** is a Python web framework for building APIs (Application Programming Interfaces).

```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/run")
async def run_simulation(request: RunRequest):
    result = simulate_circuit(request.qasm, request.shots)
    return result
```

Key concepts:
- **Endpoints** are URL paths that accept requests: `/run`, `/save`
- **HTTP methods** define the action: `GET` (read), `POST` (create)
- **Request bodies** contain data from the frontend (JSON)
- **Response bodies** contain data sent back (JSON)
- **Pydantic** validates incoming data automatically

### What is Qiskit?

**Qiskit** is IBM's open-source quantum computing SDK for Python.

```python
from qiskit import QuantumCircuit

# Create a 2-qubit circuit
qc = QuantumCircuit(2, 2)

# Apply gates
qc.h(0)        # Hadamard on qubit 0 → creates superposition
qc.cx(0, 1)    # CNOT: control=0, target=1 → creates entanglement

# Measure
qc.measure([0, 1], [0, 1])

# This creates a Bell state: |00⟩ + |11⟩ (50/50)
```

Key concepts:
- **QuantumCircuit** — The circuit object
- **Gates** — Operations on qubits (H, X, CX, etc.)
- **Measure** — Collapses quantum state to classical bits
- **AerSimulator** — Simulates circuits on your CPU
- **Counts** — How many times each outcome occurred

### What is OpenQASM?

**OpenQASM** (Open Quantum Assembly Language) is a text format for describing quantum circuits. It's like Assembly language for quantum computers.

```
OPENQASM 2.0;
include "qelib1.inc";

qreg q[8];    // 8 quantum bits
creg c[8];    // 8 classical bits

h q[0];       // Hadamard on qubit 0
cx q[0],q[7]; // CNOT: control q0, target q7
measure q[0] -> c[0];  // Measure qubit 0
measure q[7] -> c[7];  // Measure qubit 7
```

Key concepts:
- **OPENQASM 2.0** — Version declaration
- **qreg** — Quantum register (declares qubits)
- **creg** — Classical register (stores measurement results)
- **Gate instructions** — `h q[0];`, `cx q[0],q[7];`
- **measure** — Reads a qubit's state into a classical bit

---

## 5. Frontend Foundations

### HTML Deep Dive

#### Elements Used in Quantum Studio

| Element | Purpose | Example |
|---------|---------|---------|
| `<div>` | Generic container | `<div class="gate-card">` |
| `<button>` | Clickable action | `<button id="btn-run">Run</button>` |
| `<input>` | Text input | `<input type="text" id="save-name">` |
| `<textarea>` | Multi-line text | `<textarea id="qasm-textarea">` |
| `<header>` | Top section | `<header id="toolbar">` |
| `<aside>` | Side panel | `<aside id="sidebar">` |
| `<main>` | Primary content | `<main id="circuit-area">` |
| `<section>` | Content group | `<section id="qasm-panel">` |
| `<canvas>` | Drawing area | `<canvas id="probability-chart">` |
| `<svg>` | Vector graphics | `<svg class="circuit-svg-overlay">` |

#### Layout Structure

```html
<div id="app">
  <!--
    The #app div uses CSS Grid to create 5 regions:
    
    ┌──────────── TOOLBAR ─────────────┐
    │ SIDEBAR │   CIRCUIT   │   QASM   │
    │         │   EDITOR    │   EDITOR  │
    ├─────────┴─────────────┴──────────┤
    │        PROBABILITY CHART         │
    └──────────────────────────────────┘
  -->
  <header id="toolbar">...</header>
  <aside id="sidebar">...</aside>
  <main id="circuit-area">...</main>
  <section id="qasm-panel">...</section>
  <section id="chart-panel">...</section>
</div>
```

### CSS Deep Dive

#### CSS Custom Properties (Variables)

We define ALL design values in one place so changing the theme requires editing only `main.css`:

```css
:root {
  --bg-primary:    #0a0a14;     /* darkest background */
  --accent-cyan:   #00d4ff;     /* primary accent color */
  --font-ui:       'Inter', sans-serif;
  --radius-md:     8px;         /* standard border radius */
  --transition-fast: 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Used like this: */
.toolbar-btn {
  background: var(--bg-surface);     /* reads from the variable */
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}
```

#### Flexbox

Flexbox arranges items in a row or column:

```css
/* The toolbar uses flexbox to lay out buttons horizontally */
#toolbar {
  display: flex;          /* enable flexbox */
  align-items: center;    /* vertically center children */
  gap: 8px;               /* space between children */
}
```

#### CSS Grid

Grid creates 2D layouts:

```css
/* The app shell uses Grid for the 5-region layout */
#app {
  display: grid;
  grid-template-columns: 220px 1fr 300px;
  grid-template-rows: 52px 1fr 220px;
  grid-template-areas:
    "toolbar  toolbar  toolbar"
    "sidebar  circuit  qasm"
    "chart    chart    chart";
  height: 100vh;
}

/* Each child claims a named area */
#toolbar      { grid-area: toolbar; }
#sidebar      { grid-area: sidebar; }
#circuit-area { grid-area: circuit; }
#qasm-panel   { grid-area: qasm; }
#chart-panel  { grid-area: chart; }
```

#### Positioning

```css
/* The SVG overlay is positioned absolutely over the grid */
.circuit-svg-overlay {
  position: absolute;  /* removed from normal flow */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* clicks pass through to grid cells */
}
```

### JavaScript Deep Dive

#### Variables

```javascript
// const — value cannot be reassigned (use for most things)
const NUM_QUBITS = 8;
const model = new CircuitModel();

// let — value can be reassigned (use when value changes)
let selectedGateId = null;
selectedGateId = "gate_123";

// AVOID var — it has confusing scoping rules
```

#### Arrays

```javascript
// Arrays store ordered lists of items
const targets = [0, 7];        // qubit indices
const gates = [];               // empty array

// Add items
gates.push({ type: "H", target: 0 });

// Remove items
gates.splice(index, 1);         // remove 1 item at index

// Find items
const found = gates.find(g => g.id === "gate_123");

// Filter items
const columnGates = gates.filter(g => g.column === 5);

// Sort items
const sorted = gates.sort((a, b) => a.column - b.column);

// Check if item exists
const exists = targets.includes(7);  // true
```

#### Objects

```javascript
// Objects group related data with named keys
const gate = {
  id: "gate_1687456789_0",   // unique identifier
  type: "CX",                 // gate type
  controls: [0],              // control qubit(s)
  targets: [7],               // target qubit(s)
  column: 5,                  // time-step
  params: {},                 // parameters (empty for CX)
};

// Access values
console.log(gate.type);        // "CX"
console.log(gate.targets[0]);  // 7

// Modify values
gate.column = 6;

// Spread operator (shallow copy)
const copy = { ...gate, column: 10 };
```

#### Classes

```javascript
// Classes are blueprints for creating objects
class CircuitModel {
  constructor() {
    this.gates = [];        // instance property
    this.numQubits = 8;
  }

  addGate(gateData) {      // instance method
    this.gates.push(gateData);
  }

  getGateCount() {
    return this.gates.length;
  }
}

// Create an instance
const model = new CircuitModel();
model.addGate({ type: "H", targets: [0], column: 0 });
console.log(model.getGateCount());  // 1
```

#### Functions

```javascript
// Arrow functions (preferred for short operations)
const add = (a, b) => a + b;

// Regular functions (needed when using 'this')
function handleClick(event) {
  console.log(event.target.id);
}

// Async functions (for API calls)
async function runSimulation() {
  const response = await fetch('/run', { method: 'POST' });
  const data = await response.json();
  return data;
}
```

#### Modules (Import/Export)

```javascript
// circuitModel.js — EXPORTS
export class CircuitModel { ... }
export const GATE_DEFS = { ... };

// app.js — IMPORTS
import { CircuitModel, GATE_DEFS } from './models/circuitModel.js';

// To use modules, the script tag needs type="module":
// <script type="module" src="js/app.js"></script>
```

#### Events

```javascript
// DOM Events — respond to user actions

// Click event
button.addEventListener('click', () => {
  console.log('Button clicked!');
});

// Drag events (used for gate placement)
card.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', 'H');
});

cell.addEventListener('drop', (e) => {
  const gateType = e.dataTransfer.getData('text/plain');
  model.addGate({ type: gateType, targets: [row], column: col });
});

// Custom events (used for model → view communication)
const target = new EventTarget();
target.dispatchEvent(new CustomEvent('circuit-changed', { detail: { action: 'add' } }));
target.addEventListener('circuit-changed', (e) => {
  renderer.render();
});
```

---

## 6. Component Deep-Dives

### index.html

**Purpose:** The single HTML page that defines the entire application structure.

**Responsibilities:**
- Define the 5-region layout (toolbar, sidebar, circuit, QASM, chart)
- Load all CSS stylesheets
- Load Chart.js from CDN
- Load the main JavaScript entry point
- Define modal dialogs (save, load, parameter input)

**Key Sections:**
1. `<header id="toolbar">` — Action buttons (Run, Save, Load, etc.)
2. `<aside id="sidebar">` — Gate palette container
3. `<main id="circuit-area">` — Circuit grid and SVG overlay
4. `<section id="qasm-panel">` — QASM textarea and controls
5. `<section id="chart-panel">` — Chart.js canvas and summary

**Data Flow:** Static structure → CSS styles it → JavaScript populates it dynamically.

---

### main.css

**Purpose:** The design system foundation. Every color, font, spacing value, and shadow is defined here as CSS custom properties.

**Responsibilities:**
- Import Google Fonts (Inter for UI, JetBrains Mono for code)
- Define 60+ CSS custom properties (design tokens)
- CSS reset (normalize browser defaults)
- Global styles (body, links, buttons, inputs)
- Custom scrollbar styling
- Utility classes (`.visually-hidden`, `.glass`)
- Keyframe animations (`fadeIn`, `slideUp`, `pulse`)

**Why Custom Properties?**
Changing `--accent-cyan: #00d4ff` to `--accent-cyan: #ff4466` instantly recolors the ENTIRE application. This is the power of a design system.

---

### toolbar.js

**Purpose:** Wires up all toolbar button click handlers and keyboard shortcuts.

**Responsibilities:**
- Run → Calls `backendAPI.runCircuit()` → Updates chart
- Save → Shows modal → Calls `backendAPI.saveCircuit()` or localStorage
- Load → Shows modal → Lists circuits → Calls `model.fromJSON()`
- Clear → Confirms → Calls `model.clearAll()`
- Undo/Redo → Calls `model.undo()` / `model.redo()`
- Export → Generates QASM → Downloads as `.qasm` file
- Keyboard: Ctrl+Enter, Ctrl+S, Ctrl+Z, Ctrl+Y

**Data Flow:**
```
Button Click → toolbar handler
  → model.clearAll() (for Clear)
  → backendAPI.runCircuit(qasm) → chart.updateResults() (for Run)
  → qasmGenerator.generate(model) → download file (for Export)
```

**Functions:**
| Function | What It Does |
|----------|-------------|
| `runSimulation()` | Generates QASM, calls backend, updates chart |
| `saveCircuit()` | Shows save modal, saves to backend/localStorage |
| `loadCircuit()` | Shows load modal, loads circuit data into model |
| `exportQASM()` | Generates QASM, creates downloadable file |
| `_updateButtonStates()` | Enables/disables undo/redo buttons |
| `_generateMockResults()` | Creates fake results when backend is offline |

---

### gatePalette.js

**Purpose:** Renders the gate card sidebar and makes cards draggable.

**Responsibilities:**
- Render gate cards grouped by category
- Display gate icon (letter) and label
- Show tooltip with gate description on hover
- Make each card a drag source

**Categories:**
1. **Single Qubit:** H, X, Y, Z, S, S†, T, T†, P
2. **Rotation:** RX, RY, RZ
3. **Controlled:** CX, CY, CZ
4. **Special:** SWAP, Measure, Reset
5. **Advanced:** CCX, QFT, IQFT

**Data Flow:**
```
GATE_DEFS (static) → gatePalette.render() → DOM cards
  → GatePlacement.setupDragSource() on each card
  → Card is now draggable
```

---

### circuitRenderer.js

**Purpose:** Reads the CircuitModel and renders the circuit as DOM elements.

**Responsibilities:**
- Create the grid of cells (8 rows × N columns)
- Render qubit labels (q0–q7)
- Place gate elements on occupied cells
- Draw SVG lines for non-adjacent controlled gates
- Show/hide the empty-state hint
- Handle gate click (select) and right-click (delete)

**Data Flow:**
```
CircuitModel "circuit-changed" event
  → renderer.render()
  → _renderGrid()     — creates empty cells
  → _renderGates()    — places gate elements on cells
  → _renderControlLines() — draws SVG for CX/CY/CZ/CCX
  → _updateEmptyHint()
```

**Functions:**
| Function | What It Does |
|----------|-------------|
| `render()` | Full re-render of the circuit |
| `_renderGrid()` | Creates NxM grid of empty cells |
| `_renderGates()` | Places gate elements on cells |
| `_renderControlLines()` | Draws SVG lines for controlled gates |
| `_onGateClick()` | Select or delete a gate |
| `_formatAngle()` | Shows π/2 instead of 1.5708 |

---

### gatePlacement.js

**Purpose:** Handles the entire drag-and-drop workflow for placing gates.

**Responsibilities:**
- Set up drag events on palette cards
- Set up drop zone events on grid cells
- Validate drop positions (no overlapping)
- Multi-step placement for controlled gates
- Parameter input for rotation gates (RX, RY, RZ, P)

**How Multi-Step Placement Works:**

For a CX (CNOT) gate:
1. User drops CX on qubit 0 → "Click target qubit for CX"
2. User clicks qubit 7 → Gate created: `{ controls: [0], targets: [7] }`

For a CCX (Toffoli) gate:
1. User drops CCX on qubit 0 → "Click second control for CCX"
2. User clicks qubit 1 → "Click target qubit for CCX"
3. User clicks qubit 2 → Gate created: `{ controls: [0,1], targets: [2] }`

**Data Flow:**
```
dragstart on palette card → dragover on grid cell (highlight)
  → drop on grid cell → _handleDrop()
    → Single gate: model.addGate() immediately
    → Controlled gate: set _pendingPlacement, wait for click
    → Parameterized gate: show modal, then model.addGate()
```

---

### qasmGenerator.js

**Purpose:** Converts the CircuitModel's gates into OpenQASM 2.0 text.

**Responsibilities:**
- Generate QASM header (version, include)
- Declare registers (qreg, creg)
- Convert each gate to a QASM instruction
- Sort by column order

**Conversion Examples:**

```
GUI Action          → Model Object                          → QASM Output
─────────────────────────────────────────────────────────────────────────
Drop H on q0       → {type:"H", targets:[0]}               → h q[0];
Drop CX: q0→q7     → {type:"CX", controls:[0], targets:[7]}→ cx q[0],q[7];
Drop RX(π/2) on q2 → {type:"RX", targets:[2], params:{θ:1.57}} → rx(1.5708) q[2];
Drop CCX: q0,q1→q2 → {type:"CCX", controls:[0,1], targets:[2]} → ccx q[0],q[1],q[2];
SWAP q2↔q5          → {type:"SWAP", targets:[2,5]}          → swap q[2],q[5];
Measure q0         → {type:"MEASURE", targets:[0]}         → measure q[0] -> c[0];
```

---

### qasmParser.js

**Purpose:** Parses OpenQASM 2.0 text back into gate objects for the model.

**Responsibilities:**
- Parse QASM header (version check)
- Parse register declarations
- Parse gate instructions using regex
- Assign column numbers automatically
- Report errors

**Parse Examples:**

```
QASM Input              → Gate Object
──────────────────────────────────────────
h q[0];                 → {type:"H", targets:[0], column:0}
cx q[0],q[7];           → {type:"CX", controls:[0], targets:[7], column:1}
rx(1.5708) q[2];        → {type:"RX", targets:[2], params:{theta:1.5708}}
measure q[0] -> c[0];   → {type:"MEASURE", targets:[0]}
```

**Column Assignment Algorithm:**
Gates are assigned to the earliest column where none of their qubits are already used. This prevents visual overlaps.

---

### probabilityChart.js

**Purpose:** Displays simulation results as a Chart.js bar chart.

**Responsibilities:**
- Create/update Chart.js bar chart
- Calculate probabilities from raw counts
- Generate gradient bar colors (cyan → purple)
- Show top-5 states in the sidebar
- Handle empty state (no results yet)

**Data Flow:**
```
Backend returns: { counts: {"00000000": 520, "10000001": 504}, shots: 1024 }
  → chart.updateResults(counts, 1024)
  → Probabilities: {"00000000": 0.508, "10000001": 0.492}
  → Chart.js renders bars
  → Top states list shows most likely outcomes
```

---

### backendAPI.js

**Purpose:** Provides clean `fetch()` wrappers for all FastAPI endpoints.

**Responsibilities:**
- `runCircuit(qasm, shots)` → POST /run
- `saveCircuit(name, qasm, model)` → POST /save
- `loadCircuit(id)` → GET /load/:id
- `listCircuits()` → GET /circuits
- `generateQASM(model)` → POST /generate-qasm
- `parseQASM(qasm)` → POST /parse-qasm
- `isHealthy()` → GET /health

**Error Handling:**
If the backend is not running, the API throws a descriptive error. The toolbar catches this and falls back to offline mode (mock results + localStorage).

---

## 7. Circuit Model Explained

The CircuitModel is the **heart** of the entire application. It's the single source of truth for the circuit's state. Every other module either reads from it or writes to it.

### Gate Object Structure

```javascript
{
  id:       "gate_1687456789_0",   // unique identifier
  type:     "CX",                   // gate type string
  controls: [0],                    // control qubit indices
  targets:  [7],                    // target qubit indices
  column:   5,                      // time-step position
  params:   {}                      // gate parameters
}
```

### Field-by-Field Explanation

#### `id` — Unique Identifier
- **What:** A unique string like `"gate_1687456789_3"`
- **Why:** So we can identify, select, move, and delete individual gates
- **How:** Generated from timestamp + counter: `gate_${Date.now()}_${counter++}`
- **Used by:** Renderer (to create DOM elements), toolbar (to delete selected gate)

#### `type` — Gate Type
- **What:** Uppercase string matching QASM instruction
- **Why:** Determines the gate's behavior, color, and QASM output
- **Values:** `"H"`, `"X"`, `"Y"`, `"Z"`, `"S"`, `"SDG"`, `"T"`, `"TDG"`, `"P"`, `"RX"`, `"RY"`, `"RZ"`, `"CX"`, `"CY"`, `"CZ"`, `"SWAP"`, `"MEASURE"`, `"RESET"`, `"CCX"`, `"QFT"`, `"IQFT"`
- **Used by:** Renderer (to choose color), QASM generator (to choose instruction name)

#### `controls` — Control Qubit Indices
- **What:** Array of qubit indices that act as controls
- **Why:** Controlled gates (CX, CY, CZ, CCX) need to know which qubits are controls
- **Values:**
  - `[]` for single-qubit gates (H, X, Y, Z, etc.)
  - `[0]` for CX with control on q0
  - `[0, 1]` for CCX with controls on q0 and q1
- **Used by:** Renderer (to draw control dots and vertical lines), QASM generator (to output `cx q[0],q[7];`)

#### `targets` — Target Qubit Indices
- **What:** Array of qubit indices that the gate acts on
- **Why:** Every gate must act on at least one qubit
- **Values:**
  - `[3]` for H on q3
  - `[7]` for CX target on q7
  - `[2, 5]` for SWAP between q2 and q5
- **Used by:** Renderer (to place gate box), QASM generator (to output qubit arguments)

#### `column` — Time-Step Position
- **What:** 0-indexed column number in the circuit grid
- **Why:** Gates in quantum circuits are ordered by time. Column 0 happens first.
- **Used by:** Renderer (CSS grid column placement), QASM generator (sorts gates by column)

#### `params` — Gate Parameters
- **What:** Object holding numerical parameters
- **Why:** Rotation gates (RX, RY, RZ) and the phase gate (P) need an angle
- **Values:**
  - `{}` for most gates
  - `{ theta: 1.5708 }` for RX(π/2)
  - `{ theta: 3.14159 }` for RZ(π)
- **Used by:** Renderer (displays angle), QASM generator (outputs `rx(1.5708) q[0];`)

### Why Is the Model the Heart?

```
┌──────────────┐
│ Gate Palette  │ ─── drops gate ───→ ┌───────────────┐
└──────────────┘                       │               │
                                       │  Circuit      │
┌──────────────┐                       │  Model        │
│ QASM Parser  │ ─── sets gates ───→  │               │
└──────────────┘                       │  gates = []   │
                                       │               │
┌──────────────┐                       │               │
│ Load Circuit │ ─── fromJSON() ───→  │               │
└──────────────┘                       └───────┬───────┘
                                               │
                              "circuit-changed" event
                                               │
              ┌────────────────┬───────────────┼────────────────┐
              ▼                ▼               ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────┐
    │  Renderer    │  │ QASM Editor  │  │ QASM Gen     │  │ Undo/  │
    │  (re-draw)   │  │ (update text)│  │ (gen QASM)   │  │ Redo   │
    └──────────────┘  └──────────────┘  └──────────────┘  └────────┘
```

Everything flows through the model. This pattern is called "single source of truth."

---

## 8. Non-Adjacent Controlled Gates

### The Challenge

A CX (CNOT) gate has a **control** qubit and a **target** qubit. When they're adjacent (e.g., q0 → q1), it's easy to draw. But when they're far apart (e.g., q0 → q7), we need a vertical line spanning 7 wires.

### How We Render It

```
q0  ──●──────  ← Control dot (filled circle)
      │
q1  ──┼──────  ← Vertical line passes through
      │
q2  ──┼──────
      │
q3  ──┼──────
      │
q4  ──┼──────
      │
q5  ──┼──────
      │
q6  ──┼──────
      │
q7  ──⊕──────  ← Target gate (CX box)
```

### Model Representation

```javascript
{
  id: "gate_123",
  type: "CX",
  controls: [0],    // control on q0
  targets: [7],     // target on q7
  column: 5,
  params: {}
}
```

### Rendering Strategy

1. The **gate box** (⊕) is placed on the target cell (column 5, row 7)
2. The **control dot** (●) is placed on the control cell (column 5, row 0)
3. An **SVG line** connects them vertically through all qubits in between

```javascript
// In circuitRenderer.js → _renderControlLines()
const x = gate.column * CELL_SIZE + CELL_SIZE / 2;   // center of column
const y1 = minQubit * CELL_SIZE + CELL_SIZE / 2;      // top qubit center
const y2 = maxQubit * CELL_SIZE + CELL_SIZE / 2;      // bottom qubit center

// SVG line from (x, y1) to (x, y2)
const line = createSVGElement('line');
line.setAttribute('x1', x); line.setAttribute('y1', y1);
line.setAttribute('x2', x); line.setAttribute('y2', y2);
```

### QASM Output

```
cx q[0],q[7];    // control first, then target
```

---

## 9. QASM Generator Flow

The QASM Generator converts the visual circuit into text code.

### Step-by-Step Flow

```
Step 1: User places gates on the circuit
        ↓
Step 2: CircuitModel stores gate objects
        gates = [
          { type:"H",  targets:[0], column:0 },
          { type:"CX", controls:[0], targets:[7], column:1 },
          { type:"MEASURE", targets:[0], column:2 },
        ]
        ↓
Step 3: QASMGenerator.generate(model) is called
        ↓
Step 4: Header is generated
        "OPENQASM 2.0;"
        'include "qelib1.inc";'
        ↓
Step 5: Registers are declared
        "qreg q[8];"
        "creg c[8];"
        ↓
Step 6: Gates are sorted by column and converted
        column 0: { type:"H", targets:[0] }     → "h q[0];"
        column 1: { type:"CX", controls:[0], targets:[7] } → "cx q[0],q[7];"
        column 2: { type:"MEASURE", targets:[0] } → "measure q[0] -> c[0];"
        ↓
Step 7: Final QASM string is assembled and returned
```

### Output

```
OPENQASM 2.0;
include "qelib1.inc";

qreg q[8];
creg c[8];

h q[0];
cx q[0],q[7];
measure q[0] -> c[0];
```

---

## 10. QASM Parser Flow

The QASM Parser converts text code back into the visual circuit.

### Step-by-Step Flow

```
Step 1: User types or pastes QASM into the editor
        ↓
Step 2: User clicks "Apply"
        ↓
Step 3: QASMParser.parse(qasmString) is called
        ↓
Step 4: Each line is processed:
        "OPENQASM 2.0;"      → Skip (header)
        'include "qelib1.inc";' → Skip (include)
        "qreg q[8];"         → Set numQubits = 8
        "creg c[8];"         → Skip
        "h q[0];"            → { type:"H", targets:[0] }
        "cx q[0],q[7];"      → { type:"CX", controls:[0], targets:[7] }
        ↓
Step 5: Columns are assigned automatically
        H  → column 0 (q0 free)
        CX → column 1 (q0 used in col 0)
        ↓
Step 6: Gates array is returned
        ↓
Step 7: model.setGates(gates) updates the model
        ↓
Step 8: "circuit-changed" event fires
        ↓
Step 9: Renderer re-draws the circuit with the parsed gates
```

---

## 11. Backend Deep-Dive

### FastAPI Structure

```python
# main.py — The server entry point

from fastapi import FastAPI
app = FastAPI(title="Quantum Studio API")

# Endpoint definition:
@app.post("/run")
async def run_simulation(request: RunRequest):
    result = simulate_circuit(request.qasm, request.shots)
    return result
```

### How Each Endpoint Works

| Endpoint | Method | Input | Action | Output |
|----------|--------|-------|--------|--------|
| `/health` | GET | — | Returns status | `{"status": "ok"}` |
| `/run` | POST | `{qasm, shots}` | Qiskit simulation | `{counts, shots}` |
| `/save` | POST | `{name, qasm, model_json}` | SQLite INSERT | `{id, message}` |
| `/load/{id}` | GET | URL param `id` | SQLite SELECT | `{id, name, qasm, ...}` |
| `/circuits` | GET | — | SQLite SELECT ALL | `[{id, name, date}]` |
| `/generate-qasm` | POST | `{model_json}` | Convert model → QASM | `{qasm}` |
| `/parse-qasm` | POST | `{qasm}` | Convert QASM → model | `{gates, errors}` |

### Request → Response Flow

```
Frontend: fetch('/run', { body: { qasm: "...", shots: 1024 } })
    ↓
FastAPI: Pydantic validates the request body
    ↓
Endpoint: run_simulation() calls simulate_circuit()
    ↓
simulator.py: Qiskit parses QASM → runs simulation → returns counts
    ↓
FastAPI: Returns JSON response to frontend
    ↓
Frontend: chart.updateResults(response.counts)
```

---

## 12. Database Schema

### Tables

#### `circuits` — Saved Circuits

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Auto-increment primary key |
| `name` | TEXT | Circuit name ("Bell State") |
| `qasm` | TEXT | OpenQASM 2.0 source code |
| `model_json` | TEXT | Circuit model as JSON string |
| `created_at` | TEXT | ISO timestamp |

#### `jobs` — Simulation Jobs

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Auto-increment primary key |
| `circuit_id` | INTEGER | Foreign key → circuits.id |
| `status` | TEXT | "pending", "running", "complete" |
| `created_at` | TEXT | ISO timestamp |

#### `results` — Simulation Results

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Auto-increment primary key |
| `job_id` | INTEGER | Foreign key → jobs.id |
| `counts_json` | TEXT | Measurement counts JSON |
| `statevector_json` | TEXT | Optional statevector data |
| `created_at` | TEXT | ISO timestamp |

### Why JSON Strings in SQLite?

SQLite doesn't have a JSON column type. We store complex data (gate arrays, count dictionaries) as JSON strings in TEXT columns. Python's `json.dumps()` and `json.loads()` convert between Python objects and JSON strings.

---

## 13. Qiskit Integration

### Key Qiskit Concepts

#### QuantumCircuit

```python
from qiskit import QuantumCircuit

# Create a circuit with 8 qubits and 8 classical bits
qc = QuantumCircuit(8, 8)

# Apply gates
qc.h(0)          # Hadamard on qubit 0
qc.x(1)          # Pauli-X (NOT) on qubit 1
qc.y(2)          # Pauli-Y on qubit 2
qc.z(3)          # Pauli-Z on qubit 3
qc.cx(0, 7)      # CNOT: control q0, target q7
qc.measure_all()  # Measure all qubits
```

#### Gate Reference

| Gate | Qiskit Method | What It Does |
|------|--------------|-------------|
| H | `qc.h(0)` | Creates superposition: \|0⟩ → (|0⟩ + \|1⟩)/√2 |
| X | `qc.x(0)` | Bit flip: \|0⟩ → \|1⟩ |
| Y | `qc.y(0)` | Bit + phase flip |
| Z | `qc.z(0)` | Phase flip: \|1⟩ → -\|1⟩ |
| CX | `qc.cx(0, 1)` | CNOT: flips target if control is \|1⟩ |
| Measure | `qc.measure(0, 0)` | Collapses qubit to 0 or 1 |
| RX | `qc.rx(θ, 0)` | X-axis rotation by angle θ |
| QFT | (decomposed) | Quantum Fourier Transform |
| IQFT | (decomposed) | Inverse QFT |

#### Simulation

```python
from qiskit import transpile
from qiskit_aer import AerSimulator

# Create simulator
simulator = AerSimulator()

# Transpile (optimize circuit for simulator)
transpiled = transpile(circuit, simulator)

# Run with 1024 shots
job = simulator.run(transpiled, shots=1024)
result = job.result()

# Get measurement counts
counts = result.get_counts()
# {"00000000": 520, "10000001": 504}
```

#### Statevector

```python
# Get exact quantum state (no randomness)
from qiskit_aer import AerSimulator

simulator = AerSimulator(method='statevector')
circuit.save_statevector()
result = simulator.run(circuit).result()
statevector = result.get_statevector()

# statevector = [0.707+0j, 0+0j, ..., 0.707+0j]
```

---

## 14. Development Roadmap

### Phase 1: Static UI
- [ ] Set up project folders
- [ ] Create `main.css` with design tokens
- [ ] Create `layout.css` with CSS Grid
- [ ] Build `index.html` with all 5 regions
- [ ] Style toolbar, sidebar, circuit, QASM, chart
- [ ] Verify layout in browser

### Phase 2: Gate Placement
- [ ] Create `gatePalette.js` — render gate cards
- [ ] Create `gatePlacement.js` — drag-and-drop
- [ ] Test dragging gates onto grid cells
- [ ] Implement parameter modal for RX, RY, RZ

### Phase 3: Circuit Model
- [ ] Create `circuitModel.js` — gate storage
- [ ] Implement `addGate()`, `removeGate()`, `clearAll()`
- [ ] Implement undo/redo stack
- [ ] Test model operations in console

### Phase 4: QASM Generation
- [ ] Create `qasmGenerator.js`
- [ ] Convert single-qubit gates to QASM
- [ ] Convert controlled gates to QASM
- [ ] Convert parameterized gates to QASM
- [ ] Test with various circuit configurations

### Phase 5: QASM Parsing
- [ ] Create `qasmParser.js`
- [ ] Parse single-qubit instructions
- [ ] Parse controlled instructions
- [ ] Parse parameterized instructions
- [ ] Implement column assignment algorithm
- [ ] Test roundtrip: generate → parse → generate

### Phase 6: Simulation
- [ ] Set up FastAPI backend (`main.py`)
- [ ] Create `simulator.py` with Qiskit
- [ ] Implement `/run` endpoint
- [ ] Test simulation with Bell state circuit
- [ ] Handle Qiskit import errors gracefully

### Phase 7: Probability Distribution
- [ ] Create `probabilityChart.js`
- [ ] Initialize Chart.js with dark theme
- [ ] Display simulation results
- [ ] Show top states summary
- [ ] Test with various result distributions

### Phase 8: Save/Load
- [ ] Create SQLite database module
- [ ] Implement `/save` and `/load` endpoints
- [ ] Create save/load modals in frontend
- [ ] Test save → load roundtrip
- [ ] Implement localStorage fallback

### Phase 9: Testing & Polish
- [ ] Test all gate types (single, controlled, param, special)
- [ ] Test non-adjacent controlled gates (q0 → q7)
- [ ] Test QASM roundtrip (generate → edit → apply)
- [ ] Test offline mode (no backend)
- [ ] Cross-browser testing (Chrome, Firefox, Edge)
- [ ] Responsive layout testing

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| **Qubit** | A quantum bit — can be 0, 1, or both (superposition) |
| **Gate** | An operation on one or more qubits |
| **Circuit** | A sequence of gates applied to qubits |
| **Hadamard (H)** | Creates an equal superposition of \|0⟩ and \|1⟩ |
| **CNOT (CX)** | Flips the target qubit if the control qubit is \|1⟩ |
| **Measurement** | Collapses a qubit's superposition to 0 or 1 |
| **Superposition** | A qubit being in a combination of 0 and 1 states |
| **Entanglement** | Two qubits linked so measuring one affects the other |
| **OpenQASM** | Text format for describing quantum circuits |
| **Qiskit** | IBM's Python SDK for quantum computing |
| **FastAPI** | Python web framework for building APIs |
| **DOM** | Document Object Model — browser's tree of HTML elements |
| **CSS Grid** | 2D layout system for arranging page sections |
| **Flexbox** | 1D layout system for arranging items in a row/column |
| **Drag and Drop** | Browser API for dragging elements between containers |
| **Undo/Redo** | Ability to reverse and re-apply actions |
| **AerSimulator** | Qiskit's local quantum simulator |
| **Shots** | Number of times a circuit is measured in simulation |
| **Counts** | How many times each measurement outcome occurred |
| **Statevector** | The full quantum state as complex amplitudes |
| **Transpile** | Optimize a circuit for a specific backend |
| **Bell State** | An entangled state: \|00⟩ + \|11⟩ (50/50 probability) |
| **QFT** | Quantum Fourier Transform — key quantum algorithm component |
| **Toffoli (CCX)** | A 3-qubit gate with 2 controls and 1 target |
| **SWAP** | Exchanges the states of two qubits |

---

## License

MIT License. Built for learning.

---

*Built with ❤️ for quantum computing education.*
#   g u i 2  
 