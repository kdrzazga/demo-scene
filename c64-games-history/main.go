package main

import (
	_ "image/jpeg"
	"time"
	"flag"
	"log"

	"github.com/hajimehoshi/ebiten/v2"
    "github.com/hajimehoshi/ebiten/v2/audio"
    //"github.com/hajimehoshi/ebiten/v2/audio/wav"
)

var (
    startTime   time.Time
    logo1Gif    *GIFAnimator
    titleGif    *GIFAnimator

    themePlayer *audio.Player
)

func main() {
    startTime = time.Now()

    analyzeArguments()

    ebiten.SetFullscreen(false)
    ebiten.SetWindowSize(800, 600)
    ebiten.SetFullscreen(true)

	ebiten.SetWindowTitle("History of Commodore 64 games")
	if err := ebiten.RunGame(&Game{}); err != nil {
		log.Fatal(err)
	}
}

func init(){
    var err error

    logo1Gif, err = NewGIFAnimator("pics/1.gif", false)
    if err != nil {
        log.Fatal(err)
    }

    titleGif, err = NewGIFAnimator("pics/2.gif", false)
    if err != nil {
        log.Fatal(err)
    }

    if themePlayer == nil{
        themePlayer, err = initAudio("sfx/intro1.wav")
        themePlayer.Play()

        if err != nil {
        	log.Fatal(err)
        }
    }
}

func analyzeArguments(){
    //go run . -stage=4
    name := flag.String("stage", "1", "a number of stage to start with")
    flag.Parse()
    stage := string(*name)
    print(stage)
}

