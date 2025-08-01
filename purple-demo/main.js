let secondsElapsed = 0;

const timeTd = document.getElementById('time');

const timer = setInterval(() => {
  secondsElapsed++;

  conditionallySwitchStage();

  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const formattedSeconds = seconds.toString().padStart(2, '0');
  timeTd.textContent = `${minutes}:${formattedSeconds}`;
}, 1000);

function conditionallySwitchStage(){
    const contentFrame = document.getElementById('content');
    let audio = new Audio('../common/sfx/dig.mp3');

    if (secondsElapsed == 90){
        contentFrame.src = 'anims/index.html';

        audio = new Audio('../common/sfx/dig.mp3');
        audio.play();
    }
    else if (secondsElapsed == 90+ 30){
        contentFrame.src = '3scenes3d/index.html';

        audio = new Audio('../common/sfx/NeverGonnaGive.mp3');
        audio.play();
    }
    else if (secondsElapsed == 90+ 30 + 45){
        contentFrame.src = 'fractals/index.html';
        audio = new Audio('../common/sfx/Lambada.mp3');
        audio.play();
    }
}
