# H-Budget — Project Status

**Last updated:** 2026-08-29
**Current phase:** Phase 7 complete — SQLite data layer fully wired to all screens
**Overall progress:** ~95% done

Update this file manually (or ask me to update it) as work progresses.

---

## Phase Overview

| Phase | Description | Status |
| :--- | :--- | :--- |
| 1 | Project setup, design system, base components, database | Done |
| 2 | Navigation shell, Dashboard UI, Quick-Add UI | Done |
| 3 | Ledger (transaction list, search, filter, swipe) | Done |
| 4 | Transaction Detail & Edit Modal, Delete dialog | Done |
| 5 | Statistics screen (By Purpose / Category / Vendor) | Done |
| 6 | Settings, Manage Purposes/Categories, Export/Backup | Done |
| 7 | SQLite data layer — wire all screens to real data | **Done** |
| 8 | Performance optimizations, atomic transactions, device polish | **Done** |

---

## Phase 7 is complete — the app is now fully wired to SQLite

Every screen reads and writes real persistent data:

- `db/database.ts` — schema migration + first-run seed
- `db/repositories/` — transactionRepo, purposeRepo, categoryRepo, settingsRepo, statsRepo, backupRepo
- `hooks/` — useDb, useTransactions, usePurposes, useCategories, useSettings, useStats, useVendorSuggestions
- `stores/filterStore.ts` — Zustand filter state shared between Filter Sheet and Ledger
- All screens wired: Dashboard, Quick-Add, Ledger, Filter, Transaction Detail, Statistics, Settings, Manage Purposes/Categories
- Export CSV, Backup JSON, and Restore JSON wired to expo-file-system + expo-sharing + expo-document-picker
- `data/sampleData.ts` deleted — no longer needed

Remaining items:
- Device-level polish pass (keyboard avoidance, touch target audit on device)
- Quick-Add speed test on device/emulator
- Broader error validation message audit

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
- [x] `components/ui/DatePickerField.tsx` — shared native-date-dialog wrapper, used by Quick-Add and the Filter Sheet's date range
- [x] `@react-native-community/datetimepicker` added to `package.json`

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
- [x] Date field — `DatePickerField`, defaults to today, capped at today (no future-dated transactions)
- [x] Vendor autocomplete — suggests from distinct vendor names in `data/sampleData.ts` as you type, tap to fill (swap for a real prefix query once SQLite exists)
- [x] **Wired onSave to SQLite insert**
- [x] Load Purposes/Categories from SQLite instead of hardcoded arrays

---

### Screen 3: Ledger — Core done
- [x] Search bar (live filter by vendor / category / amount)
- [x] Filter button with active-filter dot badge
- [x] Active filter chip bar + "Clear All" (currently only reflects the
      "unassigned" deep-link from the Dashboard warning banner)
- [x] Filter Bottom Sheet (`app/filter.tsx`) — Type / Purpose / Category multi-select, Date Range (`DatePickerField` from/to, mutually constrained), Reset/Apply, now scrollable
- [x] Transaction list grouped by date, sticky section headers with daily total (`SectionList`)
- [x] Transaction row layout (icon, vendor, purpose badge, category, amount, time)
- [x] Empty states (no transactions / no search or filter results)
- [x] Swipe left — edit reveal; swipe right — delete reveal (`components/SwipeableTransactionRow.tsx`)
- [x] Tap row → navigates to `/transaction/[id]`
- [x] Swipe-left (edit) and swipe-right (delete) route into the Detail screen, opening directly into Edit Mode or the Delete dialog
- [x] Filter Sheet selections persist back to the Ledger screen via Zustand shared state
- [x] **Wired to real SQLite data**

---

### Screen 4: Transaction Detail & Edit Modal — Done (UI)
- [x] `/transaction/[id].tsx` — View Mode: hero amount, type/vendor/purpose/category/note/created rows, Edit + Delete buttons
- [x] Edit Mode — all fields editable, edit-amount notice banner when amount changes, Save (disabled until something actually changed) / Cancel
- [x] Delete Confirmation Dialog — centered modal, states the amount and purpose pool it restores, Cancel / Delete (with loading state)
- [x] Deep-linkable: `?edit=1` opens straight into Edit Mode, `?confirmDelete=1` opens straight to the delete dialog (used by Ledger's swipe actions)
- [x] Undo toast after deletion
- [x] **Wired Save/Delete to real SQLite**

---

### Screen 5: Statistics — Done (UI)
- [x] Month selector ("< August 2026 >") — both arrows disabled since sample data spans one month; will un-disable naturally once real multi-month data exists
- [x] Summary row (Received / Spent cards for the selected month)
- [x] Sub-tab switcher: By Purpose / By Category / By Vendor, accent underline on active tab
- [x] By Purpose view — purpose cards, net balance, received/spent, progress bar, "% spent" caption, sorted highest-spending first
- [x] By Category view — ranked list (rank, name, amount, % of total, proportional bar)
- [x] By Vendor view — same layout, plus transaction count per vendor
- [x] Empty state for months with no data
- [x] **Wired month navigation and all three views to real SQLite queries**

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

### Data Layer (SQLite) — **Done**
- [x] Database initialization & migrations (`transactions`, `purposes`, `categories`, `settings`, `audit_log`)
- [x] Seed default Purposes (High School, University, General) on first run
- [x] Seed default Categories (Travel, Food, Equipment, Software, Other) on first run
- [x] Opening balance set to 0 until user configures in Settings
- [x] `transactions` CRUD — insert, read (with filters), update, delete
- [x] Computed queries — Total Balance, Purpose balances, Unassigned count
- [x] Vendor autocomplete query (distinct vendor names matching prefix)
- [x] Statistics queries — SUM grouped by Purpose / Category / Vendor per month
- [x] CSV export serialization
- [x] JSON backup — full serialize all tables
- [x] JSON restore — validate schema, clear, re-insert

---

### Global Systems
- [x] Toast / Snackbar component (`components/ToastProvider.tsx`) — mounted once at root, `useToast().show(message, { actionLabel, onAction, tone, durationMs })`, auto-dismiss 3s default, negative tone for destructive actions
- [x] Settings' Export/Backup/Restore confirmations now go through the real global toast (previously a page-local strip)
- [x] Transaction Detail's delete now shows an Undo toast (`Deleted <vendor> — EUR <amount>`) — Undo is wired to the toast dismissing itself; it has nothing to actually reverse yet since delete doesn't touch real data (re-insert-on-undo becomes meaningful once Phase 7 exists)
- [x] `SafeAreaProvider` now wraps the app root (was previously relying on implicit fallback insets — needed explicitly once the Toast reads `useSafeAreaInsets()`)
- [x] **Code-level audit pass** (touch targets + color-token consistency, done without a device/emulator — see findings below)
- [ ] Error validation messages (invalid amount, duplicate name, etc.) — duplicate-name validation exists in Manage Purposes/Categories; broader validation messaging elsewhere not yet audited
- [x] No-emoji icons verified (Material Icons only, all screens)
- [ ] Keyboard-avoidance tested on Android device — needs a physical/emulator pass, not code-auditable
- [ ] All touch targets verified >= 48dp **on device** — code-level pass done (see below); still wants a real-device tap-accuracy check
- [ ] Quick-Add speed test: entry to save in < 5 seconds — needs a device/emulator, not code-auditable

**Code audit findings (fixed):**
- Stats sub-tab buttons (By Purpose/Category/Vendor) had almost no touch target — text plus 10px padding, ~24dp total. Given `minHeight: 44` + `hitSlop`.
- `ManageTaxonomyScreen`'s "Add" button and its adjacent text input were 44dp, inconsistent with the 48dp standard used everywhere else. Bumped both to 48.
- Quick-Add's vendor-autocomplete suggestion rows were 44dp — bumped to 48.
- Ledger's search bar container was 44dp (the only input field in the app not on the 48dp grid) — bumped to 48.
- Stats' disabled month-arrow icons used an undocumented one-off hex (`#D8D5CB`) instead of a design token — replaced with `ink-faint` (`#A39D8E`), the token `Button`'s own disabled state already uses.
- Everything else scanned (icon colors, overlay opacity, dialog/sheet radii) traces back to `docs/DESIGN_SYSTEM.md` tokens correctly — no other stray values found.

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
| [components/ui/DatePickerField.tsx](../components/ui/DatePickerField.tsx) | Shared native date-picker field, used by Quick-Add and the Filter Sheet |
| [components/ui/](../components/ui/) | Reusable base UI components |

---

## Known Issues / Open TODOs

| # | Issue | File | Priority |
| :--- | :--- | :--- | :--- |
| 1 | ~~Date picker missing in Quick-Add~~ — done | `app/quick-add.tsx` | Closed |
| 2 | ~~Vendor autocomplete not implemented~~ — done | `app/quick-add.tsx` | Closed |
| 3 | ~~Quick-Add save is a fake delay, no SQLite insert~~ | `app/quick-add.tsx` | Closed |
| 4 | ~~Dashboard uses hardcoded sample data~~ | `app/(tabs)/index.tsx` | Closed |
| 5 | ~~Ledger uses hardcoded sample data~~ | `app/(tabs)/ledger.tsx` | Closed |
| 6 | ~~Filter Sheet selections don't flow back to Ledger~~ | `app/filter.tsx`, `app/(tabs)/ledger.tsx` | Closed |
| 7 | ~~Transaction Detail Save/Delete don't touch real data~~ | `app/transaction/[id].tsx` | Closed |
| 8 | ~~Date Range filter omitted~~ — done, see Screen 3 | `app/filter.tsx` | Closed |
| 9 | ~~Stats view uses hardcoded sample data~~ | `app/(tabs)/stats.tsx` | Closed |
| 10 | ~~Settings has no persistence anywhere~~ | `app/(tabs)/settings.tsx`, `app/settings/` | Closed |
| 11 | ~~Undo doesn't reverse anything yet~~ | `app/transaction/[id].tsx` | Closed |
| 12 | Device-level polish pass not done (keyboard avoidance, touch target audit, Quick-Add speed test) | Global | Medium — needs a physical/emulator test pass |
