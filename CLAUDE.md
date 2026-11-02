# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a static site with no `package.json`, build step, linter, or test suite. To run it, open `index.html` in a browser (`open index.html` on macOS).

## Architecture

A browser calculator in plain HTML, CSS, and JavaScript. The scripts are classic `<script>` tags, not ES modules, so they share the global scope:

- `esempio.js` holds the pure arithmetic functions. `app.js` uses them without importing them, and reads them while it loads (the `operazioni` table), so `esempio.js` must stay before `app.js` in `index.html`.
- `app.js` holds the calculator state (`corrente`, `precedente`, `operatore`, `nuovoNumero`, `operandoDaRadice`) and one delegated click listener on `.tasti`.
- Buttons in `index.html` declare what they do through `data-cifra`, `data-operatore`, or `data-azione`. The listener dispatches on these attributes, so a new button needs matching handling in `app.js`. A new operator also needs a function in `esempio.js` and an entry in `operazioni`.

Division by zero crosses these layers: `dividi` throws, `calcola` catches the error, resets the state, and writes the message directly to the display. It then returns `false`, which propagates through `scegliOperatore` or `uguale` so the listener skips its usual display update. Without that, the message would be overwritten. The square root of a negative number follows the same path through `applicaRadice`. The root acts immediately on the displayed number, as a `data-azione` rather than an operator; `operandoDaRadice` marks its result as the second operand, so a chained operator computes instead of just replacing the pending operator.

`MAX_CARATTERI` limits both typed input and formatted results to what fits in the display. `formatta` also removes float rounding errors such as `0.1 + 0.2`.

## Conventions

Identifiers, UI text, code comments, and commit messages are in Italian.

JavaScript preferences, from `.claude/skills/preferenze-js/SKILL.md`:

- Use the Temporal API (`Temporal.PlainDate`, `Temporal.PlainDateTime`, `Temporal.ZonedDateTime`) instead of `Date`.
- Use `const` by default and `let` only when needed. Avoid `var`.
- Use arrow functions for anonymous functions.
- Use template literals instead of `+` concatenation.
- Prefer `map`, `filter`, and `reduce` over `for` loops when possible.
- Prefer `async`/`await` over `.then()` and `.catch()`.
