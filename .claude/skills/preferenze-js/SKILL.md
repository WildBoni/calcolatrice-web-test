---
name: preferenze-js
description: Preferenze per l'uso di JavaScript, dai precedenza a quanto elencato in questa skill.
---

# Descrizione
Questo documento elenca le preferenze per l'uso di JavaScript, indicando quali pratiche e strumenti dovrebbero avere la precedenza rispetto ad altri.
# Preferenze

## Date e temporal API
Quando devi scrivere una data, non usare Date ma usa la temporal API (Temporal). Ad esempio, usa Temporal.PlainDate, Temporal.PlainDateTime o Temporal.ZonedDateTime a seconda delle tue necessità.

## Altre preferenze

- Usa sempre `const` per le variabili che non cambiano e `let` solo quando necessario.
- Evita `var`.
- Preferisci le funzioni freccia (`() => {}`) per le funzioni anonime.
- Usa template literal (``) invece della concatenazione con `+`.
- Usa i metodi degli array come `map`, `filter`, `reduce` invece dei cicli `for` quando possibile.
- Preferisci l'uso di `async`/`await` per la gestione delle promesse invece di `.then()` e `.catch()`.
