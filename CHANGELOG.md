# Changelog

## 2026-06-22

### Timeline Status Update
- Added status toggle (OPEN ↔ SOLVED) in Timeline view - click status badge to update.
- Status changes persist to backend with loading state during update.

### PWA Enhancement
- Enhanced web manifest with screenshots, icons, and display modes.
- Added light/dark theme colors, Windows tile config, and notch support.
- All Apple splash screens configured for iOS devices.
- PWA installable on iOS, Android, Windows, and macOS.

### Fixed
- Notch overlap issue: header now respects safe area on notched devices.
- Status badge styling: added interactive hover effects.
- Build error: switched CSS minifier to esbuild.

## 2026-06-21

- Added startup splash animation: "Nischal Tatvam Jivan Mukti" with letter-by-letter reveal.
- Reworked header layout for better desktop/mobile responsiveness.
- Centered header content to align with main column.
- Added subtle background gradients and decorative styling.
- Added API request/response logging for debugging.
- Created CHANGELOG.md for feature tracking.
