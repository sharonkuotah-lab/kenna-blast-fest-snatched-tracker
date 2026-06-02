# Kenna's Blast Fest Snatched Tracker

A mobile-first, local-first Progressive Web App for a 45-day body recomposition challenge leading to Blast Fest on July 18, 2026. The interface is designed to be simple and repeatable: daily essentials first, deeper tracking only when useful.

## Phase 2 UI Polish

Phase 2 adds a more elevated soft-glam wellness identity while preserving the complete version 1 tracker. The dashboard now behaves like a luxury wellness command center with a focused daily mission, event countdowns, glass panels, premium progress rings, a floating pill navigation, and stronger visual hierarchy. Meals, official check-ins, and the AI Coach journal received dedicated layouts for faster daily use.

### Design System

- Palette: warm cream `#f8f1ec`, soft blush `#e7b7b6`, dusty rose `#bd7180`, mauve `#a98791`, champagne `#bc945e`, and espresso `#241b1c`
- Headings: [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond)
- Body text: [DM Sans](https://fonts.google.com/specimen/DM+Sans)
- Decorative brand mark: [Italiana](https://fonts.google.com/specimen/Italiana)
- UI language: translucent glass cards, editorial spacing, rounded corners, pill buttons, restrained gradients, and large mobile-friendly touch targets

## Features

- Dashboard with event countdowns, challenge day, streak, next check-in, scores, progress bars, calorie dashboard, and daily coach feedback
- Daily checklist with quick mode, full check-in, manual Apple Health fields, voice dictation, and emergency reset
- Meal tracking with one-tap Whole Foods-style meals, custom meals, nutrition totals, and local meal photos
- Gut health tracker for water, fiber, vegetables, kefir, probiotics, bowel movements, bloating, constipation, stress, and sleep
- Repeating seven-day workout plan with exercise checkboxes and notes
- Official check-ins on days 1, 9, 18, 27, 36, and 45, including RENPHO-style manual metrics, measurements, reflections, and local progress photos
- Private random weigh-ins that never affect official weight charts
- Progress charts, 45-day calendar, badges, calorie projection, and a copyable 9-day ChatGPT summary
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

The first launch includes clearly labeled sample logs so the dashboard and charts are easy to explore. Use **Settings > Clear all data** to remove sample or tracker data. Clearing browser site data also removes it.

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
