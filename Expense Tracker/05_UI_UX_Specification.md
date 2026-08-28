# UI/UX Specification (Design Handoff Guide)

This document is the UI/UX blueprint for the H-Budget Android application. It covers component layouts, button behaviors, color tokens, and screen specifications for design and development handoff.

**Internal use app — keep the UI clean, functional, and fast. No need for decorative onboarding or splash screens.**

---

## 1. Design System

### 1.1 Color Palette

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `bg-primary` | `#F8F9FA` | App background |
| `surface-card` | `#FFFFFF` | Cards, bottom sheets, modals |
| `surface-elevated` | `#F1F5F9` | List section headers, input backgrounds |
| `brand-primary` | `#2563EB` | Primary buttons, active nav, selected chips |
| `brand-primary-light` | `#DBEAFE` | Selected chip background, active filter chips |
| `positive` | `#16A34A` | Income amounts, positive balance, Income button |
| `positive-light` | `#DCFCE7` | Income badge background |
| `negative` | `#DC2626` | Expense amounts, negative balance, Expense button, delete |
| `negative-light` | `#FEE2E2` | Expense badge background |
| `warning` | `#D97706` | Unassigned alert banner |
| `warning-light` | `#FEF3C7` | Warning banner fill |
| `text-primary` | `#0F172A` | Headlines, amounts, vendor names |
| `text-secondary` | `#64748B` | Labels, subtext, timestamps |
| `text-tertiary` | `#94A3B8` | Placeholder text |
| `border` | `#E2E8F0` | Card borders, dividers, input borders |
| `overlay` | `#00000066` | Dimmed background behind sheets/modals |

### 1.2 Typography

| Role | Size | Weight | Usage |
| :--- | :--- | :--- | :--- |
| `hero-balance` | 36sp | Bold | Main balance number on Dashboard |
| `hero-input` | 32sp | Bold | Amount input in Quick-Add |
| `screen-title` | 22sp | Semi-Bold | Top app bar titles |
| `section-header` | 16sp | Semi-Bold | "Balances by Purpose", "Recent Activity" |
| `card-title` | 15sp | Medium | Purpose card name, vendor name in list |
| `body` | 14sp | Regular | Field values, notes |
| `label` | 13sp | Regular | Input field labels, subtext |
| `caption` | 12sp | Medium | Chip text, timestamps |
| `micro` | 11sp | Regular | "Created at" in detail view |

**Font:** System default (Roboto on Android).

### 1.3 Icons

> [!IMPORTANT]
> **NO EMOJIS** — anywhere in the app, UI, or database. Emojis cause encoding crashes. Use SVG icons only (Material Icons Outlined or Feather Icons — pick one and use consistently).

| Icon ID | Material Icon Name | Used In |
| :--- | :--- | :--- |
| `icon_dashboard` | `home` | Bottom nav |
| `icon_ledger` | `receipt_long` | Bottom nav |
| `icon_stats` | `bar_chart` | Bottom nav |
| `icon_settings` | `settings` | Bottom nav |
| `icon_add` | `add` | Income button |
| `icon_remove` | `remove` | Expense button |
| `icon_close` | `close` | Close modals/sheets |
| `icon_warning` | `warning_amber` | Unassigned alert |
| `icon_search` | `search` | Ledger search bar |
| `icon_filter` | `filter_list` | Ledger filter |
| `icon_calendar` | `calendar_today` | Date field |
| `icon_edit` | `edit` | Edit button/swipe action |
| `icon_delete` | `delete_outline` | Delete button/swipe action |
| `icon_chevron_right` | `chevron_right` | Settings rows, "Classify" link |
| `icon_export` | `file_download` | Export buttons |
| `icon_import` | `file_upload` | Restore button |
| `icon_arrow_back` | `arrow_back` | Sub-screen back |

**Icon sizes:** Bottom nav: 24dp. Inline actions: 20dp. Category icons in lists: 24dp inside 40dp rounded background.

### 1.4 Touch Targets & Spacing

| Element | Minimum Size |
| :--- | :--- |
| Bottom Nav Item | 48dp tall |
| Action Buttons (Income/Expense) | 52dp tall, 50% screen width |
| Chip/Pill | 36dp tall, 48dp tap target |
| List Item Row | 64dp tall minimum |
| Close/X Button | 48dp x 48dp tap target |
| Swipe Action Reveal | Full row height, 80dp wide |

**Spacing:** 16dp screen margins. 16dp card internal padding. 12dp gap between cards. 8dp gap between chips.

**Corner Radius:** Cards 12dp. Primary buttons 12dp. Chips fully rounded (20dp). Inputs 8dp. Bottom sheets 16dp top corners. Dialogs 16dp.

---

## 2. Screen Specifications

---

### Screen 1: Dashboard (Home)

The first screen users see on every launch. Scrollable content with a fixed sticky bar at the bottom.

#### Layout (Top to Bottom):

**1. Top App Bar (Fixed)**
- Height: 56dp.
- Left: "H-Budget" (`screen-title`).
- Right: Reconciliation badge:
  - All transactions have a purpose: green dot + "Reconciled" (`caption`, `positive`).
  - Any transactions are unassigned: amber dot + "Action needed" (`caption`, `warning`).

**2. Hero Balance Card (Full width, 16dp margins)**
- Background: `surface-card`, 12dp radius.
- Internal padding: 20dp.
- Label: "Total Available Balance" (`label`, `text-secondary`).
- Hero number: "EUR 3,464.10" (`hero-balance`).
  - Color: `positive` if >= 0, `negative` if < 0.
- Sub-row: "Received: +EUR 2,000.00" (`caption`, `positive`) — "Spent: -EUR 535.90" (`caption`, `negative`).
- Divider line.
- "Opening Balance: EUR 3,000.00" (`caption`, `text-tertiary`).

**3. Warning Banner (Only visible when unassigned transactions exist)**
- Background: `warning-light`, 1dp `warning` border, 12dp radius, 16dp margin.
- Left: `icon_warning` (20dp, `warning`).
- Text: "7 transactions need classification" (`body`, `text-primary`).
- Right: "Classify >" (`caption`, `brand-primary`) — tapping opens Ledger filtered by Unassigned.
- Full banner is tappable.

**4. Purpose Balance Section**
- Header: "Balances by Purpose" (`section-header`).
- 2-column card grid (12dp gap):
  - Each card: Purpose Name, "Received: +EUR X", "Spent: -EUR X", divider, "Remaining: EUR X" (color-coded).
  - Optional: thin progress bar (4dp, `brand-primary` fill) showing % of received spent.

**5. Recent Activity Section**
- Header row: "Recent Activity" (left) + "View All" (`caption`, `brand-primary`, navigates to Ledger tab) (right).
- Last 5 transactions. See Transaction List Item layout in Screen 3.
- If no transactions: Text "No transactions yet. Tap + Income or - Expense below to get started." (`body`, `text-secondary`, centered).

**6. Sticky Action Bar (Fixed at bottom, above Nav)**
- Background: `surface-card`, top border 1dp `border`.
- Internal padding: 12dp horizontal, 10dp vertical.
- Two buttons side-by-side (8dp gap):
  - **Left `[ + Income ]`:** `positive` background, white text + `icon_add`. Height 52dp, 12dp radius. Tap opens Quick-Add in Income mode.
  - **Right `[ - Expense ]`:** `negative` background, white text + `icon_remove`. Height 52dp, 12dp radius. Tap opens Quick-Add in Expense mode.

---

### Screen 2: Quick-Add Bottom Sheet

The most-used screen. Must be frictionless. Opens from either Dashboard action button. Slides up from bottom, dimming background.

#### Opening Behavior:
- Sheet covers ~85% of screen height.
- Soft keyboard opens automatically on the Amount field.
- Tapping the dimmed area OR `[X]` closes the sheet without saving.

#### Components (Top to Bottom):

**1. Handle & Header**
- Top: 40dp drag handle indicator (centered, 4dp tall, `border` color).
- Row: "New Transaction" (`section-header`, left) + `[X]` close button (`icon_close`, 48dp tap target, right).

**2. Expense / Income Toggle (Segmented Control)**
- Full width. Two options: `[ Expense ]` | `[ Income ]`.
- Active segment: Filled pill. Expense = `negative` bg. Income = `positive` bg. White text.
- Inactive: Transparent, `text-secondary`.
- Default: pre-selected based on which button was tapped on Dashboard.

**3. Amount Input (Hero)**
- Prefix: "EUR" (`label`, `text-secondary`).
- Input: Large numeric (`hero-input` size, centered, no visible border).
- Placeholder: "0.00" (`text-tertiary`).
- Color while typing: `negative` for Expense, `positive` for Income.
- Keyboard: Numeric decimal.
- Below: Thin divider line.

**4. Vendor / Source Input**
- Label: "Vendor / Store" (Expense) or "Source / Payer" (Income) (`label`, `text-secondary`).
- Text input: `surface-elevated` bg, `border` outline, 8dp radius, 48dp height.
- Placeholder: "e.g. Deutsche Bahn" or "e.g. Mentorship Grant".
- **Autocomplete:** Dropdown of past entries appears as user types. Max 4 visible items. Tap to fill.

**5. Purpose Chips**
- Label: "Purpose" (`label`, `text-secondary`).
- Horizontal scrolling row. Single-select (radio behavior).
- User-defined purposes + "[ Unassigned ]" always last (dashed border when unselected, `warning-light` bg when selected).
- Selected chip: `brand-primary` bg, white text. Unselected: `surface-elevated` bg, `border`, `text-primary`.

**6. Category Chips**
- Label: "Category" (`label`, `text-secondary`).
- Same layout as Purpose. Single-select.
- Options: Travel, Food, Equipment, Software, Other (user-configurable in Settings).

**7. Date Selector**
- Label: "Date" (`label`, `text-secondary`).
- Tappable row: `icon_calendar` (left) + Selected date "Today, Aug 28, 2026" (center) + `icon_chevron_right` (right).
- Default: today. Tap opens native Android DatePicker.

**8. Note (Optional)**
- Label: "Note (optional)" (`label`, `text-secondary`).
- Single-line text input, `surface-elevated` bg, 48dp height.
- Placeholder: "e.g. Trip to Mannheim".

**9. Save Button (Fixed above keyboard)**
- Full width (minus 16dp margins). Height 52dp. 12dp radius.
- Text: "Save Transaction" (white, `card-title` weight).
- **Enabled:** `brand-primary` bg when Amount > 0.
- **Disabled:** `border` bg, `text-tertiary` text when Amount = 0.
- On save: sheet closes, toast "Transaction saved" appears.

---

### Screen 3: Transaction Ledger (Ledger Tab)

Full scrollable list of all transactions with search and filter.

#### Layout:

**1. Top Bar (Fixed)**
- Search field (full width minus filter button): `surface-elevated` bg, 8dp radius, 44dp height. `icon_search` inside left. Placeholder: "Search vendor, note, or amount..."
- Filter button (48dp x 48dp): `icon_filter`. Shows a small `brand-primary` dot badge when filters are active.

**2. Active Filter Bar (Only visible when filters are active)**
- Horizontal scrolling row of removable chips (e.g., `Purpose: High School [X]`).
- Chip style: `brand-primary-light` bg, `brand-primary` text.
- `[X]` on each chip removes that filter. "Clear All" text button (`caption`, `negative`) at the right end.

**3. Filter Bottom Sheet (Opens when filter button tapped)**
- Same sheet animation as Quick-Add.
- Title: "Filter Transactions" + `[X]` close.
- **Transaction Type:** Multi-select chips: `[ All ]` `[ Income ]` `[ Expense ]`.
- **Purpose:** Multi-select chips of all user-defined purposes + `[ Unassigned ]`.
- **Category:** Multi-select chips of all categories.
- **Date Range:** Two date pickers: "From" | "To".
- Bottom: `[ Reset ]` (outline) + `[ Apply ]` (`brand-primary` filled).

**4. Transaction List (Grouped by Date)**
- **Sticky section header:** Date label (e.g., "Thursday, August 28, 2026") in `surface-elevated` bg, 32dp height. Right: daily total in color-coded `caption`.
- **List item (72dp min height):**
  - Left (48dp zone): Category icon (24dp) inside 40dp rounded square (`brand-primary-light` bg for expenses, `positive-light` for income).
  - Center: Vendor name (`card-title`, `text-primary`) — "No vendor" in italic `text-tertiary` if empty. Below: Purpose badge (small gray pill) + Category text (`caption`, `text-secondary`).
  - Right: Amount (`card-title`, Bold, color-coded) + Time below (`micro`, `text-tertiary`).
  - Divider: 1dp `border`, indented 72dp from left.
- **Swipe Left:** Reveals red 80dp panel with `icon_delete` (white). Release triggers Delete Confirmation.
- **Swipe Right:** Reveals blue 80dp panel with `icon_edit` (white). Release opens Transaction Detail in Edit Mode.
- **Tap:** Opens Transaction Detail in View Mode.
- **Empty state:** "No transactions found." Subtext: "Try adjusting your filters." (if filter active) or "Start by adding your first transaction." (if no filters).

---

### Screen 4: Transaction Detail & Edit Modal

Opens as a bottom sheet (75% screen height). Triggered by tapping a list item or swipe-right.

#### View Mode:

**Header:** "Transaction Details" (`section-header`, left) + `[X]` (right).

**Amount:** Centered. "- EUR 23.50" or "+ EUR 500.00" (`hero-balance`, color-coded). Date below: "Thursday, August 28, 2026 at 14:32" (`label`, `text-secondary`).

**Detail rows (label left / value right):**
- Type — "Expense" (with color dot)
- Vendor — "Deutsche Bahn" (or "---" in `text-tertiary`)
- Purpose — shown as colored badge/chip
- Category — shown as colored badge/chip
- Note — "Trip to Mannheim" (or "---")
- Created — "Aug 28, 2026 14:32" (`micro`, `text-tertiary`)
- Last Updated — only visible if transaction was edited

**Buttons:**
- `[ Edit Transaction ]` — Full width, `brand-primary` outline. Switches to Edit Mode.
- `[ Delete Transaction ]` — Full width, transparent bg, `negative` text.

#### Edit Mode (after tapping "Edit Transaction"):

- All detail rows become editable inputs (same field types as Quick-Add: amount input, text input, chips, date picker, note).
- **Edit notice banner** (if amount changed): "Changing from EUR 23.50 to EUR 30.00 will adjust your balance by EUR 6.50." (`caption`, `warning-light` bg).
- `[ Save Changes ]` — Full width, `brand-primary`. Disabled if nothing changed.
- `[ Cancel ]` — Full width, transparent, `text-secondary`. Returns to View Mode without saving.

#### Delete Confirmation Dialog (Modal):

- Centered dialog, `surface-card` bg, 16dp radius, 24dp padding. Width: screen minus 48dp.
- Title: "Delete this transaction?" (`section-header`).
- Message: "This will remove EUR 23.50 and restore it to your Total Balance and University pool." (`body`, `text-secondary`).
- Buttons (right-aligned row): `[ Cancel ]` (text button) + `[ Delete ]` (`negative` filled, 12dp gap).

---

### Screen 5: Statistics & Insights (Stats Tab)

#### Layout:

**1. Month Selector**
- Row: `< ` (arrow, 48dp tap) + "August 2026" (`section-header`, centered) + ` >` (arrow, 48dp tap).
- Arrow disabled (grayed) at earliest/latest available month.
- Filters all statistics below to the selected month.

**2. Summary Row**
- Two side-by-side cards: "Received +EUR 2,000.00" (`positive`) | "Spent -EUR 725.70" (`negative`).

**3. Sub-Tab Switcher**
- `[ By Purpose ]` | `[ By Category ]` | `[ By Vendor ]`
- Active: `brand-primary` text + 3dp bottom underline. Inactive: `text-secondary`.

**4. By Purpose Tab**
- One card per purpose (sorted highest spending first):
  - Purpose Name + Net balance (right, color-coded).
  - "Received: +EUR X" + "Spent: -EUR X".
  - Progress bar (6dp, `brand-primary` fill, % of received spent. `negative` fill if overspent).
  - "77% spent" below bar (`micro`, `text-tertiary`).

**5. By Category Tab**
- Ranked vertical list (highest to lowest spending):
  - Rank number + Category Name + Amount right + Percentage.
  - Horizontal bar indicator (4dp, proportional to top category).

**6. By Vendor Tab**
- Same layout as By Category.
- Shows transaction count per vendor: "(12 transactions)" (`caption`, `text-tertiary`).

**Empty state (if no data for selected month):** "No data for this month." centered.

---

### Screen 6: Settings Tab

Scrollable grouped list.

**Section "Account"**
- "Opening Bank Balance" → current value (`text-secondary`) + `icon_chevron_right`. Tap: dialog with numeric input + `[ Save ]` / `[ Cancel ]`.
- "Currency" → "EUR" + `icon_chevron_right`. Tap: selection list (EUR, USD, GBP, TRY, CHF). Single select.

**Section "Customization"**
- "Manage Purposes" → `icon_chevron_right`. Tap: navigates to Manage Purposes sub-screen.
- "Manage Categories" → `icon_chevron_right`. Tap: navigates to Manage Categories sub-screen.

**Section "Data & Backup"**
- "Export CSV Report" → `icon_export` left. Tap: generates CSV, opens Android share sheet.
- "Backup Data (JSON)" → `icon_export` left. Tap: generates JSON backup, opens share sheet.
- "Restore Data (JSON)" → `icon_import` left. Tap: opens file picker, then confirmation dialog:
  - "Restore from backup? This will replace ALL current data. This cannot be undone."
  - Buttons: `[ Cancel ]` + `[ Restore ]` (`negative` fill).

**Section "About"**
- "App Version" → "1.0.0" (non-tappable, `text-tertiary`).

---

### Sub-Screen: Manage Purposes

Top app bar: `icon_arrow_back` + "Manage Purposes".

**List of existing purposes:**
- Each row: Purpose name (`body`) + `icon_edit` (48dp tap) + `icon_delete` (48dp tap, `negative`).
- Delete disabled if it is the last remaining purpose OR if transactions use it. Tooltip: "Cannot delete: [n] transactions use this purpose."
- Tapping edit: row name becomes inline text input. Confirm by pressing Enter or tapping outside.

**Add new (bottom):**
- Text input "New purpose name..." + `[ Add ]` button (`brand-primary` outline, disabled if input empty, blocked if duplicate name).

---

### Sub-Screen: Manage Categories

Identical layout and behavior to Manage Purposes.

---

## 3. Global Components

### Bottom Navigation Bar (Present on all 4 main tabs)

- Fixed at screen bottom. Background: `surface-card`. Top border: 1dp `border`. Height: 56dp.
- 4 equal-width items. Icon (24dp) above label (`micro`).
- Active: `brand-primary` color, filled icon variant. Inactive: `text-tertiary`, outlined icon.

| # | Label | Active Icon | Inactive Icon |
| :--- | :--- | :--- | :--- |
| 1 | Dashboard | `home` (filled) | `home` (outlined) |
| 2 | Ledger | `receipt_long` (filled) | `receipt_long` (outlined) |
| 3 | Stats | `bar_chart` (filled) | `bar_chart` (outlined) |
| 4 | Settings | `settings` (filled) | `settings` (outlined) |

### Toast / Snackbar Notifications

- Appears at bottom of screen, above nav bar. Auto-dismisses after 3 seconds.
- Dark background, white text. `caption` size.

| Event | Message | Special |
| :--- | :--- | :--- |
| Transaction saved | "Transaction saved" | None |
| Transaction deleted | "Transaction deleted" | Includes `[ UNDO ]` button (re-inserts if tapped within 3 seconds) |
| Transaction updated | "Transaction updated" | None |
| Purpose/Category added | "Added" | None |
| CSV exported | "CSV saved" | None |
| JSON backup created | "Backup saved" | None |
| Data restored | "Data restored. [n] transactions loaded." | Positive green tint |
| Restore failed | (Modal dialog instead, not toast) | See error states |

### Error States & Validation

| Scenario | Behavior |
| :--- | :--- |
| Amount = 0 or empty | Save button stays disabled. No error text needed. |
| Non-numeric amount | Red `border-focus` on field. Inline text: "Please enter a valid number." |
| Duplicate purpose/category name | `[ Add ]` button stays disabled. Inline: "This name already exists." |
| Delete last purpose | Delete button grayed out. Tooltip: "Must have at least one purpose." |
| Restore file invalid | Modal dialog: "Restore Failed. The file is not a valid H-Budget backup." + `[ OK ]`. |

---

## 4. Button & Interaction Matrix

| # | Button | Screen | Visual Style | Height | Default | Disabled Condition | Tap Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `[ + Income ]` | Dashboard sticky bar | `positive` filled, white | 52dp | Always active | Never | Opens Quick-Add (Income mode) |
| 2 | `[ - Expense ]` | Dashboard sticky bar | `negative` filled, white | 52dp | Always active | Never | Opens Quick-Add (Expense mode) |
| 3 | `[ Save Transaction ]` | Quick-Add Sheet | `brand-primary` filled, white | 52dp | Active when amount > 0 | Amount = 0 or empty | Saves to SQLite, closes sheet, shows toast |
| 4 | `[X]` Close | Quick-Add / Detail | Icon only | 48dp tap target | Always active | Never | Closes sheet without saving |
| 5 | "Classify >" | Dashboard Warning Banner | Text link `brand-primary` | 48dp tap height | Active when unassigned > 0 | Banner hidden when 0 | Opens Ledger filtered by Unassigned |
| 6 | "View All" | Dashboard Recent Activity | Text link `brand-primary` | 48dp tap height | Always active | Never | Navigates to Ledger tab |
| 7 | `icon_filter` | Ledger top bar | Icon `text-secondary` | 48dp tap target | Always active | Never | Opens Filter sheet. Dot badge when filters active. |
| 8 | `[X]` on filter chip | Ledger filter bar | Chip remove icon | 36dp tap target | When filters exist | -- | Removes that specific filter |
| 9 | "Clear All" | Ledger filter bar | Text `negative` | 36dp tap height | When filters exist | -- | Clears all active filters |
| 10 | `[ Apply ]` | Filter Sheet | `brand-primary` filled | 48dp | Always active | Never | Applies selections, closes sheet |
| 11 | `[ Reset ]` | Filter Sheet | Outline `text-secondary` | 48dp | Always active | Never | Clears all filter selections in sheet |
| 12 | `[ Edit Transaction ]` | Detail Modal | `brand-primary` outline | 48dp | Always active | Never | Switches to Edit Mode |
| 13 | `[ Delete Transaction ]` | Detail Modal | Transparent, `negative` text | 48dp | Always active | Never | Opens Delete Confirmation Dialog |
| 14 | `[ Save Changes ]` | Detail Edit Mode | `brand-primary` filled | 48dp | Active when a field changed | Nothing changed | Saves to SQLite, returns to View Mode |
| 15 | `[ Cancel ]` (edit) | Detail Edit Mode | Transparent, `text-secondary` | 48dp | Always active | Never | Discards edits, returns to View Mode |
| 16 | `[ Cancel ]` (delete) | Delete Dialog | Text `text-secondary` | 48dp | Always active | Never | Dismisses dialog |
| 17 | `[ Delete ]` (confirm) | Delete Dialog | `negative` filled, white | 48dp | Always active | Never | Deletes record, shows toast with UNDO |
| 18 | `[ UNDO ]` | Toast (after delete) | White text button | 36dp | Active for 3 seconds | After 3 seconds | Re-inserts deleted transaction |
| 19 | `[ Add ]` (purpose/category) | Manage sub-screens | `brand-primary` outline | 44dp | Active when input filled | Input empty or duplicate | Adds new entry to SQLite |
| 20 | `icon_edit` (row) | Manage sub-screens | Icon `text-secondary` | 48dp tap target | Always active | Never | Makes row name inline-editable |
| 21 | `icon_delete` (row) | Manage sub-screens | Icon `negative` | 48dp tap target | Active unless last item or in-use | Last purpose; purpose in use | Deletes taxonomy item |
| 22 | Month `<` arrow | Statistics | Icon `text-secondary` | 48dp tap target | Active if data exists | At earliest month | Goes to previous month |
| 23 | Month `>` arrow | Statistics | Icon `text-secondary` | 48dp tap target | Active if not current | At current month | Goes to next month |
| 24 | `[ Export CSV ]` | Settings | Row tap + `icon_export` | 56dp row | Always active | Never | Generates CSV, opens share sheet |
| 25 | `[ Backup JSON ]` | Settings | Row tap + `icon_export` | 56dp row | Always active | Never | Generates JSON, opens share sheet |
| 26 | `[ Restore JSON ]` | Settings | Row tap + `icon_import` | 56dp row | Always active | Never | Opens file picker, then confirm dialog |
| 27 | `[ Restore ]` (confirm) | Restore Dialog | `negative` filled | 48dp | Always active | Never | Clears DB, imports backup, shows toast |

---

## 5. Key Edge Cases

| Scenario | Handling |
| :--- | :--- |
| Balance goes negative | Hero number shows in `negative` red. No blocking — user may intentionally overspend a pool. |
| Long vendor name (>30 chars) | Truncate with "..." in list items. Full name visible in Detail Modal. |
| No vendor entered | List shows "No vendor" in italic `text-tertiary`. |
| No note entered | Detail Modal shows "---" in `text-tertiary`. |
| Amount display | Always 2 decimal places: "EUR 5.00" not "EUR 5". Always prefix sign in lists: "+EUR" or "-EUR". |
| Thousands separator | "EUR 1,200.00" with comma. |
| Dates | Short form: "Aug 28, 2026". Full form: "Thursday, August 28, 2026". Time: 24h "14:32". |
