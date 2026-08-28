import type { Transaction, Purpose } from "@/types/models";

/**
 * Single source of sample data for UI development. Every screen imports
 * from here instead of keeping its own local array, so a transaction
 * tapped in the Ledger is the same record the Detail screen looks up.
 * Replace this whole file's role with real SQLite queries in Phase 7 —
 * the shapes in types/models.ts stay the same.
 */

export const samplePurposes: Purpose[] = [
  { id: "1", name: "University", received: 1200, spent: 866.4 },
  { id: "2", name: "High School", received: 800, spent: 537.4 },
  { id: "3", name: "General", received: 300, spent: 34.9 },
];

export const sampleTransactions: (Transaction & { time: string })[] = [
  {
    id: "1",
    vendor: "Deutsche Bahn",
    amount: -23.5,
    purpose: "University",
    category: "Travel",
    note: "Weekend trip to Mannheim",
    date: "Thursday, August 28, 2026",
    time: "14:32",
  },
  {
    id: "2",
    vendor: "Mentorship Grant",
    amount: 500,
    purpose: "University",
    category: null,
    note: null,
    date: "Thursday, August 28, 2026",
    time: "09:10",
  },
  {
    id: "3",
    vendor: null,
    amount: -48.2,
    purpose: null,
    category: "Equipment",
    note: null,
    date: "Thursday, August 28, 2026",
    time: "08:55",
  },
  {
    id: "4",
    vendor: "Copyshop Wagner",
    amount: -12.4,
    purpose: "High School",
    category: "Equipment",
    note: "Printouts for mentoring session",
    date: "Wednesday, August 27, 2026",
    time: "17:02",
  },
  {
    id: "5",
    vendor: "REWE",
    amount: -34.9,
    purpose: "General",
    category: "Food",
    note: null,
    date: "Wednesday, August 27, 2026",
    time: "12:41",
  },
  {
    id: "6",
    vendor: "Kaiserslautern Uni Library",
    amount: -6.0,
    purpose: "University",
    category: "Other",
    note: "Late fee",
    date: "Tuesday, August 26, 2026",
    time: "10:15",
  },
];
