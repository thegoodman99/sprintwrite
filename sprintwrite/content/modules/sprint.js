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
    return function(e) {
      if (state.running && !state.paused) {
        e.preventDefault();
        e.returnValue = 'Your sprint is still running. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
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
    window.removeEventListener('beforeunload', this.confirmUnload(state));

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

    // Save history
    if (completedSec > 0) {
      await Storage.appendHistory(record);

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
    }

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
