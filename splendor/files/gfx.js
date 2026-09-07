const Gfx = {
    tokenCircle(scene, x, y, radius, gem) {
        const circle = scene.add.circle(x, y, radius, GEM_COLOR[gem]);
        circle.setStrokeStyle(Math.max(2, radius * 0.14), 0x0a0d10, 0.65);
        return circle;
    },

    countedToken(scene, x, y, radius, gem, count) {
        const circle = this.tokenCircle(scene, x, y, radius, gem);
        const label = scene.add.text(x, y, String(count), {
            fontFamily: 'monospace',
            fontSize: Math.round(radius * 1.25) + 'px',
            color: GEM_TEXT_COLOR[gem],
            fontStyle: 'bold'
        }).setOrigin(0.5);
        return [circle, label];
    },

    cardSquare(scene, x, y, half, gem) {
        const square = scene.add.rectangle(x, y, half * 2, half * 2, GEM_COLOR[gem]);
        square.setStrokeStyle(Math.max(2, half * 0.14), 0x0a0d10, 0.65);
        return square;
    },

    countedCard(scene, x, y, half, gem, count) {
        const square = this.cardSquare(scene, x, y, half, gem);
        const label = scene.add.text(x, y, String(count), {
            fontFamily: 'monospace',
            fontSize: Math.round(half * 1.25) + 'px',
            color: GEM_TEXT_COLOR[gem],
            fontStyle: 'bold'
        }).setOrigin(0.5);
        return [square, label];
    }
};
