/* global Storage, Util */
(async function() {
  const themeSel = document.getElementById('theme');
  const saveTheme = document.getElementById('save-theme');
  const soundToggle = document.getElementById('sound-toggle');
  const celebrationToggle = document.getElementById('celebration-toggle');
  const savePreferences = document.getElementById('save-preferences');
  const refresh = document.getElementById('refresh');
  const exportBtn = document.getElementById('export');
  const clearBtn = document.getElementById('clear-history');
  const histTable = document.getElementById('hist').querySelector('tbody');
  const histEmpty = document.getElementById('hist-empty');

  async function loadTheme() {
    const s = await Storage.getSettings();
    themeSel.value = s.theme || 'light';
    
    // Apply theme to options page
    document.body.className = '';
    if (s.theme !== 'light') {
      document.body.classList.add('theme-' + s.theme);
    }
  }

  async function loadPreferences() {
    const s = await Storage.getSettings();
    soundToggle.checked = s.sound ?? true;
    celebrationToggle.checked = s.celebration ?? true;
  }

  async function saveThemeNow() {
    const s = await Storage.getSettings();
    s.theme = themeSel.value;
    await Storage.setSettings(s);
    
    // Apply theme immediately
    await loadTheme();
    
    // Notify content script to refresh
    chrome.tabs.query({url: 'https://docs.google.com/document/*'}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {action: 'REFRESH_WIDGET'}).catch(() => {});
      });
    });
    
    showToast('Theme saved successfully!');
  }

  async function savePreferencesNow() {
    const s = await Storage.getSettings();
    s.sound = soundToggle.checked;
    s.celebration = celebrationToggle.checked;
    await Storage.setSettings(s);
    
    // Notify content script to refresh
    chrome.tabs.query({url: 'https://docs.google.com/document/*'}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {action: 'REFRESH_WIDGET'}).catch(() => {});
      });
    });
    
    showToast('Preferences saved successfully!');
  }

  async function refreshHistory() {
    histTable.innerHTML = '';
    
    const hSync = await Storage.getHistory();
    if (!hSync.length) {
      histEmpty.textContent = 'No history yet. Complete a sprint to see entries.';
      // Update stats to zero
      document.getElementById('stat-sprints').textContent = '0';
      document.getElementById('stat-minutes').textContent = '0';
      document.getElementById('stat-words').textContent = '0';
      document.getElementById('stat-wpm').textContent = '0';
      return;
    }
    
    histEmpty.textContent = '';
    
    // Calculate statistics
    const totalSprints = hSync.length;
    const totalMinutes = hSync.reduce((a, r) => a + Math.floor(r.completedSec / 60), 0);
    const totalWords = hSync.reduce((a, r) => a + (r.wordsGained || 0), 0);
    const avgWPM = totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0;
    
    // Update statistics display
    document.getElementById('stat-sprints').textContent = totalSprints.toLocaleString();
    document.getElementById('stat-minutes').textContent = totalMinutes.toLocaleString();
    document.getElementById('stat-words').textContent = totalWords.toLocaleString();
    document.getElementById('stat-wpm').textContent = avgWPM;
    
    // Show most recent first
    for (const r of hSync.slice().reverse()) {
      const tr = document.createElement('tr');
      const wordsDelta = (r.wordsEnd - r.wordsStart);
      const completedMin = Math.floor(r.completedSec / 60);
      const completedSec = r.completedSec % 60;
      const timeStr = `${completedMin}m ${completedSec}s`;
      
      tr.innerHTML = `
        <td>${new Date(r.startISO).toLocaleString()}</td>
        <td>${r.durationMin} min</td>
        <td>${timeStr}</td>
        <td class="${wordsDelta > 0 ? 'positive' : ''}">${wordsDelta > 0 ? '+' : ''}${wordsDelta}</td>
      `;
      histTable.appendChild(tr);
    }
    
    // Add summary row
    const totalWordsSum = hSync.reduce((a, r) => a + (r.wordsEnd - r.wordsStart), 0);
    const totalTimeSum = hSync.reduce((a, r) => a + Math.floor(r.completedSec / 60), 0);
    
    const summaryRow = document.createElement('tr');
    summaryRow.className = 'summary-row';
    summaryRow.innerHTML = `
      <td><strong>Totals</strong></td>
      <td><strong>${totalTimeSum} min</strong></td>
      <td><strong>${hSync.length} sprints</strong></td>
      <td><strong>${totalWordsSum}</strong></td>
    `;
    histTable.appendChild(summaryRow);
  }

  async function exportCsv() {
    const h = await Storage.getHistory();
    if (h.length === 0) {
      showToast('No history to export yet!', 'error');
      return;
    }
    const csv = Util.toCsv(h);
    Util.download('sprintwrite_history.csv', csv);
    showToast('History exported successfully!');
  }

  async function clearHistory() {
    if (!confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      return;
    }
    
    await Storage.set('sw_history', [], 'sync');
    await Storage.set('sw_history', [], 'local');
    
    await refreshHistory();
    showToast('History cleared successfully!');
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('toast-show'), 10);
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  saveTheme.onclick = saveThemeNow;
  savePreferences.onclick = savePreferencesNow;
  exportBtn.onclick = exportCsv;
  clearBtn.onclick = clearHistory;
  refresh.onclick = async () => { 
    await refreshHistory();
    showToast('History refreshed!');
  };

  // Theme preview on change
  themeSel.onchange = async () => {
    document.body.className = '';
    if (themeSel.value !== 'light') {
      document.body.classList.add('theme-' + themeSel.value);
    }
  };

  await loadTheme();
  await loadPreferences();
  await refreshHistory();
})();
