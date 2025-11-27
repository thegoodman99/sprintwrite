/* global Storage, Util */

/**
 * Statistics Module
 * Handles statistics display, history viewing, and data export
 */

window.SprintWriteStats = {
  /**
   * Show statistics modal with different time periods
   */
  async showStats() {
    const hist = await Storage.getHistory();
    if (!hist.length) {
      alert('No statistics yet. Complete some sprints first!');
      return;
    }

    // Filter function for time periods
    const filterByPeriod = (history, period) => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      const startOfMonth = new Date(now);
      startOfMonth.setDate(now.getDate() - 30);

      return history.filter(record => {
        const recordDate = new Date(record.startISO);
        if (period === 'today') return recordDate >= startOfToday;
        if (period === 'week') return recordDate >= startOfWeek;
        if (period === 'month') return recordDate >= startOfMonth;
        return true; // all time
      });
    };

    // Calculate stats for a given filtered history
    const calculateStats = (filteredHist) => {
      const totalSprints = filteredHist.length;
      const totalMinutes = filteredHist.reduce((a, r) => a + Math.floor(r.completedSec / 60), 0);
      const totalWords = filteredHist.reduce((a, r) => a + (r.wordsGained || 0), 0);
      const avgWPM = totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0;
      return { totalSprints, totalMinutes, totalWords, avgWPM };
    };

    // Create stats HTML for a given period
    const renderStats = (period) => {
      const filteredHist = filterByPeriod(hist, period);
      if (filteredHist.length === 0) {
        return `
          <div class="sw-stat-grid">
            <div class="sw-stat-item" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
              <div style="color: var(--sw-text-secondary); font-size: 14px;">
                No sprints in this time period
              </div>
            </div>
          </div>
        `;
      }

      const stats = calculateStats(filteredHist);
      return `
        <div class="sw-stat-grid">
          <div class="sw-stat-item">
            <div class="sw-stat-value">${stats.totalSprints}</div>
            <div class="sw-stat-label">Total Sprints</div>
          </div>
          <div class="sw-stat-item">
            <div class="sw-stat-value">${stats.totalMinutes}</div>
            <div class="sw-stat-label">Minutes Written</div>
          </div>
          <div class="sw-stat-item">
            <div class="sw-stat-value">${stats.totalWords.toLocaleString()}</div>
            <div class="sw-stat-label">Words Written</div>
          </div>
          <div class="sw-stat-item">
            <div class="sw-stat-value">${stats.avgWPM}</div>
            <div class="sw-stat-label">Avg Words/Min</div>
          </div>
        </div>
      `;
    };

    const statsHtml = `
      <div class="sw-stats-overlay">
        <div class="sw-stats-panel">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${chrome.runtime.getURL('icons/logo_256px.png')}"
                 alt="SprintWrite"
                 style="max-width: 200px; height: auto;">
            <h2 style="margin: 12px 0 0 0; font-size: 20px;">📊 Your Statistics</h2>
          </div>

          <div class="sw-stats-tabs">
            <button class="sw-stats-tab active" data-period="all">All Time</button>
            <button class="sw-stats-tab" data-period="month">Month</button>
            <button class="sw-stats-tab" data-period="week">Week</button>
            <button class="sw-stats-tab" data-period="today">Today</button>
          </div>

          <div class="sw-stats-content" id="sw-stats-content">
            ${renderStats('all')}
          </div>

          <div class="sw-stats-actions">
            <button class="sw-secondary sw-stats-copy">📋 Copy Stats</button>
            <button class="sw-primary sw-stats-close">Close</button>
          </div>
        </div>
      </div>
    `;

    const overlay = document.createElement('div');
    overlay.innerHTML = statsHtml;
    document.body.appendChild(overlay);

    // Tab switching
    overlay.querySelectorAll('.sw-stats-tab').forEach(tab => {
      tab.onclick = () => {
        overlay.querySelectorAll('.sw-stats-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const period = tab.dataset.period;
        const content = overlay.querySelector('#sw-stats-content');
        content.innerHTML = renderStats(period);
      };
    });

    // Copy stats
    overlay.querySelector('.sw-stats-copy').onclick = async () => {
      const period = overlay.querySelector('.sw-stats-tab.active').dataset.period;
      const filteredHist = filterByPeriod(hist, period);
      const stats = calculateStats(filteredHist);

      const periodName = period.charAt(0).toUpperCase() + period.slice(1);
      const settings = await Storage.getSettings();
      const dailyGoal = settings.dailyGoal || 0;
      let goalSection = '';

      if (dailyGoal > 0 && period === 'today') {
        const progress = await Storage.getTodayProgress();
        const percentage = Math.min(100, Math.round((progress.wordsWritten / dailyGoal) * 100));
        goalSection = `\nWriting Goal Progress: ${progress.wordsWritten.toLocaleString()} / ${dailyGoal.toLocaleString()} words (${percentage}%)\n`;
      }

      const statsText = `SprintWrite – Writing Sprint Timer
${periodName} Statistics

Total Sprints: ${stats.totalSprints}
Minutes Written: ${stats.totalMinutes}
Words Written: ${stats.totalWords.toLocaleString()}
Avg Words/Min: ${stats.avgWPM}${goalSection}
Keep writing!

Track YOUR writing sprints FREE:
Chrome Extension: chrome.google.com/webstore (search "SprintWrite")
Created by: ko-fi.com/thegoodman99`;

      try {
        await navigator.clipboard.writeText(statsText);
        alert('Statistics copied to clipboard!');
      } catch (err) {
        alert('Could not copy to clipboard. Try again.');
      }
    };

    // Close
    overlay.querySelector('.sw-stats-close').onclick = () => overlay.remove();
    overlay.querySelector('.sw-stats-overlay').onclick = (e) => {
      if (e.target.classList.contains('sw-stats-overlay')) overlay.remove();
    };
  },

  /**
   * Show history modal (simplified version - full implementation in inject.js)
   */
  async showHistory() {
    alert('History modal - see options page for full history');
  },

  /**
   * Export history as CSV
   */
  async exportHistory() {
    const h = await Storage.getHistory();
    if (h.length === 0) {
      alert('No history to export yet!');
      return;
    }
    const csv = Util.toCsv(h);
    Util.download('sprintwrite_history.csv', csv);
  }
};
