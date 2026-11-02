// Helper: carica esempio.js e app.js in un contesto vm con un DOM finto minimale.
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

const radice = path.join(__dirname, "..");
const leggi = (nome) => fs.readFileSync(path.join(radice, nome), "utf8");

// Estrae i bottoni reali da index.html con i relativi attributi data-*.
const leggiBottoni = () => {
    const html = leggi("index.html");
    const bottoni = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
    return bottoni.map(([, attributi, testo]) => {
        const dataset = Object.fromEntries(
            [...attributi.matchAll(/data-([\w-]+)="([^"]*)"/g)].map(([, nome, valore]) => [nome, valore])
        );
        return { dataset, testo: testo.trim() };
    });
};

// Ordine di caricamento degli script secondo index.html.
const leggiScript = () =>
    [...leggi("index.html").matchAll(/<script\s+src="([^"]+)"/g)].map(([, src]) => src);

// Crea una calcolatrice nuova (stato pulito) e restituisce un'API di test.
const creaCalcolatrice = () => {
    const bottoni = leggiBottoni();
    const display = { textContent: "0" };
    const listener = { click: null };
    const tasti = {
        addEventListener: (tipo, fn) => {
            listener[tipo] = fn;
        },
    };
    const contesto = vm.createContext({
        document: {
            getElementById: (id) => (id === "display" ? display : null),
            querySelector: (selettore) => (selettore === ".tasti" ? tasti : null),
        },
    });
    leggiScript().forEach((src) => vm.runInContext(leggi(src), contesto, { filename: src }));

    const clicca = (bottone) => {
        const tasto = { dataset: bottone.dataset, closest: (s) => (s === "button" ? tasto : null) };
        listener.click({ target: tasto });
    };
    const trova = (attributo, valore) => {
        const bottone = bottoni.find((b) => b.dataset[attributo] === valore);
        if (!bottone) {
            throw new Error(`Bottone data-${attributo}="${valore}" non trovato in index.html`);
        }
        return bottone;
    };
    const premi = (...tasti) =>
        tasti.forEach((t) => {
            if (/^\d$/.test(t)) return clicca(trova("cifra", t));
            if (t === ".") return clicca(trova("azione", "punto"));
            if (t === "=") return clicca(trova("azione", "uguale"));
            if (t === "C") return clicca(trova("azione", "cancella"));
            if (t === "√") return clicca(trova("azione", "radice"));
            return clicca(trova("operatore", t));
        });
    // Digita un numero cifra per cifra (es. "12.5").
    const digita = (testo) => premi(...testo.split(""));

    return {
        contesto,
        bottoni,
        display,
        clicca,
        premi,
        digita,
        // Legge variabili const/let top-level (non proprietà del contesto).
        stato: () => vm.runInContext("({ corrente, precedente, operatore, nuovoNumero })", contesto),
        costante: (nome) => vm.runInContext(nome, contesto),
        testo: () => display.textContent,
        haListener: () => typeof listener.click === "function",
        clicSuNonBottone: () => listener.click({ target: { closest: () => null } }),
    };
};

module.exports = { creaCalcolatrice, leggiBottoni, leggiScript };
