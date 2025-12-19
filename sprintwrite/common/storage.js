const SW_KEYS = {
  SETTINGS: 'sw_settings',
  HISTORY: 'sw_history',
  LICENSE: 'sw_license'
};

const Storage = {
  async get(key, area = 'sync') {
    try {
      const api = chrome.storage[area] || chrome.storage.sync;
      const res = await api.get(key);
      return res[key];
    } catch (error) {
      // Silently fail if extension context is invalid (rare in production)
      console.warn('Storage get failed:', error.message);
      return undefined;
    }
  },
  async set(key, value, area = 'sync') {
    try {
      const api = chrome.storage[area] || chrome.storage.sync;
      await api.set({ [key]: value });
    } catch (error) {
      // Silently fail if extension context is invalid (rare in production)
      console.warn('Storage set failed:', error.message);
    }
  },
  async getSettings() {
    const def = {
      theme: 'light', // light | dark | nord | solar | midnight
      sound: true,
      plan: 'FREE', // FREE | PRO_LIFETIME | PRO_SUB - mirrored from license
      dailyGoal: 0, // Daily word count goal (0 = disabled)
      timerPreset1: 15, // First timer preset in minutes
      timerPreset2: 20, // Second timer preset in minutes
      timerPreset3: 30, // Third timer preset in minutes
      minimizeOnStart: false // Auto-minimize widget when sprint starts
    };
    const saved = await Storage.get(SW_KEYS.SETTINGS);
    return { ...def, ...(saved || {}) };
  },
  async setSettings(next) {
    await Storage.set(SW_KEYS.SETTINGS, next);
  },
  async getLicense() {
    return (await Storage.get(SW_KEYS.LICENSE)) || { status: 'FREE', key: '' };
  },
  async setLicense(lic) {
    await Storage.set(SW_KEYS.LICENSE, lic);
  },
  async getHistory() {
    // Try sync storage first
    const syncHist = await Storage.get(SW_KEYS.HISTORY, 'sync');

    // Also check local storage (fallback when sync quota exceeded)
    const localHist = await Storage.get(SW_KEYS.HISTORY, 'local');

    // Merge both, removing duplicates by startISO
    const sync = Array.isArray(syncHist) ? syncHist : [];
    const local = Array.isArray(localHist) ? localHist : [];

    // Combine and deduplicate
    const combined = [...sync, ...local];
    const unique = combined.filter((item, index, self) =>
      index === self.findIndex(t => t.startISO === item.startISO)
    );

    // Sort by date (newest first)
    return unique.sort((a, b) => new Date(b.startISO) - new Date(a.startISO));
  },
  async appendHistory(rec) {
    try {
      // Get current sync history
      const syncHist = (await Storage.get(SW_KEYS.HISTORY, 'sync')) || [];
      syncHist.push(rec);

      // Determine cutoff date (30 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      // Split into recent (last 30 days) and old (archive)
      const recent = [];
      const toArchive = [];

      syncHist.forEach(sprint => {
        const sprintDate = new Date(sprint.startISO);
        if (sprintDate >= cutoffDate) {
          recent.push(sprint);
        } else {
          toArchive.push(sprint);
        }
      });

      // Save recent sprints to sync storage (cross-device)
      await Storage.set(SW_KEYS.HISTORY, recent, 'sync');

      // Move old sprints to local storage (archive)
      if (toArchive.length > 0) {
        const localHist = (await Storage.get(SW_KEYS.HISTORY, 'local')) || [];
        const combined = [...localHist, ...toArchive];

        // Deduplicate by startISO
        const unique = combined.filter((item, index, self) =>
          index === self.findIndex(t => t.startISO === item.startISO)
        );

        await Storage.set(SW_KEYS.HISTORY, unique, 'local');
      }

    } catch (e) {
      console.warn('Storage error, falling back to local:', e.message);

      // Fallback: save directly to local storage if sync fails
      const localHist = (await Storage.get(SW_KEYS.HISTORY, 'local')) || [];
      localHist.push(rec);
      await Storage.set(SW_KEYS.HISTORY, localHist, 'local');
    }
  },
  async getTodayProgress() {
    const history = await Storage.getHistory();
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Sum words gained from all sprints today
    const todaysSprints = history.filter(record => {
      const recordDate = new Date(record.startISO);
      return recordDate >= startOfToday;
    });

    const totalWordsToday = todaysSprints.reduce((sum, record) => {
      return sum + (record.wordsGained || 0);
    }, 0);

    return {
      wordsWritten: totalWordsToday,
      sprintsCompleted: todaysSprints.length
    };
  }
};
