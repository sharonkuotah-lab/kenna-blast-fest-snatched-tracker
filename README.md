# Kenna's Blast Fest Snatched Tracker

A mobile-first, local-first Progressive Web App for a 46-day body recomposition challenge leading to Blast Fest on July 18, 2026. The interface is designed to be simple and repeatable: daily essentials first, deeper tracking only when useful.

## Phase 2 UI Polish

Phase 2 adds a more elevated soft-glam wellness identity while preserving the complete version 1 tracker. The dashboard now behaves like a luxury wellness command center with a focused daily mission, event countdowns, glass panels, premium progress rings, a floating pill navigation, and stronger visual hierarchy. Meals, official check-ins, and the AI Coach journal received dedicated layouts for faster daily use.

### Design System

- Palette: warm cream `#f8f1ec`, soft blush `#e7b7b6`, dusty rose `#bd7180`, mauve `#a98791`, champagne `#bc945e`, and espresso `#241b1c`
- Display headings: [Bodoni Moda](https://fonts.google.com/specimen/Bodoni+Moda), inspired by the Bodoni / Old Money reference
- Editorial accents: [Playfair Display SC](https://fonts.google.com/specimen/Playfair+Display+SC) and [Libre Baskerville](https://fonts.google.com/specimen/Libre+Baskerville)
- Functional UI text: [Montserrat](https://fonts.google.com/specimen/Montserrat) with [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) fallback
- Soft secondary sans: [Josefin Sans](https://fonts.google.com/specimen/Josefin+Sans) and [Didact Gothic](https://fonts.google.com/specimen/Didact+Gothic)
- UI language: translucent glass cards, editorial spacing, rounded corners, pill buttons, restrained gradients, and large mobile-friendly touch targets

## Phase 2.1 Routine Integration

Phase 2.1 makes the app calmer and more personal for daily use:

- Clean-start flow for a real June 2, 2026 Day 1 without sample trends
- Routine-aware missions for class days, clinical shifts, recovery days, off days, prep days, and Sunday resets
- Minimal dashboard with collapsible calorie, gut, trend, event, and reminder details
- Clear 30-second Quick Log and detailed Full Check-In modes
- Combined Nutrition + Gut workspace with Meals, Gut, Grocery, and Whole Foods tabs
- Camera-ready meal photo input, grocery builder, and repeatable Whole Foods meal-prep logs
- Workout split browser with sets, reps, weight, notes, cardio tracking, and custom exercises
- Clickable challenge calendar, empty trend states, extra event support, and expanded AI Coach tools

## Phase 3 Coach Engine

- Calmer command-center Home with a compact hero, mission chips, quick actions, forecast card, and weekly progress
- Snatched Forecast Engine with estimated Blast Fest weight, goal pace, current pace, status, and one practical adjustment
- Permanent RENPHO and tape-measure baseline for starting, previous, current, and total-change comparisons
- Sunday review with weekly wins, the biggest bottleneck, and one realistic focus for the next week
- Smart Coach alerts that deliberately surface one priority instead of a wall of warnings
- One-click structured ChatGPT export with habits, official trends, forecast context, gut health, and saved coach notes
- Local Day 1 versus later check-in photo comparisons with front, side, and back drag sliders
- Progressive-overload cues showing the previous logged weight beside today's exercise entry
- Reusable Whole Foods library with favorites, price, rating, macros, notes, and one-tap logging

## Custom Meal Library

- **My Saved Meals** now appears at the top of Nutrition + Gut for fast repeat logging.
- Saved meal templates are separate from daily logged meals, so editing or deleting a template does not change meal history.
- Tap a saved meal to choose **Log as-is**, **Customize today**, **Edit template**, favorite/unfavorite, or delete.
- **Log with edits** opens a meal builder for today only, with optional add-ons, portion adjustment, notes, and photo input.
- Edited meals can be saved only for today, saved as a new custom meal, or used to update the original template.
- Logged meals can be edited for that specific day without changing the saved template.
- Default templates include eggs and egg whites, protein shakes, kefir smoothies, Whole Foods meals, tortilla chips, coffee, and green tea with ginger and honey.

## Official Baseline + On Track Forecast

- June 2, 2026 is saved as the official Day 1 RENPHO and smart tape baseline.
- Baseline metrics include weight, body fat, skeletal muscle, muscle mass, fat-free mass, visceral fat, subcutaneous fat, body water, protein %, BMR, metabolic age, waist, abdomen, and hip.
- Official check-ins now generate a transformation Snatched Score based on body fat, waist, abdomen, weight, muscle mass, protein, and steps.
- The app flags **Hydration Focus Week** when body water is below 48%.
- The “Am I On Track?” card projects July 18 weight, body fat, waist, and abdomen from the official check-in trend when enough data exists.
- Every 9-day check-in can import expanded RENPHO and smart tape metrics, then generate wins, warnings, and forecast context.

## Phase 5 Automation + ADHD Mode

- Home now opens as a Smart Morning Dashboard: greeting, day number, Seattle and Blast Fest countdowns, Today's Top 3 Priorities, Today's Score, streaks, and quick actions.
- Today's Score is simplified to the essentials only: protein, steps, water, workout, and check-in.
- Protein, workout, step, check-in, and water streaks are tracked with a forgiving missed-day recovery message.
- Nursing school routines now drive the daily briefing for class days, clinical days, clinical recovery, gym days, prep days, reset days, and off days.
- A floating plus button gives one-tap access to water, protein, meals, workouts, voice notes, and steps without navigating.
- Achievement cards now highlight meaningful wins such as first workout, 10,000 step day, body fat down, waist down, and official check-ins.
- The Weekly Report summarizes wins, areas to improve, forecast, best habit, worst habit, and next-week focus with one-click copy.
- Detailed tracking still exists, but it is tucked behind buttons, tabs, and expandable sections so daily use feels calm instead of crowded.

## Phase 6 Kenna Operating System

- The app now behaves more like a personal transformation dashboard than a weight-loss tracker.
- Whole Foods Builder 2.0 supports one-tap logging, editing, duplicating, deleting, and saving variations of repeat meals.
- The RENPHO Import Center compares current official measurements against the June 2 baseline with soft green, champagne, and orange status colors.
- Body Recomp Dashboard prioritizes waist change, body fat change, muscle retention, and Transformation Score before scale weight.
- Seattle and Blast Fest goal visualization cards show progress from the official baseline toward event-specific goals.
- Photo Timeline gives every official check-in day a gallery entry and keeps Day 1 comparison tools available.
- Gym Progression Center summarizes current, previous, best, and personal-record status for key lifts.
- Sunday Planning creates a weekly setup ritual for meals, groceries, workouts, school, appointments, and events.
- Content Creator Mode tracks optional photoshoots, brand deadlines, trips, campaign goals, and future milestones.
- Day 45 Transformation Report generates a printable scrapbook-style report that can be saved as a PDF from the browser print dialog.

## Features

- Smart Morning Dashboard with event countdowns, Top 3 priorities, Today's Score, streaks, quick actions, and missed-day recovery
- Daily checklist with quick mode, full check-in, manual Apple Health fields, voice dictation, and emergency reset
- Meal tracking with one-tap Whole Foods-style meals, custom meals, nutrition totals, and local meal photos
- Gut health tracker for water, fiber, vegetables, kefir, probiotics, bowel movements, bloating, constipation, stress, and sleep
- Repeating seven-day workout plan with exercise checkboxes and notes
- Official check-ins on days 1, 9, 18, 27, 36, and 45, including RENPHO-style manual metrics, measurements, reflections, and local progress photos
- Private random weigh-ins that never affect official weight charts
- Progress charts, challenge calendar, achievements, calorie projection, and a copyable 9-day ChatGPT summary
- Soft-glam mobile design, offline support, installable PWA manifest, and no backend

## Run Locally

The service worker needs a local web server. From this folder, run:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Install as a PWA

On iPhone, open the deployed site in Safari, tap **Share**, select **Add to Home Screen**, and confirm. On supported desktop browsers, use the install option in the browser address bar or menu. Once installed, the tracker opens like a standalone app and previously cached screens remain available offline.

## Deploy to GitHub Pages

1. Push these files to a GitHub repository.
2. Open the repository's **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch containing the files and the `/ (root)` folder.
5. Save and open the published GitHub Pages URL.

All paths are relative, so the PWA works from a GitHub Pages project subdirectory.

## Data Storage

Daily logs, settings, meals, check-ins, and private weigh-ins are stored in `localStorage`. Photos are stored in IndexedDB when the browser supports it. Data remains on the current device and browser profile.

New trackers start clean. Existing preview data can be removed with **Settings > Clear Sample Data + Start My Real Tracker**. Use **Settings > Clear all data** to remove all local tracker data. Clearing browser site data also removes it.

## Limitations

- Version 1 uses manual Apple Health and RENPHO entry.
- Browser notifications are permission-based and not guaranteed to run reliably when the app is closed.
- Photos remain on the device and are not included in copied AI summaries.
- There is no account sync, cloud backup, or food database.

## Future Upgrades

- Apple Health integration
- Login and account sync
- Cloud photo storage
- AI photo analysis
- Reliable push notifications
- Food database and barcode scanner
- Native iOS app

## Safety

This tracker supports wellness and consistency. It is not medical advice. If you experience dizziness, fainting, extreme fatigue, severe constipation, chest pain, disordered eating symptoms, or worsening health symptoms, seek medical guidance.
