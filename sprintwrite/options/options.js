/* global Storage, Util */
(async function() {
  const themeSel = document.getElementById('theme');
  const saveTheme = document.getElementById('save-theme');
  const soundToggle = document.getElementById('sound-toggle');
  const celebrationToggle = document.getElementById('celebration-toggle');
  const savePreferences = document.getElementById('save-preferences');
  const timerPreset1 = document.getElementById('timer-preset-1');
  const timerPreset2 = document.getElementById('timer-preset-2');
  const timerPreset3 = document.getElementById('timer-preset-3');
  const saveTimerPresets = document.getElementById('save-timer-presets');
  const dailyGoalInput = document.getElementById('daily-goal');
  const saveGoal = document.getElementById('save-goal');
  const todayProgress = document.getElementById('today-progress');
  const goalProgressText = document.getElementById('goal-progress-text');
  const goalBarFill = document.getElementById('goal-bar-fill');
  const goalSprintsText = document.getElementById('goal-sprints-text');
  const refresh = document.getElementById('refresh');
  const shareBtn = document.getElementById('share-stats');
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

  async function loadTimerPresets() {
    const s = await Storage.getSettings();
    timerPreset1.value = s.timerPreset1 || 15;
    timerPreset2.value = s.timerPreset2 || 20;
    timerPreset3.value = s.timerPreset3 || 30;
  }

  async function loadGoal() {
    const s = await Storage.getSettings();
    dailyGoalInput.value = s.dailyGoal || 0;
    await updateGoalProgress();
  }

  async function updateGoalProgress() {
    const s = await Storage.getSettings();
    const goal = s.dailyGoal || 0;

    if (goal === 0) {
      todayProgress.style.display = 'none';
      return;
    }

    const progress = await Storage.getTodayProgress();
    const wordsWritten = progress.wordsWritten;
    const sprintsCompleted = progress.sprintsCompleted;
    const percentage = Math.min(100, (wordsWritten / goal) * 100);

    todayProgress.style.display = 'block';
    goalProgressText.textContent = `${wordsWritten.toLocaleString()} / ${goal.toLocaleString()} words`;
    goalBarFill.style.width = percentage + '%';
    goalSprintsText.textContent = `${sprintsCompleted} sprint${sprintsCompleted !== 1 ? 's' : ''} completed today`;
  }

  async function saveGoalNow() {
    const s = await Storage.getSettings();
    const goalValue = parseInt(dailyGoalInput.value, 10);

    if (isNaN(goalValue) || goalValue < 0) {
      showToast('Please enter a valid goal (0 or higher)', 'error');
      return;
    }

    s.dailyGoal = goalValue;
    await Storage.setSettings(s);
    await updateGoalProgress();

    if (goalValue === 0) {
      showToast('Daily goal disabled');
    } else {
      showToast(`Daily goal set to ${goalValue.toLocaleString()} words!`);
    }
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

  async function saveTimerPresetsNow() {
    const s = await Storage.getSettings();

    // Validate inputs
    const preset1 = parseInt(timerPreset1.value, 10);
    const preset2 = parseInt(timerPreset2.value, 10);
    const preset3 = parseInt(timerPreset3.value, 10);

    if (isNaN(preset1) || preset1 < 1 || preset1 > 180 ||
        isNaN(preset2) || preset2 < 1 || preset2 > 180 ||
        isNaN(preset3) || preset3 < 1 || preset3 > 180) {
      showToast('Please enter valid timer values (1-180 minutes)', 'error');
      return;
    }

    s.timerPreset1 = preset1;
    s.timerPreset2 = preset2;
    s.timerPreset3 = preset3;
    await Storage.setSettings(s);

    showToast('Timer presets saved! Reload your Google Docs to see changes.');
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

  async function shareStats() {
    const hist = await Storage.getHistory();
    if (hist.length === 0) {
      showToast('No stats to share yet. Complete some sprints first!', 'error');
      return;
    }

    // Calculate statistics
    const totalSprints = hist.length;
    const totalMinutes = hist.reduce((a, r) => a + Math.floor(r.completedSec / 60), 0);
    const totalWords = hist.reduce((a, r) => a + (r.wordsGained || 0), 0);
    const avgWPM = totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0;

    // Get daily goal progress if available
    const settings = await Storage.getSettings();
    const dailyGoal = settings.dailyGoal || 0;
    let goalSection = '';

    if (dailyGoal > 0) {
      const progress = await Storage.getTodayProgress();
      const percentage = Math.min(100, Math.round((progress.wordsWritten / dailyGoal) * 100));
      goalSection = `
Daily Goal Progress: ${progress.wordsWritten.toLocaleString()} / ${dailyGoal.toLocaleString()} words (${percentage}%)
`;
    }

    const statsText = `SprintWrite – Writing Sprint Timer
All Time Statistics

Total Sprints: ${totalSprints}
Minutes Written: ${totalMinutes}
Words Written: ${totalWords.toLocaleString()}
Avg Words/Min: ${avgWPM}${goalSection}
Keep writing!

Track YOUR writing sprints FREE:
Chrome Extension: chrome.google.com/webstore (search "SprintWrite")
Created by: ko-fi.com/thegoodman99`;

    try {
      await navigator.clipboard.writeText(statsText);
      showToast('Stats copied to clipboard! Ready to share.');
    } catch (err) {
      console.error('Failed to copy stats:', err);
      showToast('Failed to copy stats. Please try again.', 'error');
    }
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
  saveTimerPresets.onclick = saveTimerPresetsNow;
  saveGoal.onclick = saveGoalNow;
  shareBtn.onclick = shareStats;
  exportBtn.onclick = exportCsv;
  clearBtn.onclick = clearHistory;
  refresh.onclick = async () => {
    await refreshHistory();
    await updateGoalProgress();
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
  await loadTimerPresets();
  await loadGoal();
  await refreshHistory();
})();
