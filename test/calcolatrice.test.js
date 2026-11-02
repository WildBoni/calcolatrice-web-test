const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { creaCalcolatrice, leggiScript } = require("./helper.js");

describe("struttura di index.html", () => {
    test("esempio.js è caricato prima di app.js", () => {
        const script = leggiScript();
        assert.ok(script.indexOf("esempio.js") >= 0);
        assert.ok(script.indexOf("esempio.js") < script.indexOf("app.js"));
    });
    test("ogni bottone dichiara esattamente un attributo data-*", () => {
        creaCalcolatrice().bottoni.forEach((b) => {
            const chiavi = Object.keys(b.dataset).filter((k) => ["cifra", "operatore", "azione"].includes(k));
            assert.equal(chiavi.length, 1, `bottone "${b.testo}"`);
        });
    });
    test("sono presenti tutte le cifre, 4 operatori e le azioni attese", () => {
        const { bottoni } = creaCalcolatrice();
        const valori = (k) => bottoni.map((b) => b.dataset[k]).filter((v) => v !== undefined).sort();
        assert.deepEqual(valori("cifra"), ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
        assert.deepEqual(valori("operatore"), ["*", "+", "-", "/"]);
        assert.deepEqual(valori("azione"), ["cancella", "punto", "radice", "uguale"]);
    });
    test("il listener è registrato e ignora click fuori dai bottoni", () => {
        const c = creaCalcolatrice();
        assert.ok(c.haListener());
        c.clicSuNonBottone();
        assert.equal(c.testo(), "0");
    });
});

describe("gestione di ogni bottone", () => {
    test("ogni cifra aggiorna il display", () => {
        creaCalcolatrice().bottoni
            .filter((b) => b.dataset.cifra !== undefined)
            .forEach((b) => {
                const c = creaCalcolatrice();
                c.clicca(b);
                assert.equal(c.testo(), b.dataset.cifra);
            });
    });
    test("ogni operatore è gestito e produce il risultato corretto", () => {
        const attesi = { "+": "8", "-": "4", "*": "12", "/": "3" };
        creaCalcolatrice().bottoni
            .filter((b) => b.dataset.operatore !== undefined)
            .forEach((b) => {
                const c = creaCalcolatrice();
                c.premi("6");
                c.clicca(b);
                c.premi("2", "=");
                const atteso = { "+": "8", "-": "4", "*": "12", "/": "3" }[b.dataset.operatore];
                assert.equal(c.testo(), atteso, `operatore ${b.dataset.operatore}`);
            });
        assert.deepEqual(Object.keys(attesi).sort(), ["*", "+", "-", "/"]);
    });
    test("ogni operatore ha una funzione nella tabella operazioni", () => {
        const c = creaCalcolatrice();
        c.bottoni
            .filter((b) => b.dataset.operatore !== undefined)
            .forEach((b) => {
                const tipo = c.costante(`typeof operazioni[${JSON.stringify(b.dataset.operatore)}]`);
                assert.equal(tipo, "function", b.dataset.operatore);
            });
    });
    test("ogni azione cambia lo stato o il display in modo osservabile", () => {
        const c = creaCalcolatrice();
        c.premi("5");
        c.premi(".");
        assert.equal(c.testo(), "5.");
        c.premi("+", "3", "=");
        assert.equal(c.testo(), "8");
        c.premi("C");
        assert.equal(c.testo(), "0");
    });
});

describe("digitazione", () => {
    test("stato iniziale", () => {
        const c = creaCalcolatrice();
        assert.equal(c.testo(), "0");
        assert.deepEqual({ ...c.stato() }, { corrente: "0", precedente: null, operatore: null, nuovoNumero: true });
    });
    test("più cifre si accodano", () => {
        const c = creaCalcolatrice();
        c.digita("123");
        assert.equal(c.testo(), "123");
    });
    test("lo zero iniziale viene sostituito", () => {
        const c = creaCalcolatrice();
        c.digita("007");
        assert.equal(c.testo(), "7");
    });
    test("lo zero da solo resta 0", () => {
        const c = creaCalcolatrice();
        c.digita("0");
        assert.equal(c.testo(), "0");
    });
    test("il punto decimale si aggiunge una sola volta", () => {
        const c = creaCalcolatrice();
        c.digita("1.2.3");
        assert.equal(c.testo(), "1.23");
    });
    test("il punto su display nuovo produce 0.", () => {
        const c = creaCalcolatrice();
        c.premi(".");
        assert.equal(c.testo(), "0.");
        c.premi("5");
        assert.equal(c.testo(), "0.5");
    });
    test("il punto dopo un operatore inizia un nuovo numero 0.", () => {
        const c = creaCalcolatrice();
        c.premi("5", "+", ".", "5", "=");
        assert.equal(c.testo(), "5.5");
    });
    test("0.5 + 0.5 = 1", () => {
        const c = creaCalcolatrice();
        c.digita("0.5");
        c.premi("+");
        c.digita("0.5");
        c.premi("=");
        assert.equal(c.testo(), "1");
    });
});

describe("operazioni", () => {
    const casi = [
        ["12", "+", "30", "42"],
        ["50", "-", "8", "42"],
        ["6", "*", "7", "42"],
        ["84", "/", "2", "42"],
        ["5", "-", "9", "-4"],
        ["7", "/", "2", "3.5"],
        ["1.5", "*", "2", "3"],
        ["0", "*", "9", "0"],
    ];
    casi.forEach(([a, op, b, atteso]) =>
        test(`${a} ${op} ${b} = ${atteso}`, () => {
            const c = creaCalcolatrice();
            c.digita(a);
            c.premi(op);
            c.digita(b);
            c.premi("=");
            assert.equal(c.testo(), atteso);
        })
    );

    test("dopo l'operatore il display mostra ancora il primo operando", () => {
        const c = creaCalcolatrice();
        c.digita("12");
        c.premi("+");
        assert.equal(c.testo(), "12");
        assert.equal(c.stato().precedente, 12);
        assert.equal(c.stato().operatore, "+");
    });
    test("dopo = lo stato è ripulito dall'operazione", () => {
        const c = creaCalcolatrice();
        c.premi("2", "+", "3", "=");
        const s = c.stato();
        assert.equal(s.precedente, null);
        assert.equal(s.operatore, null);
        assert.equal(s.nuovoNumero, true);
    });
    test("= senza operatore non cambia il display", () => {
        const c = creaCalcolatrice();
        c.digita("42");
        c.premi("=");
        assert.equal(c.testo(), "42");
    });
    test("= a calcolatrice appena aperta lascia 0", () => {
        const c = creaCalcolatrice();
        c.premi("=");
        assert.equal(c.testo(), "0");
    });
    test("dopo = una nuova cifra inizia un nuovo numero", () => {
        const c = creaCalcolatrice();
        c.premi("2", "+", "3", "=", "9");
        assert.equal(c.testo(), "9");
    });
    test("dopo = si può proseguire con un operatore sul risultato", () => {
        const c = creaCalcolatrice();
        c.premi("2", "+", "3", "=", "*", "4", "=");
        assert.equal(c.testo(), "20");
    });
});

describe("operazioni concatenate", () => {
    test("2 + 3 + 4 = 9 (risultato intermedio mostrato al secondo operatore)", () => {
        const c = creaCalcolatrice();
        c.premi("2", "+", "3", "+");
        assert.equal(c.testo(), "5");
        c.premi("4", "=");
        assert.equal(c.testo(), "9");
    });
    test("valutazione da sinistra a destra: 2 + 3 * 4 = 20", () => {
        const c = creaCalcolatrice();
        c.premi("2", "+", "3", "*", "4", "=");
        assert.equal(c.testo(), "20");
    });
    test("catena mista: 10 - 4 / 2 = 3", () => {
        const c = creaCalcolatrice();
        c.premi("1", "0", "-", "4", "/", "2", "=");
        assert.equal(c.testo(), "3");
    });
    test("cambiare operatore senza digitare un secondo numero usa l'ultimo scelto", () => {
        const c = creaCalcolatrice();
        c.premi("5", "+", "*", "3", "=");
        assert.equal(c.testo(), "15");
    });
});

describe("cancella (C)", () => {
    test("riporta display e stato ai valori iniziali", () => {
        const c = creaCalcolatrice();
        c.premi("9", "*", "8", "C");
        assert.equal(c.testo(), "0");
        assert.deepEqual({ ...c.stato() }, { corrente: "0", precedente: null, operatore: null, nuovoNumero: true });
    });
    test("dopo C si può iniziare un nuovo calcolo", () => {
        const c = creaCalcolatrice();
        c.premi("9", "*", "C", "2", "+", "2", "=");
        assert.equal(c.testo(), "4");
    });
});

describe("divisione per zero", () => {
    test("mostra il messaggio di errore", () => {
        const c = creaCalcolatrice();
        c.premi("5", "/", "0", "=");
        assert.equal(c.testo(), "Errore: ÷ 0");
    });
    test("il messaggio non viene sovrascritto e lo stato è azzerato", () => {
        const c = creaCalcolatrice();
        c.premi("5", "/", "0", "=");
        assert.deepEqual({ ...c.stato() }, { corrente: "0", precedente: null, operatore: null, nuovoNumero: true });
    });
    test("l'errore si propaga anche da un operatore concatenato", () => {
        const c = creaCalcolatrice();
        c.premi("5", "/", "0", "+");
        assert.equal(c.testo(), "Errore: ÷ 0");
        assert.equal(c.stato().operatore, null);
    });
    test("0 / 5 non è un errore", () => {
        const c = creaCalcolatrice();
        c.premi("0", "/", "5", "=");
        assert.equal(c.testo(), "0");
    });
    test("dopo l'errore la prossima cifra ripristina il display", () => {
        const c = creaCalcolatrice();
        c.premi("5", "/", "0", "=", "7");
        assert.equal(c.testo(), "7");
    });
    test("dividere per 0.0 è un errore", () => {
        const c = creaCalcolatrice();
        c.premi("5", "/", "0", ".", "0", "=");
        assert.equal(c.testo(), "Errore: ÷ 0");
    });
});

describe("radice quadrata", () => {
    test("calcola subito la radice del numero sul display", () => {
        const c = creaCalcolatrice();
        c.digita("16");
        c.premi("√");
        assert.equal(c.testo(), "4");
    });
    test("la radice di 0 è 0", () => {
        const c = creaCalcolatrice();
        c.premi("√");
        assert.equal(c.testo(), "0");
    });
    test("il risultato irrazionale rientra nel limite del display", () => {
        const c = creaCalcolatrice();
        c.premi("2", "√");
        assert.ok(c.testo().length <= 14, c.testo());
        assert.ok(c.testo().startsWith("1.41421356"));
    });
    test("si può applicare due volte di seguito", () => {
        const c = creaCalcolatrice();
        c.digita("16");
        c.premi("√", "√");
        assert.equal(c.testo(), "2");
    });
    test("dopo la radice una nuova cifra inizia un nuovo numero", () => {
        const c = creaCalcolatrice();
        c.premi("9", "√", "7");
        assert.equal(c.testo(), "7");
    });
    test("si applica al secondo operando: 9 + √16 = 13", () => {
        const c = creaCalcolatrice();
        c.premi("9", "+");
        c.digita("16");
        c.premi("√");
        assert.equal(c.testo(), "4");
        c.premi("=");
        assert.equal(c.testo(), "13");
    });
    test("con un operatore concatenato non perde il primo operando: 9 + √16 + 1 = 14", () => {
        const c = creaCalcolatrice();
        c.premi("9", "+");
        c.digita("16");
        c.premi("√", "+");
        assert.equal(c.testo(), "13");
        c.premi("1", "=");
        assert.equal(c.testo(), "14");
    });
    test("un secondo operatore dopo la concatenazione sostituisce solo l'operatore", () => {
        const c = creaCalcolatrice();
        c.premi("9", "+", "4", "√", "+", "*", "2", "=");
        assert.equal(c.testo(), "22");
    });
    test("si applica al risultato di un'operazione", () => {
        const c = creaCalcolatrice();
        c.premi("8", "+", "8", "=", "√");
        assert.equal(c.testo(), "4");
    });
    test("una cifra dopo la radice sostituisce il secondo operando", () => {
        const c = creaCalcolatrice();
        c.premi("9", "+", "4", "√", "5", "=");
        assert.equal(c.testo(), "14");
    });
    test("su un numero negativo mostra l'errore e azzera lo stato", () => {
        const c = creaCalcolatrice();
        c.premi("3", "-", "7", "=", "√");
        assert.equal(c.testo(), "Errore: √ < 0");
        assert.deepEqual({ ...c.stato() }, { corrente: "0", precedente: null, operatore: null, nuovoNumero: true });
        c.premi("7");
        assert.equal(c.testo(), "7");
    });
    test("C dopo la radice non lascia operandi in sospeso", () => {
        const c = creaCalcolatrice();
        c.premi("9", "+", "4", "√", "C", "2", "+", "3", "=");
        assert.equal(c.testo(), "5");
    });
});

describe("limite MAX_CARATTERI", () => {
    test("MAX_CARATTERI vale 14", () => {
        assert.equal(creaCalcolatrice().costante("MAX_CARATTERI"), 14);
    });
    test("le cifre digitate oltre il limite sono ignorate", () => {
        const c = creaCalcolatrice();
        c.digita("1".repeat(20));
        assert.equal(c.testo(), "1".repeat(14));
    });
    test("il punto non supera il limite", () => {
        const c = creaCalcolatrice();
        c.digita("1".repeat(14));
        c.premi(".");
        assert.equal(c.testo(), "1".repeat(14));
    });
    test("ogni risultato rientra nel limite del display", () => {
        const c = creaCalcolatrice();
        c.digita("9".repeat(14));
        c.premi("*");
        c.digita("9".repeat(14));
        c.premi("=");
        assert.ok(c.testo().length <= 14, `lungo ${c.testo().length}: ${c.testo()}`);
    });
    test("1 / 3 rientra nel limite", () => {
        const c = creaCalcolatrice();
        c.premi("1", "/", "3", "=");
        assert.ok(c.testo().length <= 14, c.testo());
        assert.ok(c.testo().startsWith("0.333333"));
    });
    test("numero enorme usa la notazione esponenziale", () => {
        const c = creaCalcolatrice();
        c.digita("9".repeat(14));
        c.premi("*");
        c.digita("9".repeat(14));
        c.premi("=");
        assert.match(c.testo(), /e\+/);
    });
});

describe("errori di arrotondamento float", () => {
    test("0.1 + 0.2 = 0.3", () => {
        const c = creaCalcolatrice();
        c.digita("0.1");
        c.premi("+");
        c.digita("0.2");
        c.premi("=");
        assert.equal(c.testo(), "0.3");
    });
    test("0.3 - 0.1 = 0.2", () => {
        const c = creaCalcolatrice();
        c.digita("0.3");
        c.premi("-");
        c.digita("0.1");
        c.premi("=");
        assert.equal(c.testo(), "0.2");
    });
    test("1.1 * 3 = 3.3", () => {
        const c = creaCalcolatrice();
        c.digita("1.1");
        c.premi("*");
        c.premi("3", "=");
        assert.equal(c.testo(), "3.3");
    });
    test("formatta riduce le cifre per stare nel display", () => {
        const { contesto } = creaCalcolatrice();
        assert.equal(contesto.formatta(0.1 + 0.2), "0.3");
        assert.ok(contesto.formatta(1 / 3).length <= 14);
        assert.equal(contesto.formatta(42), "42");
    });
});
