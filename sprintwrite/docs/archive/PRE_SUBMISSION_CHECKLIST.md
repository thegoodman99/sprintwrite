# Chrome Web Store Pre-Submission Checklist

## 📋 Required Files & Documentation

- [x] **manifest.json** - Version 2.4.2, all permissions justified
- [x] **README.md** - Updated with current version and features
- [x] **PRIVACY.md** - Comprehensive privacy policy
- [x] **CHANGELOG.md** - Complete version history
- [x] **STORE_LISTING.md** - Store descriptions and marketing materials
- [x] **build.sh** - Production build script
- [x] **Production Package** - dist/sprintwrite-v2.4.2-*.zip

## 🎨 Visual Assets

### Icons (All Required Sizes)
- [x] 16x16 (icon16.png)
- [x] 48x48 (icon48.png)
- [x] 128x128 (icon128.png)
- [x] 256x256 (logo_256px.png)
- [x] 512x512 (logo_512px.png)

### Store Listing Screenshots (1280x800px)
- [x] Screenshot 1: Main widget during active sprint
- [x] Screenshot 2: Theme showcase
- [x] Screenshot 3: Options & Writing Insights
- [x] Screenshot 4: Complete history & statistics
- [x] Screenshot 5: Minimal mode

### Promotional Images
- [ ] Small promo tile: 440x280 (optional but recommended)
- [ ] Marquee promo tile: 1400x560 (optional but recommended)

## 🔍 Code Quality Checks

- [x] All console.log statements removed
- [x] No debug code or comments
- [x] Code organized into modules
- [x] All features tested and working
- [x] No unused files or dependencies
- [x] Proper error handling throughout

## ⚙️ Functionality Testing

### Core Features
- [x] Timer starts, pauses, resumes correctly
- [x] Word count tracking works accurately
- [x] Sprint completion triggers celebration
- [x] Sound effects play (when enabled)
- [x] History saves properly
- [x] Statistics calculate correctly

### New Features (v2.4.0)
- [x] 3-second countdown on sprint start
- [x] Minimal mode with smart controls
- [x] Daily goal tracking with live updates
- [x] WPM persistence (shows last sprint WPM)
- [x] Word count warning always visible when needed
- [x] Writing insights (best time, sprint length, productive day, streak)
- [x] Load more pagination (25 items at a time)

### Settings & Options
- [x] All themes apply correctly
- [x] Timer presets save and load
- [x] Display mode (toolbar/float) works
- [x] Minimize on start functions properly
- [x] Sound/celebration toggles work
- [x] Daily goal saves and tracks
- [x] Export data works
- [x] Clear history works (with confirmation)
- [x] Refresh buttons update data

### UI/UX
- [x] High-DPI displays show crisp logos
- [x] No duplicate branding text
- [x] Responsive layout works
- [x] All buttons and controls accessible
- [x] Keyboard navigation works
- [x] Screen reader friendly (ARIA labels)

## 🔒 Privacy & Security

- [x] No external API calls
- [x] No data collection or analytics
- [x] All data stored locally
- [x] Chrome Sync optional and user-controlled
- [x] Privacy policy published and linked
- [x] Permissions minimal and justified:
  - [x] `storage` - Save user preferences and sprint history
  - [x] Host permissions - Only docs.google.com (content script injects the widget)

## 📱 Browser Compatibility

- [x] Chrome/Chromium tested
- [x] Manifest V3 compliant
- [x] No deprecated APIs used
- [x] Content Security Policy compliant

## 📝 Store Listing Preparation

### Short Description (132 characters max)
```
Focus on your writing with timed sprints! Track progress, set goals, and build better writing habits - completely free & private.
```
✓ Characters: 131/132

### Detailed Description
- [x] Feature list complete
- [x] Benefits clearly stated
- [x] Privacy guarantees mentioned
- [x] Screenshots referenced
- [x] Call to action included

### Categories & Tags
- **Category**: Productivity
- **Tags**: writing, productivity, timer, focus, goals, tracking

### Support Information
- [x] GitHub repository: https://github.com/thegoodman99/sprintwrite
- [x] Privacy policy: https://github.com/thegoodman99/sprintwrite/blob/main/PRIVACY.md
- [x] Support page: GitHub Issues

## 🚀 Final Checks Before Upload

1. [x] Run `./build.sh` to create fresh production package
2. [ ] Test the ZIP package in clean Chrome profile
3. [x] Verify all 5 screenshots captured at 1280x800
4. [ ] Review store listing text for typos
5. [x] Confirm version number in manifest matches package name (2.4.2)
6. [ ] Double-check privacy policy URL is accessible
7. [ ] Ensure support email/GitHub is monitored

## 📤 Submission Checklist

- [ ] Chrome Web Store Developer account created ($5 fee)
- [ ] Upload dist/sprintwrite-v2.4.2-*.zip
- [ ] Add all 5 screenshots with captions
- [ ] Fill in store listing details
- [ ] Add privacy policy link
- [ ] Set pricing to Free
- [ ] Select appropriate categories
- [ ] Request permissions justification if prompted
- [ ] Submit for review

## 🎯 Post-Submission

- [ ] Monitor for review feedback
- [ ] Respond to any questions within 24 hours
- [ ] Plan announcement (social media, GitHub, etc.)
- [ ] Set up user feedback monitoring
- [ ] Plan for future updates (v2.5.0)

---

## Expected Review Time
Chrome Web Store typically reviews extensions within **1-3 business days** for new submissions.

## Common Rejection Reasons to Avoid
✅ Single purpose clearly defined (writing sprint timer)
✅ Minimal permissions requested and justified
✅ Privacy policy published and linked
✅ No misleading descriptions or screenshots
✅ No trademark violations
✅ Functionality works as described

---

**Version**: 2.4.2
**Last Updated**: October 22, 2026
**Status**: Ready for submission — test the zip in a clean Chrome profile, then upload
