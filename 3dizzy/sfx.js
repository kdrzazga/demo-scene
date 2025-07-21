function playMusic() {
    var audio = new Audio('../common/sfx/AntonioZepeda.mp3');
    audio.play();
    setInterval(function() {
      audio.play();
    }, (7*60+0)*165);
    console.log('Music started.');
}

function ping(){
    var audio = new Audio('../common/sfx/ping2.mp3');
    audio.play();
}
