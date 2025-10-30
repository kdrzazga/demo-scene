package main

import (
    "github.com/hajimehoshi/ebiten/v2"
)

type Game struct {
	count int
}

func (g *Game) Update() error{
	g.count++
	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {

}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	s := ebiten.Monitor().DeviceScaleFactor()
	return int(float64(outsideWidth) * s), int(float64(outsideHeight) * s)
}

