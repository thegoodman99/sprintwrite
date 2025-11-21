document.addEventListener('DOMContentLoaded', async () => {
  // Load history
  chrome.storage.sync.get(['sw_history'], (result) => {
    const history = result.sw_history || [];
    
    // Calculate stats
    const totalSprints = history.length;
    const totalWords = history.reduce((sum, r) => sum + (r.wordsEnd - r.wordsStart), 0);
    
    document.getElementById('total-sprints').textContent = totalSprints;
    document.getElementById('total-words').textContent = totalWords.toLocaleString();
    
    // Update status text
    const statusText = document.getElementById('status-text');
    if (totalSprints === 0) {
      statusText.textContent = 'Open a Google Doc to start your first sprint!';
    } else {
      statusText.textContent = `Great progress! Keep up the momentum! 🚀`;
    }
  });
  
  // Button handlers
  document.getElementById('open-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('open-docs').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://docs.google.com/document/create' });
  });
  
  document.getElementById('help-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://ko-fi.com/thegoodman99' });
  });
});
