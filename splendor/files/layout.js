const LAYOUT = {
    width: 1280,
    height: 800,

    card: { w: 100, h: 132 },
    noble: { size: 84 },

    tableau: {
        x: 300,
        firstRowY: 150,
        rowStep: 150,
        nobleY: 42,
        deckGap: 12,
        cardGap: 12
    },

    bank: { x: 150, firstY: 168, step: 74, radius: 27 },

    panel: { x: 902, y: 20, w: 358, h: 378, step: 386 },

    action: { x: 300, buttonsY: 720, selectionY: 648 }
};

LAYOUT.cardX = function (slot) {
    return LAYOUT.tableau.x + LAYOUT.card.w + LAYOUT.tableau.deckGap + slot * (LAYOUT.card.w + LAYOUT.tableau.cardGap);
};

LAYOUT.rowY = function (level) {
    return LAYOUT.tableau.firstRowY + (3 - level) * LAYOUT.tableau.rowStep;
};
