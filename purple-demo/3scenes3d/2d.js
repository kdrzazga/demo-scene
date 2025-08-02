function positionImageAtBottom() {
    const img = document.getElementById('rick');
    img.style.left = '0px';
    img.style.bottom = '0px';
}

window.addEventListener('load', positionImageAtBottom);
window.addEventListener('resize', positionImageAtBottom);

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 40,
    scene: [Scene1],
    parent: 'caption',
};

const game = new Phaser.Game(config);
