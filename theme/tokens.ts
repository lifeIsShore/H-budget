/**
 * Non-color tokens that don't live in Tailwind (touch targets, icon sizes).
 * Colors/type/radius live in tailwind.config.js — use className, not these,
 * for anything Tailwind already covers. See docs/DESIGN_SYSTEM.md.
 */
export const touchTarget = {
  bottomNavItem: 48,
  actionButton: 52,
  chip: 36,
  listRow: 64,
  closeButton: 48,
} as const;

export const iconSize = {
  bottomNav: 24,
  inline: 20,
  category: 24,
  categoryBg: 40,
} as const;

export const spacing = {
  screenMargin: 16,
  cardPadding: 16,
  cardGap: 12,
  chipGap: 8,
} as const;
