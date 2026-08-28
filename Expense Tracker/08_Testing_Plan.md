# Testing Plan

Since this is a financial application, state integrity and math calculations are the most critical aspects to test, even in V1.

## 1. Core State Integrity Tests
- **The "Zero Sum" Test:**
  - Set opening balance to 0.
  - Add EUR 1,000 Income assigned to "High School".
  - Add five EUR 200 Expenses across different vendors/purposes.
  - Verify total balance is exactly EUR 0.00.
  - Verify each purpose balance reflects only its own transactions.
- **Edit Recalculation:**
  - Add EUR 50 expense. Balance drops by EUR 50.
  - Edit expense to EUR 80. Balance must reflect a total drop of EUR 80 (not EUR 130).
  - Verify purpose pool also adjusts correctly.
- **Deletion Recalculation:**
  - Add EUR 100 income to "University".
  - Delete the income record.
  - Verify total balance reverts to the state before the income was added.
  - Verify University purpose balance also reverts.
- **Integer Precision:**
  - Add EUR 0.01 income, then add EUR 0.01 expense. Balance should be exactly EUR 0.00 (not a floating point artifact like EUR 0.0000001).
  - Add EUR 33.33 three times. Verify total is exactly EUR 99.99.

## 2. Unassigned Edge Cases
- Add an expense with no purpose selected.
- Verify it is deducted from the Total Balance but does NOT affect any specific Purpose balance.
- Verify the Dashboard Warning Banner appears with correct count.
- Edit the transaction to assign a purpose; verify the Warning Banner count decrements and the Purpose balance updates.
- Add 3 unassigned transactions. Verify count shows "3 transactions need classification".
- Classify all 3. Verify Warning Banner disappears entirely.

## 3. First-Launch Sanity Check
- Set opening balance to EUR 3,000 in Settings. Verify Dashboard shows EUR 3,000.00.
- Verify default Purposes (High School, University, General) are pre-seeded and visible in Quick-Add chips.
- Verify default Categories (Travel, Food, Equipment, etc.) are pre-seeded.

## 4. Quick-Add Friction Tests (Android Device)
- **Speed Test:** Launch app -> tap `[ - Expense ]` -> type 8.50 -> tap Save. Must be possible in under 5 seconds.
- **Keyboard Auto-Focus:** Verify numeric keyboard opens automatically when Quick-Add sheet appears.
- **Save Button Visibility:** Verify Save button remains visible above the keyboard (not hidden behind it).
- **Touch Targets:** Verify Purpose/Category chips are easily tappable with a thumb while walking (minimum 36dp tall, 48dp tap target).
- **Vendor Autocomplete:** Type "Deu" after previously saving a "Deutsche Bahn" transaction. Verify autocomplete dropdown appears showing "Deutsche Bahn".

## 5. Ledger & Filtering Tests
- Add 10 transactions across different purposes, categories, dates, and types.
- **Search:** Type a vendor name. Verify only matching transactions appear.
- **Filter by Purpose:** Apply filter for "University". Verify only University transactions shown.
- **Filter by Type:** Apply "Income" filter. Verify only income transactions shown.
- **Multiple Filters:** Apply Purpose + Type filters simultaneously. Verify correct intersection.
- **Clear Filters:** Tap "Clear All". Verify full list returns.
- **Active Filter Chips:** Verify removable chips appear in the Active Filter Bar. Tap [X] on one and verify it is removed.

## 6. Delete & Undo Tests
- Delete a transaction. Verify toast appears with `[ UNDO ]` button.
- Tap UNDO within 3 seconds. Verify transaction re-appears in list and balance reverts.
- Delete a transaction. Wait 4 seconds (do NOT tap UNDO). Verify transaction is permanently gone.
- Delete the ONLY transaction in the list. Verify the empty state appears.

## 7. Statistics Tests
- Add transactions across 3 different months.
- Verify month selector arrows navigate between months.
- Verify "By Purpose" shows correct Received/Spent/Net per purpose for the selected month only.
- Verify "By Category" ranks categories from highest to lowest spending for the selected month.
- Verify "By Vendor" shows correct spend per vendor with transaction counts.
- Navigate to a month with no transactions. Verify empty state appears.

## 8. Settings & Taxonomy Tests
- **Edit Opening Balance:** Change from EUR 3,000 to EUR 3,500. Verify Dashboard balance increases by EUR 500.
- **Add Purpose:** Add "Personal" purpose. Verify it appears as a chip in Quick-Add and as a card on Dashboard.
- **Rename Purpose:** Rename "High School" to "HS Mentoring". Verify all existing transactions still display the new name.
- **Delete Protection:** Try to delete a purpose that has transactions. Verify it is blocked with tooltip message.
- **Delete Protection (Last):** With only 1 purpose remaining, verify delete button is disabled.
- **Add Category:** Add "Clothing". Verify it appears in Quick-Add Category chips.

## 9. Data Export & Backup Tests
- **CSV Export:** Add 5 dummy transactions. Export CSV. Open in spreadsheet viewer. Verify all columns (id, type, amount, date, vendor, purpose, category, note) are present and correct.
- **JSON Backup:** Trigger backup. Verify file is created and can be saved via share sheet.
- **JSON Restore:** 
  - Backup current data. 
  - Add 3 more transactions. 
  - Restore from backup. 
  - Verify the 3 new transactions are gone and data matches the backup exactly.
- **Invalid Restore:** Try restoring a non-JSON file or a JSON file that is not an H-Budget backup. Verify error dialog: "The selected file is not a valid H-Budget backup."

## 10. Empty State Tests
- Fresh app after onboarding (no transactions):
  - Dashboard Recent Activity: shows empty state illustration and "No transactions yet" text.
  - Ledger: shows empty state with "No transactions found" text.
  - Statistics: shows "Not enough data yet" text.
- Ledger with search term that matches nothing: shows "No results for [term]" text.
- Statistics on month with no data: shows empty state text.

## 11. Edge Case & Visual Tests
- **Negative Balance:** Spend more than received for a purpose. Verify balance displays in red, no crashes.
- **Long Vendor Name:** Enter a 50-character vendor name. Verify it truncates with "..." in list items and shows fully in Detail Modal.
- **Amount Display:** Verify all amounts show 2 decimal places (EUR 5.00, not EUR 5).
- **Thousands Separator:** Add EUR 1,200.00 income. Verify display shows "EUR 1,200.00" with comma separator.
