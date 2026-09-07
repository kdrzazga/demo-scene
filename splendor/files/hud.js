class Hud {
    constructor(scene) {
        scene.add.text(LAYOUT.width / 2, 12, 'SPLENDOR', {
            fontFamily: 'monospace',
            fontSize: '22px',
            color: '#7fd7ff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);

        this.turn = scene.add.text(24, 40, '', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#cfd8dc'
        }).setOrigin(0);

        this.message = scene.add.text(LAYOUT.action.x, LAYOUT.action.selectionY - 34, '', {
            fontFamily: 'monospace',
            fontSize: '15px',
            color: '#9fd0a8'
        }).setOrigin(0);
    }

    setTurn(name) {
        this.turn.setText('> ' + name + "'s turn");
    }

    setMessage(text) {
        this.message.setText(text);
    }
}
