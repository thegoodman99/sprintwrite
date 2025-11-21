# SprintWrite – Writing Sprint Timer for Google Docs

A completely **FREE** Chrome extension that helps writers stay productive with timed writing sprints, real-time word tracking, and detailed statistics.

![Version](https://img.shields.io/badge/version-2.3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality
- ⏱️ **Timed Writing Sprints** - Set sprints for 15, 20, 30 minutes, or custom duration
- 📝 **Real-time Word Tracking** - See current word count, words added during sprint, and WPM
- 📊 **Sprint Statistics** - Track performance across all your Google Docs
- 📜 **Global History** - View your last 50 sprints with document names, dates, and stats
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
- 🎯 **Auto Word Count** - Attempts to automatically enable Google Docs word count

## Installation

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

### From Chrome Web Store (Coming Soon)
*Extension will be published to the Chrome Web Store soon*

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
├── icons/                 # Extension icons (16, 48, 128)
└── license/               # License verification (infrastructure only)
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

### Version 2.3.0 (Current)
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
