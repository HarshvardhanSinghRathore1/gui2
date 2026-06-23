/* ============================================================
   probabilityChart.js — Chart.js Probability Distribution
   ============================================================
   PURPOSE:
     Displays simulation results as a bar chart using Chart.js.
     Shows the probability distribution of measurement outcomes.

   RESPONSIBILITIES:
     - Initialize Chart.js bar chart
     - Update chart data when simulation results arrive
     - Show top states in the summary sidebar
     - Handle empty state (no results yet)
     - Configure chart styling to match the dark theme

   DATA FLOW:
     Backend returns counts → toolbar calls chart.updateResults()
     → Chart.js renders bar chart
     → Top states list is populated

   INTERACTIONS:
     - Called by: Toolbar after simulation completes
     - Uses: Chart.js library (loaded via CDN)
   ============================================================ */

/**
 * ProbabilityChart — Manages the Chart.js probability distribution.
 */
export class ProbabilityChart {
  constructor() {
    // ── DOM References ──────────────────────────────────
    this.emptyEl     = document.getElementById('chart-empty');
    this.canvasWrap  = document.getElementById('chart-canvas-wrap');
    this.summaryEl   = document.getElementById('chart-summary');
    this.statesListEl = document.getElementById('top-states-list');
    this.shotsInfoEl = document.getElementById('chart-shots-info');
    this.shotsBadge  = document.getElementById('chart-shots-badge');
    this.canvas      = document.getElementById('probability-chart');

    /** @type {Chart|null} Chart.js instance */
    this.chart = null;

    /** @type {Object|null} Last simulation results */
    this.lastCounts = null;
  }

  /**
   * Update the chart with new simulation results.
   *
   * @param {Object} counts — Map of state strings to count values
   *   Example: { "00000000": 512, "10000001": 256, "11111111": 256 }
   * @param {number} totalShots — Total number of simulation shots
   *
   * DATA FLOW:
   *   counts = { "00000000": 512, "10000001": 512 }
   *   totalShots = 1024
   *   → Probabilities: { "00000000": 0.5, "10000001": 0.5 }
   *   → Chart bars represent these probabilities
   *   → Top states list shows most likely outcomes
   */
  updateResults(counts, totalShots = 1024) {
    this.lastCounts = counts;

    // Show chart, hide empty state
    this.emptyEl.style.display = 'none';
    this.canvasWrap.style.display = 'block';
    this.summaryEl.style.display = 'flex';

    // Sort states by count (descending)
    const sortedStates = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);

    // Calculate probabilities
    const labels = sortedStates.map(([state]) => `|${state}⟩`);
    const probabilities = sortedStates.map(([, count]) => count / totalShots);
    const rawCounts = sortedStates.map(([, count]) => count);

    // ── Generate Bar Colors (gradient from cyan to purple) ──
    const colors = sortedStates.map((_, i) => {
      const ratio = i / Math.max(sortedStates.length - 1, 1);
      const r = Math.round(0 + ratio * 136);   // 0 → 136
      const g = Math.round(212 - ratio * 127);  // 212 → 85
      const b = Math.round(255);                // 255
      return `rgba(${r}, ${g}, ${b}, 0.8)`;
    });

    const borderColors = colors.map(c => c.replace('0.8', '1'));

    // ── Create or Update Chart ──────────────────────────
    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = probabilities;
      this.chart.data.datasets[0].backgroundColor = colors;
      this.chart.data.datasets[0].borderColor = borderColors;
      this.chart.data.datasets[0]._rawCounts = rawCounts;
      this.chart.update('none'); // skip animation for speed
    } else {
      this._createChart(labels, probabilities, rawCounts, colors, borderColors);
    }

    // ── Update Top States List ──────────────────────────
    this._updateTopStates(sortedStates, totalShots);

    // ── Update Shots Badge ──────────────────────────────
    if (this.shotsBadge) {
      this.shotsBadge.textContent = `${totalShots} shots`;
    }
    if (this.shotsInfoEl) {
      this.shotsInfoEl.textContent = `Total shots: ${totalShots}`;
    }
  }

  /**
   * Create a new Chart.js bar chart.
   */
  _createChart(labels, probabilities, rawCounts, colors, borderColors) {
    const ctx = this.canvas.getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Probability',
          data: probabilities,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 4,
          _rawCounts: rawCounts,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 600,
          easing: 'easeOutQuart',
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: '#a0a0c0',
              font: {
                family: "'JetBrains Mono', monospace",
                size: 10,
              },
              maxRotation: 90,
              minRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
            max: 1,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: '#a0a0c0',
              font: {
                family: "'JetBrains Mono', monospace",
                size: 10,
              },
              callback: (value) => `${(value * 100).toFixed(0)}%`,
            },
            title: {
              display: true,
              text: 'Probability',
              color: '#6a6a8a',
              font: {
                family: "'Inter', sans-serif",
                size: 11,
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#141428',
            titleColor: '#e8e8f0',
            bodyColor: '#a0a0c0',
            borderColor: '#2a2a4a',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: "'JetBrains Mono', monospace",
              size: 12,
            },
            bodyFont: {
              family: "'JetBrains Mono', monospace",
              size: 11,
            },
            callbacks: {
              title: (items) => items[0]?.label || '',
              label: (item) => {
                const prob = (item.raw * 100).toFixed(2);
                const count = item.dataset._rawCounts?.[item.dataIndex] || 0;
                return [`Probability: ${prob}%`, `Counts: ${count}`];
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update the "Top States" list in the summary sidebar.
   */
  _updateTopStates(sortedStates, totalShots) {
    if (!this.statesListEl) return;

    this.statesListEl.innerHTML = '';

    // Show top 5 states
    const topN = sortedStates.slice(0, 5);
    const maxCount = topN[0]?.[1] || 1;

    for (const [state, count] of topN) {
      const prob = (count / totalShots * 100).toFixed(1);
      const barWidth = (count / maxCount * 100).toFixed(0);

      const item = document.createElement('div');
      item.className = 'top-state-item';
      item.innerHTML = `
        <span class="top-state-label">|${state}⟩</span>
        <div style="flex:1;margin:0 8px;">
          <div class="top-state-bar" style="width:${barWidth}%;"></div>
        </div>
        <span class="top-state-prob">${prob}%</span>
      `;

      this.statesListEl.appendChild(item);
    }
  }

  /**
   * Reset the chart to the empty state.
   */
  reset() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.lastCounts = null;
    this.emptyEl.style.display = 'flex';
    this.canvasWrap.style.display = 'none';
    this.summaryEl.style.display = 'none';
  }
}
