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
    dragonGif   *GIFAnimator
    timeline    *ebiten.Image
    gianaBoard  *ebiten.Image
    ghost1      *ebiten.Image
    ghost2      *ebiten.Image
    ghost3      *ebiten.Image

    leMansRiverRaidBoard  *ebiten.Image

    themePlayer *audio.Player
)

func main() {
    startTime = time.Now()

    analyzeArguments()

    ebiten.SetCursorMode(ebiten.CursorModeHidden)
    ebiten.SetFullscreen(false)
    ebiten.SetWindowSize(800, 600)
    ebiten.SetFullscreen(true)

	ebiten.SetWindowTitle("History of Commodore 64 games")
	g := Game{}
	g.Init()
	if err := ebiten.RunGame(&g); err != nil {
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

    dragonGif, err = NewGIFAnimator("pics/GSdragon.gif", true)
    if err != nil {
        log.Fatal(err)
    }

    timeline, err = loadImage("pics/timeline.png")
    if err != nil {
        log.Fatal(err)
    }
    gianaBoard, err = loadImage("pics/giana.png")
    if err != nil {
        log.Fatal(err)
    }
    leMansRiverRaidBoard, err = loadImage("pics/le-mans-river.png")
    if err != nil {
        log.Fatal(err)
    }
    ghost1, err = loadImage("pics/digdug/ghost1.png")
    if err != nil {
        log.Fatal(err)
    }
    ghost2, err = loadImage("pics/digdug/ghost2.png")
    if err != nil {
        log.Fatal(err)
    }
    ghost3, err = loadImage("pics/digdug/ghostYellow1.png")
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
