# MVP Features (V1)

## 1. Dashboard
- **Current Balance:** The total calculated money available.
- **Summary Metrics:** Total Money Received vs. Total Money Spent.
- **Purpose Breakdown:** A list showing how much remains in each bucket (e.g., [University]: €340, [High School]: €275).
- **Recent Transactions List:** The last 5-10 transactions for quick review.
- **Action Required Alert:** Banner for transactions that lack a purpose ("Unassigned").

## 2. Frictionless Quick-Add (Income / Expense)
- **Income Form:** Amount, Date, Source, Purpose (Bucket).
- **Expense Form:** Amount, Date, Vendor (Who), Category, Purpose, Note.
- *Crucial UX:* The form should auto-focus the amount field, allow rapid keyboard entry, and support saving with partial information.

## 3. Transaction Ledger
- A searchable, scrollable list of all transactions.
- Filters: Date range, Purpose, Category.
- Non-destructive Editing: Ability to edit a transaction (amount, purpose, category) and have balances cleanly recalculate.
- Deletion with confirmation ("This will change your remaining balance by X. Are you sure?").

## 4. Customizable Tags/Taxonomy
- **Purposes:** User can define their own tracking buckets (High School, University, General).
- **Categories:** User can define expense types (Travel, Food, Equipment).

## 5. Question-Driven Statistics
Instead of generic pie charts, explicitly answer these questions:
- *Where did the money go?* (Spending aggregated by Category)
- *Who did I spend it on?* (Spending aggregated by Vendor)
- *What was it for?* (Spending aggregated by Purpose)
- *How much did each program consume?* (Income vs. Spent per Purpose)

## 6. Settings & Data Management
- Opening balance adjustment.
- Currency selection (defaults to EUR €).
- Manage Tags/Categories.
- **Export Data (CSV/JSON):** Export all ledger data to CSV (for spreadsheet viewing) or JSON (for data backup).
- **Import / Restore Data (JSON):** Ability to import a previously backed-up JSON file to restore all transactions, purposes, and categories when reinstalling or changing phones.
