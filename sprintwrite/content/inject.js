/* global Storage, Util, SprintWriteState, SprintWriteRender, SprintWriteHandlers, SprintWriteUI, SprintWriteWordCount */

/**
 * SprintWrite - Main Entry Point
 * A writing sprint timer for Google Docs
 */

(async function init() {
  try {
    // Prevent multiple injections
    if (window.__SW_INJECTED__) return;
    window.__SW_INJECTED__ = true;

    // Only run on Google Docs
    if (!/https:\/\/docs\.google\.com\/document\//.test(location.href)) return;

    // Initialize state from storage
    const state = await SprintWriteState.initialize();

  // Create widget root element
  const root = document.createElement('div');
  root.id = 'sw-root';
  root.style.top = state.position.top + 'px';
  root.style.right = state.position.right + 'px';

  // Apply positioning mode
  if (state.compactMode) {
    root.classList.add('sw-compact');
    SprintWriteUI.positionToolbarMode(root);
  }

  // Apply theme
  SprintWriteUI.applyThemeClass(root, state.theme);

  // Inject into page
  document.documentElement.appendChild(root);

  // Render initial UI
  root.innerHTML = SprintWriteRender.render(state);
  SprintWriteHandlers.bindUI(root, state);

  // Make draggable in float mode
  SprintWriteUI.makeDraggable(root, state);

  // Try to ensure word count is visible after page loads
  setTimeout(() => {
    SprintWriteWordCount.ensureWordCountVisible();
  }, 2000);

  // Initialize word count display
  setTimeout(() => {
    const initialWords = Util.countWordsHeuristic();
    state.wordsNow = initialWords;
    SprintWriteRender.updateWordsUI(root, state, initialWords);
  }, 500);

  // Keep word count updated even when not sprinting
  setInterval(() => {
    if (!state.running) {
      const currentWords = Util.countWordsHeuristic();
      state.wordsNow = currentWords;
      SprintWriteRender.updateWordsUI(root, state, currentWords);
    }
  }, 2000);

  // Listen for settings changes from options page
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    // Settings changed
  });

  // Listen for messages from options page
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'REFRESH_WIDGET') {
      // Trigger the refresh button click to reuse existing logic
      const refreshBtn = root.querySelector('#sw-refresh');
      if (refreshBtn) {
        refreshBtn.click();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Refresh button not found' });
      }
    }

    return true; // Keep message channel open for async response
  });

  } catch (error) {
    // Handle initialization errors
    if (error.message && (error.message.includes('Extension context invalidated') ||
                           error.message.includes('Cannot access'))) {
      // Context invalidation is already handled by the global error handler
      // Just prevent the error from propagating
      return;
    }
    // Re-throw other errors for debugging
    throw error;
  }
})();
