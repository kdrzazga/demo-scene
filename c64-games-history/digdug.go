package main

import (
    "math"

    "github.com/hajimehoshi/ebiten/v2"
)

func digDugStageUpdate(g *Game)  *Game{
        g.ghost1X -= 1 + 5*math.Cos(g.timelineX/6.28)
        g.ghost1Y += 0.1 + 3*math.Sin(g.timelineX/3.14)
        g.ghost2X -=0.9
        g.ghost2Y += 0.3 + 2*math.Cos(g.timelineX/6.28)
        g.ghost3X -= 3.2
        if (g.timer >19 && g.timer < 25){
            g.ghost3X  += 4.1
        }
        return g
}

func digDugStageDraw(screen *ebiten.Image, g *Game){

        op := &ebiten.DrawImageOptions{}
        op.GeoM.Translate(g.ghost1X, g.ghost1Y)
        screen.DrawImage(ghost1, op)

        op.GeoM.Reset()
        op.GeoM.Translate(g.ghost2X, g.ghost2Y)
        screen.DrawImage(ghost2, op)

        op.GeoM.Reset()
        op.GeoM.Translate(g.ghost3X, g.ghost3Y)
        screen.DrawImage(ghost3, op)
}
