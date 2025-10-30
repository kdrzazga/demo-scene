package main

import (
	_ "image/jpeg"
	"time"
	"flag"
	"log"

	"github.com/hajimehoshi/ebiten/v2"
)

var (
    startTime time.Time
)

func main() {
    startTime = time.Now()

    analyzeArguments()

    ebiten.SetFullscreen(true)
	ebiten.SetWindowTitle("BRUCE LEE TRIBUTE")
	if err := ebiten.RunGame(&Game{}); err != nil {
		log.Fatal(err)
	}
}

func analyzeArguments(){
    //go run . -stage=4
    name := flag.String("stage", "1", "a number of stage to start with")
    flag.Parse()
    stage := string(*name)
    print(stage)
}

