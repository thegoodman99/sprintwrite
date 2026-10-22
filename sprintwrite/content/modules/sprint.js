/* global Storage, Util, SprintWriteRender, SprintWriteCelebrations, SprintWriteWordCount */

/**
 * Sprint Logic Module
 * Handles all sprint timer functionality, state management during sprints
 */

window.SprintWriteSprint = {
  /**
   * Confirm before leaving page during active sprint
   */
  confirmUnload(state) {
    // Cache the handler so add/removeEventListener receive the same function
    if (!state.unloadHandler) {
      state.unloadHandler = function(e) {
        if (state.running && !state.paused) {
          e.preventDefault();
          e.returnValue = 'Your sprint is still running. Are you sure you want to leave?';
          return e.returnValue;
        }
        if (state.pendingSprints.length > 0) {
          e.preventDefault();
          e.returnValue = 'A finished sprint has not been saved yet. Are you sure you want to leave?';
          return e.returnValue;
        }
      };
    }
    return state.unloadHandler;
  },

  /**
   * Keep the leave-page warning attached only while there is something to lose
   */
  updateUnloadGuard(state) {
    const handler = this.confirmUnload(state);
    if (state.running || state.pendingSprints.length > 0) {
      window.addEventListener('beforeunload', handler);
    } else {
      window.removeEventListener('beforeunload', handler);
    }
  },

  /**
   * Show a short notice at the top of the page
   */
  showNotice(message, background) {
    const notice = document.createElement('div');
    notice.style.cssText = `
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: ${background};
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999999;
      cursor: pointer;
    `;
    notice.textContent = message;
    notice.onclick = () => notice.remove();
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 10000);
  },

  /**
   * Retry sprints that failed to save. Returns true when none are left.
   */
  async flushPendingSprints(root, state, handlers) {
    clearTimeout(state.pendingRetryId);
    state.pendingRetryId = null;
    if (state.pendingSprints.length === 0) return true;

    const stillPending = [];
    for (const record of state.pendingSprints) {
      if (!(await Storage.appendHistory(record))) stillPending.push(record);
    }
    const savedCount = state.pendingSprints.length - stillPending.length;
    state.pendingSprints = stillPending;

    if (savedCount > 0) {
      state.todayWordsWritten = (await Storage.getTodayProgress()).wordsWritten;
      this.showNotice(`✓ Saved ${savedCount} unsaved sprint${savedCount === 1 ? '' : 's'}`, '#43a047');
      if (!state.running) {
        root.innerHTML = SprintWriteRender.render(state);
        handlers.bindUI(root, state);
      }
    }

    if (stillPending.length > 0) {
      state.pendingRetryId = setTimeout(() => this.flushPendingSprints(root, state, handlers), 60000);
    }
    this.updateUnloadGuard(state);
    return stillPending.length === 0;
  },

  /**
   * Play sound effects
   */
  playSound(type) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'complete') {
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'pause') {
        oscillator.frequency.value = 400;
        gainNode.gain.value = 0.2;
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      }
    } catch (e) {
      // Audio not available
    }
  },

  /**
   * Start the sprint ticker (polls for word count and time updates)
   */
  startTicking(root, state, handlers) {
    let lastWordCountCheck = Date.now();
    let wordCountWarningShown = false;

    const poll = Util.throttle(() => {
      state.wordsNow = Util.countWordsHeuristic();
      SprintWriteRender.updateWordsUI(root, state, state.wordsNow);

      // Check if word count is still visible every 5 seconds
      const now = Date.now();
      if (now - lastWordCountCheck > 5000) {
        lastWordCountCheck = now;
        const wordCountVisible = document.querySelector('.kix-documentmetrics-widget-number');

        if (!wordCountVisible && !wordCountWarningShown) {
          wordCountWarningShown = true;

          // Show non-intrusive warning
          const warningDiv = document.createElement('div');
          warningDiv.style.cssText = `
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff9800;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999999;
            cursor: pointer;
          `;
          warningDiv.textContent = '⚠️ Word count hidden! Click Tools → Word count to re-enable';
          warningDiv.onclick = () => warningDiv.remove();
          document.body.appendChild(warningDiv);

          // Auto-remove after 10 seconds
          setTimeout(() => {
            if (warningDiv.parentNode) {
              warningDiv.remove();
            }
          }, 10000);
        }
      }
    }, 1000);

    const tick = () => {
      if (!state.running || state.paused) return;
      SprintWriteRender.updateTimeUI(root, state);
      poll();
      const remain = state.endEpoch - Date.now()/1000;
      if (remain <= 0) {
        this.finishSprint(root, state, handlers, true);
      } else {
        state.timerId = setTimeout(tick, 250);
      }
    };
    tick();
  },

  /**
   * Finish the sprint (called when timer completes or user manually finishes)
   */
  async finishSprint(root, state, handlers, natural) {
    state.running = false;
    state.paused = false;
    clearTimeout(state.timerId);

    const completedSec = Math.max(0, Math.floor((Date.now()/1000) - state.startEpoch - state.totalPausedTime));
    const wordsEnd = Util.countWordsHeuristic();
    const wordsGained = Math.max(0, wordsEnd - state.wordsAtSprintStart);

    // Calculate WPM
    const completedMin = completedSec / 60;
    state.wordsPerMinute = completedMin > 0 ? Math.round(wordsGained / completedMin) : 0;
    state.lastSprintWPM = state.wordsPerMinute; // Save for display when idle

    // Get document title for tracking
    const docTitle = document.title.replace(' - Google Docs', '').trim() || 'Untitled';

    const record = {
      startISO: new Date(state.startEpoch * 1000).toISOString(),
      durationMin: Math.round(state.durationSec/60),
      completedSec,
      wordsStart: state.wordsAtSprintStart,
      wordsEnd,
      wordsGained,
      wpm: state.wordsPerMinute,
      completed: natural,
      docTitle: docTitle
    };

    // Save history (earlier unsaved sprints first, so order is preserved)
    if (completedSec > 0) {
      await this.flushPendingSprints(root, state, handlers);
      const saved = await Storage.appendHistory(record);

      if (saved) {
        // Update today's progress for daily goal
        const previousWordsToday = state.todayWordsWritten;
        state.todayWordsWritten += wordsGained;

        // Check if daily goal was just reached
        const goalReached = state.dailyGoal > 0 &&
                            previousWordsToday < state.dailyGoal &&
                            state.todayWordsWritten >= state.dailyGoal;

        if (goalReached && state.celebration) {
          SprintWriteCelebrations.showGoalCelebration(state.dailyGoal);
        }
      } else {
        // Keep it in memory and retry; warn so the user doesn't close the tab
        state.pendingSprints.push(record);
        this.showNotice("⚠️ Couldn't save this sprint. Retrying every minute; keep this tab open.", '#e53935');
        if (!state.pendingRetryId) {
          state.pendingRetryId = setTimeout(() => this.flushPendingSprints(root, state, handlers), 60000);
        }
      }
    }
    this.updateUnloadGuard(state);

    if (state.sound && natural) {
      this.playSound('complete');
    }

    if (state.celebration && natural && completedSec >= state.durationSec * 0.9) {
      SprintWriteCelebrations.showCelebration(wordsGained, state.wordsPerMinute);
    }

    // Re-render to show WPM and updated daily goal
    root.innerHTML = SprintWriteRender.render(state);
    handlers.bindUI(root, state);
  }
};
