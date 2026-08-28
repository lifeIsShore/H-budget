# Product Requirements Document

## 1. Product Name
**Working Name:** Expense Ledger (H-Budget)

## 2. The Core Problem
Users receiving money for multiple purposes (e.g., different mentorship groups) currently have to manually reconstruct how much was received, how much was spent, what each expense was for, and what remains.
- **Workflow gap:** Money comes in for Group A and Group B → Everything is deposited into one single physical bank account → Money is spent from that single account → Users must manually comb through bank statements to match expenses to purposes.

## 3. The Solution
A lightweight, offline-first financial ledger that separates **physical money** from **accounting purpose**. It creates a "virtual accounting layer" on top of a single real-world bank account.

## 4. Core Principle
> **One real bank account can contain multiple virtual budgets/purposes inside the app.**

## 5. Key Constraints & Requirements
- **Local-First & Private:** Data must stay strictly on the device. No cloud syncing, no online databases.
- **Platform:** Android-first native app experience, but built with web UI technologies for potential cross-platform use.
- **Lean Philosophy:** Eliminate friction. Adding an expense should take under 5 seconds. Avoid "AI bloat" for the core functionality; prioritize utility and speed.
- **No Emojis:** Strictly no emojis in the app UI, database records, icons, or text fields, as non-standard characters can cause system crashes or database encoding issues. Use standard SVG icons or text labels instead.
- **Manual Entry Focus:** No direct bank connections (Open Banking/PSD2) in V1. The value is in associating spending with a purpose, which requires manual tagging.

## 6. Target Audience & Use Case
Individuals managing operational budgets for distinct groups or projects from a single checking account (e.g., Mentorship coordinators managing High School vs. University funds).
