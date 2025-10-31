package main

import (
	_ "image/jpeg"

	"github.com/hajimehoshi/ebiten/v2"
)

func lemansRiverraidStageDraw(screen *ebiten.Image, g *Game){
    op := &ebiten.DrawImageOptions{}

    op.GeoM.Reset()
    op.GeoM.Translate(g.lemansX, g.lemansY)
    screen.DrawImage(leMansRiverRaidBoard, op)
}
