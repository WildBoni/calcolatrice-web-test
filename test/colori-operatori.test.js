const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const radice = path.join(__dirname, "..");
const leggi = (nome) => fs.readFileSync(path.join(radice, nome), "utf8");

const css = leggi("style.css");
const html = leggi("index.html");

const sfuma = (testo) => testo.replace(/\/\*[\s\S]*?\*\//g, "");

// Restituisce il corpo della regola con selettore esatto, o null se assente.
const corpoRegola = (selettore) => {
    const escapato = selettore.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const corrispondenza = new RegExp(`(?:^|})\\s*${escapato}\\s*\\{([^}]*)\\}`).exec(sfuma(css));
    return corrispondenza ? corrispondenza[1] : null;
};

// Legge il valore di una proprieta' in un corpo di regola.
const proprieta = (corpo, nome) => {
    const corrispondenza = new RegExp(`(?:^|[;\\s])${nome}\\s*:\\s*([^;]+?)\\s*(?:;|$)`, "i").exec(corpo);
    return corrispondenza ? corrispondenza[1].trim().toLowerCase() : null;
};

// Estrae i bottoni da index.html con le loro classi.
const bottoni = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(([, attributi, testo]) => {
    const classi = (/class="([^"]*)"/.exec(attributi)?.[1] ?? "").split(/\s+/).filter(Boolean);
    return { classi, testo: testo.trim() };
});
const trovaPerTesto = (testo) => bottoni.find((b) => b.testo === testo);

describe("colori dei tasti operatore (ECT-2)", () => {
    test(":root definisce --color-blu-operatore con valore #1a56db", () => {
        const radiceCss = corpoRegola(":root");
        assert.ok(radiceCss, "regola :root non trovata");
        assert.equal(proprieta(radiceCss, "--color-blu-operatore"), "#1a56db");
    });

    test("la regola .operatore usa var(--color-blu-operatore) come background", () => {
        const corpo = corpoRegola(".operatore");
        assert.ok(corpo, "regola .operatore non trovata");
        assert.equal(proprieta(corpo, "background"), "var(--color-blu-operatore)");
    });

    test("la regola .operatore mantiene il testo bianco #fff", () => {
        const corpo = corpoRegola(".operatore");
        assert.ok(corpo, "regola .operatore non trovata");
        assert.equal(proprieta(corpo, "color"), "#fff");
    });

    test("la regola .operatore non contiene piu' il verde #15803d", () => {
        const corpo = corpoRegola(".operatore");
        assert.ok(corpo, "regola .operatore non trovata");
        assert.doesNotMatch(corpo, /#15803d/i);
    });

    test("la regola .azione ha ancora background #dc2626", () => {
        const corpo = corpoRegola(".azione");
        assert.ok(corpo, "regola .azione non trovata");
        assert.equal(proprieta(corpo, "background"), "#dc2626");
    });

    describe("classi dei tasti in index.html", () => {
        ["÷", "×", "−", "+", "√", "="].forEach((simbolo) => {
            test(`il tasto ${simbolo} ha la classe operatore`, () => {
                const bottone = trovaPerTesto(simbolo);
                assert.ok(bottone, `tasto ${simbolo} non trovato in index.html`);
                assert.ok(bottone.classi.includes("operatore"));
            });
        });

        test("il tasto C ha la classe azione e non operatore", () => {
            const bottone = trovaPerTesto("C");
            assert.ok(bottone, "tasto C non trovato in index.html");
            assert.ok(bottone.classi.includes("azione"));
            assert.ok(!bottone.classi.includes("operatore"));
        });

        test("esattamente sei tasti hanno la classe operatore", () => {
            assert.equal(bottoni.filter((b) => b.classi.includes("operatore")).length, 6);
        });
    });
});
