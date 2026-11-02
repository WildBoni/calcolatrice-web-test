const MAX_CARATTERI = 14;

const operazioni = {
    "+": aggiungi,
    "-": sottrai,
    "*": moltiplica,
    "/": dividi,
};

const display = document.getElementById("display");

let corrente = "0";
let precedente = null;
let operatore = null;
let nuovoNumero = true;
// Il risultato di una radice è il secondo operando anche se nuovoNumero è true
let operandoDaRadice = false;

function formatta(numero) {
    // Elimina gli errori di arrotondamento dei float (es. 0.1 + 0.2)
    // e riduce le cifre decimali solo quanto basta per stare nel display
    for (let cifre = 15; cifre >= 7; cifre--) {
        const testo = String(Number(numero.toPrecision(cifre)));
        if (testo.length <= MAX_CARATTERI) {
            return testo;
        }
    }
    return numero.toExponential(6);
}

function cancella() {
    corrente = "0";
    precedente = null;
    operatore = null;
    nuovoNumero = true;
    operandoDaRadice = false;
}

function inserisciCifra(cifra) {
    if (nuovoNumero || corrente === "0") {
        corrente = cifra;
        nuovoNumero = false;
    } else if (corrente.length < MAX_CARATTERI) {
        corrente += cifra;
    }
}

function inserisciPunto() {
    if (nuovoNumero) {
        corrente = "0.";
        nuovoNumero = false;
    } else if (!corrente.includes(".") && corrente.length < MAX_CARATTERI) {
        corrente += ".";
    }
}

function calcola() {
    try {
        const risultato = operazioni[operatore](precedente, Number(corrente));
        corrente = formatta(risultato);
    } catch (errore) {
        cancella();
        display.textContent = "Errore: ÷ 0";
        return false;
    }
    precedente = null;
    operatore = null;
    nuovoNumero = true;
    operandoDaRadice = false;
    return true;
}

function applicaRadice() {
    try {
        corrente = formatta(radiceQuadrata(Number(corrente)));
    } catch (errore) {
        cancella();
        display.textContent = "Errore: √ < 0";
        return false;
    }
    nuovoNumero = true;
    operandoDaRadice = operatore !== null;
    return true;
}

function scegliOperatore(nuovoOperatore) {
    if (operatore !== null && (!nuovoNumero || operandoDaRadice) && !calcola()) {
        return false;
    }
    precedente = Number(corrente);
    operatore = nuovoOperatore;
    nuovoNumero = true;
    return true;
}

function uguale() {
    return operatore === null || calcola();
}

document.querySelector(".tasti").addEventListener("click", (evento) => {
    const tasto = evento.target.closest("button");
    if (!tasto) {
        return;
    }

    const { cifra, operatore: tastoOperatore, azione } = tasto.dataset;
    let aggiornaDisplay = true;

    if (cifra !== undefined) {
        inserisciCifra(cifra);
    } else if (tastoOperatore !== undefined) {
        aggiornaDisplay = scegliOperatore(tastoOperatore);
    } else if (azione === "punto") {
        inserisciPunto();
    } else if (azione === "radice") {
        aggiornaDisplay = applicaRadice();
    } else if (azione === "uguale") {
        aggiornaDisplay = uguale();
    } else if (azione === "cancella") {
        cancella();
    }

    if (aggiornaDisplay) {
        display.textContent = corrente;
    }
});
