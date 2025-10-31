package main

import (
    "log"

    "github.com/hajimehoshi/ebiten/v2"
)

type Game struct {
	timer float64
	timelineX float64
}

func (g *Game) Init(){
    g.timelineX = 2000.0
}

func (g *Game) Update() error{
	g.timer += 1.0/60.0

	if themePlayer != nil && !themePlayer.IsPlaying() {
        themePlayer.Rewind()
        themePlayer.Play()
    }

	if (g.timer < 7.68){
	    logo1Gif.Update()
	} else if (g.timer < 10.2){
        titleGif.Update()
    } else {
        g.timelineX--
    }

    log.Println(g.timer)
	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
	if (g.timer < 7.68){
	    logo1Gif.Draw(screen, float64(0), 0)
	} else if (g.timer < 10.2){
        titleGif.Draw(screen, float64(0), 0)
    } else {
        op := &ebiten.DrawImageOptions{}
        op.GeoM.Translate(g.timelineX, 50)
        screen.DrawImage(timeline, op)
    }
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	s := ebiten.Monitor().DeviceScaleFactor()
	return int(float64(outsideWidth) * s), int(float64(outsideHeight) * s)
}

