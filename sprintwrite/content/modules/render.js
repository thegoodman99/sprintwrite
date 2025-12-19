/* global Util */

/**
 * Rendering Module
 * Handles all UI rendering and updates
 */

window.SprintWriteRender = {
  /**
   * Render writing goal section
   */
  renderDailyGoal(state, wordsAddedThisSprint = 0) {
    if (!state.dailyGoal || state.dailyGoal === 0) {
      return '';
    }

    // Include current sprint progress in real-time
    const wordsWritten = state.todayWordsWritten + wordsAddedThisSprint;
    const percentage = Math.min(100, (wordsWritten / state.dailyGoal) * 100);
    const remaining = Math.max(0, state.dailyGoal - wordsWritten);

    return `
      <div class="sw-daily-goal">
        <div class="sw-goal-header">
          <span class="sw-mini">Writing Goal</span>
          <span class="sw-mini sw-goal-fraction" style="color: var(--sw-accent); font-weight: 600;">${wordsWritten.toLocaleString()} / ${state.dailyGoal.toLocaleString()}</span>
        </div>
        <div class="sw-goal-bar">
          <div class="sw-goal-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="sw-mini sw-goal-remaining" style="text-align: center; color: var(--sw-text-secondary); margin-top: 3px;">
          ${remaining > 0 ? `${remaining.toLocaleString()} words to go` : '✓ Goal reached!'}
        </div>
      </div>
    `;
  },

  /**
   * Main render function
   */
  render(state) {
    // Calculate time to display
    let timeToShow;
    if (state.running && !state.paused) {
      timeToShow = Math.max(0, state.endEpoch - Date.now()/1000);
    } else if (state.paused) {
      timeToShow = Math.max(0, state.endEpoch - state.pausedAt);
    } else {
      timeToShow = state.durationSec;
    }
    const timeStr = Util.fmtTime(timeToShow);

    // Word count display
    const wordsAdded = state.running ? Math.max(0, state.wordsNow - state.wordsAtSprintStart) : 0;

    // Show current WPM during/after sprint, or last sprint's WPM when idle
    let wpmDisplay = '';
    if (state.wordsPerMinute > 0) {
      wpmDisplay = `<div class="sw-mini" style="color: var(--sw-accent); font-weight: 600;">${state.wordsPerMinute} WPM</div>`;
    } else if (state.lastSprintWPM > 0 && !state.running) {
      wpmDisplay = `<div class="sw-mini" style="color: var(--sw-text-secondary); font-weight: 500;" title="Last sprint">${state.lastSprintWPM} WPM (last)</div>`;
    }

    // Check if word count is visible - show warning at all times if hidden
    const wordCountVisible = document.querySelector('.kix-documentmetrics-widget-number');
    const needsWordCount = !wordCountVisible;
    const wordCountHelp = needsWordCount ? `
      <div class="sw-compact-notice" style="background: #ff9800; color: white; padding: 8px 12px; border-radius: 6px; text-align: center; margin-bottom: 12px; font-size: 12px; font-weight: 600;" title="Enable word count: Tools → Word count, then check 'Display word count while typing'">
        ⚠️ Enable word count: <strong>Tools → Word count</strong>
      </div>
    ` : '';

    const minimizedClass = state.minimized ? ' sw-minimized' : '';
    const minimizeIcon = state.minimized ? '▼' : '▲';
    const minimizeLabel = state.minimized ? 'Expand' : 'Minimize';

    // Start/Pause button
    let startBtnText = 'Start';
    if (state.running && !state.paused) {
      startBtnText = 'Pause';
    } else if (state.paused) {
      startBtnText = 'Resume';
    }

    return `
      <div class="sw-card${minimizedClass}" aria-live="polite">
        <div class="sw-header">
          <div class="sw-header-title" style="display:flex;gap:8px;align-items:center;flex:1">
            <img src="${chrome.runtime.getURL('icons/logo_256px.png')}"
                 alt="SprintWrite"
                 class="sw-logo"
                 title="Click to ${state.minimized ? 'expand' : 'collapse'}"
                 style="height: ${state.compactMode ? '20px' : '24px'}; width: auto; display: block;">
          </div>
          <button class="sw-minimize" title="${minimizeLabel}" aria-label="${minimizeLabel} widget">${minimizeIcon}</button>
          <button class="sw-refresh" id="sw-refresh" title="Refresh widget" aria-label="Refresh widget">🔄</button>
          <div class="sw-menu" id="sw-menu" role="button" aria-label="Menu" tabindex="0">⋮</div>
          <div class="sw-menu-panel" id="sw-menu-panel" role="menu">
            <a href="#" id="sw-toggle-compact" role="menuitem">📍 ${state.compactMode ? 'Float Mode' : 'Toolbar Mode'}</a>
            <a href="#" id="sw-open-options" role="menuitem">⚙️ Options & Goal</a>
            <a href="#" id="sw-view-stats" role="menuitem">📊 Statistics</a>
            <a href="#" id="sw-export-data" role="menuitem">📥 Export Data</a>
            <a href="https://ko-fi.com/thegoodman99" target="_blank" role="menuitem">☕ Buy Me a Drink</a>
          </div>
        </div>

        <div class="sw-body" style="${state.minimized && !state.inMinimalMode ? 'display:none' : ''}">
          ${wordCountHelp}

          ${state.minimized && state.inMinimalMode ? `
            <!-- Minimal mode: compact view with controls -->
            <div class="sw-row" style="justify-content: center;">
              <div class="sw-time" id="sw-time" role="timer" aria-live="polite" style="font-size: 28px;">${timeStr}</div>
            </div>

            ${state.running ? '' : `
              <div class="sw-row" id="sw-duration" style="gap: 6px; flex-wrap: wrap;">
                <button class="sw-dur-btn ${state.durationSec===state.timerPreset1*60?'active':''}" data-duration="${state.timerPreset1*60}">${state.timerPreset1}m</button>
                <button class="sw-dur-btn ${state.durationSec===state.timerPreset2*60?'active':''}" data-duration="${state.timerPreset2*60}">${state.timerPreset2}m</button>
                <button class="sw-dur-btn ${state.durationSec===state.timerPreset3*60?'active':''}" data-duration="${state.timerPreset3*60}">${state.timerPreset3}m</button>
                <button class="sw-dur-btn ${![state.timerPreset1*60,state.timerPreset2*60,state.timerPreset3*60].includes(state.durationSec)?'active':''}" id="sw-custom-btn">Custom</button>
              </div>

              <div class="sw-row" id="sw-custom-input" style="${![state.timerPreset1*60,state.timerPreset2*60,state.timerPreset3*60].includes(state.durationSec) ? '' : 'display:none;'} gap: 8px;">
                <input id="sw-custom" class="sw-number" type="number" min="1" max="180" step="1" value="${Math.round(state.durationSec/60)}" placeholder="Minutes" />
                <button id="sw-custom-set" class="sw-secondary">Set</button>
              </div>
            `}

            <div class="sw-row" style="gap: 10px;">
              <button id="sw-start" class="sw-primary" style="flex: 2;" title="${startBtnText} sprint">${startBtnText}</button>
              <button id="sw-reset" style="flex: 1;" title="Reset timer">Reset</button>
            </div>
          ` : `
            <!-- Full widget view -->
            <div class="sw-row">
              <div class="sw-time" id="sw-time" role="timer" aria-live="polite">${timeStr}</div>
              <div class="sw-col" style="align-items:flex-end; gap: 4px;">
                <div class="sw-mini" style="font-size: 14px;"><strong id="sw-words-total">${state.wordsNow}</strong> words</div>
                <div class="sw-mini" style="color: var(--sw-success); font-weight: 600; font-size: 13px;"><strong id="sw-words-added">+${wordsAdded}</strong> added</div>
                ${wpmDisplay}
              </div>
            </div>

            <div class="sw-progress-bar">
              <div class="sw-progress-fill" id="sw-progress" style="width: 0%"></div>
            </div>

            ${this.renderDailyGoal(state, wordsAdded)}

            <div class="sw-row" id="sw-duration" style="gap: 6px; flex-wrap: wrap;">
              <button class="sw-dur-btn ${state.durationSec===state.timerPreset1*60?'active':''}" data-duration="${state.timerPreset1*60}">${state.timerPreset1}m</button>
              <button class="sw-dur-btn ${state.durationSec===state.timerPreset2*60?'active':''}" data-duration="${state.timerPreset2*60}">${state.timerPreset2}m</button>
              <button class="sw-dur-btn ${state.durationSec===state.timerPreset3*60?'active':''}" data-duration="${state.timerPreset3*60}">${state.timerPreset3}m</button>
              <button class="sw-dur-btn ${![state.timerPreset1*60,state.timerPreset2*60,state.timerPreset3*60].includes(state.durationSec)?'active':''}" id="sw-custom-btn">Custom</button>
            </div>

            <div class="sw-row" id="sw-custom-input" style="${![state.timerPreset1*60,state.timerPreset2*60,state.timerPreset3*60].includes(state.durationSec) ? '' : 'display:none;'} gap: 8px;">
              <input id="sw-custom" class="sw-number" type="number" min="1" max="180" step="1" value="${Math.round(state.durationSec/60)}" placeholder="Minutes" />
              <button id="sw-custom-set" class="sw-secondary">Set</button>
            </div>

            <div class="sw-row" style="gap: 10px;">
              <button id="sw-start" class="sw-primary" style="flex: 2;" title="${startBtnText} sprint">${startBtnText}</button>
              <button id="sw-reset" style="flex: 1;" title="Reset timer">Reset</button>
            </div>
          `}
        </div>
      </div>
    `;
  },

  /**
   * Update time display during sprint
   */
  updateTimeUI(root, state) {
    const tEl = root.querySelector('#sw-time');
    const progressEl = root.querySelector('#sw-progress');

    if (state.running && !state.paused) {
      const remain = Math.max(0, Math.floor(state.endEpoch - Date.now()/1000));
      if (tEl) tEl.textContent = Util.fmtTime(remain);

      // Update progress bar
      if (progressEl) {
        const totalDur = state.durationSec;
        const elapsed = totalDur - remain;
        const percent = Math.min(100, (elapsed / totalDur) * 100);
        progressEl.style.width = percent + '%';
      }
    }
  },

  /**
   * Update word count display
   */
  updateWordsUI(root, state, currentTotal) {
    const totalEl = root.querySelector('#sw-words-total');
    const addedEl = root.querySelector('#sw-words-added');

    state.wordsNow = currentTotal;

    if (totalEl) totalEl.textContent = currentTotal;
    if (addedEl && state.running) {
      const wordsAdded = Math.max(0, currentTotal - state.wordsAtSprintStart);
      addedEl.textContent = `+${wordsAdded}`;

      // Update daily goal progress in real-time
      if (state.dailyGoal && state.dailyGoal > 0) {
        const goalFractionEl = root.querySelector('.sw-goal-fraction');
        const goalFillBar = root.querySelector('.sw-goal-fill');
        const goalRemainingEl = root.querySelector('.sw-goal-remaining');

        if (goalFractionEl && goalFillBar && goalRemainingEl) {
          const totalWordsToday = state.todayWordsWritten + wordsAdded;
          const percentage = Math.min(100, (totalWordsToday / state.dailyGoal) * 100);
          const remaining = Math.max(0, state.dailyGoal - totalWordsToday);

          goalFractionEl.textContent = `${totalWordsToday.toLocaleString()} / ${state.dailyGoal.toLocaleString()}`;
          goalFillBar.style.width = `${percentage}%`;
          goalRemainingEl.textContent = remaining > 0 ? `${remaining.toLocaleString()} words to go` : '✓ Goal reached!';
        }
      }
    }
  }
};
