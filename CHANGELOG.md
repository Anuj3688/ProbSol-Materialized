# Changelog

This file contains high-level notes for feature changes, design updates, and debugging improvements. Add a new entry under the current date whenever a feature is completed.

## 2026-06-22

### PWA Enhancement
- Enhanced web manifest with screenshots, additional icon sizes, and categories.
- Added `color-scheme` meta tag for automatic light/dark theme support.
- Updated theme colors for both light (#4f46e5) and dark (#8b5cf6) modes.
- Added Windows tile configuration (`browserconfig.xml`) for Windows Start menu support.
- Updated viewport meta tag with `viewport-fit=cover` for notch support.
- All Apple splash screens (light and dark) configured for iOS devices.
- PWA now fully installable on iOS, Android, Windows, and macOS.

### Fixed
- Build error: switched CSS minifier from `lightningcss` to `esbuild` in vite.config.ts.
- Added `esbuild` as a dev dependency.

## 2026-06-21

- Added a startup splash animation showing the text "Nischal Tatvam Jivan Mukti" with a letter-by-letter reveal.
- Reworked the header layout to align better on desktop and mobile devices.
- Centered the header content so the page title and theme picker align with the main form column.
- Added subtle background gradients and decorative styling for better visual depth.
- Added API request / response logging support to `src/services/api.ts` for easier debugging.
- Created this `CHANGELOG.md` file for future feature recording.

> Tip: Update this file after each feature with the date, the feature, and any important notes.
