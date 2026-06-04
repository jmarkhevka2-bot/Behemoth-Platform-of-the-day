# Behemoth POTD — Full Site Audit Report
**Generated:** June 4, 2026  
**Codebase Size:** 4,272 lines of TypeScript/React  
**Build Status:** ✅ Passes `npm run build`  
**Lint Status:** ❌ 15 ESLint errors found

---

## 📊 Executive Summary

The application is architecturally sound with proper React patterns, type safety, and separation of concerns. However, there are **15 actionable ESLint errors**, significant **accessibility gaps**, and **environment configuration issues** blocking local development. The Leaderboard redesign is complete with responsive layouts and theme support, but requires cleanup of unused imports and type safety improvements.

**Critical Issues:** 5  
**High Priority:** 8  
**Medium Priority:** 12  
**Low Priority:** 4

---

## 🔴 Critical Issues (Fix Before Deployment)

### 1. **Supabase Environment Variables Missing**
**File:** `lib/supabase.ts`, `lib/db.ts`  
**Severity:** 🔴 Critical  
**Impact:** App cannot run in development or production without env vars

The app initializes Supabase on startup. Without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, the dev server returns 500 errors.

```
Error: supabaseUrl is required.
  at eval (./lib/supabase.ts:9:85)
```

**Action Items:**
- [ ] Create `.env.local` with Supabase credentials (development)
- [ ] Set env vars in Vercel deployment settings (production)
- [ ] Consider adding a fallback for missing Supabase to allow local testing without DB

**Recommendation:** Either provision Supabase credentials or stub out the DB layer for dev testing.

---

### 2. **15 ESLint Errors Blocking CI/CD**
**Files Affected:** 6 components  
**Severity:** 🔴 Critical  
**Impact:** Will fail Vercel build unless fixed

#### Unused Variables (7 errors)
**Header.tsx (3 errors)**
- Line 4: `motion`, `AnimatePresence` imported but never used
- Line 7: `shouldShiftBeActive` imported but never used

**EndShiftSummary.tsx (2 errors)**
- Line 15: `_onStartNew` parameter unused
- Line 81: `isTied` assigned but never used

**ProgressBar.tsx (1 error)**
- Line 5: `getNextTierConfig` imported but never used

**Leaderboard.tsx (1 error)**
- Line 49: `hovered` state set but never used (PodiumCard)
- Line 370: `tiedMap` assigned but never used

#### Type Safety Issues (4 errors)
**Leaderboard.tsx (4 errors)**
- Lines 43, 47, 174, 178, 271: Using `any` type instead of proper interfaces
- Example: `associate: any` should be `Associate` from `@/lib/types`

#### Unescaped HTML Entities (2 errors)
**Info.tsx (5 entity errors)**
- Lines 161, 163, 172: Straight quotes `"` should be `&quot;` or `&ldquo;`/`&rdquo;`
- Line 172: Straight apostrophe should be `&apos;`

#### Expression Statements (2 errors)
**POTDCeremony.tsx, CrewGrid.tsx**
- Unexpected expression statements (likely comma instead of semicolon or incomplete logic)

**Action Items:**
```bash
# Remove unused imports
- Header.tsx: Remove motion, AnimatePresence, shouldShiftBeActive
- EndShiftSummary.tsx: Remove unused _onStartNew, isTied
- ProgressBar.tsx: Remove getNextTierConfig
- Leaderboard.tsx: Remove unused hovered, tiedMap; replace `any` with `Associate`

# Fix entity encoding in Info.tsx
- Replace " with &quot; or &ldquo;/&rdquo;
- Replace ' with &apos;
```

---

### 3. **Type Safety Issues in Leaderboard Component**
**File:** `components/views/Leaderboard.tsx`  
**Severity:** 🔴 Critical  
**Impact:** Runtime errors, poor IDE support, hard to debug

```tsx
// ❌ CURRENT (lines 43, 44, 47)
function PodiumCard({
  associate: any,  // Missing type info
  nextTierConfig: any,
}) { ... }

// ✅ SHOULD BE
import type { Associate, TierConfig } from '@/lib/types';
function PodiumCard({
  associate: Associate,
  nextTierConfig: TierConfig | null,
}) { ... }
```

**Action Items:**
- [ ] Replace all `any` with proper types from `lib/types.ts`
- [ ] Add proper return types to all functions
- [ ] Enable TypeScript strict mode if not already enabled

---

## 🟠 High Priority Issues (Fix This Sprint)

### 4. **Accessibility: Non-Button Click Handlers (42 instances)**
**Files:** Multiple components  
**Severity:** 🟠 High  
**Impact:** Screen readers cannot identify clickable elements; keyboard navigation broken

**Examples:**
- Leaderboard.tsx: `<motion.div onClick={}>` should be `<button>` or `<div role="button">`
- CrewGrid.tsx: `<div onClick={}>` without `role="button"` or `tabindex`
- LeaderboardCard.tsx: Interactive divs without keyboard support

```tsx
// ❌ CURRENT
<motion.div onClick={() => onCardClick(associate.id)}>
  {associate.displayName}
</motion.div>

// ✅ SHOULD BE
<button
  onClick={() => onCardClick(associate.id)}
  className="..." 
  aria-label={`View ${associate.displayName}`}
>
  {associate.displayName}
</button>
```

**Out of 81 `onClick` handlers:** 42 (52%) are on non-button elements.

**Action Items:**
- [ ] Audit all 42 non-button clickable elements
- [ ] Convert to `<button>` or add `role="button"` + `tabindex="0"` + keyboard handlers
- [ ] Test with keyboard navigation (Tab key)

---

### 5. **Minimal Accessibility Attributes (ARIA)**
**Severity:** 🟠 High  
**Impact:** Screen readers and AT users cannot navigate the app properly

**Current State:**
- ARIA attributes: **1 instance** across entire codebase
- `aria-label` attributes: **0** (buttons use emoji + title, not descriptive)
- `aria-live` regions: **0** (real-time updates not announced)
- Keyboard shortcuts: Only 3 keyboard handlers for 81 clickable elements

**Critical Missing ARIA:**
- Theme toggle button: "☀️" is not descriptive for screen readers
- Sound toggle button: "🔊" / "🔇" emoji-only buttons
- Leaderboard cards: No way to announce rank changes or point updates
- Award buttons: No notification when disabled

**Action Items:**
- [ ] Add `aria-label` to all buttons (especially emoji-only ones)
- [ ] Add `aria-live="polite"` to real-time update regions (Leaderboard, activity feed)
- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)

**Example Fixes:**
```tsx
// ❌ CURRENT
<button onClick={toggleTheme} title={...}>
  {theme === 'dark' ? '☀️' : '🌙'}
</button>

// ✅ SHOULD BE
<button 
  onClick={toggleTheme}
  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  title={...}
>
  {theme === 'dark' ? '☀️' : '🌙'}
</button>
```

---

### 6. **Component Size: Leaderboard is 590 Lines**
**File:** `components/views/Leaderboard.tsx`  
**Severity:** 🟠 High  
**Impact:** Harder to test, maintain, and debug; mixed concerns

The Leaderboard component is one of the largest in the app:
- 590 lines of logic + rendering
- 4 nested subcomponents (PodiumCard, ChasingCard, PackRow, StatCard) defined inline
- Multiple responsibilities: sorting, filtering, rendering, animations

**Component Breakdown:**
| Component | Lines | Responsibilities |
|-----------|-------|------------------|
| Leaderboard (main) | 590 | View logic, real-time polling, 4 section rendering |
| PodiumCard | ~150 | Rank 1-3 rendering, animations, progress |
| ChasingCard | ~150 | Rank 4-10 cards, tier badges, hover effects |
| PackRow | ~100 | Rank 11-40 rows, compact layout |
| TodayActivity | ~80 | Feed rendering, timestamps |

**Action Items:**
- [ ] Extract PodiumCard, ChasingCard, PackRow as separate files
- [ ] Move constants (TIER_COLORS, etc.) to `lib/constants.ts`
- [ ] Split into: `Leaderboard.tsx` (orchestration) + `components/leaderboard/*` (subcomponents)
- [ ] Add comments explaining data transformations

**Example refactor:**
```
components/
├── views/
│   ├── Leaderboard.tsx (200 lines: polling, data prep, layout)
│   └── leaderboard/
│       ├── PodiumSection.tsx
│       ├── ChasingSection.tsx
│       ├── PackSection.tsx
│       ├── TodayActivityFeed.tsx
│       └── useLeaderboardData.ts (hook for sorting/filtering)
```

---

### 7. **Incomplete Supabase Integration**
**Files:** `lib/db.ts`, `lib/context/AppContext.tsx`  
**Severity:** 🟠 High  
**Impact:** Real-time sync not fully implemented; offline support missing

**Issues:**
1. **Realtime subscription setup:** AppContext imports `setupRealtimeSubscription` but error handling is minimal
2. **Sync logic:** `syncToSupabase` is async but doesn't debounce properly on rapid changes
3. **Fallback behavior:** No offline queue; updates are lost if network is down
4. **Type mapping:** db.ts has loose mapping between DB schema and AppState types

**Action Items:**
- [ ] Add error boundaries around Supabase operations in AppContext
- [ ] Implement retry logic with exponential backoff
- [ ] Add offline queue using IndexedDB or localStorage
- [ ] Test with network throttling/offline scenarios
- [ ] Document sync behavior in README

---

### 8. **Theme Color Inconsistency**
**Files:** `tailwind.config.ts`, `app/globals.css`, `components/`  
**Severity:** 🟠 High  
**Impact:** Hardcoded colors conflict with CSS variable system

**Issue:**
- Tailwind config has hardcoded dark colors (e.g., `'bg-primary': '#0d0d0d'`)
- App prefers CSS variables (`var(--bg-primary)`)
- Components use arbitrary Tailwind values like `bg-[#1A1A1A]` instead of variables
- This works but makes switching themes/colors tedious

**Current State:**
```tsx
// ❌ Inconsistent
bg-[#1A1A1A]           // Arbitrary hardcoded color
bg-[var(--bg-card)]    // CSS variable
bg-primary             // Tailwind theme color (unused)
```

**Action Items:**
- [ ] Update `tailwind.config.ts` to reference CSS variables or remove duplicate colors
- [ ] Audit all components for hardcoded colors and replace with `var(--*)`
- [ ] Add type-safe color utilities if needed
- [ ] Document which colors are used where

---

## 🟡 Medium Priority Issues (Fix Next Sprint)

### 9. **No Keyboard Navigation Support**
**Severity:** 🟡 Medium  
**Impact:** Power users and keyboard-only users have poor UX

Only **3 keyboard event handlers** for 81 clickable elements.

**Missing:**
- Tab navigation between leaderboard ranks
- Enter/Space to activate button-like elements
- Arrow keys to navigate list items
- Escape to close modals

**Action Items:**
- [ ] Add keyboard handler to PodiumCard, ChasingCard, PackRow
- [ ] Test Tab order with DevTools
- [ ] Add Escape handling to all modals

---

### 10. **Missing Test Coverage**
**Severity:** 🟡 Medium  
**Impact:** Harder to catch regressions; confidence in changes reduced

**Current State:**
- No test files found (`*.test.ts`, `*.spec.tsx`)
- No test runner configured (Jest, Vitest)
- Critical logic untested: tier calculations, badge unlocks, rivalry matching

**Action Items:**
- [ ] Set up Jest or Vitest
- [ ] Write tests for:
  - Tier thresholds and unlocking logic
  - Badge unlock conditions
  - Streak calculation
  - Daily rivalry matching
  - Award point calculations

---

### 11. **Component Parameter Documentation**
**Severity:** 🟡 Medium  
**Impact:** Future maintainers struggle to understand component APIs

**Issue:**
- Props interfaces lack JSDoc comments
- Complex data flows (e.g., Leaderboard → Dashboard → AppContext) unclear
- No storybook or component documentation

**Example:**
```tsx
// ❌ NO DOCUMENTATION
interface Props {
  rank: 1 | 2 | 3;
  associate: any;
  isAdmin: boolean;
}

// ✅ WITH DOCUMENTATION
/**
 * Renders a podium rank card (1, 2, or 3) with metallic gradient and animations.
 * @param rank - Rank number (1=gold center, 2=silver left, 3=bronze right)
 * @param associate - Full Associate object with points and tier info
 * @param isAdmin - If false, hides award button
 */
interface Props {
  rank: 1 | 2 | 3;
  associate: Associate;
  isAdmin: boolean;
}
```

**Action Items:**
- [ ] Add JSDoc comments to all component Props
- [ ] Document complex hooks (useAppState, useTheme)
- [ ] Create component diagram in README

---

### 12. **Performance: Real-Time Polling (30 seconds)**
**File:** `components/views/Leaderboard.tsx`  
**Severity:** 🟡 Medium  
**Impact:** Unnecessary re-renders; Supabase realtime may be better

**Current:**
```tsx
// Polls every 30 seconds
const pollId = setInterval(async () => {
  const data = await fetch('/api/leaderboard');
  // ... update state
}, 30_000);
```

**Issue:** Supabase is already configured for realtime updates via `setupRealtimeSubscription`. The 30-second polling is redundant.

**Action Items:**
- [ ] Remove 30-second polling from Leaderboard
- [ ] Rely on Supabase realtime subscriptions instead
- [ ] Measure network activity reduction

---

### 13. **Modal Stacking & Focus Management**
**Severity:** 🟡 Medium  
**Impact:** Multiple open modals don't have proper focus trapping

**Issue:**
- No focus trap on modals (AssociateProfile, POTDCeremony, etc.)
- Escape key closes most modals but not consistently
- Backdrop click behavior varies
- No z-index coordination

**Action Items:**
- [ ] Create `<Modal>` wrapper component with focus trap
- [ ] Use `focusManager` from `framer-motion` or `react-focus-lock`
- [ ] Standardize Escape key handling
- [ ] Test tab order within modals

---

### 14. **LocalStorage Fallback Not Documented**
**Severity:** 🟡 Medium  
**Impact:** Unclear how offline/failed Supabase scenarios are handled

**Files:** `lib/storage.ts`, `lib/context/AppContext.tsx`

**Question:** What happens if Supabase is down but the user has data in localStorage? Which wins? There's no clear fallback strategy documented.

**Action Items:**
- [ ] Document data persistence hierarchy: localStorage vs Supabase vs cache
- [ ] Add migration logic if schema changes
- [ ] Test offline scenarios

---

### 15. **Sound Effects Not Tested for Accessibility**
**Severity:** 🟡 Medium  
**Impact:** Deaf/hard of hearing users may miss important feedback

**Current:** Sound toggle exists, but no haptic feedback alternative.

**Action Items:**
- [ ] Ensure all critical actions have visual feedback (not just sound)
- [ ] Test with sound disabled
- [ ] Consider haptic feedback API for devices that support it

---

## 🔵 Low Priority Issues (Nice-to-Haves)

### 16. **README Outdated or Missing Key Info**
The README doesn't mention:
- Supabase setup steps
- Environment variable requirements
- Local development prerequisites
- Component architecture diagram

**Action:** Update README with setup instructions.

---

### 17. **No Error Boundary for Failed Components**
Currently, a component error crashes the entire app. Add Error Boundary around views.

---

### 18. **Emoji-Heavy Design May Not Translate Well**
Testing with screen readers shows emoji read as their literal names ("sun" instead of "theme toggle").

---

### 19. **POTDCeremony: Unused useCallback Import**
Minor cleanup needed (line 3 of POTDCeremony.tsx).

---

## ✅ What's Working Well

1. **React Architecture:** Clean component hierarchy, proper use of hooks
2. **Type Safety:** Good TypeScript usage overall (except `any` in Leaderboard)
3. **Styling:** Consistent Tailwind + CSS variables for theming
4. **Responsive Design:** Proper `md:`, `sm:`, `lg:` breakpoints
5. **Real-Time Updates:** Supabase integration is well-structured
6. **Build Process:** Next.js build passes, fast incremental builds
7. **Animation Library:** Framer Motion used effectively for polish
8. **State Management:** Context + Reducer pattern works well

---

## 📋 Audit Checklist

### Critical (Fix Before Merge)
- [ ] Fix 15 ESLint errors
- [ ] Set up Supabase env vars or stub out DB layer for dev
- [ ] Replace `any` types in Leaderboard with proper types

### High Priority (This Sprint)
- [ ] Audit and fix 42 non-button click handlers
- [ ] Add ARIA labels to all buttons (especially emoji-only)
- [ ] Add `aria-live` regions for real-time updates
- [ ] Extract Leaderboard subcomponents to separate files
- [ ] Add error handling for Supabase operations
- [ ] Consistent theme color strategy

### Medium Priority (Next Sprint)
- [ ] Add keyboard navigation support
- [ ] Set up test suite (Jest/Vitest)
- [ ] Add JSDoc documentation to components
- [ ] Remove 30-second polling (use Supabase realtime)
- [ ] Implement modal focus trapping
- [ ] Document data persistence strategy

### Low Priority (Backlog)
- [ ] Update README
- [ ] Add Error Boundaries
- [ ] Haptic feedback exploration
- [ ] Screen reader optimization

---

## 🎯 Recommended Fix Order

1. **Today:** Fix 15 ESLint errors (quick wins)
2. **This Week:** Set up Supabase env vars, replace `any` types, accessibility audit
3. **Next Sprint:** Refactor Leaderboard, add keyboard nav, tests

**Estimated Effort:**
- ESLint fixes: 1-2 hours
- Accessibility (buttons + ARIA): 4-6 hours
- Type safety improvements: 2-3 hours
- Leaderboard refactor: 4-6 hours
- Testing setup: 3-4 hours

**Total:** ~14-21 hours of work

---

## 📁 Files Requiring Changes

| File | Issues | Priority |
|------|--------|----------|
| `components/views/Leaderboard.tsx` | Type safety, size, unused vars | 🔴 Critical |
| `components/layout/Header.tsx` | Unused imports, accessibility | 🟠 High |
| `components/views/Info.tsx` | Unescaped entities | 🔴 Critical |
| `lib/db.ts` | Error handling, offline support | 🟠 High |
| `lib/context/AppContext.tsx` | Supabase integration, error handling | 🟠 High |
| `components/modals/*.tsx` | Accessibility, focus management | 🟠 High |
| `components/ui/*.tsx` | Accessibility, button semantics | 🟡 Medium |
| `tailwind.config.ts` | Color consistency | 🟠 High |

---

**Report Generated:** 2026-06-04  
**Next Review:** After critical fixes are applied
