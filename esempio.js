function aggiungi(a, b) {
    return a + b;
}
function sottrai(a, b) {
    return a - b;
}

function moltiplica(a, b) {
    return a * b;
}

function dividi(a, b) {
    if (b === 0) {
        throw new Error("Divisione per zero non consentita");
    }
    return a / b;
}
