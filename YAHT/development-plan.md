# YAHT Development Roadmap

This plan prioritizes high-leverage improvements: changes that deliver maximum value to the user (Mobile/UX) and the developer (Code Health) with minimal friction.

## 1. Immediate: Visual Consistency & Mobile Polish
**Goal:** Make the app look professional and feel native on mobile devices.

**Status: COMPLETED** (2026-01-21)

*   **Complete UI Standardization:**
    *   [x] **Audit Pages:** `Register.jsx` and `Create.jsx` already used the unified `colors.js` palette correctly.
    *   [x] **Standardize Containers:** Updated `Settings.jsx` to use `HomeCard` wrapper (was missing the gradient border container).
    *   [x] **NotificationSettings cleanup:** Removed redundant Box wrapper since HomeCard now provides the background styling.
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
- [ ] **Refactor HomeCard naming:** Consider renaming to `GradientCard` or `BorderCard` for clarity (it's used beyond just the Home page now)
- [x] **Dashboard Page Improvements** (2026-01-22):
  - Added HomeCard gradient aesthetic to all 6 dashboard panels
  - Created responsive dual-layout system:
    - **Mobile (< lg):** Scrollable VStack with generous minimum heights (140-220px per panel)
    - **Desktop (lg+):** 2-column grid layout with HomeCard wrappers
  - Added 44px touch targets to all dashboard buttons (habit filter, range selector, retry)
  - Fixed TodayFocus "Done" button touch target

---

## 2. Architecture: "Delete Code to Improve Code"
**Goal:** Simplify state management and reduce boilerplate by ~30%.

*   **Adopt TanStack Query (React Query):**
    *   **Current Issue:** Manual `useEffect`, `useState`, `isLoading`, and `error` handling in every component is verbose and buggy (waterfall loading).
    *   **Solution:** Replace manual fetching with `useQuery` and `useMutation`. This provides automatic caching, background refetching, and optimistic updates out of the box.
*   **Smart API Client (Axios + Interceptors):**
    *   **Current Issue:** `api.js` manually repeats header injection for every call.
    *   **Solution:** Create a single `axios` instance with an **interceptor** that:
        *   Automatically attaches the `Authorization: Bearer` token.
        *   Globally handles `401 Unauthorized` errors (redirects to login).

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

1.  **DX:** Create the root `npm start` script with `concurrently`.
2.  **Refactor:** Implement the Axios interceptor to clean up `api.js`.
3.  **Phase 2:** Adopt TanStack Query for cleaner data fetching.
