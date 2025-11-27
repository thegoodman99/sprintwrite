/* global Storage */

/**
 * Celebrations Module
 * Handles celebration screens for sprint completions and goal achievements
 */

window.SprintWriteCelebrations = {
  /**
   * Show celebration overlay after completing a sprint
   */
  showCelebration(words, wpm) {
    const messages = [
      '🎉 Great job!',
      '✨ Sprint completed!',
      '🚀 You did it!',
      '💪 Well done!',
      '⭐ Amazing work!'
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    // Show Ko-fi link occasionally (every 10th sprint)
    Storage.getHistory().then(hist => {
      const sprintCount = hist.length;
      const showKofi = sprintCount > 0 && sprintCount % 10 === 0;

      const kofiLink = showKofi ? `
        <div style="margin-top: 12px; font-size: 12px; opacity: 0.9;">
          <a href="https://ko-fi.com/thegoodman99" target="_blank" style="color: #fff; text-decoration: none; display: flex; align-items: center; gap: 4px; justify-content: center;">
            ☕ Enjoying SprintWrite? Buy me a Drink!
          </a>
        </div>
      ` : '';

      const celebDiv = document.createElement('div');
      celebDiv.className = 'sw-celebration';
      celebDiv.innerHTML = `
        <div class="sw-celebration-content">
          <div class="sw-celebration-emoji">${msg.split(' ')[0]}</div>
          <div class="sw-celebration-text">${msg.substring(2)}</div>
          <div class="sw-celebration-stats">
            <div>+${words} words</div>
            <div>${wpm} WPM</div>
          </div>
          ${kofiLink}
        </div>
      `;
      document.body.appendChild(celebDiv);

      setTimeout(() => celebDiv.classList.add('sw-celebration-show'), 10);
      setTimeout(() => {
        celebDiv.classList.remove('sw-celebration-show');
        setTimeout(() => celebDiv.remove(), 300);
      }, showKofi ? 5000 : 3000); // Show longer if Ko-fi link present
    });
  },

  /**
   * Show celebration when daily writing goal is reached
   */
  showGoalCelebration(goal) {
    const celebDiv = document.createElement('div');
    celebDiv.className = 'sw-celebration';
    celebDiv.innerHTML = `
      <div class="sw-celebration-content">
        <div class="sw-celebration-emoji">🎯</div>
        <div class="sw-celebration-text">Writing Goal Reached!</div>
        <div class="sw-celebration-stats">
          <div>${goal.toLocaleString()} words today!</div>
        </div>
        <div style="margin-top: 12px; font-size: 14px; opacity: 0.9; color: var(--sw-success);">
          Keep up the amazing work! ✨
        </div>
      </div>
    `;
    document.body.appendChild(celebDiv);

    setTimeout(() => celebDiv.classList.add('sw-celebration-show'), 10);
    setTimeout(() => {
      celebDiv.classList.remove('sw-celebration-show');
      setTimeout(() => celebDiv.remove(), 300);
    }, 4000);
  }
};
