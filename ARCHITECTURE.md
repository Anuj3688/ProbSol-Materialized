# Architecture & Technical Design

This document provides a comprehensive technical overview of **ProbSol Materialised**, covering system design, application architecture, component hierarchy, state flow, Progressive Web App (PWA) setup, and backend integrations.

---

## 1. System Overview

**ProbSol Materialised** is a mobile-first Progressive Web Application designed for rapid thought capture—specifically problems and solutions encountered during daily engineering and personal activities.

### Current High-Level Architecture (V0)

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Device                         │
│  (Mobile PWA / Desktop Chrome / Safari / Edge / Firefox)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Hosting & Edge Routing                      │
│                         (Vercel)                            │
│  ┌───────────────────────┐       ┌────────────────────────┐ │
│  │   Static Assets (SPA) │       │ Serverless API Proxy   │ │
│  │   Vite Build Output   │       │ /api (api/index.ts)    │ │
│  └───────────────────────┘       └───────────┬────────────┘ │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                                               │ HTTPS POST / GET
                                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Google Apps Script Web App                  │
│                     (google-apps-script/Code.gs)            │
│  - Receives doGet() & doPost() requests                     │
│  - Parses & validates payload                               │
│  - Appends rows / updates cell status                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ Internal Google Sheet API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Google Sheets Database                      │
│                     ("Entries" Sheet)                       │
│  Columns: ID | Type | Status | Title | Description |        │
│           Tags | Timestamp                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Core Framework** | React 19 (`react`, `react-dom`) | Declarative UI rendering |
| **Language** | TypeScript (~6.0) | Static typing & interface definitions |
| **Build Tooling** | Vite 8 | Fast HMR, optimized production bundler |
| **Routing** | React Router DOM v7 | Client-side declarative routing |
| **PWA Engine** | `vite-plugin-pwa` (Workbox) | Offline caching & manifest generation |
| **Styling** | Vanilla CSS (CSS Variables) | Lightweight, zero-runtime overhead theming |
| **Linter / Quality** | ESLint 10 + `typescript-eslint` | Code quality and style enforcement |

### 2.2 Directory Structure

```
ProbSol Materialized/
├── api/
│   └── index.ts                 # Vercel Serverless Function (reverse proxy to Apps Script)
├── google-apps-script/
│   └── Code.gs                  # Google Apps Script API handler for Google Sheets
├── public/
│   ├── splash/                  # iOS splash screens for various device viewports
│   ├── browserconfig.xml        # Windows Live Tile configuration
│   ├── favicon.svg              # SVG favicon
│   ├── apple-touch-icon.png     # iOS bookmark icon
│   └── pwa-*.png                # Android & PWA icons
├── src/
│   ├── assets/                  # Static media assets
│   ├── components/              # Modular UI components
│   │   ├── AppHeader.tsx        # Top navigation & theme switcher
│   │   ├── BottomNavigation.tsx # Mobile tab bar navigation
│   │   ├── Splash.tsx           # Sanskrit splash animation screen
│   │   └── Splash.css           # Splash animation styling
│   ├── hooks/                   # Custom reusable React hooks
│   │   ├── useLocalStorage.ts   # Persistent local storage state hook
│   │   └── usePreferredTheme.ts # System & user theme sync hook
│   ├── pages/                   # Application view controllers
│   │   ├── CapturePage.tsx      # Problem & solution entry form
│   │   └── TimelinePage.tsx     # Chronological entries feed
│   ├── services/                # External communication layer
│   │   ├── api.ts               # HTTP client with proxy handling & normalization
│   │   └── problemService.ts    # In-memory problem utility helpers
│   ├── types/
│   │   └── index.ts             # Domain models, payloads, and application types
│   ├── App.css                  # Core component & layout styles
│   ├── App.tsx                  # App shell, routing, and layout coordinator
│   ├── index.css                # Global tokens, reset, typography, & CSS variables
│   └── main.tsx                 # React DOM mount point
├── vite.config.ts               # Vite & PWA Workbox configuration
├── vercel.json                  # Edge routing, headers, and SPA rewrites
└── tsconfig*.json               # TypeScript compiler options
```

---

## 3. Component Hierarchy & Navigation Flow

The application is structured as a single-page app (SPA) with a persistent shell and dynamic view pages.

```
<App>
 ├── <Splash> (renders conditionally during initial 3-second startup)
 ├── <AppHeader> (branding + theme selector: light / dark / system)
 ├── <main className="app-main">
 │    └── <Routes>
 │         ├── Route "/capture"  -> <CapturePage>
 │         ├── Route "/timeline" -> <TimelinePage>
 │         └── Route "*"         -> Redirect to "/capture"
 └── <BottomNavigation> (fixed bottom bar with active route highlighting)
```

### Pages

1. **`CapturePage`** (`/capture`):
   - **Purpose**: Low-friction entry creation.
   - **Fields**:
     - `Type`: Radio selector (`Problem` vs `Solution`). Default status adjusts dynamically (`Problem` defaults to `OPEN`, `Solution` defaults to `SOLVED`).
     - `Status`: Radio selector (`OPEN` vs `SOLVED`).
     - `Title`: Required single-line input.
     - `Description`: Multiline context textarea.
     - `Tags`: Comma-separated input with real-time tag pill preview.
   - **Draft Preview**: Displays the most recently submitted entry directly below the form as feedback.

2. **`TimelinePage`** (`/timeline`):
   - **Purpose**: Reviewing entries in reverse chronological order.
   - **Features**:
     - Real-time refresh action with loading spinner.
     - Card-based layout with colored type badges (`type-problem`, `type-solution`).
     - **Interactive Status Badge**: Clicking a status badge (`OPEN` / `SOLVED`) sends an asynchronous status toggle request to the backend and updates the UI optimistically.
     - Tag preview chips for quick identification.

---

## 4. State Management & Data Flow

### 4.1 Client-Side State
- **Form State**: Managed using local `useState` hooks inside [`CapturePage.tsx`](file:///Users/anujtiwari/ProbSol%20Materialized/src/pages/CapturePage.tsx).
- **Theme State**: Handled via [`useLocalStorage.ts`](file:///Users/anujtiwari/ProbSol%20Materialized/src/hooks/useLocalStorage.ts) and [`usePreferredTheme.ts`](file:///Users/anujtiwari/ProbSol%20Materialized/src/hooks/usePreferredTheme.ts), synchronizing CSS root dataset attributes (`data-theme="light"` / `data-theme="dark"`).
- **Timeline State**: Managed in [`TimelinePage.tsx`](file:///Users/anujtiwari/ProbSol%20Materialized/src/pages/TimelinePage.tsx), storing the entries array and handling per-card mutation locks (`updatingId`).

### 4.2 Data Normalization Pipeline

Client domain types differ slightly from the backend Google Apps Script schema. [`src/services/api.ts`](file:///Users/anujtiwari/ProbSol%20Materialized/src/services/api.ts) acts as an anti-corruption layer:

```
Frontend Types                     API / Wire Format
------------------                 -----------------
CaptureDraft / TimelineEntry  <==> ApiEntry
  id: string                         id: string
  type: 'problem' | 'solution'       type: 'Problem' | 'Solution'
  status: 'OPEN' | 'SOLVED'          status: 'OPEN' | 'SOLVED'
  title: string                      title: string
  description: string                description: string
  tags: string[]                     tags: string[] | "tag1, tag2"
  createdAt: string                  timestamp: ISO string
```

---

## 5. Backend Integration & Proxy Architecture

### 5.1 The CORS & Redirect Challenge

Google Apps Script Web Apps:
1. Always issue `302 Found` redirects to `script.googleusercontent.com` upon receiving requests.
2. Direct client-side `fetch` calls to Google Apps Script often trigger CORS preflight failures or opaque response restrictions in browser environments.

### 5.2 The Vercel Serverless Proxy Solution

To guarantee reliable communication across all web and mobile browsers:
- Client code invokes `/api` on the same origin.
- [`api/index.ts`](file:///Users/anujtiwari/ProbSol%20Materialized/api/index.ts) is deployed as a Vercel Serverless Function.
- The proxy forwards headers and bodies to the target Google Apps Script URL specified by `VITE_API_BASE_URL`.
- The proxy consumes the Google Apps Script redirect internally and returns the final JSON response to the client with clean CORS headers.

```
Browser Client  ───>  /api  ───>  Vercel Serverless Handler  ───>  Google Apps Script (Executes doGet / doPost)
                                         (api/index.ts)                      │
                                                                             ▼
                                                                       Google Sheets
```

### 5.3 Google Apps Script Handler (`Code.gs`)

The script acts as a mini-controller:
- **`doGet(e)`**: Invokes `getEntries()`. Reads row range `1..N`, maps headers to objects, sorts by `timestamp` descending, and returns `{ success: true, data: entries }`.
- **`doPost(e)`**: 
  - If `body.action === 'updateStatus'`, finds the row matching `body.id` and updates column 3 (`Status`).
  - Otherwise, calls `addEntry(body)`. Generates a UUID via `Utilities.getUuid()`, stamps current ISO timestamp, and appends the row to the `Entries` sheet.

---

## 6. Progressive Web App (PWA) Implementation

The application leverages `vite-plugin-pwa` configured in [`vite.config.ts`](file:///Users/anujtiwari/ProbSol%20Materialized/vite.config.ts).

### Key PWA Capabilities:
1. **Offline Shell**: Service worker precaches HTML, JS, CSS, and media assets via Workbox.
2. **Device Display Modes**:
   - `display: 'standalone'` removes URL bar and browser chrome.
   - Fallback modes: `['standalone', 'minimal-ui', 'browser']`.
3. **iOS Safe Area Support**:
   - Meta tag `viewport-fit=cover`.
   - CSS properties `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` protect against notch and home-indicator overlap.
4. **Complete Apple Splash Screen Matrix**:
   - Over 50 pre-generated splash screens in `public/splash/` matching distinct physical pixel ratios of modern iPhones and iPads in both light and dark orientations.

---

## 7. Current Architectural Trade-offs & Limitations (V0)

| Aspect | Current V0 Implementation | Trade-off / Limitation |
|---|---|---|
| **Data Storage** | Google Sheets | Latency of 1.5s - 3.5s per write; concurrency row lock limitations; lacks primary key constraints. |
| **Authentication** | None (Single Shared Sheet) | Cannot support multi-user isolation. Anyone accessing the deployed URL writes to the same sheet. |
| **Search & Querying** | Client-side linear array scan | Does not scale beyond several hundred notes; no full-text indexing or fuzzy search. |
| **CRUD Operations** | Create, List, Status Toggle only | No editing note content, no tag renaming, no soft or permanent delete. |
| **Offline Sync** | Precaches UI shell only | Entries submitted offline will fail rather than queueing in IndexedDB for background sync. |
