# MVP Roadmap (V1)

> Internal-use app. No complex onboarding wizard needed — user sets opening balance in Settings on first use.

## Phase 1: Project Setup & Database (Days 1-3)
- Initialize Expo / React Native project with TypeScript.
- Install core dependencies: `expo-sqlite`, `expo-file-system`, `expo-sharing`, `expo-document-picker`.
- Set up folder structure: `/src/screens`, `/src/components`, `/src/db`, `/src/utils`.
- Implement design tokens (colors, typography, spacing) as a central theme file.
- Build reusable base components: Button, Chip, Card, TextInput, BottomSheet, Toast/Snackbar.
- Create SQLite migration scripts for all tables: `transactions`, `purposes`, `categories`, `settings`, `audit_log`.
- Build data access layer (CRUD) and computed balance queries.
- Seed default Purposes (High School, University, General) and Categories (Travel, Food, Equipment, etc.).
- Store all amounts as integers (cents). Build display formatting utility: `2350` -> `"EUR 23.50"`.


## Phase 2: Navigation Shell, Dashboard & Quick-Add (Days 4-8)
- Build the Bottom Navigation Bar (Dashboard, Ledger, Stats, Settings tabs).
- Build the Quick-Add Bottom Sheet (Income/Expense toggle, Amount hero input, Vendor autocomplete, Purpose chips, Category chips, Date picker, Note, Save button).
- Implement all Quick-Add validation (amount > 0, disabled state).
- Build the Dashboard screen (Hero Balance Card, Warning Banner, Purpose Cards, Recent Activity list, Sticky Action Bar).
- Wire Dashboard to live SQLite queries so it refreshes on every transaction change.

## Phase 4: Ledger & Transaction Management (Days 11-14)
- Build the Ledger screen (Search bar, Filter button, Grouped transaction list).
- Build the Filter Bottom Sheet (Type, Purpose, Category, Date Range chips + Apply/Reset).
- Build the Active Filter Bar (removable chips).
- Build the Transaction Detail Modal (View Mode with all fields).
- Build the Edit Mode (inline editing, Save Changes, Cancel, edit confirmation banner).
- Build the Delete Confirmation Dialog.
- Implement swipe-to-delete and swipe-to-edit gestures on list items.
- Implement Undo toast for deletions (3-second window).

## Phase 5: Statistics (Days 15-16)
- Build the Statistics screen (Month selector, Summary row, Sub-tab switcher).
- Build "By Purpose" view (Purpose cards with progress bars).
- Build "By Category" view (Ranked list with bar indicators).
- Build "By Vendor" view (Ranked list with transaction counts).
- Wire all views to SQLite aggregate queries filtered by selected month.
- Implement empty states for statistics.

## Phase 6: Settings, Taxonomy & Data Management (Days 17-19)
- Build the Settings screen (grouped rows for Account, Customization, Data & Backup, About).
- Build the Manage Purposes sub-screen (list, add, inline edit, delete with protection).
- Build the Manage Categories sub-screen (same layout as Manage Purposes).
- Implement Opening Balance edit dialog.
- Implement Currency selector.
- Implement CSV Export (generate file + Android share sheet).
- Implement JSON Backup (serialize all tables + Android share sheet).
- Implement JSON Restore (file picker + validation + confirmation dialog + restore logic).

## Phase 6: Polish & Testing (Days 19-21)
- Implement all toast/snackbar notifications and error validation messages.
- Test on physical Android device via Expo Go.
- Run through all User Flows end-to-end (see 02_User_Flows.md).
- Run through all Testing Plan scenarios (see 08_Testing_Plan.md).
- Performance check: Quick-Add flow completes in under 5 seconds.
- Fix edge cases (negative balances, long text truncation, empty states).
