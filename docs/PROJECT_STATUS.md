# H-Budget — Project Status

**Last updated:** 2026-08-29
**Current phase:** All 6 screens have real UI, global Toast/Snackbar system built — Phase 7 (backend/data layer) is the natural next step
**Overall progress:** ~80% done

Update this file manually (or ask me to update it) as work progresses.

---

## Phase Overview

| Phase | Description | Status |
| :--- | :--- | :--- |
| 1 | Project setup, design system, base components, database | Done |
| 2 | Navigation shell, Dashboard UI, Quick-Add UI | Done |
| 3 | Ledger (transaction list, search, filter, swipe) | Core done — see open items below |
| 4 | Transaction Detail & Edit Modal, Delete dialog | Done (UI) |
| 5 | Statistics screen (By Purpose / Category / Vendor) | Done (UI) |
| 6 | Settings, Manage Purposes/Categories, Export/Backup | Done (UI) |
| 7 | SQLite data layer — wire all screens to real data | **Not started — can begin now, see below** |
| 8 | Toast/Snackbar system, error states, polish & testing | Toast/Snackbar built; error states & device polish pass still open |

---

## All 6 screens now have real UI — start the backend

Every screen in the spec has a built, styled, stateful UI now (Dashboard,
Quick-Add, Ledger, Transaction Detail/Edit, Statistics, Settings + its two
sub-screens). None of it is wired to persistent data yet — everything reads
from `data/sampleData.ts` or holds local component state that resets on
reload. This is the natural point to start Phase 7:

- Schema + migrations from `04_Data_Model.md`
- Seed Purposes/Categories on first run
- Transaction CRUD + the computed queries listed below
- Then one wiring pass: swap each screen's `data/sampleData.ts` import /
  fake-delay handler for a real query or mutation

Nothing left in the UI blocks this — go ahead whenever you're ready.

---

## Detailed Task Checklist

### Foundation & Design System
- [x] Expo + React Native + TypeScript project initialized
- [x] NativeWind / Tailwind configured (`tailwind.config.js`)
- [x] Design System documented — `docs/DESIGN_SYSTEM.md`
- [x] `theme/tokens.ts` — touch targets, icon sizes, spacing constants
- [x] `types/models.ts` — shared `Transaction` / `Purpose` shapes (match `04_Data_Model.md`)
- [x] Base UI components: `Button` (added `muted` variant for neutral Cancel actions, distinct from `ghost`'s negative-text Delete styling), `Chip`, `Card`, `Amount`, `EmptyState`, `Skeleton`
- [x] `GestureHandlerRootView` wired at root (needed for Ledger swipe actions)
- [x] `data/sampleData.ts` — single shared sample dataset; every screen imports from it (previously duplicated per-screen)

---

### Navigation Shell
- [x] Bottom Tab Navigator (Dashboard, Ledger, Stats, Settings) — all 4 routes resolve
- [x] Tab icons — Material Icons, active/inactive color states
- [x] `app/_layout.tsx` root layout, modal routes registered (`quick-add`, `filter`, `transaction/[id]`)
- [x] `app/settings/` — plain pushed stack screens (not modals) for Manage Purposes / Categories, matching spec's "top app bar + back" pattern

---

### Screen 1: Dashboard — Done (UI)
- [x] All sections built (hero balance, warning banner, purpose cards, recent activity, sticky action bar, loading/empty states)
- [ ] **Wire to real SQLite data** (currently uses sample data)

---

### Screen 2: Quick-Add Sheet — Done (UI)
- [x] All fields, toggle, chips, save button states
- [ ] Date selector (still missing — needs native DatePicker)
- [ ] Vendor autocomplete dropdown (currently plain input)
- [ ] **Wire onSave to SQLite insert** (currently a 400ms fake delay)
- [ ] Load Purposes/Categories from SQLite instead of hardcoded arrays

---

### Screen 3: Ledger — Core done
- [x] Search bar (live filter by vendor / category / amount)
- [x] Filter button with active-filter dot badge
- [x] Active filter chip bar + "Clear All" (currently only reflects the
      "unassigned" deep-link from the Dashboard warning banner)
- [x] Filter Bottom Sheet (`app/filter.tsx`) — Type / Purpose / Category multi-select, Reset/Apply
- [x] Transaction list grouped by date, sticky section headers with daily total (`SectionList`)
- [x] Transaction row layout (icon, vendor, purpose badge, category, amount, time)
- [x] Empty states (no transactions / no search or filter results)
- [x] Swipe left — edit reveal; swipe right — delete reveal (`components/SwipeableTransactionRow.tsx`)
- [x] Tap row → navigates to `/transaction/[id]`
- [x] Swipe-left (edit) and swipe-right (delete) route into the Detail screen, opening directly into Edit Mode or the Delete dialog
- [ ] Filter Sheet selections don't persist back to the Ledger screen yet (no shared filter state)
- [ ] Date Range filter (needs `@react-native-community/datetimepicker`, not yet a dependency)
- [ ] **Wire to real SQLite data** (currently uses sample data)

---

### Screen 4: Transaction Detail & Edit Modal — Done (UI)
- [x] `/transaction/[id].tsx` — View Mode: hero amount, type/vendor/purpose/category/note/created rows, Edit + Delete buttons
- [x] Edit Mode — all fields editable, edit-amount notice banner when amount changes, Save (disabled until something actually changed) / Cancel
- [x] Delete Confirmation Dialog — centered modal, states the amount and purpose pool it restores, Cancel / Delete (with loading state)
- [x] Deep-linkable: `?edit=1` opens straight into Edit Mode, `?confirmDelete=1` opens straight to the delete dialog (used by Ledger's swipe actions)
- [ ] Undo toast after deletion (needs the global Toast/Snackbar system — Phase 8)
- [ ] **Wire Save/Delete to real SQLite** (currently local state only, mutates nothing persistent)

---

### Screen 5: Statistics — Done (UI)
- [x] Month selector ("< August 2026 >") — both arrows disabled since sample data spans one month; will un-disable naturally once real multi-month data exists
- [x] Summary row (Received / Spent cards for the selected month)
- [x] Sub-tab switcher: By Purpose / By Category / By Vendor, accent underline on active tab
- [x] By Purpose view — purpose cards, net balance, received/spent, progress bar, "% spent" caption, sorted highest-spending first
- [x] By Category view — ranked list (rank, name, amount, % of total, proportional bar)
- [x] By Vendor view — same layout, plus transaction count per vendor
- [x] Empty state for months with no data
- [ ] **Wire month navigation and all three views to real SQLite queries** (currently computed from `data/sampleData.ts`)

---

### Screen 6: Settings — Done (UI)
- [x] Account section — Opening Balance (tap → edit dialog), Currency (tap → selection sheet, EUR/USD/GBP/TRY/CHF)
- [x] Customization section — Manage Purposes / Manage Categories rows push to sub-screens
- [x] Data & Backup section — Export CSV, Backup JSON, Restore JSON (with destructive confirmation dialog)
- [x] About section — App Version, non-tappable
- [x] `app/settings/purposes.tsx` + `app/settings/categories.tsx` — shared `ManageTaxonomyScreen` component: edit inline, delete (disabled if last remaining or currently in use by a transaction), add with duplicate-name validation
- [ ] Opening Balance / Currency are local state, not shared with Dashboard's hardcoded value yet (needs real app state — zustand is already a dependency, just not wired)
- [ ] Export/Backup/Restore show a page-local demo confirmation strip, not a real file write — the *global*, reusable Toast/Snackbar (Phase 8) isn't built yet, this was a local stand-in, not a substitute for it
- [ ] **Wire everything to real SQLite + expo-file-system/expo-sharing** (currently no persistence anywhere in Settings)

---

### Data Layer (SQLite) — Not started, can begin now
- [ ] Database initialization & migrations (`transactions`, `purposes`, `categories`, `settings`, `audit_log`)
- [ ] Seed default Purposes (High School, University, General) on first run
- [ ] Seed default Categories (Travel, Food, Equipment, Software, Other) on first run
- [ ] Opening balance set to 0 until user configures in Settings
- [ ] `transactions` CRUD — insert, read (with filters), update, delete
- [ ] Computed queries — Total Balance, Purpose balances, Unassigned count
- [ ] Vendor autocomplete query (distinct vendor names matching prefix)
- [ ] Statistics queries — SUM grouped by Purpose / Category / Vendor per month
- [ ] CSV export serialization
- [ ] JSON backup — full serialize all tables
- [ ] JSON restore — validate schema, clear, re-insert

---

### Global Systems
- [x] Toast / Snackbar component (`components/ToastProvider.tsx`) — mounted once at root, `useToast().show(message, { actionLabel, onAction, tone, durationMs })`, auto-dismiss 3s default, negative tone for destructive actions
- [x] Settings' Export/Backup/Restore confirmations now go through the real global toast (previously a page-local strip)
- [x] Transaction Detail's delete now shows an Undo toast (`Deleted <vendor> — EUR <amount>`) — Undo is wired to the toast dismissing itself; it has nothing to actually reverse yet since delete doesn't touch real data (re-insert-on-undo becomes meaningful once Phase 7 exists)
- [x] `SafeAreaProvider` now wraps the app root (was previously relying on implicit fallback insets — needed explicitly once the Toast reads `useSafeAreaInsets()`)
- [ ] Error validation messages (invalid amount, duplicate name, etc.) — duplicate-name validation exists in Manage Purposes/Categories; broader validation messaging elsewhere not yet audited
- [x] No-emoji icons verified (Material Icons only, all screens)
- [ ] Keyboard-avoidance tested on Android device
- [ ] All touch targets verified >= 48dp on device
- [ ] Quick-Add speed test: entry to save in < 5 seconds

---

## Key Files Reference

| File | Purpose |
| :--- | :--- |
| [docs/DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Color tokens, typography, shape — supersedes spec section 1 |
| [Expense Tracker/05_UI_UX_Specification.md](../Expense%20Tracker/05_UI_UX_Specification.md) | Full screen specs, button matrix, edge cases |
| [Expense Tracker/04_Data_Model.md](../Expense%20Tracker/04_Data_Model.md) | SQLite schema, field types, constraints, backup format |
| [types/models.ts](../types/models.ts) | Shared `Transaction` / `Purpose` TS types |
| [theme/tokens.ts](../theme/tokens.ts) | Touch target, icon size, spacing constants |
| [app/(tabs)/index.tsx](../app/(tabs)/index.tsx) | Dashboard screen |
| [app/(tabs)/ledger.tsx](../app/(tabs)/ledger.tsx) | Ledger screen |
| [app/(tabs)/stats.tsx](../app/(tabs)/stats.tsx) | Stats screen — By Purpose / Category / Vendor |
| [app/(tabs)/settings.tsx](../app/(tabs)/settings.tsx) | Settings screen — Account / Customization / Data & Backup / About |
| [app/settings/purposes.tsx](../app/settings/purposes.tsx) | Manage Purposes sub-screen |
| [app/settings/categories.tsx](../app/settings/categories.tsx) | Manage Categories sub-screen |
| [app/quick-add.tsx](../app/quick-add.tsx) | Quick-Add modal screen |
| [app/filter.tsx](../app/filter.tsx) | Ledger filter modal screen |
| [app/transaction/\[id\].tsx](../app/transaction/%5Bid%5D.tsx) | Transaction Detail / Edit / Delete screen |
| [data/sampleData.ts](../data/sampleData.ts) | Shared sample transactions/purposes used by all screens |
| [components/SwipeableTransactionRow.tsx](../components/SwipeableTransactionRow.tsx) | Swipeable ledger row |
| [components/ManageTaxonomyScreen.tsx](../components/ManageTaxonomyScreen.tsx) | Shared edit/delete/add list, used by both Manage Purposes/Categories |
| [components/ToastProvider.tsx](../components/ToastProvider.tsx) | Global Toast/Snackbar — `useToast()` hook, mounted once in `app/_layout.tsx` |
| [components/ui/](../components/ui/) | Reusable base UI components |

---

## Known Issues / Open TODOs

| # | Issue | File | Priority |
| :--- | :--- | :--- | :--- |
| 1 | Date picker missing in Quick-Add | `app/quick-add.tsx` | High |
| 2 | Vendor autocomplete not implemented | `app/quick-add.tsx` | Medium |
| 3 | Quick-Add save is a fake delay, no SQLite insert | `app/quick-add.tsx` | High — blocked on data layer |
| 4 | Dashboard uses hardcoded sample data | `app/(tabs)/index.tsx` | High — blocked on data layer |
| 5 | Ledger uses hardcoded sample data | `app/(tabs)/ledger.tsx` | High — blocked on data layer |
| 6 | Filter Sheet selections don't flow back to Ledger | `app/filter.tsx`, `app/(tabs)/ledger.tsx` | Medium |
| 7 | Transaction Detail Save/Delete don't touch real data | `app/transaction/[id].tsx` | High — blocked on data layer |
| 8 | Date Range filter omitted (needs a date-picker dependency) | `app/filter.tsx` | Low |
| 9 | Stats view uses hardcoded sample data | `app/(tabs)/stats.tsx` | High — blocked on data layer |
| 10 | Settings has no persistence anywhere (balance, currency, purposes, categories, export/backup/restore) | `app/(tabs)/settings.tsx`, `app/settings/` | High — blocked on data layer |
| 11 | Undo (Transaction Detail delete toast) doesn't reverse anything yet — needs real delete to undo | `app/transaction/[id].tsx` | High — blocked on data layer |
| 12 | Device-level polish pass not done (keyboard avoidance, touch target audit, Quick-Add speed test) | Global | Medium — needs a physical/emulator test pass |
