const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { creaCalcolatrice } = require("./helper.js");

const { contesto } = creaCalcolatrice();
const { aggiungi, sottrai, moltiplica, dividi, radiceQuadrata } = contesto;

describe("funzioni aritmetiche", () => {
    test("aggiungi somma due numeri", () => {
        assert.equal(aggiungi(2, 3), 5);
        assert.equal(aggiungi(-2, 3), 1);
        assert.equal(aggiungi(0, 0), 0);
    });
    test("sottrai calcola la differenza", () => {
        assert.equal(sottrai(5, 3), 2);
        assert.equal(sottrai(3, 5), -2);
    });
    test("moltiplica calcola il prodotto", () => {
        assert.equal(moltiplica(4, 3), 12);
        assert.equal(moltiplica(-4, 3), -12);
        assert.equal(moltiplica(5, 0), 0);
    });
    test("dividi calcola il quoziente", () => {
        assert.equal(dividi(10, 4), 2.5);
        assert.equal(dividi(-9, 3), -3);
        assert.equal(dividi(0, 5), 0);
    });
    test("dividi lancia un errore con divisore zero", () => {
        assert.throws(() => dividi(5, 0), /Divisione per zero/);
    });
    test("radiceQuadrata calcola la radice", () => {
        assert.equal(radiceQuadrata(16), 4);
        assert.equal(radiceQuadrata(0), 0);
        assert.equal(radiceQuadrata(2.25), 1.5);
    });
    test("radiceQuadrata lancia un errore con un numero negativo", () => {
        assert.throws(() => radiceQuadrata(-1), /numero negativo/);
    });
    test("le funzioni mantengono l'errore float grezzo (la pulizia spetta a formatta)", () => {
        assert.notEqual(aggiungi(0.1, 0.2), 0.3);
    });
});
