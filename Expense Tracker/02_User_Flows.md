# User Flows

> **Note:** This is an internal-use app. On first install, the user sets their opening balance directly in Settings. No onboarding wizard is needed.

## 1. Receiving Funds (Income)
1. Mentorship funding arrives in the user's real bank account.
2. User taps `[ + Income ]` on the Dashboard sticky action bar.
3. Quick-Add Bottom Sheet slides up with **Income** mode pre-selected (green tint).
4. Keyboard opens automatically, cursor on the Amount field.
5. User types `500`.
6. User types `Mentorship Grant` in the Source field.
7. User taps the `[ High School ]` purpose chip. It fills with brand-primary color.
8. User leaves Date as today and Note empty.
9. User taps `[ Save Transaction ]`.
10. Sheet closes. Toast appears: "Transaction saved".
11. Dashboard updates: Total available is now EUR 3,500.00. High School card shows Received: +EUR 500.00.

## 2. Standard Expense Logging
1. User purchases train tickets for a student.
2. User taps `[ - Expense ]` on the Dashboard sticky action bar.
3. Quick-Add Bottom Sheet slides up with **Expense** mode pre-selected (red tint).
4. User types `23.50` in the Amount field (displays in red).
5. User starts typing `Deut...` in the Vendor field. Autocomplete dropdown appears showing "Deutsche Bahn" from a previous entry. User taps it.
6. User taps the `[ University ]` purpose chip.
7. User taps the `[ Travel ]` category chip.
8. User types "Trip to Mannheim" in the Note field.
9. User taps `[ Save Transaction ]`.
10. Sheet closes. Toast: "Transaction saved".
11. Dashboard updates: Total balance drops by EUR 23.50. University card shows Spent: -EUR 23.50.

## 3. Rushed Expense Logging (Unassigned)
1. User buys snacks at a store but is in a rush.
2. User taps `[ - Expense ]`.
3. User types `12.40` in Amount.
4. User types `Lidl` in Vendor.
5. User skips Purpose (no chip selected) and skips Category.
6. User taps `[ Save Transaction ]`.
7. Sheet closes. Toast: "Transaction saved".
8. Dashboard updates: Total balance drops by EUR 12.40.
9. Warning Banner appears on Dashboard: "[Warning] 1 transaction needs classification" with "Classify >" link.

## 4. Classifying an Unassigned Transaction
1. User taps the "Classify >" link on the Warning Banner.
2. App switches to the Ledger tab with filter pre-applied: `Purpose: Unassigned`.
3. User sees only the unassigned transactions in the list.
4. User taps the EUR 12.40 Lidl transaction.
5. Transaction Detail Modal opens in View Mode.
6. User taps `[ Edit Transaction ]`.
7. Detail converts to Edit Mode. User taps `[ High School ]` purpose chip and `[ Food ]` category chip.
8. User taps `[ Save Changes ]`.
9. Modal returns to View Mode with updated fields. Toast: "Transaction updated".
10. User closes the modal. Warning Banner on Dashboard disappears (0 unassigned remaining).

## 5. Editing a Transaction Amount
1. User realizes they entered the wrong amount for a train ticket.
2. User goes to the Ledger tab and finds the Deutsche Bahn transaction.
3. User taps the transaction. Detail Modal opens.
4. User taps `[ Edit Transaction ]`.
5. User changes Amount from 23.50 to 30.00.
6. Edit Confirmation Banner appears: "Changing amount from EUR 23.50 to EUR 30.00 will adjust your balance by EUR 6.50."
7. User taps `[ Save Changes ]`.
8. Dashboard recalculates: Total balance adjusts by -EUR 6.50. University pool adjusts accordingly.

## 6. Deleting a Transaction
1. In the Ledger, user swipes a transaction to the left.
2. Red delete panel reveals on the right side.
3. User releases the swipe. Delete Confirmation Dialog appears.
4. Dialog shows: "This will remove the EUR 12.40 expense and restore it to your Total Balance."
5. User taps `[ Delete ]`.
6. Dialog and row disappear. Toast appears: "Transaction deleted [UNDO]".
7. If user taps `[ UNDO ]` within 3 seconds: transaction is re-inserted. Toast: "Transaction restored".
8. If 3 seconds pass: deletion is permanent.

## 7. Month-End Reconciliation
1. At the end of the month, the user checks the app Dashboard.
2. Dashboard shows Total Available Balance: "EUR 3,464.10".
3. User opens their real banking app and sees EUR 3,459.10.
4. User calculates a EUR 5.00 difference.
5. User taps `[ - Expense ]` on the Dashboard. Enters EUR 5.00, Vendor "Bank", Purpose "General", Category "Other", Note "Monthly account fee".
6. Dashboard now shows EUR 3,459.10. Matches the real bank.
7. Status Badge in top bar shows "Reconciled" with green dot.

## 8. Exporting Data
1. User goes to the Settings tab.
2. User taps "Export CSV Report".
3. Loading overlay appears briefly: "Exporting your data..."
4. Android share sheet opens with the generated CSV file attached.
5. User selects "Save to Files" or emails it to themselves.

## 9. Backing Up and Restoring Data
1. User goes to Settings and taps "Backup Data (JSON)".
2. App generates a JSON file. Share sheet opens. User saves to phone storage.
3. Later, user gets a new phone. Installs H-Budget. Completes Onboarding.
4. User goes to Settings and taps "Restore Data (JSON)".
5. Android file picker opens. User selects the backup JSON file.
6. Confirmation dialog: "This will replace ALL current data. This action cannot be undone."
7. User taps `[ Restore ]`.
8. Loading overlay: "Restoring... Please do not close the app."
9. Toast: "Data restored successfully. 47 transactions loaded."
10. Dashboard fully refreshes with restored data.
