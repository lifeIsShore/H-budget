# Future Ideas (V2 & V3)

These features are explicitly excluded from V1 to keep the initial build lean and fast, but the V1 architecture (SQLite, Expo) is designed to easily support them later.

## V2: Quality of Life Improvements
- **Recurring Transactions:** Set up €500 Income for "High School" to appear as *Expected* every 1st of the month, requiring only a single tap to mark as *Received*.
- **Receipt Attachments:** Take a photo of a physical receipt and attach it to a transaction row in the local database.
- **Budget Periods:** Group statistics and balances by month (e.g., "August Budget" vs "September Budget") instead of a continuous running total.
- **Bank Reconciliation Helper:** A specific UI mode at the end of the month that lets you check off transactions one by one against your bank statement.

## V3: Intelligence & Automation (Optional)
- **Natural Language Parsing (On-Device):**
  - Use a small local NLP model so the user can just type: *"Spent 42 euros at DB yesterday for university"* into a single text box, and the app automatically fills the Quick-Add fields.
- **Smart Categorization:**
  - As the local database grows, if the user types "Lidl", the app auto-suggests Category: *Food* and Purpose: *High School* based on their historical behavior, requiring zero manual tagging.
- **AI Financial Summaries:**
  - At the end of the month, generate a textual report: *"You received €2,000 and spent €1,247. University-related expenses accounted for €482..."*
