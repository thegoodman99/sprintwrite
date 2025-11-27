/* global Storage, Util, SprintWriteRender, SprintWriteUI, SprintWriteSprint, SprintWriteStats, SprintWriteWordCount */

/**
 * Event Handlers Module
 * Handles all UI event binding and user interactions
 */

window.SprintWriteHandlers = {
  /**
   * Bind all UI event handlers
   */
  bindUI(root, state) {
    // Store reference for use in sprint logic
    const handlers = this;

    // Minimize button
    const minimizeBtn = root.querySelector('.sw-minimize');
    if (minimizeBtn) {
      minimizeBtn.onclick = async () => {
        state.minimized = !state.minimized;

        // If user is expanding, exit minimal mode
        if (!state.minimized) {
          state.inMinimalMode = false;
        }

        const s = await Storage.getSettings();
        s.minimized = state.minimized;
        await Storage.setSettings(s);
        root.innerHTML = SprintWriteRender.render(state);
        this.bindUI(root, state);
      };
    }

    // Refresh button
    const refreshBtn = root.querySelector('#sw-refresh');
    if (refreshBtn) {
      refreshBtn.onclick = async () => {

        // Reload settings from storage
        const s = await Storage.getSettings();
        state.theme = s.theme || 'light';
        state.sound = s.sound ?? true;
        state.celebration = s.celebration ?? true;
        state.minimizeOnStart = s.minimizeOnStart ?? false;
        state.dailyGoal = s.dailyGoal || 0;
        state.timerPreset1 = s.timerPreset1 || 15;
        state.timerPreset2 = s.timerPreset2 || 20;
        state.timerPreset3 = s.timerPreset3 || 30;
        state.compactMode = s.compactMode ?? true;

        // Apply theme
        SprintWriteUI.applyThemeClass(root, state.theme);

        // Refresh daily goal progress
        if (state.dailyGoal > 0) {
          const progress = await Storage.getTodayProgress();
          state.todayWordsWritten = progress.wordsWritten;
        }

        // Reposition if in toolbar mode
        if (state.compactMode) {
          root.classList.add('sw-compact');
          SprintWriteUI.positionToolbarMode(root);
        } else {
          root.classList.remove('sw-compact');
          root.style.top = state.position.top + 'px';
          root.style.right = state.position.right + 'px';
        }

        // Re-render
        root.innerHTML = SprintWriteRender.render(state);
        this.bindUI(root, state);

        // Show brief visual feedback
        refreshBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
          const btn = root.querySelector('#sw-refresh');
          if (btn) btn.style.transform = 'rotate(0deg)';
        }, 300);
      };
    }

    // Logo click to toggle minimize
    const logo = root.querySelector('.sw-logo');
    if (logo) {
      logo.onclick = async (e) => {
        e.stopPropagation();
        state.minimized = !state.minimized;
        const s = await Storage.getSettings();
        s.minimized = state.minimized;
        await Storage.setSettings(s);
        root.innerHTML = SprintWriteRender.render(state);
        this.bindUI(root, state);
      };
      logo.style.cursor = 'pointer';
    }

    // Menu
    const menu = root.querySelector('#sw-menu');
    const panel = root.querySelector('#sw-menu-panel');

    if (menu && panel) {
      const toggleMenu = (e) => {
        e.stopPropagation();
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
      };

      menu.onclick = toggleMenu;
      document.addEventListener('click', () => { panel.style.display = 'none'; });
    }

    // Export data
    const exportBtn = root.querySelector('#sw-export-data');
    if (exportBtn) {
      exportBtn.onclick = async (e) => {
        e.preventDefault();
        await SprintWriteStats.exportHistory();
      };
    }

    // Open options page
    const optionsBtn = root.querySelector('#sw-open-options');
    if (optionsBtn) {
      optionsBtn.onclick = (e) => {
        e.preventDefault();
        chrome.runtime.sendMessage({action: 'OPEN_OPTIONS'});
      };
    }

    // Toggle compact mode
    const compactToggle = root.querySelector('#sw-toggle-compact');
    if (compactToggle) {
      compactToggle.onclick = async (e) => {
        e.preventDefault();
        state.compactMode = !state.compactMode;

        // Save setting
        const s = await Storage.getSettings();
        s.compactMode = state.compactMode;
        await Storage.setSettings(s);

        // Toggle class and reposition
        if (state.compactMode) {
          root.classList.add('sw-compact');
          SprintWriteUI.positionToolbarMode(root);
        } else {
          root.classList.remove('sw-compact');
          root.style.top = state.position.top + 'px';
          root.style.right = state.position.right + 'px';
        }

        // Re-render to update menu text
        root.innerHTML = SprintWriteRender.render(state);
        this.bindUI(root, state);
      };
    }

    // Stats
    const statsBtn = root.querySelector('#sw-view-stats');
    if (statsBtn) {
      statsBtn.onclick = async (e) => {
        e.preventDefault();
        await SprintWriteStats.showStats();
      };
    }

    // History
    const historyBtn = root.querySelector('#sw-view-history');
    if (historyBtn) {
      historyBtn.onclick = async (e) => {
        e.preventDefault();
        await SprintWriteStats.showHistory();
      };
    }

    // Duration buttons
    const durBtns = root.querySelectorAll('.sw-dur-btn[data-duration]');
    durBtns.forEach(btn => {
      btn.onclick = () => {
        if (state.running) return;
        state.durationSec = parseInt(btn.dataset.duration, 10);
        root.innerHTML = SprintWriteRender.render(state);
        this.bindUI(root, state);
      };
    });

    // Custom button
    const customBtn = root.querySelector('#sw-custom-btn');
    if (customBtn) {
      customBtn.onclick = () => {
        if (state.running) return;
        const customInput = root.querySelector('#sw-custom-input');
        if (customInput) {
          customInput.style.display = customInput.style.display === 'none' ? 'flex' : 'none';
        }
      };
    }

    // Custom set button
    const customSet = root.querySelector('#sw-custom-set');
    const customInput = root.querySelector('#sw-custom');
    if (customSet && customInput) {
      customSet.onclick = () => {
        if (state.running) return;

        const rawValue = customInput.value.trim();
        const numValue = parseFloat(rawValue);

        if (!rawValue || isNaN(numValue) || numValue <= 0) {
          alert('Please enter a valid number between 1 and 180 minutes.');
          customInput.value = '15';
          return;
        }

        const minutes = Math.max(1, Math.min(180, Math.round(numValue)));
        customInput.value = minutes;
        state.durationSec = minutes * 60;
        root.innerHTML = SprintWriteRender.render(state);
        this.bindUI(root, state);
      };
    }

    // Start/Pause/Resume button
    const startBtn = root.querySelector('#sw-start');
    if (startBtn) {
      startBtn.onclick = () => {
        if (state.running && !state.paused) {
          // PAUSE
          state.paused = true;
          state.pausedAt = Date.now()/1000;
          clearTimeout(state.timerId);
          if (state.sound) SprintWriteSprint.playSound('pause');
          root.innerHTML = SprintWriteRender.render(state);
          this.bindUI(root, state);
          return;
        }

        if (state.paused) {
          // RESUME
          state.paused = false;
          const pauseDuration = Date.now()/1000 - state.pausedAt;
          state.totalPausedTime += pauseDuration;
          state.endEpoch += pauseDuration;
          root.innerHTML = SprintWriteRender.render(state);
          this.bindUI(root, state);
          SprintWriteSprint.startTicking(root, state, handlers);
          return;
        }

        // START
        this.startNewSprint(root, state, handlers);
      };
    }

    // Reset button
    const resetBtn = root.querySelector('#sw-reset');
    if (resetBtn) {
      resetBtn.onclick = () => {
        state.running = false;
        state.paused = false;
        state.startEpoch = 0;
        state.endEpoch = 0;
        state.totalPausedTime = 0;
        state.wordsPerMinute = 0;
        clearTimeout(state.timerId);
        window.removeEventListener('beforeunload', SprintWriteSprint.confirmUnload(state));
        root.innerHTML = SprintWriteRender.render(state);
        this.bindUI(root, state);
      };
    }

    // Re-attach draggable functionality after UI updates
    SprintWriteUI.makeDraggable(root, state);
  },

  /**
   * Start a new sprint with countdown
   */
  startNewSprint(root, state, handlers) {
    // Check if word count is visible (warning shown in widget UI if not)
    SprintWriteWordCount.ensureWordCountVisible();

    // Capture initial word count and start 3-second countdown
    state.wordsAtSprintStart = Util.countWordsHeuristic();
    state.wordsNow = state.wordsAtSprintStart;
    state.wordsPerMinute = 0;

    const timeDisplay = root.querySelector('#sw-time');
    if (timeDisplay) {
      timeDisplay.textContent = 'Starting in 3';
      setTimeout(() => {
        timeDisplay.textContent = 'Starting in 2';
        setTimeout(() => {
          timeDisplay.textContent = 'Starting in 1';
          setTimeout(async () => {
            // Actually start the timer
            state.running = true;
            state.paused = false;
            state.totalPausedTime = 0;
            state.startEpoch = Date.now()/1000;
            state.endEpoch = state.startEpoch + state.durationSec;

            // Auto-minimize if enabled
            if (state.minimizeOnStart && !state.minimized) {
              state.minimized = true;
              state.inMinimalMode = true; // Enter minimal mode on sprint start
              const s = await Storage.getSettings();
              s.minimized = true;
              await Storage.setSettings(s);
            }

            root.innerHTML = SprintWriteRender.render(state);
            handlers.bindUI(root, state);
            SprintWriteSprint.startTicking(root, state, handlers);
            window.addEventListener('beforeunload', SprintWriteSprint.confirmUnload(state));
          }, 1000);
        }, 1000);
      }, 1000);
    }
  }
};
