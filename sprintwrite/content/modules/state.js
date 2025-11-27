/* global Storage */

/**
 * State Management Module
 * Handles widget state initialization and management
 */

window.SprintWriteState = {
  /**
   * Initialize widget state from storage
   * @returns {Promise<Object>} Initial state object
   */
  async initialize() {
    const settings = await Storage.getSettings();
    const todayProgress = await Storage.getTodayProgress();

    // Get last sprint WPM from history
    const history = await Storage.getHistory();
    const lastSprint = history.length > 0 ? history[history.length - 1] : null;
    const lastWPM = lastSprint ? lastSprint.wpm : 0;

    return {
      running: false,
      paused: false,
      startEpoch: 0,
      endEpoch: 0,
      pausedAt: 0,
      totalPausedTime: 0,
      durationSec: (settings.timerPreset1 || 15) * 60, // Default to first preset
      timerId: null,
      wordsAtSprintStart: 0,  // Captured when sprint starts
      wordsNow: 0,            // Current word count (always updated)
      wordsPerMinute: 0,      // Current sprint WPM (calculated at end)
      lastSprintWPM: lastWPM, // Last completed sprint's WPM
      theme: settings.theme || 'light',
      sound: settings.sound ?? true,
      celebration: settings.celebration ?? true,
      minimized: settings.minimized ?? true,
      compactMode: settings.compactMode ?? true,
      position: settings.position || { top: 100, right: 12 },
      dailyGoal: settings.dailyGoal || 0,
      todayWordsWritten: todayProgress.wordsWritten,
      timerPreset1: settings.timerPreset1 || 15,
      timerPreset2: settings.timerPreset2 || 20,
      timerPreset3: settings.timerPreset3 || 30,
      minimizeOnStart: settings.minimizeOnStart ?? false,
      inMinimalMode: false // Special minimal mode entered on sprint start
    };
  }
};
