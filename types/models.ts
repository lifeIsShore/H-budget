/**
 * UI-facing shapes matching 04_Data_Model.md. Keep in sync with the real
 * SQLite schema when the data layer is wired — these are what every
 * screen currently imports for its sample data.
 */
export type Transaction = {
  id: string;
  vendor: string | null;
  amount: number; // negative = expense, positive = income
  purpose: string | null;
  category: string | null;
  note?: string | null;
  date: string; // display label for now (e.g. "Today") — real field is ISO
  time?: string;
};

export type Purpose = {
  id: string;
  name: string;
  received: number;
  spent: number;
};
