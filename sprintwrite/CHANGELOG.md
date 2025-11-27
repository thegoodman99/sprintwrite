# Changelog

All notable changes to SprintWrite will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.0] - 2024-11-22

### Added
- 3-second countdown before sprint timer starts (improved UX)
- Enhanced minimal mode that persists controls during active sprints
- Smart minimal mode state machine (enters on sprint start, exits on user expand)
- Refresh button in Writing Goal section on options page
- High-resolution logo assets (256px, 512px, 1024px)

### Changed
- **Major Refactor:** Restructured codebase into 8 focused modules:
  - `state.js` - State management
  - `render.js` - UI rendering
  - `handlers.js` - Event handling
  - `ui-utils.js` - Theme & positioning
  - `word-count.js` - Word count detection
  - `celebrations.js` - Celebration animations
  - `sprint.js` - Sprint timer logic
  - `stats.js` - Statistics & history
- Completely redesigned options page with modern UI/UX
  - Gradient effects and glassmorphism
  - Better typography and spacing
  - Improved animations and transitions
  - Icon buttons with hover effects
- Simplified word count detection (now only checks visibility, removed automation)
- Reduced startup delay from 1200ms to 300ms for faster countdown

### Removed
- All console.log/error statements (production-ready code)
- Automatic word count enabling feature (unreliable, removed ~170 lines)
- `optimized-word-count.js` test file
- `WORD_COUNT_AUTOMATION_ANALYSIS.md` documentation
- Emoji icons from checkbox labels in options page
- ~280 lines of debug/unused code total

### Fixed
- Checkbox spacing issues in options page
- Goal progress refresh now works independently
- Minimal mode behavior now matches expected state machine

### Technical
- Reduced `content/modules/word-count.js` from 237 to 19 lines
- Reduced `content/inject.js` from 1,630 to 95 lines (modularization)
- All code now production-ready with no debug logging
- Improved code organization and maintainability

## [2.3.0] - 2024-11-21

### Added
- Document title tracking in sprint history
- 5 theme options: Light, Dark, Nord, Solar, Midnight
- Toolbar/Float display mode toggle
- Statistics filtering (Today, Week, Month, All Time)
- Pause and resume functionality during sprints
- Enhanced celebration animations
- Daily writing goal with progress tracking
- Goal progress visualization in widget and options page

### Changed
- Improved word count detection with multiple fallback methods
- Enhanced CSV export to include document names
- Better error handling across the extension

### Fixed
- Word count detection edge cases
- Sprint completion timing issues
- Theme switching persistence

## [2.2.0] - 2024-11-15

### Added
- Cross-device sync via Chrome Sync Storage
- Navigation protection during active sprints
- Sound effect toggle in options
- Celebration animation toggle

### Changed
- Improved widget positioning in toolbar mode
- Enhanced draggable functionality in float mode

### Fixed
- Widget positioning on page resize
- Storage quota management

## [2.1.0] - 2024-11-10

### Added
- CSV export functionality for sprint history
- WPM (words per minute) calculation
- Sprint statistics dashboard
- Last 50 sprints history view

### Changed
- Improved storage architecture
- Better local/sync storage fallback logic

## [2.0.0] - 2024-11-05

### Added
- Custom timer duration input (1-180 minutes)
- Three preset timer buttons (15m, 20m, 30m)
- Real-time word count tracking during sprints
- Sprint completion celebration screen

### Changed
- Complete UI redesign with modern look
- Migrated to Manifest V3
- Improved performance and reliability

### Removed
- Legacy Manifest V2 code

## [1.0.0] - 2024-10-28

### Added
- Initial release
- Basic sprint timer functionality
- Word count tracking
- Minimize/expand widget
- Light/Dark theme toggle
- Google Docs integration

---

## Version History Summary

- **2.4.0** - Production-ready release with modular architecture
- **2.3.0** - Feature-complete with themes, modes, and goals
- **2.2.0** - Cross-device sync and enhanced UX
- **2.1.0** - Statistics and export features
- **2.0.0** - Manifest V3 migration and UI redesign
- **1.0.0** - Initial release

[2.4.0]: https://github.com/thegoodman99/sprintwrite/releases/tag/v2.4.0
[2.3.0]: https://github.com/thegoodman99/sprintwrite/releases/tag/v2.3.0
[2.2.0]: https://github.com/thegoodman99/sprintwrite/releases/tag/v2.2.0
[2.1.0]: https://github.com/thegoodman99/sprintwrite/releases/tag/v2.1.0
[2.0.0]: https://github.com/thegoodman99/sprintwrite/releases/tag/v2.0.0
[1.0.0]: https://github.com/thegoodman99/sprintwrite/releases/tag/v1.0.0
