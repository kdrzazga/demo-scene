package main

import (
    "log"

    "github.com/hajimehoshi/ebiten/v2"
)

type Game struct {
	timer float64
}

func (g *Game) Update() error{
	g.timer += 1.0/60.0

	logo1Gif.Update()
    log.Println(g.timer)
	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
    logo1Gif.Draw(screen, float64(0), 0)
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	s := ebiten.Monitor().DeviceScaleFactor()
	return int(float64(outsideWidth) * s), int(float64(outsideHeight) * s)
}

