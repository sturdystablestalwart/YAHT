# YAHT Development Roadmap

This plan prioritizes high-leverage improvements: changes that deliver maximum value to the user (Mobile/UX) and the developer (Code Health) with minimal friction.

## 1. Immediate: Visual Consistency & Mobile Polish
**Goal:** Make the app look professional and feel native on mobile devices.

**Status: COMPLETED** (2026-01-21)

*   **Complete UI Standardization:**
    *   [x] **Audit Pages:** `Register.jsx` and `Create.jsx` already used the unified `colors.js` palette correctly.
    *   [x] **Standardize Containers:** Updated `Settings.jsx` to use `GradientCard` wrapper (was missing the gradient border container).
    *   [x] **NotificationSettings cleanup:** Removed redundant Box wrapper since GradientCard now provides the background styling.
*   **Mobile-First Experience:**
    *   [x] **Touch Targets:** Added `minH="44px"` and `minW="44px"` to all interactive elements:
        - Navbar: IconButtons (Create, Dashboard), ColorModeButton, Login/Register buttons, User menu
        - Forms: Submit buttons on Login, Register, Create pages
        - Settings: All toggle and action buttons
    *   [x] **Navigation:** Navbar responsiveness verified - username hides on mobile, logo scales, touch targets proper size.
    *   [x] **PWA (Progressive Web App):** Installed `vite-plugin-pwa` with:
        - Web app manifest (name, icons, theme color)
        - Service worker with asset caching
        - SVG icons (192x192, 512x512, apple-touch-icon) with gradient "Y" logo
        - Updated index.html with PWA meta tags

### Testing Instructions for Phase 1

**To verify the changes:**

1. **Start the servers:**
   ```bash
   # Terminal 1 - Backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Test Mobile View:**
   - Open browser DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Select iPhone 14 Pro or similar (390x844)
   - Navigate through all pages and verify:
     - Gradient borders on all cards
     - Buttons are easily tappable (44px minimum)
     - Forms are readable and usable

3. **Test Dark/Light Mode:**
   - Click the sun/moon icon in navbar
   - Verify colors change correctly on all pages

4. **Test PWA Installation:**
   - Build the frontend: `cd frontend && npm run build`
   - Serve the build: `npm run preview`
   - In Chrome, look for the install icon in the address bar
   - Or: DevTools > Application > Manifest (verify manifest loads)

5. **Verify Touch Targets:**
   - On mobile view, all buttons should be easy to tap
   - No accidental mis-taps on adjacent elements

### Future Work (from this phase)
- [x] **Refactor HomeCard naming:** Renamed `HomeCard` to `GradientCard` for clarity (it's used beyond just the Home page now)
- [x] **Dashboard Page Improvements** (2026-01-22):
	- Added GradientCard gradient aesthetic to all 6 dashboard panels
	- Created responsive dual-layout system:
	    - **Mobile (< lg):** Scrollable VStack with generous minimum heights (140-220px per panel)
	    - **Desktop (lg+):** 2-column grid layout with GradientCard wrappers
	  - Added 44px touch targets to all dashboard buttons (habit filter, range selector, retry)
	  - Fixed TodayFocus "Done" button touch target

---

## 2. Architecture: "Delete Code to Improve Code"
**Goal:** Simplify state management and reduce boilerplate by ~30%.

**Status: COMPLETED** (2026-01-22)

*   **Prettier Setup:**
    *   [x] Created `.prettierrc` and `.prettierignore` configuration files
    *   [x] Added `format` and `format:check` scripts to root `package.json`
    *   [x] Formatted entire codebase (backend + frontend)

*   **Axios + Interceptors:**
    *   [x] Created `frontend/src/services/axiosInstance.js` with request/response interceptors
    *   [x] Auto-attaches `Authorization: Bearer` token to all requests
    *   [x] Handles 401 globally (clears localStorage, redirects to `/login`)
    *   [x] Auto-unwraps `response.data` for cleaner API calls
    *   [x] Refactored `api.js` from ~228 lines to ~78 lines (removed `getAuthHeaders()`, `handleResponse()`)

*   **TanStack Query (React Query):**
    *   [x] Installed `@tanstack/react-query` and `@tanstack/react-query-devtools`
    *   [x] Added `QueryClientProvider` to `main.jsx` with optimized defaults (5min staleTime, 30min gcTime)
    *   [x] Created query hooks:
        - `useHabits.js` - habits, streaks, and CRUD mutations with **optimistic updates**
        - `useDashboard.js` - dashboard summary, calendar heatmap, trends, time heatmap
        - `useCompletions.js` - daily stats for chart
    *   [x] Migrated components:
        - `HabitsList.jsx` - uses `useHabits`, `useStreaks`, `useLogCompletion`, `useDeleteTodayCompletion`
        - `Chart.jsx` - uses `useDailyStats`
        - `Dashboard.jsx` - uses `useDashboardSummary`
        - `CalendarHeatmap.jsx`, `TrendChart.jsx`, `TimeHeatmap.jsx` - use respective dashboard hooks
        - `Create.jsx` - uses `useCreateHabit` mutation
        - `ManageModal.jsx` - uses `useHabits`, `useUpdateHabit`, `useDeleteHabit` mutations
    *   [x] Removed `refreshKey` pattern from `Home.jsx` (TanStack Query handles cache invalidation)
    *   [x] Cleaned up `LogModal.jsx` and `HabitsList.jsx` (removed unused `onCompletionLogged` callbacks)

### Testing Instructions for Phase 2

**To verify the changes:**

1. **Start the servers:**
   ```bash
   # Terminal 1 - Backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Verify Prettier:**
   ```bash
   npm run format:check   # Should pass with no issues
   ```

3. **Test Authentication Flow:**
   - Navigate to http://localhost:5173/login
   - Login or register a new user
   - Verify redirect to home page
   - Check that navbar shows username

4. **Test Optimistic Updates (Habit Completion):**
   - On home page, click the Log Modal (plus icon)
   - Click a habit to complete it
   - **Verify UI updates INSTANTLY** (no loading spinner)
   - Click again to uncomplete
   - **Verify UI rolls back instantly**

5. **Test Dashboard:**
   - Navigate to http://localhost:5173/dashboard
   - Verify all 6 panels load:
     - Streak tiles
     - Today's focus
     - Calendar heatmap
     - Time heatmap
     - Trend chart
     - Completion bars
   - Change range selector (7D, 30D, 90D)
   - Verify data updates without full page reload

6. **Test Create Habit:**
   - Navigate to /create
   - Fill in habit details and submit
   - Verify redirect to home and new habit appears (cache invalidation)

7. **Test Manage Habit:**
   - On home page, click the Settings icon
   - Select a habit to edit
   - Change the name and save
   - Verify the list updates with new name

8. **Verify React Query Devtools:**
   - In browser, look for the flower icon (bottom-right)
   - Click to open devtools
   - Verify queries are listed: `["habits", "list"]`, `["streaks"]`, etc.
   - Complete a habit and verify cache invalidation in devtools

## 3. Backend: Safety & Validation
**Goal:** Robust error handling and security without over-engineering.

*   **Schema Validation (Zod):**
    *   **Current Issue:** Controllers are cluttered with manual checks (`if (!body.title)...`).
    *   **Solution:** Create middleware using **Zod** schemas. Validate requests *before* they reach the controller.
*   **Security Essentials:**
    *   **Rate Limiting:** Implement `express-rate-limit` on auth routes to prevent brute-force attacks.
    *   **Helmet:** Add `helmet` middleware to set secure HTTP headers.
*   **Centralized Error Handling:**
    *   Replace `console.error` in every `catch` block with a global error handling middleware.

## 4. Developer Experience (DX)
**Goal:** Make the project easy to run and maintain.

*   **"One Command" Start:**
    *   Add `concurrently` to the root `package.json` to start both Backend (Nodemon) and Frontend (Vite) with a single command (`npm start`).
*   **Automated Formatting:**
    *   Configure **Prettier** to run on save. This eliminates discussions/decisions about code style (indentation, quotes, etc.).

---

## Suggested Next Steps

1.  **DX:** Create the root `npm start` script with `concurrently` (one command to start both servers).
2.  **Phase 3:** Implement backend validation with Zod schemas.
3.  **Security:** Add rate limiting and Helmet middleware.
