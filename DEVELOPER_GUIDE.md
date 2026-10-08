# Developer Onboarding & Contribution Guide

This guide walks through setting up, developing, testing, debugging, and deploying **ProbSol Materialised**.

---

## 1. Prerequisites

Before getting started, make sure your local environment has:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+), `pnpm`, or `yarn`
- **Google Account**: If setting up your own Google Sheet and Apps Script backend.
- **Git**: For version control.

---

## 2. Quick Start

### 2.1 Clone and Install Dependencies

```bash
git clone https://github.com/Anuj3688/ProbSol-Materialized.git
cd "ProbSol-Materialized"
npm install
```

### 2.2 Configure Environment Variables

Duplicate the template file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```ini
# Google Apps Script Web App Deployment URL
VITE_API_BASE_URL=https://script.google.com/macros/s/AKfycbx.../exec

# Enable verbose API request/response logging in browser console (true | false)
VITE_API_DEBUG=true
```

### 2.3 Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173` (or the next available port).

---

## 3. Project Scripts

| Command | Action | Description |
|---|---|---|
| `npm run dev` | Start Vite dev server | Runs local server with Hot Module Replacement (HMR). |
| `npm run build` | Compile & Bundle | Runs TypeScript check (`tsc -b`) followed by Vite production build. |
| `npm run lint` | ESLint static analysis | Checks code for errors and rule violations. |
| `npm run preview` | Production preview | Serves the built `dist/` directory locally on port 4173 to test PWA and production behavior. |

---

## 4. Google Apps Script Setup (Backend Storage)

If you need to deploy your own Google Sheets backend:

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name the spreadsheet (e.g., `ProbSol Data`).
3. Rename the first tab/sheet to `Entries`.

### Step 2: Open Script Editor
1. In your sheet, click **Extensions** → **Apps Script**.
2. Replace all code in the script editor with the contents of [`google-apps-script/Code.gs`](file:///Users/anujtiwari/ProbSol%20Materialized/google-apps-script/Code.gs).

### Step 3: Deploy as Web App
1. Click **Deploy** → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the fields:
   - **Description**: `ProbSol API v1`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial so that the frontend can call it without Google OAuth prompts)*
4. Click **Deploy**.
5. Copy the generated **Web app URL** (format: `https://script.google.com/macros/s/.../exec`).

### Step 4: Link with Frontend
Paste this URL into your `.env` file as `VITE_API_BASE_URL`.

---

## 5. Local API Proxying vs Production Proxying

### In Local Development (`npm run dev`)
- Vite directly accesses the environment variable. When you interact with `/capture` or `/timeline`, the fetch calls in [`src/services/api.ts`](file:///Users/anujtiwari/ProbSol%20Materialized/src/services/api.ts) target `/api`.
- In local development without Vercel CLI, if you want direct calls, you can configure Vite proxy in [`vite.config.ts`](file:///Users/anujtiwari/ProbSol%20Materialized/vite.config.ts) or test with the Vercel dev CLI (`npx vercel dev`).

### In Production (Vercel)
- Vercel automatically deploys [`api/index.ts`](file:///Users/anujtiwari/ProbSol%20Materialized/api/index.ts) as a serverless endpoint answering `GET` and `POST` at `/api`.
- `VITE_API_BASE_URL` is set in the Vercel Project Settings → Environment Variables.

---

## 6. Progressive Web App (PWA) Testing

PWA service workers only run over HTTPS or `localhost` on production bundles.

To test PWA installation and service worker behaviors locally:

```bash
npm run build
npm run preview
```

1. Open `http://localhost:4173` in Google Chrome or Microsoft Edge.
2. Open Chrome DevTools (`F12` or `Cmd + Option + I`).
3. Navigate to the **Application** tab:
   - **Manifest**: Verify icons, theme colors, and display mode (`standalone`).
   - **Service Workers**: Verify `sw.js` is installed and activated.
   - **Cache Storage**: Verify precached static bundles and images exist.
4. Try toggling **Offline** mode under the Service Workers tab and reload the page—the shell should render without network errors.

---

## 7. Code Standards & Architecture Guidelines

1. **TypeScript Typing**:
   - Store all shared types and domain interfaces in [`src/types/index.ts`](file:///Users/anujtiwari/ProbSol%20Materialized/src/types/index.ts).
   - Avoid `any`. Use discriminated unions for polymorphic types.

2. **Styling & Theming**:
   - Use CSS custom properties defined in [`src/index.css`](file:///Users/anujtiwari/ProbSol%20Materialized/src/index.css) (e.g., `var(--color-bg)`, `var(--color-text)`, `var(--color-primary)`).
   - Component styles belong in [`src/App.css`](file:///Users/anujtiwari/ProbSol%20Materialized/src/App.css) or scoped CSS files.

3. **Accessibility (a11y)**:
   - Always provide accessible labels, `aria-live` polite regions for asynchronous loading, and descriptive `aria-label` tags on icon buttons.
