# H-Budget — Project Status

**Last updated:** 2026-08-28
**Current phase:** Phase 2 complete — starting Phase 3 (Ledger)
**Overall progress:** ~25% done

Update this file manually (or ask me to update it) as work progresses.

---

## Phase Overview

| Phase | Description | Status |
| :--- | :--- | :--- |
| 1 | Project setup, design system, base components, database | Done |
| 2 | Navigation shell, Dashboard UI, Quick-Add UI | Done |
| 3 | Ledger (transaction list, search, filter, swipe) | Not started |
| 4 | Transaction Detail & Edit Modal, Delete dialog | Not started |
| 5 | Statistics screen (By Purpose / Category / Vendor) | Not started |
| 6 | Settings, Manage Purposes/Categories, Export/Backup | Not started |
| 7 | SQLite data layer — wire all screens to real data | Not started |
| 8 | Toast/Snackbar system, error states, polish & testing | Not started |

---

## Detailed Task Checklist

### Foundation & Design System
- [x] Expo + React Native + TypeScript project initialized
- [x] NativeWind / Tailwind configured (`tailwind.config.js`)
- [x] Design System documented — `docs/DESIGN_SYSTEM.md`
  - [x] Color tokens (ink-on-paper palette, brass accent, muted positive/negative)
  - [x] Typography — IBM Plex Mono for all amounts, IBM Plex Sans for text
  - [x] Shape & elevation rules (hairline borders over shadows)
- [x] `theme/tokens.ts` — touch targets, icon sizes, spacing constants
- [x] Base UI components
  - [x] `Button` (positive / negative / brand / outline variants, loading state)
  - [x] `Chip` (selected/unselected, dashed warning variant)
  - [x] `Card` (hairline border, 8dp radius)
  - [x] `Amount` (hero + row size, color-coded, IBM Plex Mono)
  - [x] `EmptyState` (icon + title + subtitle)
  - [x] `Skeleton` (loading placeholder for Dashboard)

---

### Navigation Shell
- [x] Bottom Tab Navigator (Dashboard, Ledger, Stats, Settings)
- [x] Tab icons — Material Icons, active/inactive color states
- [x] `app/_layout.tsx` root layout

---

### Screen 1: Dashboard
- [x] Top App Bar — title + Reconciled/Action-needed badge
- [x] Hero Balance Card — balance, received/spent row, accent rule, opening balance
- [x] Warning Banner — unassigned count, "Classify >" link, navigates to Ledger
- [x] Purpose Cards grid — received, spent, remaining, progress bar
- [x] Recent Activity list — transaction rows (vendor, purpose badge, category, amount, date)
- [x] Empty state for Recent Activity
- [x] Sticky Action Bar — "+ Income" and "- Expense" buttons
- [ ] **Wire to real SQLite data** (currently uses sample data)

---

### Screen 2: Quick-Add Sheet
- [x] Opens as full-screen modal from Dashboard action buttons
- [x] Dimmed background overlay, tapping closes
- [x] Drag handle + Header row + Close button
- [x] Expense / Income toggle (color-coded: red / green fill)
- [x] Amount hero input — IBM Plex Mono 34sp, EUR prefix, decimal keyboard, auto-focus
- [x] Vendor / Source text input with dynamic label
- [x] Purpose chip group (from hardcoded list, Unassigned chip with dashed border)
- [x] Category chip group (from hardcoded list)
- [x] Note optional text input
- [x] Save button — disabled when amount = 0, loading state on save
- [ ] Date selector (currently missing — needs native DatePicker)
- [ ] Vendor autocomplete dropdown (currently plain input)
- [ ] **Wire onSave to SQLite insert** (currently a 400ms fake delay)
- [ ] Load Purposes and Categories from SQLite instead of hardcoded arrays

---

### Screen 3: Ledger
- [ ] Search bar (live filter by vendor / note / amount)
- [ ] Filter button + active filter chip bar
- [ ] Filter Bottom Sheet (Type / Purpose / Category / Date Range)
- [ ] Transaction list grouped by date (sticky section headers with daily total)
- [ ] Transaction list item layout (icon, vendor, purpose badge, category, amount, time)
- [ ] Empty state (no transactions / no search results)
- [ ] Swipe left — delete action reveal
- [ ] Swipe right — edit action reveal
- [ ] Tap row — opens Transaction Detail Modal

---

### Screen 4: Transaction Detail & Edit Modal
- [ ] View Mode — amount, date, all fields in read-only table
- [ ] Edit button — switches to Edit Mode
- [ ] Edit Mode — all fields editable (same inputs as Quick-Add)
- [ ] Edit amount notice banner ("this will adjust your balance by X")
- [ ] Save Changes button (disabled if nothing changed)
- [ ] Cancel button (discards edits)
- [ ] Delete button — opens Delete Confirmation Dialog
- [ ] Delete Confirmation Dialog (two-step: confirm shows balance impact)
- [ ] Undo toast after deletion (3-second window)

---

### Screen 5: Statistics
- [ ] Month selector (< August 2026 >)
- [ ] Summary row (Received / Spent for selected month)
- [ ] Sub-tab switcher: By Purpose / By Category / By Vendor
- [ ] By Purpose view — purpose cards with progress bar
- [ ] By Category view — ranked list with proportional bar
- [ ] By Vendor view — ranked list with transaction count
- [ ] Empty state for months with no data

---

### Screen 6: Settings
- [ ] Section: Account — Opening Balance edit dialog, Currency selector
- [ ] Section: Customization — links to Manage Purposes / Manage Categories
- [ ] Section: Data & Backup — Export CSV, Backup JSON, Restore JSON
- [ ] Section: About — App version (non-tappable)
- [ ] Manage Purposes sub-screen (list, inline edit, add new, delete with protection)
- [ ] Manage Categories sub-screen (same layout as Manage Purposes)
- [ ] Restore confirmation dialog + schema validation

---

### Data Layer (SQLite)
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
- [ ] Toast / Snackbar component (auto-dismiss 3s, UNDO action for deletes)
- [ ] Error validation messages (invalid amount, duplicate name, etc.)
- [ ] `icon_warning` + all icons verified no-emoji (SVG Material Icons only)
- [ ] Keyboard-avoidance tested on Android
- [ ] All touch targets verified >= 48dp on device
- [ ] Quick-Add speed test: entry to save in < 5 seconds

---

## Key Files Reference

| File | Purpose |
| :--- | :--- |
| [docs/DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Color tokens, typography, shape — supersedes spec section 1 |
| [Expense Tracker/05_UI_UX_Specification.md](../Expense%20Tracker/05_UI_UX_Specification.md) | Full screen specs, button matrix, edge cases |
| [Expense Tracker/04_Data_Model.md](../Expense%20Tracker/04_Data_Model.md) | SQLite schema, field types, constraints, backup format |
| [Expense Tracker/02_User_Flows.md](../Expense%20Tracker/02_User_Flows.md) | Step-by-step user journeys |
| [Expense Tracker/07_MVP_Roadmap.md](../Expense%20Tracker/07_MVP_Roadmap.md) | Phase plan with day estimates |
| [Expense Tracker/08_Testing_Plan.md](../Expense%20Tracker/08_Testing_Plan.md) | All test cases to run before shipping |
| [theme/tokens.ts](../theme/tokens.ts) | Touch target, icon size, spacing constants |
| [app/(tabs)/index.tsx](../app/(tabs)/index.tsx) | Dashboard screen |
| [app/quick-add.tsx](../app/quick-add.tsx) | Quick-Add modal screen |
| [components/ui/](../components/ui/) | Reusable base UI components |

---

## Known Issues / Open TODOs

| # | Issue | File | Priority |
| :--- | :--- | :--- | :--- |
| 1 | Date picker missing in Quick-Add | `app/quick-add.tsx` | High |
| 2 | Vendor autocomplete not implemented | `app/quick-add.tsx` | Medium |
| 3 | Quick-Add save is a fake delay, no SQLite insert | `app/quick-add.tsx` | High — blocked on data layer |
| 4 | Dashboard uses hardcoded sample data | `app/(tabs)/index.tsx` | High — blocked on data layer |
| 5 | Ledger, Stats, Settings tab screens are empty stubs | `app/(tabs)/` | Phase 3–6 |
| 6 | No Toast/Snackbar system yet | Global | Phase 8 |
