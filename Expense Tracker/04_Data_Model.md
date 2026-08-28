# Data Model (Offline First)

Since the app must be strictly offline and store data on the device, a relational local database like **SQLite** is ideal for ensuring data integrity, especially for financial calculations and historical edits.

> **CRITICAL: All monetary amounts are stored as INTEGERS in the smallest currency unit (cents). EUR 23.50 is stored as `2350`. This prevents floating-point rounding errors which are unacceptable in a financial application.**

## 1. `transactions` Table
Stores all financial movements (income, expenses, adjustments).
- `id` (TEXT, UUID v4, Primary Key)
- `type` (TEXT, NOT NULL, CHECK IN ('income', 'expense', 'adjustment'))
- `amount` (INTEGER, NOT NULL) - *stored in cents, e.g., 2350 = EUR 23.50*
- `date` (TEXT, NOT NULL) - *ISO 8601 format: "2026-08-28"*
- `vendor` (TEXT, nullable) - *e.g., "Deutsche Bahn". NULL is allowed (rushed entry).*
- `purpose_id` (TEXT, Foreign Key -> purposes.id, nullable) - *NULL means "Unassigned"*
- `category_id` (TEXT, Foreign Key -> categories.id, nullable) - *NULL means uncategorized*
- `note` (TEXT, nullable) - *max ~200 chars, e.g., "Trip to Mannheim"*
- `created_at` (TEXT, NOT NULL) - *ISO 8601 with time: "2026-08-28T14:32:00"*
- `updated_at` (TEXT, NOT NULL) - *updated on every edit*

**Indexes:**
- `idx_transactions_date` on `date` (for grouping by date in Ledger).
- `idx_transactions_purpose` on `purpose_id` (for Purpose balance queries).
- `idx_transactions_type` on `type` (for filtering Income vs Expense).

## 2. `purposes` Table
The "buckets" or distinct funding pools.
- `id` (TEXT, UUID v4, Primary Key)
- `name` (TEXT, NOT NULL, UNIQUE) - *e.g., "High School", "University"*
- `color` (TEXT, nullable) - *hex color for UI chip/card tinting, e.g., "#2563EB"*
- `sort_order` (INTEGER, NOT NULL, DEFAULT 0) - *for consistent display ordering*
- `is_active` (INTEGER, NOT NULL, DEFAULT 1) - *1 = active, 0 = archived (hidden from chips but data preserved)*
- `created_at` (TEXT, NOT NULL)

**Constraints:**
- Cannot delete a purpose if any transactions reference it (`purpose_id`).
- Must always have at least 1 active purpose.

## 3. `categories` Table
The classification of what the expense was for.
- `id` (TEXT, UUID v4, Primary Key)
- `name` (TEXT, NOT NULL, UNIQUE) - *e.g., "Travel", "Food"*
- `sort_order` (INTEGER, NOT NULL, DEFAULT 0)
- `is_active` (INTEGER, NOT NULL, DEFAULT 1)
- `created_at` (TEXT, NOT NULL)

**Constraints:**
- Cannot delete a category if any transactions reference it (`category_id`).

## 4. `settings` Table
App-wide configuration stored as key-value pairs.
- `key` (TEXT, Primary Key)
- `value` (TEXT)

**Required Keys:**
| Key | Value Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `opening_balance` | Integer (cents) | `300000` | The initial bank balance (EUR 3,000.00) |
| `currency` | String | `EUR` | Currency code |
| `currency_symbol` | String | `EUR` | Display symbol (no special characters) |
| `onboarding_completed` | Boolean string | `true` | Whether onboarding was done |
| `app_version` | String | `1.0.0` | For future migration needs |

## 5. `audit_log` Table (Recommended for V1)
Records changes to transactions to maintain a perfect accounting history.
- `id` (TEXT, UUID v4, Primary Key)
- `transaction_id` (TEXT, NOT NULL, Foreign Key -> transactions.id)
- `action` (TEXT, NOT NULL, CHECK IN ('create', 'update', 'delete'))
- `previous_state` (TEXT, nullable) - *JSON snapshot of the transaction before the change (NULL for 'create')*
- `new_state` (TEXT, nullable) - *JSON snapshot after the change (NULL for 'delete')*
- `changed_at` (TEXT, NOT NULL) - *ISO 8601*

## 6. Key Computed Values (NOT stored, calculated via SQL queries)

These values are derived at runtime and never persisted:

| Value | Calculation |
| :--- | :--- |
| Total Available Balance | `opening_balance + SUM(income amounts) - SUM(expense amounts)` |
| Purpose Received | `SUM(amount) WHERE type='income' AND purpose_id = ?` |
| Purpose Spent | `SUM(amount) WHERE type='expense' AND purpose_id = ?` |
| Purpose Net Balance | `Purpose Received - Purpose Spent` |
| Unassigned Count | `COUNT(*) WHERE purpose_id IS NULL` |
| Category Total | `SUM(amount) WHERE type='expense' AND category_id = ?` |
| Vendor Total | `SUM(amount) WHERE type='expense' AND vendor = ?` |

## 7. Default Seed Data

On first launch (after onboarding), the app inserts:

**Purposes (user can modify during onboarding):**
- "High School"
- "University"
- "General"

**Categories (pre-populated, user can edit later):**
- "Travel"
- "Food"
- "Equipment"
- "Software"
- "Other"

## 8. JSON Backup Schema

The JSON export/backup file structure:

```json
{
  "app": "h-budget",
  "version": "1.0.0",
  "exported_at": "2026-08-28T17:00:00",
  "data": {
    "settings": { ... },
    "purposes": [ ... ],
    "categories": [ ... ],
    "transactions": [ ... ]
  }
}
```

On restore, the app validates `app == "h-budget"` and `version` compatibility before proceeding.
