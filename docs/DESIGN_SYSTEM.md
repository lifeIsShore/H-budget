# H-Budget — Visual Design System

This supersedes the palette/type tokens in `Expense Tracker/05_UI_UX_Specification.md`
(section 1). Every layout, component spec, screen flow, interaction, and state
in that document stays exactly as written — only the color, type, and shape
tokens change. Reasoning below.

## Why deviate from the original palette

The original spec (`#2563EB` blue primary, `#16A34A`/`#DC2626` green/red,
system-default Roboto, 12dp rounded everywhere) is a fine, safe choice — but
it is also the single most common "fintech app" template in circulation right
now. It reads as generated rather than designed. Since this is a tool you'll
open every day, it's worth having an identity that's actually its own.

## Direction: Ledger / Passbook

H-Budget's whole premise is a paper ledger's logic (separate purposes inside
one account) reimplemented digitally. The visual identity leans into that
directly instead of defaulting to generic-SaaS-fintech-blue:

- **Tabular monospace numerals for every amount** — hero balance, list rows,
  stats. This is the signature element: money is set in a mono ledger face so
  columns of numbers actually align, the way a real ledger or bank passbook
  reads. It's functional (digit widths line up) and it's the one thing that
  makes this app visually unmistakable from a generic list-of-cards app.
- **Ink-on-paper base**, not cool SaaS gray or Claude-adjacent cream. Near-black
  charcoal text on a barely-warm off-white, closer to a printed statement than
  a screen.
- **Charcoal ink as the primary action color**, not blue. Buttons, active nav,
  selected states are near-black, not saturated blue — it reads as
  restrained/serious rather than "app."
- **A single brass/antique-gold accent**, used sparingly (focus rings,
  selected-chip underline, the divider under the hero balance) — the one
  spot of color the eye is drawn to, rather than color everywhere.
- **Desaturated, muted income/expense colors** instead of bright
  stoplight green/red — still instantly legible as positive/negative, but
  not neon.
- **Hairline rules over shadows.** Ledger paper uses printed lines, not drop
  shadows. Shadows are reserved for things that are genuinely floating above
  the page (sheets, dialogs) — cards and rows use 1px borders instead.
- **Tighter corner radii** than the original spec (6–8dp vs 12dp) — crisper,
  more "printed form," less "rounded app bubble."

## Color tokens

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `bg` | `#FAF9F6` | App background — barely-warm paper white |
| `surface` | `#FFFFFF` | Cards, sheets, modals |
| `surface-alt` | `#F1EFE8` | Section headers, input backgrounds, sticky bars |
| `ink` | `#1C1B19` | Primary text, amounts, headlines |
| `ink-muted` | `#6B6659` | Labels, subtext, timestamps |
| `ink-faint` | `#A39D8E` | Placeholder text, disabled |
| `border` | `#E4E1D8` | Hairlines, dividers, input outlines |
| `brand` | `#22211F` | Primary buttons, active nav, selected fills (near-black ink, not blue) |
| `brand-subtle` | `#E7E5DE` | Selected chip background (neutral, not blue tint) |
| `accent` | `#9C7A3C` | Signature accent — focus rings, hero-balance underline, active tab indicator. Used sparingly, never as a fill |
| `positive` | `#3F7A5C` | Income amounts, positive balance (muted forest, not stoplight green) |
| `positive-subtle` | `#E4EEE7` | Income badge backgrounds |
| `negative` | `#B5473A` | Expense amounts, negative balance, delete (muted brick, not stoplight red) |
| `negative-subtle` | `#F3E3E0` | Expense badge backgrounds |
| `warning` | `#B8862E` | Unassigned-transaction alert |
| `warning-subtle` | `#F5EBD7` | Warning banner fill |
| `overlay` | `#1C1B1966` | Dimmed background behind sheets/modals |

## Typography

| Role | Face | Size | Weight |
| :--- | :--- | :--- | :--- |
| Hero balance / hero input | IBM Plex Mono | 34sp | Medium, tabular numerals |
| List / row amounts | IBM Plex Mono | 15sp | Medium, tabular numerals |
| Screen title | IBM Plex Sans | 20sp | SemiBold |
| Section header | IBM Plex Sans | 15sp | SemiBold |
| Card / row title | IBM Plex Sans | 15sp | Medium |
| Body | IBM Plex Sans | 14sp | Regular |
| Label | IBM Plex Sans | 12.5sp | Regular, letter-spacing +0.2 |
| Caption | IBM Plex Sans | 12sp | Medium |
| Micro | IBM Plex Sans | 10.5sp | Regular |

Why this pairing: same type family (Plex) in two optical roles is a
deliberate, coherent system rather than a random display/body mashup — and
using the mono cut specifically for money is the functional justification,
not decoration. Falls back to system monospace/sans if fonts fail to load —
never silently substitutes Inter as a stand-in.

## Shape & elevation

- Card / row radius: 8dp (was 12dp)
- Primary button radius: 8dp (was 12dp)
- Chip radius: fully rounded — kept, chips read correctly as pills
- Input radius: 6dp (was 8dp)
- Bottom sheet top corners: 20dp (kept — softer for the overlay layer specifically)
- Dialog radius: 10dp (was 16dp)
- Elevation: cards and list rows use a 1px `border` hairline, no shadow. Only
  sheets and dialogs get a soft shadow, since those are the only elements
  actually floating above the page.

## What stays exactly as specified

Layouts, spacing scale (16/12/8dp), touch target minimums, icon set
(Material Icons Outlined, no emoji), component behavior, screen flows, the
full state matrix, and the button/interaction table in
`05_UI_UX_Specification.md` are unchanged — this document only replaces
section 1 (Design System) of that spec.
