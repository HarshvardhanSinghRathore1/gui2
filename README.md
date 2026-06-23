# ⚛ Quantum Studio — Comprehensive Web Development & Quantum Engineering Textbook

Welcome to the **Quantum Studio Complete Curriculum and Textbook**. This document is designed to take you from a basic programmer to a professional frontend architect, backend developer, and quantum software engineer. 

Through this textbook, we will build a professional-grade, browser-based quantum circuit editor from scratch.

---

# PART 1: The Foundations of the Web

## 1. What is a Webpage?
A webpage is a structured document delivered by a server to a client (usually a web browser) over the internet. At its core, it is a text document that references other resources (like stylesheets, script files, and images).
The browser parses this text document and renders a visual interface that users can interact with.

## 2. How a Webpage Loads in a Browser
When you type a URL into a browser, the following process occurs:
```
1. DNS Resolution: Browser requests the IP address of the server from DNS.
2. TCP Handshake: Browser establishes a connection with the server.
3. HTTP Request: Browser requests the file (e.g., index.html).
4. HTTP Response: Server sends back index.html.
5. DOM Construction: Browser parses HTML and builds the DOM tree.
6. CSSOM Construction: Browser parses CSS and builds the CSSOM tree.
7. Render Tree: DOM + CSSOM are combined.
8. Layout: Browser calculates sizes and positions of elements.
9. Paint: Browser draws pixels on the screen.
```

## 3. How HTML, CSS, and JavaScript Work Together
- **HTML (HyperText Markup Language)** provides the **structure** and raw elements.
- **CSS (Cascading Style Sheets)** provides the **presentation** and layout rules.
- **JavaScript (JS)** provides the **behavior** and logic.

---

# PART 2: HTML Section (From Zero to Hero)

For each HTML element below, we break down:
1. **What is it?**
2. **Why do we need it?**
3. **What problem does it solve?**
4. **How does it work internally?**
5. **Small beginner example.**
6. **How it is used in Quantum Studio.**
7. **Common mistakes.**
8. **Best practices.**

---

### `<html>`
*   **What is it?** The root container of the HTML document.
*   **Why do we need it?** It marks the beginning and end of the document.
*   **What problem does it solve?** It tells the parser that this is an HTML document.
*   **Internal Working:** The browser engine parses this tag first to instantiate the root HTMLHtmlElement DOM node.
*   **Example:** `<html></html>`
*   **Quantum Studio usage:** Wraps the entire `index.html` file.
*   **Common mistake:** Forgetting the `<DOCTYPE html>` declaration or omitting the language attribute `lang="en"`.
*   **Best practice:** Always declare `<html lang="en">` for search engines and screen readers.

### `<head>`
*   **What is it?** A metadata container.
*   **Why do we need it?** To specify character encodings, stylesheets, and scripts.
*   **What problem does it solve?** Separates settings and setup from the actual visible contents.
*   **Internal Working:** The browser processes items in the head before rendering the body.
*   **Example:** `<head><title>Test</title></head>`
*   **Quantum Studio usage:** Contains all stylesheet link tags and CDN script imports.
*   **Common mistake:** Placing visible content (like paragraphs or divs) inside the head.
*   **Best practice:** Keep script tags at the bottom of the body or load them with `defer` or `type="module"`.

### `<body>`
*   **What is it?** The visible content container.
*   **Why do we need it?** To wrap all user-facing UI elements.
*   **What problem does it solve?** Tells the browser what must be rendered on the page canvas.
*   **Internal Working:** Triggers the generation of the render tree nodes.
*   **Example:** `<body><h1>Hello World</h1></body>`
*   **Quantum Studio usage:** Contains the `#app` layout grid wrapper.
*   **Common mistake:** Adding more than one body tag to a page.
*   **Best practice:** Maintain proper semantic structure inside the body.

### `<div>`
*   **What is it?** A generic block-level container.
*   **Why do we need it?** For grouping elements together for styling or script interactions.
*   **What problem does it solve?** Helps divide the page into distinct boxes.
*   **Internal Working:** Standard block element with zero default styling.
*   **Example:** `<div><p>Text</p></div>`
*   **Quantum Studio usage:** Used extensively to form cells in the circuit grid.
*   **Common mistake:** "Divitis" — using divs for everything instead of semantic elements like `<header>`.
*   **Best practice:** Use divs ONLY when no semantic tag fits the purpose.

### `<button>`
*   **What is it?** A clickable interface control.
*   **Why do we need it?** To capture user clicks and trigger logic.
*   **What problem does it solve?** Standardizes keyboard accessibility and focus management.
*   **Internal Working:** Fires click events when clicked or when the Space/Enter keys are pressed.
*   **Example:** `<button>Click Me</button>`
*   **Quantum Studio usage:** Used for toolbar buttons (Run, Save, Load, Clear).
*   **Common mistake:** Using a styled `div` instead of a `button` for actions.
*   **Best practice:** Always specify `type="button"` to prevent it from submitting forms.

### `<input>`
*   **What is it?** A data entry field.
*   **Why do we need it?** To accept text or numeric parameters from the user.
*   **What problem does it solve?** Allows interactive inputs.
*   **Internal Working:** Captures keystrokes and updates the `value` property in the DOM.
*   **Example:** `<input type="number" id="val" />`
*   **Quantum Studio usage:** Parameter modal for RX, RY, RZ rotation angles.
*   **Common mistake:** Not specifying labels or placeholder attributes.
*   **Best practice:** Always associate inputs with a label for accessibility.

### `<textarea>`
*   **What is it?** A multi-line text input field.
*   **Why do we need it?** To display and edit raw OpenQASM source code blocks.
*   **What problem does it solve?** Standard text inputs are only single-line.
*   **Internal Working:** Manages a large block of text with scroll support.
*   **Example:** `<textarea>OPENQASM 2.0;</textarea>`
*   **Quantum Studio usage:** Displays the generated QASM code.
*   **Common mistake:** Forgetting to disable native browser spelling check (`spellcheck="false"`).
*   **Best practice:** Set `spellcheck="false"` when displaying source code.

### `<span>`
*   **What is it?** An inline container for text.
*   **Why do we need it?** To style specific parts of a text sentence.
*   **What problem does it solve?** Allows styling inside a paragraph without breaking lines.
*   **Internal Working:** Inline element with zero padding or margin defaults.
*   **Example:** `<p>Hello <span style="color:red">World</span></p>`
*   **Quantum Studio usage:** Brand text styling (`Quantum <span>Studio</span>`).
*   **Common mistake:** Using span as a block element.
*   **Best practice:** Use only for inline decoration or small inline indicators.

### `<section>`
*   **What is it?** A semantic container representing a section of a page.
*   **Why do we need it?** To divide the document into logical sections.
*   **What problem does it solve?** Improves document semantics.
*   **Internal Working:** Block level element parsed as a document outline node.
*   **Example:** `<section><h2>Help</h2></section>`
*   **Quantum Studio usage:** Wraps the QASM panel and Chart panel.
*   **Common mistake:** Using it for styling purposes instead of semantic outlining.
*   **Best practice:** Every section should contain a heading tag (`<h2>`-`<h6>`).

### `<header>`
*   **What is it?** A semantic wrapper for introductory content.
*   **Why do we need it?** To structure headings and navigations.
*   **What problem does it solve?** Marks structural headers.
*   **Internal Working:** Block layout, parsed as outline header.
*   **Example:** `<header><h1>Main Menu</h1></header>`
*   **Quantum Studio usage:** The toolbar is styled inside a `<header id="toolbar">` tag.
*   **Common mistake:** Nesting a header inside another header.
*   **Best practice:** Use it at the top of structural blocks.

### `<footer>`
*   **What is it?** A footer container for pages or sections.
*   **Why do we need it?** To store copyright or metadata links.
*   **What problem does it solve?** Semantic structural classification.
*   **Internal Working:** Standard block element at the end of sections.
*   **Example:** `<footer>Copyright 2026</footer>`
*   **Quantum Studio usage:** Holds author and license info.
*   **Common mistake:** Placing main navigation menus inside standard footers.
*   **Best practice:** Keep footer links concise.

### `<main>`
*   **What is it?** A wrapper for the primary content.
*   **Why do we need it?** To separate unique content from repeating elements like sidebars.
*   **What problem does it solve?** Identifies core page content for assistive technologies.
*   **Internal Working:** Unique block container.
*   **Example:** `<main><p>Core Content</p></main>`
*   **Quantum Studio usage:** Wraps the circuit editor canvas.
*   **Common mistake:** Using more than one `<main>` tag on a single document.
*   **Best practice:** Always use exactly one `<main>` tag per page.

### `<nav>`
*   **What is it?** A navigation link container.
*   **Why do we need it?** To group menu paths.
*   **What problem does it solve?** Accessibility tools can quickly skip or read navigation routes.
*   **Internal Working:** Structural block element.
*   **Example:** `<nav><a href="/">Home</a></nav>`
*   **Quantum Studio usage:** Toolbar sub-navigation groups.
*   **Common mistake:** Wrapping non-navigation lists in `<nav>`.
*   **Best practice:** Wrap only major site navigations.

---

## 4. HTML Layout & Relationships

### Parent-Child Relationships
Elements nested inside other elements are "children" of those elements. The nesting defines hierarchical scopes. For example:
```html
<div class="parent">
  <button class="child">Run</button>
</div>
```
Here, the `parent` wraps the `child`. Styling properties (like font-family) cascade down from the parent.

### The DOM Tree
DOM stands for **Document Object Model**. The browser transforms HTML text into a tree of JavaScript objects.
```
         Document
            │
          <html>
        ┌───┴───┐
     <head>   <body>
                │
              <div> (app)
        ┌───────┼───────┐
    <header> <aside>  <main>
```

### Visual Hierarchy
Visual hierarchy organizes content visually using font size, weights, margins, and contrast to guide the user's eye from the most critical elements to supporting details.

---

# PART 3: CSS Section (Layout Architecture)

For each CSS property and selector type below, we break down:
1. **What is it?**
2. **Why do we need it?**
3. **Visual behavior (with diagrams).**
4. **Common mistakes.**
5. **Quantum Studio usage.**

---

### CSS Selectors
*   **What is it?** Patterns used to match and target elements for styling.
*   **Why do we need it?** To isolate style rules to specific elements.
*   **Visual Representation:**
    - Element selector: `button {}` targets all buttons.
    - Class selector: `.btn-primary {}` targets elements with the class attribute.
    - ID selector: `#toolbar {}` targets the unique element with the matching ID.
*   **Common mistake:** Using excessively long selector paths like `div > header > div > button`.
*   **Quantum Studio usage:** `.gate-card` styles individual gate options in the sidebar.

### CSS Box Model
*   **What is it?** The box structure wrapped around every element.
*   **Why do we need it?** To compute layout dimensions.
*   **Visual Diagram:**
```
 ┌──────────────────────────────────────────┐
 │                 MARGIN                   │  <- Outside space (separates boxes)
 │  ┌────────────────────────────────────┐  │
 │  │              BORDER                │  │  <- Line wrapping content
 │  │  ┌──────────────────────────────┐  │  │
 │  │  │           PADDING            │  │  │  <- Inside space (breathing room)
 │  │  │  ┌────────────────────────┐  │  │  │
 │  │  │  │        CONTENT         │  │  │  │  <- The actual elements/text
 │  │  │  └────────────────────────┘  │  │  │
 │  │  └──────────────────────────────┘  │  │
 │  └────────────────────────────────────┘  │
 └──────────────────────────────────────────┘
```
*   **Common mistake:** Forgetting to set `box-sizing: border-box`, which causes padding and borders to expand elements beyond their configured widths.
*   **Quantum Studio usage:** Standardizing box sizing globally in `main.css`.

### Margin, Padding, and Border
*   **What is it?** Spacing layers of the CSS Box Model.
*   **Why do we need it?**
    - Padding gives content breathing room inside a card.
    - Border highlights structural divisions.
    - Margin positions elements relative to neighbors.
*   **Common mistake:** Applying margins instead of paddings, leading to broken click hit-boxes on buttons.
*   **Quantum Studio usage:** Padding on the `.panel-body` container.

### Display
*   **What is it?** Controls how elements render inside their parents.
*   **Why do we need it?** To switch elements between block, inline, flex, grid, or hidden.
*   **Common mistake:** Forgetting that inline elements ignore top/bottom margins and widths.
*   **Quantum Studio usage:** `display: grid` on `#app` layouts.

### Flexbox (Flexible Box Layout)
*   **What is it?** A 1D layout model for arranging items in rows or columns.
*   **Why do we need it?** To distribute space and align items along axes.
*   **Visual Axis:**
```
     Main Axis (horizontal by default)
     ┌───────────────────────────────────┐
     │  [Item 1]    [Item 2]    [Item 3] │
     └───────────────────────────────────┘
```
*   **Common mistake:** Confusing `justify-content` (aligns along the main axis) with `align-items` (aligns along the cross axis).
*   **Quantum Studio usage:** `#toolbar` uses `display: flex; align-items: center` to align items.

### CSS Grid
*   **What is it?** A 2D grid-based layout framework.
*   **Why do we need it?** To build complex, multi-row, multi-column web structures.
*   **Visual Grid:**
```
     Column 1   Column 2   Column 3
     ┌──────────┬──────────┬──────────┐
Row 1│ Header   │ Header   │ Header   │
     ├──────────┼──────────┼──────────┤
Row 2│ Sidebar  │ Circuit  │ QASM     │
     └──────────┴──────────┴──────────┘
```
*   **Common mistake:** Over-nesting grids when flexbox would be simpler.
*   **Quantum Studio usage:** Laying out the 8 horizontal wires and time columns.

### CSS Positions (Relative, Absolute, Fixed, Sticky)
*   **What is it?** Controls positioning rules of elements.
*   **Why do we need it?**
    - `relative`: Positions elements relative to their normal flow location.
    - `absolute`: Positions elements relative to their nearest positioned ancestor.
    - `fixed`: Positions elements relative to the viewport.
    - `sticky`: Toggles relative/fixed positioning on scroll.
*   **Common mistake:** Forgetting to add `position: relative` to the parent container when using `position: absolute` on children.
*   **Quantum Studio usage:** `.circuit-svg-overlay` is absolute-positioned over the grid.

---

# PART 4: JavaScript Section (Logic & Architecture)

Here, we explore the engine under the hood.

---

### Variables (`const` vs `let`)
*   **Explanation:** `const` defines block-scoped values that cannot be reassigned. `let` defines block-scoped variables that can be modified.
*   **Internal Working:** They exist inside lexical environments, preventing hoisting variables to global scopes like the deprecated `var` did.
*   **Example:**
```javascript
const maxQubits = 8;
let currentColumn = 0;
```
*   **Quantum Studio usage:** Initializing configurations.

### Functions
*   **Explanation:** Reusable statements containing blocks of code.
*   **Internal Working:** Functions create Execution Contexts on the Call Stack when executed.
*   **Example:**
```javascript
const add = (a, b) => a + b;
```

### Arrays & Methods
*   **Explanation:** Ordered lists of values supporting map, filter, and reduce operations.
*   **Internal Working:** Fast index lookups.
*   **Example:**
```javascript
const list = [0, 1, 2];
const doubled = list.map(n => n * 2);
```
*   **Quantum Studio usage:** `this.gates` is an array of objects manipulated by `addGate()` and `removeGate()`.

### Objects
*   **Explanation:** Key-value collections representing structured entities.
*   **Example:**
```javascript
const gate = { type: 'H', target: 0 };
```

### Classes
*   **Explanation:** Blueprint templates for creating object structures.
*   **Internal Working:** Syntactic sugar over JavaScript's prototype-based inheritance.
*   **Example:**
```javascript
class Qubit {
  constructor(index) { this.index = index; }
}
```

### ES Modules
*   **Explanation:** Native mechanism to split code blocks into files using `import` and `export`.
*   **Internal Working:** Evaluated in structural dependency graphs before loading.
*   **Example:**
```javascript
export class CircuitModel {}
import { CircuitModel } from './models/circuitModel.js';
```

### DOM Manipulation
*   **Explanation:** Logic updates to structural page nodes dynamically.
*   **Internal Working:** Triggers browser layouts and paint passes.
*   **Example:**
```javascript
document.getElementById('title').textContent = 'Quantum';
```

### Events & Handlers
*   **Explanation:** Signal emitters notifying actions like clicks and drags.
*   **Internal Working:** Captured via browser event-loop task queues.
*   **Example:**
```javascript
button.addEventListener('click', e => runSim());
```

### Local Storage
*   **Explanation:** Key-value browser storage engine persisting across refreshes.
*   **Example:**
```javascript
localStorage.setItem('circuit', JSON.stringify(data));
```

### Fetch API & Async/Await
*   **Explanation:** Web API facilitating asynchronous HTTP requests.
*   **Internal Working:** Executes on microtask queues using Promises.
*   **Example:**
```javascript
async function runAPI() {
  const res = await fetch('/run', { method: 'POST' });
  return await res.json();
}
```

---

# PART 5: Step-by-Step Curriculum (Lessons 1-14)

---

## Lesson 1: Create `index.html`

### File Design
*   **Why this file exists:** Entry point of the web UI.
*   **Responsibility:** Define core structural regions and load styles.
*   **Inputs:** None (initial browser loads).
*   **Outputs:** HTML Document Object Model.
*   **Dependencies:** `css/main.css`, `js/app.js`, `chart.js` CDN.

### Annotated Source Code
We will write the complete visual structure of the layout regions:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Quantum Studio — A professional 8-qubit quantum circuit editor.">
  <title>Quantum Studio — Quantum Circuit Editor</title>
  
  <!-- CSS Stylesheets -->
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/toolbar.css">
  <link rel="stylesheet" href="css/gates.css">
  <link rel="stylesheet" href="css/circuit.css">
  <link rel="stylesheet" href="css/qasm.css">
  <link rel="stylesheet" href="css/chart.css">

  <!-- Chart.js Library -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
</head>
<body>
  <div id="app">
    <!-- TOOLBAR -->
    <header id="toolbar">
      <div class="toolbar-brand">
        <div class="toolbar-brand-icon">Q</div>
        <div class="toolbar-brand-text">Quantum <span>Studio</span></div>
      </div>
      <div class="toolbar-group">
        <button id="btn-run" class="toolbar-btn btn-primary" title="Run simulation">
          <span class="btn-icon">▶</span>
          <span class="btn-label">Run</span>
        </button>
      </div>
      <div class="toolbar-separator"></div>
      <div class="toolbar-group">
        <button id="btn-save" class="toolbar-btn">💾 Save</button>
        <button id="btn-load" class="toolbar-btn">📂 Load</button>
      </div>
      <div class="toolbar-status">
        <span class="toolbar-status-dot" id="status-dot"></span>
        <span id="status-text">Ready</span>
      </div>
    </header>

    <!-- SIDEBAR -->
    <aside id="sidebar">
      <div class="panel-header"><h2>Gates</h2></div>
      <div class="panel-body" id="gate-palette"></div>
    </aside>

    <!-- CIRCUIT -->
    <main id="circuit-area">
      <div class="circuit-container" id="circuit-container">
        <div class="qubit-labels" id="qubit-labels"></div>
        <div class="circuit-grid" id="circuit-grid"></div>
        <svg class="circuit-svg-overlay" id="circuit-svg-overlay"></svg>
        <div class="circuit-empty-hint" id="circuit-empty-hint">⚛️ Drag gates here</div>
      </div>
    </main>

    <!-- QASM PANEL -->
    <section id="qasm-panel">
      <div class="panel-header"><h2>OpenQASM</h2></div>
      <textarea id="qasm-textarea" spellcheck="false"></textarea>
    </section>

    <!-- CHART PANEL -->
    <section id="chart-panel">
      <div class="panel-header"><h2>Simulation Results</h2></div>
      <div class="chart-container">
        <canvas id="probability-chart"></canvas>
      </div>
    </section>
  </div>

  <!-- Bootstrapping Script -->
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

### Line-by-Line Code Explanation
*   `Line 1`: Declares the document type as HTML5.
*   `Line 2`: Sets English as the webpage language.
*   `Line 3-7`: Document metadata and configurations.
*   `Line 8-14`: Links structural and component styles.
*   `Line 17`: Loads Chart.js for data visualization.
*   `Line 20`: Div layout entry wrapper container.
*   `Line 21-39`: Navigation button actions and statuses.
*   `Line 42-45`: Sidebar component containing available gates.
*   `Line 48-55`: Primary circuit container, drawing lines and holding gates.
*   `Line 58-61`: Text editor for handling generated source code.
*   `Line 64-69`: Panel displaying final counts distributions.
*   `Line 72`: Imports modular logic execution scripts.

---

## Lesson 2: Create Application Layout (`layout.css` & `main.css`)

### File Design
*   **Why this file exists:** Establishes color themes, resets defaults, and specifies the 5-region Grid layout.
*   **Responsibility:** Design layout responsive regions and set CSS variables.
*   **Inputs:** None (parsed by browser).
*   **Outputs:** Visual layouts.
*   **Dependencies:** None.

### Annotated Source Code
Here is the core layouts stylesheet `layout.css`:

```css
#app {
  display: grid;
  grid-template-columns: 240px 1fr 320px;
  grid-template-rows: 56px 1fr 240px;
  grid-template-areas:
    "toolbar  toolbar  toolbar"
    "sidebar  circuit  qasm"
    "chart    chart    chart";
  height: 100vh;
  width: 100vw;
  background-color: #0d0e15;
  color: #f1f1f1;
}

#toolbar {
  grid-area: toolbar;
  background-color: #12131c;
  border-bottom: 1px solid #232533;
}

#sidebar {
  grid-area: sidebar;
  background-color: #12131c;
  border-right: 1px solid #232533;
}

#circuit-area {
  grid-area: circuit;
  overflow: auto;
  position: relative;
}

#qasm-panel {
  grid-area: qasm;
  background-color: #12131c;
  border-left: 1px solid #232533;
}

#chart-panel {
  grid-area: chart;
  background-color: #12131c;
  border-top: 1px solid #232533;
}
```

### Line-by-Line Code Explanation
*   `Line 1-9`: Configures grid positions mapping columns and rows.
*   `Line 10-13`: Sets full height/width constraints.
*   `Line 15-19`: Maps the header component to the top grid area.
*   `Line 21-25`: Pins the sidebar selector to the left-aligned grid block.
*   `Line 27-31`: Defines the central workspace grid position, setting scrolling rules.
*   `Line 33-37`: Positions the code editor wrapper area.
*   `Line 39-43`: Positions the bottom measurement output distribution dashboard.

---

## Lesson 3: Create Toolbar (`toolbar.js` & `toolbar.css`)

### File Design
*   **Why this file exists:** Implements the button logic on the top actions panel.
*   **Responsibility:** Hook up run, save, load, and clear buttons to event listeners.
*   **Inputs:** User mouse click actions.
*   **Outputs:** Invokes backend calculations and triggers model resets.
*   **Dependencies:** `backendAPI.js`, `circuitModel.js`.

### Annotated Source Code
We implement `toolbar.js`:

```javascript
export class Toolbar {
  constructor(model, qasmGenerator, backendAPI, chart) {
    this.model = model;
    this.qasmGenerator = qasmGenerator;
    this.backendAPI = backendAPI;
    this.chart = chart;
    this.setupListeners();
  }

  setupListeners() {
    document.getElementById('btn-run').addEventListener('click', () => this.runSimulation());
    document.getElementById('btn-clear').addEventListener('click', () => this.clearCircuit());
  }

  async runSimulation() {
    const qasm = this.qasmGenerator.generate(this.model);
    try {
      const res = await this.backendAPI.runCircuit(qasm);
      this.chart.updateResults(res.counts);
    } catch (e) {
      console.warn("Backend offline, using mocks", e);
      this.chart.updateMockResults();
    }
  }

  clearCircuit() {
    if (confirm("Reset current circuit?")) {
      this.model.clearAll();
    }
  }
}
```

### Line-by-Line Code Explanation
*   `Line 1-7`: Instantiates references to core models, generators, APIs, and charts.
*   `Line 9-12`: Hooks event listeners to buttons using element selectors.
*   `Line 14-23`: Converts current model structures to QASM text, makes network fetch calls, and updates probabilities.
*   `Line 25-29`: Calls clean algorithms in the model if confirmed.

---

## Lesson 4: Create Gate Palette (`gatePalette.js` & `gates.css`)

### File Design
*   **Why this file exists:** Renders draggable gates (H, X, CNOT) on the sidebar panel.
*   **Responsibility:** Display gate options and mark them as drag sources.
*   **Inputs:** `GATE_DEFS` definitions map metadata.
*   **Outputs:** HTML draggable elements populated into the DOM.
*   **Dependencies:** `circuitModel.js` metadata definitions.

### Annotated Source Code
We define `gatePalette.js`:

```javascript
import { GATE_DEFS } from '../models/circuitModel.js';

export class GatePalette {
  constructor(placementEngine) {
    this.placement = placementEngine;
    this.render();
  }

  render() {
    const container = document.getElementById('gate-palette');
    container.innerHTML = '';
    
    for (const [type, def] of Object.entries(GATE_DEFS)) {
      const card = document.createElement('div');
      card.className = 'gate-card';
      card.draggable = true;
      card.dataset.type = type;
      card.innerHTML = `<span class="gate-label">${def.label}</span>`;
      
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', type);
      });
      
      container.appendChild(card);
    }
  }
}
```

### Line-by-Line Code Explanation
*   `Line 1`: Imports metadata definitions from the data model layer.
*   `Line 3-7`: Instantiates the palette UI renderer.
*   `Line 9-11`: Resets HTML content inside the sidebar.
*   `Line 13-18`: Iteratively generates drag cards.
*   `Line 20-22`: Implements dragstart handlers, storing target gate types in dataTransfer objects.
*   `Line 24-25`: Appends created cards to the DOM.

---

## Lesson 5: Create Qubit Wires (`circuit.css`)

### File Design
*   **Why this file exists:** Visualizes the horizontal lines (wires) representing qubits.
*   **Responsibility:** Render horizontal grid segments and wires.
*   **Inputs:** None (CSS declarations).
*   **Outputs:** Styling layout lines.

### Annotated Source Code
Here is `circuit.css`:

```css
.circuit-container {
  position: relative;
  padding: 24px;
  background-color: #0d0e15;
}

.circuit-grid {
  display: grid;
  grid-template-rows: repeat(8, 64px);
  position: relative;
}

.circuit-row-wire {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #232533;
  top: 31px;
  z-index: 1;
}
```

### Line-by-Line Code Explanation
*   `Line 1-5`: Configures main container constraints.
*   `Line 7-10`: Implements grid layout for 8 rows of qubits (64px height each).
*   `Line 12-20`: Positions absolute lines acting as qubit wires behind the gates.

---

## Lesson 6: Create Circuit Model (`circuitModel.js`)

### File Design
*   **Why this file exists:** Single source of truth containing all circuit data.
*   **Responsibility:** Store gates, manage snapshots, and implement undo/redo functions.
*   **Inputs:** Calls from placement handler operations.
*   **Outputs:** Returns sorted arrays of active gates.

### Annotated Source Code
We write the code:

```javascript
export class CircuitModel {
  constructor() {
    this.gates = [];
    this.undoStack = [];
    this.redoStack = [];
  }

  addGate(gateData) {
    this.saveSnapshot();
    const newGate = {
      id: `gate_${Date.now()}_${Math.random()}`,
      type: gateData.type,
      controls: gateData.controls || [],
      targets: gateData.targets || [],
      column: gateData.column
    };
    this.gates.push(newGate);
    this.emitChange();
    return newGate;
  }

  saveSnapshot() {
    this.undoStack.push(JSON.stringify(this.gates));
    this.redoStack = [];
  }

  clearAll() {
    this.saveSnapshot();
    this.gates = [];
    this.emitChange();
  }

  emitChange() {
    document.dispatchEvent(new CustomEvent('circuit-changed'));
  }
}
```

### Line-by-Line Code Explanation
*   `Line 1-6`: Instantiates model data arrays and stacks.
*   `Line 8-19`: Creates gate objects with unique IDs and appends them to the internal array.
*   `Line 21-24`: Deep-copies states into the undo stack and clears redo trackers.
*   `Line 26-30`: Empties the current circuit list.
*   `Line 32-34`: Dispatches custom browser events.

---

## Lesson 7: Render Gates (`circuitRenderer.js`)

### File Design
*   **Why this file exists:** Draws gates and connection lines onto the circuit panel.
*   **Responsibility:** Draw SVG connection lines and position HTML gate boxes.
*   **Inputs:** State of the `CircuitModel`.
*   **Outputs:** Generated UI DOM elements.
*   **Dependencies:** `circuitModel.js`.

### Annotated Source Code
We define `circuitRenderer.js`:

```javascript
export class CircuitRenderer {
  constructor(model) {
    this.model = model;
    document.addEventListener('circuit-changed', () => this.draw());
  }

  draw() {
    const grid = document.getElementById('circuit-grid');
    grid.innerHTML = '';
    
    // Create empty cells
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 12; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        grid.appendChild(cell);
      }
    }

    // Place gates
    for (const gate of this.model.gates) {
      const targetCol = gate.column;
      for (const targetRow of gate.targets) {
        const cell = grid.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
        if (cell) {
          const el = document.createElement('div');
          el.className = 'placed-gate';
          el.textContent = gate.type;
          cell.appendChild(el);
        }
      }
    }
  }
}
```

### Line-by-Line Code Explanation
*   `Line 1-5`: Configures listeners monitoring updates on data models.
*   `Line 7-9`: Resets active grid configurations.
*   `Line 11-20`: Renders empty grid cell blocks.
*   `Line 22-33`: Matches coordinates to place text-labeled visual boxes representing gates.

---

## Lesson 8: Add Drag-and-Drop (`gatePlacement.js`)

### File Design
*   **Why this file exists:** Connects user drags and mouse drops to model updates.
*   **Responsibility:** Validate placement zones and fire placement callbacks.
*   **Inputs:** Browser drag-and-drop operations.
*   **Outputs:** Calls `model.addGate()` to modify state.
*   **Dependencies:** `circuitModel.js`, `circuitRenderer.js`.

### Annotated Source Code
We construct `gatePlacement.js`:

```javascript
export class GatePlacement {
  constructor(model, renderer) {
    this.model = model;
    this.renderer = renderer;
    this.setupDropZones();
  }

  setupDropZones() {
    const grid = document.getElementById('circuit-grid');
    
    grid.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    grid.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('text/plain');
      const targetCell = e.target.closest('.grid-cell');
      if (targetCell) {
        const row = parseInt(targetCell.dataset.row);
        const col = parseInt(targetCell.dataset.col);
        this.model.addGate({ type, targets: [row], column: col });
      }
    });
  }
}
```

### Line-by-Line Code Explanation
*   `Line 1-6`: Saves renderer references.
*   `Line 8-15`: Declares grid drop listeners.
*   `Line 17-26`: Extracts the gate type from `dataTransfer` and parses coordinates on drop.

---

## Lesson 9: Add OpenQASM Generator (`qasmGenerator.js`)

### File Design
*   **Why this file exists:** Converts visual circuit configurations into text source code.
*   **Responsibility:** Serialize gate objects.
*   **Inputs:** `CircuitModel` data arrays.
*   **Outputs:** Valid OpenQASM 2.0 source code string.

### Annotated Source Code
We write the compiler layout:

```javascript
export class QASMGenerator {
  generate(model) {
    const lines = [
      'OPENQASM 2.0;',
      'include "qelib1.inc";',
      `qreg q[8];`,
      `creg c[8];`
    ];

    const sorted = [...model.gates].sort((a, b) => a.column - b.column);
    for (const g of sorted) {
      if (g.type === 'H') {
        lines.push(`h q[${g.targets[0]}];`);
      } else if (g.type === 'X') {
        lines.push(`x q[${g.targets[0]}];`);
      }
    }
    return lines.join('\n');
  }
}
```

### Line-by-Line Code Explanation
*   `Line 1-9`: Writes version header and sets up registers.
*   `Line 10`: Sorts gates by columns so instructions appear in time order.
*   `Line 11-17`: Iterates through gates, converting them to corresponding OpenQASM commands.
*   `Line 18`: Joins the array of lines with newlines.

---

## Lesson 10: Build Backend (`main.py` & `simulator.py`)

### File Design
*   **Why this file exists:** Runs a FastAPI server to run simulation pipelines using Qiskit.
*   **Responsibility:** Validate QASM payloads and process quantum probabilities.
*   **Inputs:** HTTP POST requests.
*   **Outputs:** Counts mapping dictionaries.

### Annotated Source Code
We implement the Python server:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from simulator import simulate_circuit

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CircuitRequest(BaseModel):
    qasm: str
    shots: int = 1024

@app.post("/run")
async def run_simulation(request: CircuitRequest):
    result = simulate_circuit(request.qasm, request.shots)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result
```

### Line-by-Line Code Explanation
*   `Line 1-4`: Imports FastAPI and the local Qiskit simulator module.
*   `Line 6`: Initializes the FastAPI application instance.
*   `Line 8-14`: Sets up CORS configuration to allow connections from local html files.
*   `Line 16-18`: Defines request schema configurations using Pydantic validation.
*   `Line 20-25`: Sets up POST endpoint routes, running the simulation and returning results.

---

## Lesson 11: Connect Frontend and Backend (`backendAPI.js`)

### File Design
*   **Why this file exists:** Network client layer handling all backend API calls.
*   **Responsibility:** Wrapper for request logic.
*   **Inputs:** QASM strings.
*   **Outputs:** Simulation data counts objects.

### Annotated Source Code
We define `backendAPI.js`:

```javascript
export class BackendAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async runCircuit(qasm, shots = 1024) {
    const res = await fetch(`${this.baseUrl}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qasm, shots })
    });
    if (!res.ok) {
      throw new Error("HTTP error: " + res.status);
    }
    return await res.json();
  }

  async isHealthy() {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
```

### Line-by-Line Code Explanation
*   `Line 1-5`: Saves baseUrl parameters.
*   `Line 7-17`: Sends QASM code in a JSON payload via POST requests.
*   `Line 19-27`: Performs health checks to determine backend status.

---

## Lesson 12: Run Qiskit Circuits (`simulator.py`)

### File Design
*   **Why this file exists:** Connects Python logic to Qiskit.
*   **Responsibility:** Parse QASM strings, execute circuits on AerSimulators, and format output keys.
*   **Inputs:** QASM strings.
*   **Outputs:** Dictionary containing formatted measurement counts.

### Annotated Source Code
We implement `simulator.py`:

```python
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

def simulate_circuit(qasm_string: str, shots: int = 1024) -> dict:
    try:
        # Load from QASM
        circuit = QuantumCircuit.from_qasm_str(qasm_string)
        
        # Check for measurements
        has_measure = any(
            instr.operation.name == 'measure'
            for instr in circuit.data
        )
        if not has_measure:
            circuit.measure_all()
            
        simulator = AerSimulator()
        transpiled_circuit = transpile(circuit, simulator)
        
        # Run Simulation
        job = simulator.run(transpiled_circuit, shots=shots)
        counts = job.result().get_counts()
        
        return {
            "counts": counts,
            "shots": shots,
            "success": True
        }
    except Exception as e:
        return {
            "counts": {},
            "shots": shots,
            "success": False,
            "error": str(e)
        }
```

### Line-by-Line Code Explanation
*   `Line 1-2`: Imports core transpiler and backend simulator packages.
*   `Line 4`: Declares simulation handler entry points.
*   `Line 7`: Parses incoming QASM strings into QuantumCircuit object instances.
*   `Line 10-15`: Checks for measure gates, adding measurements if missing.
*   `Line 16-18`: Transpiles (optimizes) circuits for execution.
*   `Line 21-22`: Runs simulation jobs and extracts result count dictionaries.
*   `Line 24-34`: Packages counts output objects or returns descriptive errors.

---

## Lesson 13: Display Probability Charts (`probabilityChart.js`)

### File Design
*   **Why this file exists:** Renders results as interactive bar charts using Chart.js.
*   **Responsibility:** Initialize canvas elements and update bars dynamically.
*   **Inputs:** API result counts dictionaries.
*   **Outputs:** Renders bar charts onto HTML canvas grids.

### Annotated Source Code
We write `probabilityChart.js`:

```javascript
export class ProbabilityChart {
  constructor() {
    this.chart = null;
    this.initChart();
  }

  initChart() {
    const ctx = document.getElementById('probability-chart').getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Probability',
          data: [],
          backgroundColor: '#00d4ff'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  updateResults(counts) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const labels = Object.keys(counts);
    const probabilities = Object.values(counts).map(c => c / total);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = probabilities;
    this.chart.update();
  }

  updateMockResults() {
    const mock = { "00000000": 512, "00000001": 512 };
    this.updateResults(mock);
  }
}
```

### Line-by-Line Code Explanation
*   `Line 1-5`: Configures class setups.
*   `Line 7-26`: Configures a Chart.js bar chart on the page canvas.
*   `Line 28-36`: Calculates probability ratios from counts and updates labels.
*   `Line 38-41`: Falls back to mock data if the backend is offline.

---

## Lesson 14: Save and Load Circuits (`database.py`)

### File Design
*   **Why this file exists:** SQLite persistence layer to save and retrieve designs.
*   **Responsibility:** Define databases tables and handle insert/select queries.
*   **Inputs:** Circuit schemas containing names, QASM code, and state JSON.
*   **Outputs:** Inserts records and returns list outputs.

### Annotated Source Code
We construct `database.py`:

```python
import sqlite3
import json

DB_FILE = "circuits.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS circuits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            qasm TEXT NOT NULL,
            model_json TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def save_circuit(name: str, qasm: str, model_json: str) -> int:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO circuits (name, qasm, model_json) VALUES (?, ?, ?)",
        (name, qasm, model_json)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id

def load_all_circuits() -> list:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM circuits")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "name": r[1]} for r in rows]
```

### Line-by-Line Code Explanation
*   `Line 1-4`: Imports sqlite library and sets filename parameters.
*   `Line 6-18`: Checks and creates tables using SQL DDL queries.
*   `Line 20-30`: Runs insert commands, committing modifications to the database file.
*   `Line 32-38`: Selects stored lists to render on front-end selection panels.

---

# Architecture Blueprints

### Client-Side Execution Flow
```
 ┌──────────────┐
 │  GatePalette  │──drag──→┌──────────────┐
 └──────────────┘          │GatePlacement  │──addGate──→┌──────────────┐
                           └──────────────┘             │ CircuitModel │
 ┌──────────────┐                                       │  (State)     │
 │   Toolbar     │──clear/undo/redo──────────────────→  │              │
 └──────────────┘                                       └──────┬───────┘
                                                               │
                                                       "circuit-changed"
                                                               │
                                       ┌───────────────────────┼───────────────────────┐
                                       ▼                       ▼                       ▼
                               ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
                               │  Renderer    │        │ QASMEditor   │        │ QASMGenerator│
                               │  (re-draw)   │        │ (update text)│        │ (gen QASM)   │
                               └──────────────┘        └──────────────┘        └──────────────┘
```

---

## Glossary of Key Terms
*   **Hadamard Gate (H):** Creates a superposition state $|+\rangle = \frac{|0\rangle+|1\rangle}{\sqrt{2}}$.
*   **CNOT (CX):** A two-qubit gate flipping target if control index is state 1.
*   **DOM (Document Object Model):** Internal browser tree structuring rendered pages.
*   **Pydantic:** Type validation library used in FastAPI payloads.
*   **AerSimulator:** High-performance local quantum simulator package from Qiskit.