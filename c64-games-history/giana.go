package main

import (
	_ "image/jpeg"

	"github.com/hajimehoshi/ebiten/v2"
)

func gianaStageDraw(screen *ebiten.Image, g *Game){
    op := &ebiten.DrawImageOptions{}

    op.GeoM.Reset()
    op.GeoM.Translate(g.gianaX, 249)
    screen.DrawImage(gianaBoard, op)

    dragonGif.Draw(screen, 400, 400)
}
