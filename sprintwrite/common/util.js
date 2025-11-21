const Util = {
  throttle(fn, wait = 800) {
    let last = 0, timer = null;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn(...args);
      } else {
        clearTimeout(timer);
        timer = setTimeout(() => {
          last = Date.now();
          fn(...args);
        }, wait - (now - last));
      }
    };
  },
  fmtTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m.toString().padStart(2,'0')}:${r.toString().padStart(2,'0')}`;
  },
  // Cached word count method for performance
  _wordCountCache: { method: null, lastCheck: 0 },
  
  countWordsHeuristic() {
    // Google Docs has multiple ways content is stored. Try them in order:
    const methods = [
      // Method 1: Use Google Docs' word count widget (MOST ACCURATE - from bottom left)
      () => {
        const el = document.querySelector('.kix-documentmetrics-widget-number');
        if (!el) return null;
        const count = parseInt(el.textContent.trim(), 10);
        return (!isNaN(count) && count >= 0) ? count : null;
      },
      // Method 2: Try alternate selector (backup)
      () => {
        const el = document.querySelector('.docs-gm-documentmetrics-widget-number');
        if (!el) return null;
        const count = parseInt(el.textContent.trim(), 10);
        return (!isNaN(count) && count >= 0) ? count : null;
      },
      // Method 3: Count from the editable content area
      () => {
        const canvas = document.querySelector('.kix-canvas-tile-content');
        if (!canvas) return null;
        const text = canvas.textContent?.trim();
        if (!text) return null;
        return text.split(/\s+/).filter(w => w.length > 0).length;
      },
      // Method 4: Look for all word nodes
      () => {
        const wordNodes = document.querySelectorAll('.kix-wordhtmlgenerator-word-node');
        if (wordNodes.length === 0) return null;
        let count = 0;
        wordNodes.forEach(node => {
          if (node.textContent?.trim().length > 0) count++;
        });
        return count > 0 ? count : null;
      },
      // Method 5: Get text from the page container
      () => {
        const pages = document.querySelectorAll('.kix-page-compact, .kix-page');
        if (pages.length === 0) return null;
        let allText = '';
        pages.forEach(page => allText += (page.textContent || '') + ' ');
        const text = allText.trim();
        if (!text) return null;
        return text.split(/\s+/).filter(w => w.length > 0).length;
      },
      // Method 6: Fallback - try the main document area
      () => {
        const docArea = document.querySelector('.kix-appview-editor');
        if (!docArea) return null;
        const text = docArea.textContent?.trim();
        if (!text) return null;
        return text.split(/\s+/).filter(w => w.length > 0).length;
      }
    ];
    
    // Try cached method first if recent (within 5 seconds)
    const now = Date.now();
    if (this._wordCountCache.method !== null && (now - this._wordCountCache.lastCheck) < 5000) {
      try {
        const result = methods[this._wordCountCache.method]();
        if (result !== null) return result;
      } catch (e) {
        // Cache failed, continue to full search
      }
    }
    
    // Try all methods
    for (let i = 0; i < methods.length; i++) {
      try {
        const result = methods[i]();
        if (result !== null) {
          // Cache successful method
          this._wordCountCache.method = i;
          this._wordCountCache.lastCheck = now;
          return result;
        }
      } catch (e) {
        // Continue to next method
      }
    }
    
    // Last resort: count from body (will include UI text, but better than nothing)
    try {
      const text = document.body?.innerText || '';
      const cleaned = text.replace(/\s+/g, ' ').trim();
      if (cleaned) {
        return cleaned.split(' ').filter(w => w.length > 0).length;
      }
    } catch (e) {
      // Ignore
    }
    
    return 0;
  },
  toCsv(rows) {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ["startISO","docTitle","durationMin","completedSec","wordsStart","wordsEnd","wordsGained","wpm"].map(esc).join(",");
    const lines = rows.map(r => [
      r.startISO, r.docTitle || 'Unknown', r.durationMin, r.completedSec, r.wordsStart, r.wordsEnd, r.wordsGained || (r.wordsEnd - r.wordsStart), r.wpm ?? 0
    ].map(esc).join(","));
    return [header, ...lines].join("\n");
  },
  download(filename, text) {
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(text);
    a.download = filename;
    a.click();
  }
};
