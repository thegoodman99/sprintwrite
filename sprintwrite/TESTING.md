# SprintWrite Testing Checklist

## Setup

1. **Load Extension in Chrome**
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode" (toggle top-right)
   - Click "Load unpacked"
   - Select the `sprintwrite` directory
   - Verify extension icon appears in toolbar

2. **Check Console for Errors**
   - Right-click extension icon → "Inspect popup" → Check console
   - Open any Google Doc → F12 → Check console for errors

## Core Functionality Tests

### 1. Widget Display
- [ ] Open a Google Doc
- [ ] SprintWrite widget appears in top-right corner
- [ ] Widget shows "SprintWrite" header
- [ ] Widget displays 15:00 timer by default
- [ ] Widget shows current word count
- [ ] Minimize button (▲) collapses widget
- [ ] Menu (⋮) opens dropdown

### 2. Word Count Detection
- [ ] If word count not visible, widget shows warning message
- [ ] Go to Tools → Word count → Check "Display word count while typing"
- [ ] Widget displays current document word count
- [ ] Type new words → word count updates (may take 1-2 seconds)

### 3. Sprint Timer - Basic
- [ ] Click "15m" duration button → button highlights
- [ ] Click "20m" → button switches highlight
- [ ] Click "30m" → button switches highlight
- [ ] Click "Custom" → input field appears
- [ ] Enter "5" in custom field → Click "Set" → timer shows 05:00

### 4. Sprint Timer - Start/Pause/Resume
- [ ] Set duration to 1 minute (for quick testing)
- [ ] Click "Start" button
- [ ] Button changes to "Pause"
- [ ] Timer counts down: 00:59, 00:58, etc.
- [ ] Progress bar fills from left to right
- [ ] Words added counter shows "+0" initially
- [ ] Type some words → "+X" counter increases
- [ ] Click "Pause" → timer stops, button changes to "Resume"
- [ ] Click "Resume" → timer continues from paused time
- [ ] Let timer reach 00:00 → Sprint completes

### 5. Sprint Completion
- [ ] Celebration popup appears (can be dismissed)
- [ ] WPM (Words Per Minute) displays in widget
- [ ] Sound plays (if sound enabled)
- [ ] Timer resets to original duration
- [ ] Start button returns to "Start" state

### 6. Sprint Reset
- [ ] Start a sprint
- [ ] Click "Reset" button
- [ ] Timer stops and resets to default duration
- [ ] Words added counter resets to "+0"
- [ ] No completion celebration appears

### 7. Navigation Protection
- [ ] Start a sprint
- [ ] Try to close tab or navigate away
- [ ] Browser shows warning: "Your sprint is still running"
- [ ] Complete or reset sprint → warning disappears

## Theme & Display Tests

### 8. Theme Switching
- [ ] Click theme dropdown
- [ ] Select "Dark" → widget changes to dark theme
- [ ] Select "Nord" → widget changes to Nord theme
- [ ] Select "Solar" → widget changes to Solar theme
- [ ] Select "Midnight" → widget changes to Midnight theme
- [ ] Select "Light" → widget returns to light theme
- [ ] Reload page → theme persists

### 9. Display Modes
- [ ] Widget starts in Toolbar mode (fixed top-right)
- [ ] Click menu (⋮) → "Float Mode"
- [ ] Widget becomes draggable with cursor:move on header
- [ ] Drag widget to different position → widget moves
- [ ] Reload page → position persists
- [ ] Click menu (⋮) → "Toolbar Mode"
- [ ] Widget returns to fixed top-right position
- [ ] Can no longer drag widget

### 10. Sound Toggle
- [ ] Check "Sound alerts" checkbox
- [ ] Complete a sprint → sound plays
- [ ] Uncheck "Sound alerts"
- [ ] Complete a sprint → no sound plays
- [ ] Reload page → setting persists

## Statistics & History Tests

### 11. Statistics Dashboard
- [ ] Complete at least 2 sprints with different word counts
- [ ] Click menu (⋮) → "Statistics"
- [ ] Modal opens with statistics
- [ ] "All Time" tab shows total sprints, minutes, words, WPM
- [ ] Click "Month" tab → stats filter to last 30 days
- [ ] Click "Week" tab → stats filter to last 7 days
- [ ] Click "Today" tab → stats filter to today
- [ ] Click "Copy Stats" → Stats copied to clipboard
- [ ] Paste in text editor → Formatted stats text appears
- [ ] Click "Close" or click outside modal → Modal closes
- [ ] Press ESC key → Modal closes

### 12. Sprint History
- [ ] Click menu (⋮) → "View History"
- [ ] Modal shows table of recent sprints
- [ ] Each row shows: Date, Time, Document name, Duration, Words, WPM
- [ ] Sprints sorted newest first
- [ ] Document name displays correctly (truncated if long)
- [ ] Shows "Showing your X most recent sprints" message
- [ ] Click "Close" or outside modal → Modal closes

### 13. Export Data
- [ ] Complete at least 1 sprint
- [ ] Click menu (⋮) → "Export Data"
- [ ] CSV file downloads: `sprintwrite_history.csv`
- [ ] Open CSV in spreadsheet software
- [ ] Headers: startISO, docTitle, durationMin, completedSec, wordsStart, wordsEnd, wordsGained, wpm
- [ ] All sprint data present and accurate

## Options Page Tests

### 14. Extension Popup
- [ ] Click SprintWrite extension icon in toolbar
- [ ] Popup shows total sprints and words written
- [ ] Click "⚙️ Open Options" → Options page opens
- [ ] Click "📝 New Google Doc" → New doc opens
- [ ] Click "☕ Support" → Ko-fi page opens

### 15. Options Page
- [ ] Right-click extension → "Options"
- [ ] Options page displays
- [ ] Statistics show total sprints, minutes, words, WPM
- [ ] History table shows recent sprints
- [ ] Change theme → Click "Save Theme" → Success toast appears
- [ ] Toggle sound → Click "Save Preferences" → Success toast
- [ ] Click "Refresh History" → Table updates
- [ ] Click "Export History" → CSV downloads
- [ ] Click "Clear History" → Confirmation dialog
- [ ] Confirm clear → History empties, stats reset to 0

## Cross-Document & Sync Tests

### 16. Multiple Documents
- [ ] Complete sprint in Document A
- [ ] Open different Document B
- [ ] Widget appears with same theme/settings
- [ ] Click menu → "View History"
- [ ] History shows sprint from Document A with doc name
- [ ] Complete sprint in Document B
- [ ] History shows both sprints with correct doc names

### 17. Chrome Sync
- [ ] Complete sprints and change settings
- [ ] Open Chrome on different device (if available) or profile
- [ ] Install extension (same sync account)
- [ ] Open Google Doc
- [ ] Settings and history should sync
- [ ] (Note: May take a few moments to sync)

## Edge Cases & Error Handling

### 18. Word Count Issues
- [ ] Disable word count: Tools → Word count → Uncheck display
- [ ] Start sprint
- [ ] Warning appears: "⚠️ Word count hidden!"
- [ ] Re-enable word count
- [ ] Warning disappears

### 19. Custom Duration Edge Cases
- [ ] Click "Custom"
- [ ] Enter "0" → Click "Set" → Alert: "Please enter valid number"
- [ ] Enter "200" → Click "Set" → Clamped to 180 minutes (03:00:00)
- [ ] Enter "abc" → Click "Set" → Alert shown
- [ ] Enter "15.5" → Input auto-removes decimal (becomes "155")

### 20. Empty Document
- [ ] Open completely empty document (0 words)
- [ ] Widget shows "0 words"
- [ ] Start sprint with 0 words
- [ ] Type 10 words
- [ ] Counter shows "+10 added"
- [ ] Complete sprint → WPM calculates correctly

### 21. Very Long Sprint
- [ ] Set custom duration: 180 minutes
- [ ] Start sprint → Timer shows 03:00:00
- [ ] Timer counts down properly in HH:MM:SS format

### 22. Pause Time Tracking
- [ ] Start 5-minute sprint
- [ ] Wait 1 minute (04:00 remaining)
- [ ] Pause for 30 seconds (real time)
- [ ] Resume
- [ ] Timer continues from 04:00 (not 03:30)
- [ ] Total sprint time excludes pause duration

## Performance Tests

### 23. Large Document
- [ ] Open document with 5000+ words
- [ ] Widget displays correct word count
- [ ] Start sprint → No lag or freezing
- [ ] Word count updates smoothly while typing

### 24. Long Usage Session
- [ ] Complete 10 sprints in succession
- [ ] Check memory usage in Task Manager
- [ ] No memory leaks or excessive CPU usage
- [ ] History stores all 10 sprints correctly

## Browser Compatibility

### 25. Chrome/Chromium Browsers
- [ ] Test in Chrome
- [ ] Test in Edge (Chromium-based)
- [ ] Test in Brave (if available)
- [ ] All features work consistently

## Final Checks

### 26. Console Errors
- [ ] Open DevTools console on Google Doc
- [ ] Complete full sprint workflow
- [ ] No JavaScript errors in console
- [ ] Only expected SprintWrite logs appear

### 27. Extension Permissions
- [ ] Extension only requests:
  - [ ] `storage` permission
  - [ ] `https://docs.google.com/*` host permission
- [ ] No unexpected permission requests

### 28. Privacy Verification
- [ ] Open Network tab in DevTools
- [ ] Complete sprints and use features
- [ ] No external network requests (except Ko-fi links when clicked)
- [ ] All data stays local

---

## Test Results

**Date Tested**: _______________

**Tester**: _______________

**Browser**: Chrome Version _______________

**Pass Rate**: _____ / 100+ test cases

### Critical Issues Found:
-

### Minor Issues Found:
-

### Suggestions:
-

---

## Reporting Issues

If you find bugs during testing:

1. Note the exact steps to reproduce
2. Check browser console for errors
3. Record browser version and OS
4. Open issue at: https://github.com/thegoodman99/sprintwrite/issues
