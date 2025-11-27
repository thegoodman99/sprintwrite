/**
 * Word Count Module
 * Checks if Google Docs word count is visible
 */

window.SprintWriteWordCount = {
  /**
   * Check if word count widget is visible
   * @returns {boolean} True if word count is visible, false otherwise
   */
  ensureWordCountVisible() {
    try {
      const wordCountWidget = document.querySelector('.kix-documentmetrics-widget-number');
      return !!wordCountWidget;
    } catch (e) {
      return false;
    }
  }
};
