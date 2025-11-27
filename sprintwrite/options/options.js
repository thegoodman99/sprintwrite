/* global Storage, Util */
(async function() {
  const themeSel = document.getElementById('theme');
  const soundToggle = document.getElementById('sound-toggle');
  const celebrationToggle = document.getElementById('celebration-toggle');
  const minimizeOnStartToggle = document.getElementById('minimize-on-start-toggle');
  const displayMode = document.getElementById('display-mode');
  const timerPreset1 = document.getElementById('timer-preset-1');
  const timerPreset2 = document.getElementById('timer-preset-2');
  const timerPreset3 = document.getElementById('timer-preset-3');
  const dailyGoalInput = document.getElementById('daily-goal');
  const saveAllBtn = document.getElementById('save-all-settings');
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
    minimizeOnStartToggle.checked = s.minimizeOnStart ?? false;
    displayMode.value = (s.compactMode ?? true) ? 'toolbar' : 'float';
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

  /**
   * Save all settings at once
   */
  async function saveAllSettings() {
    const s = await Storage.getSettings();

    // Validate timer presets
    const preset1 = parseInt(timerPreset1.value, 10);
    const preset2 = parseInt(timerPreset2.value, 10);
    const preset3 = parseInt(timerPreset3.value, 10);

    if (isNaN(preset1) || preset1 < 1 || preset1 > 180 ||
        isNaN(preset2) || preset2 < 1 || preset2 > 180 ||
        isNaN(preset3) || preset3 < 1 || preset3 > 180) {
      showToast('Please enter valid timer values (1-180 minutes)', 'error');
      return;
    }

    // Validate daily goal
    const goalValue = parseInt(dailyGoalInput.value, 10);
    if (isNaN(goalValue) || goalValue < 0) {
      showToast('Please enter a valid goal (0 or higher)', 'error');
      return;
    }

    // Save theme
    s.theme = themeSel.value;

    // Save preferences
    s.sound = soundToggle.checked;
    s.celebration = celebrationToggle.checked;
    s.minimizeOnStart = minimizeOnStartToggle.checked;
    s.compactMode = displayMode.value === 'toolbar';

    // Save timer presets
    s.timerPreset1 = preset1;
    s.timerPreset2 = preset2;
    s.timerPreset3 = preset3;

    // Save daily goal
    s.dailyGoal = goalValue;

    // Save all settings at once
    await Storage.setSettings(s);

    // Apply theme to options page
    await loadTheme();

    // Update goal progress display
    await updateGoalProgress();

    // Notify content script to refresh (ONLY ONCE)
    chrome.tabs.query({url: 'https://docs.google.com/document/*'}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {action: 'REFRESH_WIDGET'}).catch(() => {});
      });
    });

    showToast('✅ All settings saved successfully!');
  }

  let displayedCount = 0;
  const INITIAL_LOAD = 25;
  let allHistory = [];

  function calculateInsights(history) {
    if (history.length < 3) return null; // Need at least 3 sprints for insights

    // Best time of day (hour with highest avg WPM)
    const hourStats = {};
    history.forEach(r => {
      const hour = new Date(r.startISO).getHours();
      if (!hourStats[hour]) hourStats[hour] = { total: 0, count: 0, words: 0 };
      hourStats[hour].total += r.wpm || 0;
      hourStats[hour].count++;
      hourStats[hour].words += r.wordsGained || 0;
    });

    let bestHour = 0, bestAvgWPM = 0;
    Object.keys(hourStats).forEach(hour => {
      const avg = hourStats[hour].total / hourStats[hour].count;
      if (avg > bestAvgWPM) {
        bestAvgWPM = avg;
        bestHour = parseInt(hour);
      }
    });

    // Best sprint duration
    const durationStats = {};
    history.forEach(r => {
      const dur = r.durationMin;
      if (!durationStats[dur]) durationStats[dur] = { total: 0, count: 0, words: 0 };
      durationStats[dur].total += r.wpm || 0;
      durationStats[dur].count++;
      durationStats[dur].words += r.wordsGained || 0;
    });

    let bestDuration = 0, bestDurationWPM = 0;
    Object.keys(durationStats).forEach(dur => {
      if (durationStats[dur].count < 2) return; // Need at least 2 samples
      const avg = durationStats[dur].total / durationStats[dur].count;
      if (avg > bestDurationWPM) {
        bestDurationWPM = avg;
        bestDuration = parseInt(dur);
      }
    });

    // Most productive day
    const dayStats = {};
    history.forEach(r => {
      const day = new Date(r.startISO).toDateString();
      if (!dayStats[day]) dayStats[day] = 0;
      dayStats[day] += r.wordsGained || 0;
    });

    let bestDay = '', mostWords = 0;
    Object.keys(dayStats).forEach(day => {
      if (dayStats[day] > mostWords) {
        mostWords = dayStats[day];
        bestDay = day;
      }
    });

    // Current streak
    const today = new Date().toDateString();
    let streak = 0;
    const sortedDays = Object.keys(dayStats).sort((a, b) => new Date(b) - new Date(a));

    for (let i = 0; i < sortedDays.length; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const checkDay = checkDate.toDateString();
      if (sortedDays.includes(checkDay)) {
        streak++;
      } else {
        break;
      }
    }

    return {
      bestHour: bestHour,
      bestHourWPM: Math.round(bestAvgWPM),
      bestDuration: bestDuration,
      bestDurationWPM: Math.round(bestDurationWPM),
      bestDay: bestDay,
      mostWords: mostWords,
      streak: streak
    };
  }

  function renderInsights(insights) {
    const section = document.getElementById('insights-section');
    const content = document.getElementById('insights-content');

    if (!insights) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';

    const formatHour = (hour) => {
      if (hour === 0) return '12 AM';
      if (hour < 12) return `${hour} AM`;
      if (hour === 12) return '12 PM';
      return `${hour - 12} PM`;
    };

    content.innerHTML = `
      <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 4px;">Best Writing Time</div>
        <div style="font-size: 20px; font-weight: 700;">${formatHour(insights.bestHour)}</div>
        <div style="opacity: 0.9; font-size: 12px;">${insights.bestHourWPM} WPM avg</div>
      </div>
      <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 4px;">Best Sprint Length</div>
        <div style="font-size: 20px; font-weight: 700;">${insights.bestDuration} minutes</div>
        <div style="opacity: 0.9; font-size: 12px;">${insights.bestDurationWPM} WPM avg</div>
      </div>
      <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 4px;">Most Productive Day</div>
        <div style="font-size: 16px; font-weight: 700;">${new Date(insights.bestDay).toLocaleDateString()}</div>
        <div style="opacity: 0.9; font-size: 12px;">${insights.mostWords.toLocaleString()} words</div>
      </div>
      <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 4px;">Current Streak</div>
        <div style="font-size: 20px; font-weight: 700;">${insights.streak} ${insights.streak === 1 ? 'day' : 'days'}</div>
        <div style="opacity: 0.9; font-size: 12px;">Keep it up!</div>
      </div>
    `;
  }

  async function refreshHistory() {
    histTable.innerHTML = '';
    displayedCount = 0;

    allHistory = await Storage.getHistory();
    if (!allHistory.length) {
      histEmpty.textContent = 'No history yet. Complete a sprint to see entries.';
      document.getElementById('stat-sprints').textContent = '0';
      document.getElementById('stat-minutes').textContent = '0';
      document.getElementById('stat-words').textContent = '0';
      document.getElementById('stat-wpm').textContent = '0';
      document.getElementById('insights-section').style.display = 'none';
      document.getElementById('load-more').style.display = 'none';
      return;
    }

    histEmpty.textContent = '';

    // Calculate statistics
    const totalSprints = allHistory.length;
    const totalMinutes = allHistory.reduce((a, r) => a + Math.floor(r.completedSec / 60), 0);
    const totalWords = allHistory.reduce((a, r) => a + (r.wordsGained || 0), 0);
    const avgWPM = totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0;

    // Update statistics display
    document.getElementById('stat-sprints').textContent = totalSprints.toLocaleString();
    document.getElementById('stat-minutes').textContent = totalMinutes.toLocaleString();
    document.getElementById('stat-words').textContent = totalWords.toLocaleString();
    document.getElementById('stat-wpm').textContent = avgWPM;

    // Calculate and render insights
    const insights = calculateInsights(allHistory);
    renderInsights(insights);

    // Show first batch
    loadMoreHistory();
  }

  function loadMoreHistory() {
    const reversed = allHistory.slice().reverse();
    const toShow = reversed.slice(displayedCount, displayedCount + INITIAL_LOAD);

    toShow.forEach(r => {
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

      // Insert before summary row if it exists
      const summaryRow = histTable.querySelector('.summary-row');
      if (summaryRow) {
        histTable.insertBefore(tr, summaryRow);
      } else {
        histTable.appendChild(tr);
      }
    });

    displayedCount += toShow.length;

    // Update or add summary row
    let summaryRow = histTable.querySelector('.summary-row');
    if (!summaryRow) {
      summaryRow = document.createElement('tr');
      summaryRow.className = 'summary-row';
      histTable.appendChild(summaryRow);
    }

    const totalWordsSum = allHistory.reduce((a, r) => a + (r.wordsEnd - r.wordsStart), 0);
    const totalTimeSum = allHistory.reduce((a, r) => a + Math.floor(r.completedSec / 60), 0);

    summaryRow.innerHTML = `
      <td><strong>Totals</strong></td>
      <td><strong>${totalTimeSum} min</strong></td>
      <td><strong>${allHistory.length} sprints</strong></td>
      <td><strong>${totalWordsSum}</strong></td>
    `;

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('load-more');
    if (displayedCount < allHistory.length) {
      loadMoreBtn.style.display = 'inline-block';
      loadMoreBtn.textContent = `Load More (${allHistory.length - displayedCount} remaining)`;
    } else {
      loadMoreBtn.style.display = 'none';
    }
  }

  // Load More button handler
  document.getElementById('load-more').onclick = loadMoreHistory;

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

  // Single save button for all settings
  saveAllBtn.onclick = saveAllSettings;

  shareBtn.onclick = shareStats;
  exportBtn.onclick = exportCsv;
  clearBtn.onclick = clearHistory;
  refresh.onclick = async () => {
    await refreshHistory();
    await updateGoalProgress();
    showToast('History refreshed!');
  };

  // Refresh goal progress button
  const refreshGoalBtn = document.getElementById('refresh-goal');
  if (refreshGoalBtn) {
    refreshGoalBtn.onclick = async () => {
      await updateGoalProgress();
      showToast('Goal progress refreshed!');

      // Visual feedback - spin the icon
      refreshGoalBtn.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        refreshGoalBtn.style.transform = '';
      }, 300);
    };
  }

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
