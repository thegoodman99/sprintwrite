/* global Storage */

/**
 * UI Utilities Module
 * Handles theme application, draggable functionality, and positioning
 */

window.SprintWriteUI = {
  /**
   * Apply theme class to element
   */
  applyThemeClass(el, theme) {
    el.classList.remove('sw-theme-dark', 'sw-theme-nord', 'sw-theme-solar', 'sw-theme-midnight');
    if (theme === 'dark') el.classList.add('sw-theme-dark');
    if (theme === 'nord') el.classList.add('sw-theme-nord');
    if (theme === 'solar') el.classList.add('sw-theme-solar');
    if (theme === 'midnight') el.classList.add('sw-theme-midnight');
  },

  /**
   * Position widget in toolbar mode (next to revision history button)
   */
  positionToolbarMode(root, retries = 0) {
    // Position toolbar mode to the left of the revision history button
    const revisionButton = document.querySelector('#docs-revisions-appbarbutton');
    if (revisionButton) {
      const rect = revisionButton.getBoundingClientRect();

      // Check if button is actually positioned (not still loading)
      if (rect.left > 100 && rect.left < window.innerWidth - 100) {
        // Calculate distance from right edge
        const rightOffset = window.innerWidth - rect.left + 8; // 8px gap
        root.style.right = rightOffset + 'px';
        root.style.top = '8px';
      } else if (retries < 20) {
        // Button found but not properly positioned yet, retry
        setTimeout(() => this.positionToolbarMode(root, retries + 1), 250);
      } else {
        // Use fallback after too many retries
        root.style.right = '80px';
        root.style.top = '8px';
      }
    } else if (retries < 20) {
      // Element not ready yet, retry after a short delay
      setTimeout(() => this.positionToolbarMode(root, retries + 1), 250);
    } else {
      // Fallback position if element never loads
      root.style.right = '80px';
      root.style.top = '8px';
    }
  },

  /**
   * Make widget draggable in float mode
   */
  makeDraggable(root, state) {
    const card = root.querySelector('.sw-card');
    const header = root.querySelector('.sw-header-title');
    if (!card || !header) return;

    let isDragging = false;
    let startX, startY, startTop, startRight;

    // Enable dragging in float mode only
    const updateDragEnabled = () => {
      if (state.compactMode) {
        header.style.cursor = 'default';
        header.removeAttribute('title');
      } else {
        header.style.cursor = 'move';
        header.setAttribute('title', 'Drag to reposition');
      }
    };

    updateDragEnabled();

    header.addEventListener('mousedown', (e) => {
      // Don't drag in compact mode
      if (state.compactMode) return;
      // Don't drag if clicking on buttons or logo
      if (e.target.closest('.sw-menu') || e.target.closest('.sw-minimize') || e.target.closest('.sw-logo')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      // Get current position
      const rect = root.getBoundingClientRect();
      startTop = rect.top;
      startRight = window.innerWidth - rect.right;

      card.style.transition = 'none';
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging || state.compactMode) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Calculate new position with bounds checking
      const newTop = Math.max(0, Math.min(window.innerHeight - 100, startTop + deltaY));
      const newRight = Math.max(0, Math.min(window.innerWidth - 200, startRight - deltaX));

      root.style.top = newTop + 'px';
      root.style.right = newRight + 'px';
    });

    document.addEventListener('mouseup', async () => {
      if (isDragging && !state.compactMode) {
        isDragging = false;
        card.style.transition = '';

        // Save position
        state.position = {
          top: parseInt(root.style.top) || 0,
          right: parseInt(root.style.right) || 0
        };

        const s = await Storage.getSettings();
        s.position = state.position;
        await Storage.setSettings(s);
      }
    });
  }
};
