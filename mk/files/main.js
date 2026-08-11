const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 320,
    parent: 'game',
    pixelArt: true,
    zoom: 2,
    backgroundColor: '#05080b',
    scene: [ArenaScene]
};

new Phaser.Game(config);

const audio = new Audio('files/Mortal Kombat.mp3');
var alreadyPlaying = false

document.addEventListener('keydown', function(event) {
  if (!alreadyPlaying) {
    audio.play();
  }
});