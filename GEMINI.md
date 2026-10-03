# Project Guidelines & Rulebook

## Core Mandates
1. **Maintain Text & Typography Consistency**:
   - Ensure all card titles, labels, badges, and section headers use identical HTML semantics and typography styling (e.g., `<h4 className="text-xs font-bold text-[var(--syn-heading)]">` for card headers).
   - Never mix disparate element tags (`span` vs `h4`) or conflicting font-weights/colors for equivalent UI hierarchy levels.

2. **Maintain Design Consistency**:
   - Standardize all card headers (Icon + Title + Tooltip + Link Action), borders, padding, badges, and interactive elements across all views.
   - Maintain uniform grid alignment, layout rhythm, border radiuses, and elevation.

3. **Always Maintain Localization (i18n)**:
   - Never hardcode user-facing strings when adding or modifying features, cards, tooltips, or design elements.
   - Always define translation keys across all supported language dictionaries (`en.ts`, `de.ts`, `es.ts`, `fr.ts`, `hi.ts`, `ja.ts`, `pt.ts`, `zh.ts`) and wrap text with `t("...")`.

4. **Always Follow Design Theme (Synetica Tokens)**:
   - Strictly use Synetica CSS variables: `var(--syn-card)`, `var(--syn-card-inner)`, `var(--syn-card-subtle)`, `var(--syn-border)`, `var(--syn-heading)`, `var(--syn-muted)`, `var(--syn-subtle)`.
   - Ensure flawless high-contrast aesthetics across both Light and Dark modes with zero color drift or un-themed hardcoded values.
