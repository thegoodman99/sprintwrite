# Chrome Web Store Listing Guide

This document contains all the content needed for the Chrome Web Store listing.

---

## Basic Information

### Extension Name
```
SprintWrite – Writing Sprint Timer for Google Docs
```

### Short Description (132 characters max)
```
FREE writing sprint timer with word tracking, stats, WPM, and 5 themes. Boost your productivity in Google Docs!
```
*Character count: 117*

### Category
- **Primary:** Productivity
- **Secondary:** Writing Tools

### Language
- English (United States)

---

## Detailed Description

```
SprintWrite is a completely FREE Chrome extension that helps writers stay productive with timed writing sprints, real-time word tracking, and detailed statistics—all inside Google Docs.

✨ CORE FEATURES

⏱️ Timed Writing Sprints
Set sprints for 15, 20, 30 minutes, or choose any custom duration (1-180 minutes). Start with a 3-second countdown and stay focused until the timer ends.

📝 Real-Time Word Tracking
Watch your word count grow during sprints with live updates showing:
• Current total word count
• Words added this sprint
• Words per minute (WPM) calculation

🎯 Daily Writing Goal
Set a daily word count target and track your progress throughout the day. Visual progress bar shows how close you are to reaching your goal.

📊 Sprint Statistics
View your writing performance with built-in analytics:
• Total sprints completed
• Total minutes written
• Total words written
• Average words per minute
• Filter by: Today, Week, Month, or All Time

📜 Complete History
Review your last 50 sprints with details including:
• Start date and time
• Document title
• Sprint duration
• Words written
• Words per minute

📥 Export Your Data
Download your complete sprint history as a CSV file for your own analysis or record-keeping.

🎨 CUSTOMIZATION

🖌️ 5 Beautiful Themes
Choose from Light, Dark, Nord, Solar, or Midnight themes to match your writing environment.

📍 Two Display Modes
• Toolbar Mode: Compact widget fixed to the top toolbar
• Float Mode: Draggable widget you can position anywhere

🔊 Sound & Celebrations
• Optional audio alerts when sprints complete
• Fun celebration animations to mark your achievement
• Toggle on/off in settings

⚙️ Smart Features
• Pause & Resume: Take breaks without losing sprint progress
• Minimal Mode: Auto-minimize during sprints with quick controls
• Navigation Protection: Warns before leaving page during active sprint
• Cross-Device Sync: Settings and history sync across your Chrome browsers

🔒 PRIVACY FIRST

• 100% private – no data collection or tracking
• All data stored locally on your device
• No external servers or analytics
• No access to your document content
• Open source – review the code yourself

📖 HOW TO USE

1. Install SprintWrite from the Chrome Web Store
2. Open any Google Doc
3. Enable word count (Tools → Word count → check "Display word count while typing")
4. Click the SprintWrite icon in your toolbar or find the widget in your doc
5. Choose your timer duration
6. Click Start and begin writing!

💡 PERFECT FOR

• NaNoWriMo participants
• Novelists and fiction writers
• Academic writers and students
• Bloggers and content creators
• Anyone who writes in Google Docs

🆓 COMPLETELY FREE

Every feature is included. No premium version, no subscriptions, no hidden costs.

🔗 OPEN SOURCE

SprintWrite is open source on GitHub. Contributions welcome!

📞 SUPPORT

• Report issues on GitHub
• Request features
• View documentation
• Support development: ko-fi.com/thegoodman99

Transform your writing sessions with SprintWrite. Download now and start tracking your progress!
```

---

## Screenshots Guide

Create 5 screenshots at 1280x800 pixels or 640x400 pixels:

### Screenshot 1: Main Widget (Full View)
**Caption:** "Track your writing sprints with real-time word count and WPM"
- Show widget in expanded state during an active sprint
- Display timer, word count, words added, WPM
- Use Light theme
- Include daily goal progress bar

### Screenshot 2: Themes Showcase
**Caption:** "Choose from 5 beautiful themes: Light, Dark, Nord, Solar, and Midnight"
- Show the widget in different themes side-by-side or in a grid
- Demonstrate theme variety

### Screenshot 3: Options Page
**Caption:** "Customize timer presets, themes, goals, and more"
- Show the modern options page
- Highlight daily goal setting
- Show preferences section
- Display statistics section

### Screenshot 4: Statistics & History
**Caption:** "Track your progress with detailed statistics and complete sprint history"
- Show statistics modal with filters (Today/Week/Month/All Time)
- Display sprint history table
- Show export button

### Screenshot 5: Minimal Mode & Toolbar Mode
**Caption:** "Smart minimal mode keeps controls accessible during sprints"
- Show widget in minimal mode during active sprint
- Show toolbar mode positioning
- Demonstrate compact design

---

## Promotional Images (Optional but Recommended)

### Small Tile (440x280)
- SprintWrite logo
- Tagline: "Write More, Track Progress"
- Key feature: "FREE Sprint Timer for Google Docs"

### Marquee (1400x560)
- Full banner design
- SprintWrite logo and name
- Screenshots of widget in action
- Key benefits: "Track Words • Set Goals • See Progress"

---

## Store Metadata

### Website
```
https://github.com/thegoodman99/sprintwrite
```

### Support URL
```
https://github.com/thegoodman99/sprintwrite/issues
```

### Privacy Policy URL
```
https://github.com/thegoodman99/sprintwrite/blob/main/PRIVACY.md
```

### Tags/Keywords
```
writing, productivity, timer, word count, google docs, sprint, nanowrimo, writing tools, word tracker, focus timer, pomodoro, writing goals
```

---

## Justification for Permissions

### Storage Permission
**Justification:**
```
SprintWrite uses Chrome storage to save your sprint history, user preferences (themes, sound settings, timer presets), and daily writing goal progress. All data is stored locally and can be synced across your Chrome browsers if Chrome Sync is enabled. No data is transmitted to external servers.
```

### Host Permission (docs.google.com)
**Justification:**
```
SprintWrite needs access to Google Docs pages to inject the sprint timer widget and detect the Google Docs word count widget. The extension only accesses the word count display element and does not read, modify, or transmit your document content.
```

---

## Version Release Notes (for 2.4.3)

```
Version 2.4.3

• Fixed: sprints could stop saving for frequent writers once sync storage filled up
• Fixed: "last sprint" WPM now shows your most recent sprint
• Fixed: history on the options page lists newest sprints first
• Removed unused internal code for a smaller, cleaner package
```

---

## Testing Checklist Before Submission

- [ ] Test sprint start/pause/resume/complete flow
- [ ] Verify all 5 themes work correctly
- [ ] Test toolbar and float mode switching
- [ ] Verify daily goal tracking works
- [ ] Test statistics filtering (Today/Week/Month/All Time)
- [ ] Verify CSV export downloads correctly
- [ ] Test on fresh install (clear all data first)
- [ ] Verify word count detection warning shows
- [ ] Test minimal mode behavior
- [ ] Check all settings persist after browser restart
- [ ] Verify no console errors in browser console
- [ ] Test with Chrome Sync on and off
- [ ] Verify privacy policy is accessible

---

## Chrome Web Store Developer Dashboard Steps

1. **Register Developer Account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay $5 one-time registration fee
   - Verify email address

2. **Create New Item**
   - Click "New Item"
   - Upload your ZIP file (created with `./build.sh`)

3. **Fill Store Listing**
   - Copy/paste content from this document
   - Upload 5 screenshots
   - Add promotional images (optional)
   - Set category to "Productivity"

4. **Privacy Practices**
   - Declare data usage (Sprint history, User settings)
   - Provide privacy policy URL
   - Explain permissions usage

5. **Submit for Review**
   - Review all information
   - Click "Submit for Review"
   - Wait 1-3 business days for approval

6. **After Approval**
   - Extension goes live automatically
   - Share store URL with users
   - Monitor reviews and ratings

---

## Post-Launch Marketing

### Announcement Templates

**Twitter/X:**
```
🚀 SprintWrite is now live on the Chrome Web Store!

A FREE writing sprint timer built for Google Docs with:
⏱️ Customizable timers
📊 Live word tracking
📈 Detailed statistics
🎨 5 beautiful themes

Perfect for #NaNoWriMo writers!

Download: [STORE_URL]
```

**Reddit (r/writing, r/nanowrimo):**
```
I built a free Chrome extension for Google Docs writers - SprintWrite

After struggling to track my writing sprints during NaNoWriMo, I created SprintWrite - a completely free timer that integrates directly into Google Docs.

Features:
• Timed writing sprints with live word count
• Words per minute tracking
• Daily writing goals
• Complete sprint history
• 5 themes to match your writing environment
• 100% private - no data collection

It's open source and available now on the Chrome Web Store. Hope it helps your writing journey!

[STORE_URL]
```

---

**Ready to submit to Chrome Web Store! 🎉**
