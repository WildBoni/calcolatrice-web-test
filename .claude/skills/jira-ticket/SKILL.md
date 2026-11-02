---
name: jira-ticket
description: Gestisce l'intero ciclo di un task Jira. Cerca i ticket in TODO raggruppati per utente, effettua il branching, esegue il grilling per creare l'handoff, delega a subagent (test e codice) e chiede il permesso per la PR. Trigger con "avvia ciclo jira" o "inizia flusso ticket".
compatibility: Richiede Jira MCP attivo e accesso a Git locale.
---
# Jira Onboarding - Manuale Operativo

Agisci come l'Orchestratore del Team. Segui rigidamente questa sequenza di step senza saltarne alcuno.

## Step 1: Estrazione e Raggruppamento Ticket
1. Interroga l'MCP di Jira per trovare tutti i ticket nello stato "Da fare" (o equivalente nell'attuale sprint/board) del progetto <ID-PROGETTO>.
2. Estrai gli assegnatari e **raggruppa visivamente i ticket per Utente e per priorità** (es. "Assegnati a [Nome]: [ID-Ticket] - [Titolo] - [Priorità]").
3. Chiedi esplicitamente all'utente quale ID ticket intende avviare.

## Step 2: Branching Git
1. Ricevuto l'ID del ticket, estrai i dettagli completi del ticket da Jira tramite MCP.
2. Assicurati di avere un ambiente Git pulito prima di creare il branch.
3. Se l'ambiente non è pulito, chiedi all'utente di fare il commit o lo stash delle modifiche prima di procedere.
4. Assegna il ticket all'utente corrente in Jira tramite MCP.
5. Sposta il ticket nello stato appropriato in Jira tramite MCP (es. "In Progress").
6. Crea un branch Git locale seguendo la convenzione: `feature/[ID-TICKET]-[titolo-in-kebab-case]`.
7. Spostati sul nuovo branch.

## Step 3: Sessione di Grilling e Sistema di Handoff
1. Avvia una sessione di domande serrate ("grilling") con l'utente per estrarre i requisiti tecnici e i dettagli implementativi del ticket. Ponigli al massimo 3 o 4 domande mirate.
2. Una volta terminata la sessione, consolida tutte le decisioni architetturali, i requisiti e l'interfaccia nel file locale temporaneo `SPEC_HANDOFF.md`.
3. Il file `SPEC_HANDOFF.md` fungerà da contratto e sistema di handoff strutturato per gli agenti che seguiranno.

## Step 4: Delegazione ai Subagent
1. **Scrittura dei Test (QA Agent)**: Invoca il subagent `qa-engineer` (`.claude/agents/qa-engineer.md`). Passagli il contesto di `SPEC_HANDOFF.md` e ordinagli di scrivere esclusivamente i test per il task.
2. **Scrittura del Codice (Dev Agent)**: Al ritorno del QA Agent, invoca il subagent `software-developer` (`.claude/agents/software-developer.md`). Passagli sia `SPEC_HANDOFF.md` che i test appena generati, ordinando di implementare il codice applicativo finché i test non passano (o finché la logica non è completa).

## Step 5: Verifica Finale e Richiesta di PR
1. Raccogli i risultati dei due subagent. Mostra all'utente un riepilogo dei file modificati e creati.
2. Rimuovi o archivia il file temporaneo `SPEC_HANDOFF.md` se non più necessario.
3. **Blocco di Sicurezza**: Chiedi esplicitamente all'utente: *"Ho completato lo sviluppo e i test. Mi dai il permesso di aprire una Pull Request su GitHub/GitLab per questo task?"*. Non procedere oltre senza la sua conferma scritta.

## Step 6: Chiusura del Ciclo
1. Una volta ottenuta la conferma dell'utente per la Pull Request, procedi con l'apertura della PR su GitHub/GitLab.
2. Aggiorna lo stato del ticket in Jira tramite MCP, spostandolo nello stato appropriato (es. "In Review").
3. Registra eventuali note o commenti rilevanti sul ticket per mantenere tracciabilità e contesto.
4. Termina il ciclo e attendi il prossimo comando dell'utente.