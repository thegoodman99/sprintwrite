# SprintWrite – Writing Sprint Timer for Google Docs

A completely **FREE** Chrome extension that helps writers stay productive with timed writing sprints, real-time word tracking, and detailed statistics.

![Version](https://img.shields.io/badge/version-2.4.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality
- ⏱️ **Timed Writing Sprints** - Set sprints for 15, 20, 30 minutes, or custom duration
- 📝 **Real-time Word Tracking** - See current word count, words added during sprint, and WPM
- 🎯 **Daily Writing Goal** - Set a daily word count target and track your progress
- 📊 **Sprint Statistics** - Track performance across all your Google Docs
- 📜 **Global History** - Years of sprint history with document names, dates, and stats
- 📥 **Export Data** - Download your complete sprint history as CSV

### Customization
- 🎨 **5 Beautiful Themes** - Light, Dark, Nord, Solar, and Midnight
- 📍 **Two Display Modes** - Toolbar (compact/fixed) or Float (draggable)
- 🔊 **Sound Alerts** - Optional audio notifications for sprint completion
- 🎉 **Celebrations** - Fun animations when you complete a sprint

### Smart Features
- ⏸️ **Pause & Resume** - Take breaks without losing your progress
- 🚫 **Navigation Protection** - Warns before leaving page during active sprint
- 🔄 **Cross-Device Sync** - Settings and history sync via Chrome Sync Storage
- ⚙️ **Minimal Mode** - Smart minimized view with controls during active sprints

## Installation

### From Chrome Web Store
[Install SprintWrite from the Chrome Web Store](https://chromewebstore.google.com/detail/sprintwrite-%E2%80%93-writing-spr/gcpkilhgmkcfiibhgfdagelbcgppiafd)

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/thegoodman99/sprintwrite.git
   cd sprintwrite
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `sprintwrite` directory

3. **Start using**
   - Open any Google Doc at `docs.google.com/document`
   - The SprintWrite widget will appear automatically

## Usage

### Starting Your First Sprint

1. **Open a Google Doc** - The SprintWrite widget appears in the top-right corner
2. **Enable Word Count** - If prompted, go to Tools → Word count and check "Display word count while typing"
3. **Choose Duration** - Select 15m, 20m, 30m, or set a custom time
4. **Click Start** - Begin your writing sprint!

### Display Modes

- **Toolbar Mode (Default)** - Compact widget fixed to the top-right corner
- **Float Mode** - Draggable widget you can position anywhere on the page
- Switch modes via the menu (⋮) → "Float Mode" or "Toolbar Mode"

### Viewing Statistics

- Click the menu (⋮) → "Statistics" to view:
  - Total sprints completed
  - Total minutes written
  - Total words written
  - Average words per minute
- Filter by: Today, Week, Month, or All Time
- Copy stats to share on social media

### Exporting Data

- Click menu (⋮) → "Export Data"
- Downloads CSV file with complete sprint history
- Includes: date, document title, duration, words written, WPM

### Setting a Daily Goal

1. **Open Options** - Right-click extension icon → "Options" or click gear icon in popup
2. **Set Your Goal** - Enter your daily word count target (e.g., 1000)
3. **Track Progress** - View real-time progress in both:
   - Widget (small progress bar between sprint timer and duration buttons)
   - Options page (detailed progress with sprint count)
4. **Reach Your Goal** - Get a special celebration when you hit your target!
5. **Start Fresh** - Progress resets automatically at midnight

**Tips:**
- Set to 0 to disable the daily goal
- Goal tracks all words written across all sprints today
- Progress persists across different Google Docs
- Celebration shows only once per day when goal is first reached

## File Structure

```
sprintwrite/
├── manifest.json           # Extension configuration (Manifest V3)
├── background/
│   └── service.js         # Background service worker
├── content/
│   ├── inject.js          # Main widget logic (injected into Google Docs)
│   └── widget.css         # Widget styling
├── common/
│   ├── storage.js         # Chrome storage wrapper
│   ├── util.js            # Utility functions
│   └── themes.css         # Theme definitions
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic
│   └── popup.css          # Popup styling
├── options/
│   ├── index.html         # Options page
│   ├── options.js         # Options logic
│   └── styles.css         # Options styling
└── icons/                 # Extension icons (16, 48, 128)
```

## Technical Details

### Word Count Detection
SprintWrite uses a sophisticated fallback system to reliably count words:
1. Google Docs native word count widget (most accurate)
2. Alternate widget selectors
3. Canvas tile content
4. Word node elements
5. Page container text
6. Document area fallback

### Storage
- **Chrome Sync Storage** - Settings and history sync across devices
- **Automatic Fallback** - Uses local storage if sync quota exceeded
- **Privacy-First** - All data stored locally, no external servers

### Performance
- Throttled word count updates (1 second intervals during sprints)
- Method caching for faster word count detection
- Minimal DOM queries with efficient selectors

## Development

### Prerequisites
- Google Chrome or Chromium-based browser
- Basic knowledge of Chrome extension development

### Making Changes

1. **Edit files** in your local directory
2. **Reload extension** in `chrome://extensions/` (click refresh icon)
3. **Reload Google Doc** page to see changes

### Key Files to Modify

- `content/inject.js` - Main widget functionality and UI
- `content/widget.css` - Widget styling
- `common/themes.css` - Theme colors and styles
- `manifest.json` - Extension permissions and configuration

### Testing Checklist

- [ ] Sprint starts correctly and counts down
- [ ] Word count updates during sprint
- [ ] Pause/Resume works correctly
- [ ] Sprint completion shows WPM and saves to history
- [ ] Theme switching works
- [ ] Statistics display correctly (Today, Week, Month, All Time)
- [ ] History shows recent sprints with document titles
- [ ] CSV export downloads properly
- [ ] Toolbar/Float mode switching works
- [ ] Widget is draggable in Float mode
- [ ] Settings persist across page reloads

## Support

Having issues or want to say thanks?

- **Report Bugs**: [GitHub Issues](https://github.com/thegoodman99/sprintwrite/issues)
- **Support Development**: [Buy me a coffee](https://ko-fi.com/thegoodman99) ☕

## Privacy

SprintWrite is completely privacy-focused:
- ✅ All data stored locally in your browser
- ✅ No external servers or analytics
- ✅ No data collection or tracking
- ✅ Chrome Sync Storage only (optional, controlled by you)
- ✅ Only accesses Google Docs pages you have open

## License

MIT License - feel free to use, modify, and distribute.

## Changelog

### Version 2.4.3 (Current)
- 🐛 **Critical Fix** - Sprints are no longer lost once sync storage fills up
- 🐛 **Fixes** - Last-sprint WPM and options history order (2.4.2 regressions)
- 🧹 **Cleanup** - Removed unused license/billing code from the package

### Version 2.4.2
- 🐛 **Critical Fix** - Fixed missing sprints bug when Chrome storage quota exceeded
- 💾 **Hybrid Storage** - Unlimited history with automatic archiving
  - Last 30 days sync across devices
  - Older sprints stored locally (years of data)
  - Zero maintenance required
- 📦 **Smart Migration** - Automatic archiving of sprints older than 30 days

### Version 2.4.1
- 📊 **Date Range Filters** - Share stats with period selection (Today/Week/Month/All Time)
- 🎨 **Cleaner Share Format** - Simplified stats output without promotional text
- 🔔 **Toast Notifications** - Replaced blocking alerts with subtle toasts
- 🗑️ **UI Cleanup** - Removed unused "View History" menu item
- 🐛 **Logo Fix** - Improved logo rendering on high-DPI displays

### Version 2.4.0
- 🏗️ **Code Architecture** - Refactored into modular architecture (8 focused modules)
- 🎨 **UI/UX Improvements** - Completely redesigned options page with modern aesthetics
- 🖼️ **New Logos** - Updated with high-resolution logos (256px, 512px, 1024px)
- ⏱️ **Sprint Start** - Added 3-second countdown before timer starts
- 📦 **Minimal Mode** - Enhanced smart minimal mode that persists during sprints
- 🧹 **Production Ready** - Removed all debug logging and unused code
- ⚡ **Performance** - Simplified word count detection (now only checks visibility)
- 🔧 **Code Quality** - Reduced codebase by ~280 lines through cleanup

### Version 2.3.0
- Added document title tracking to history
- Improved word count detection reliability
- Added 5 theme options
- Added Toolbar/Float display modes
- Added statistics filtering (Today/Week/Month/All Time)
- Added pause/resume functionality
- Enhanced celebration animations
- Improved CSV export with document names
- Better error handling and edge cases

## Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

Made with ❤️ for writers everywhere

**Keep writing! 🚀**
