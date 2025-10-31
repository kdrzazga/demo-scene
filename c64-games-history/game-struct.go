package main

import (
    "log"

    "github.com/hajimehoshi/ebiten/v2"
)

type Game struct {
	timer float64
	timelineX float64
	gianaX float64
	lemansX float64
	lemansY float64
	ghost1X float64
	ghost1Y float64
	ghost2X float64
	ghost2Y float64
	ghost3X float64
	ghost3Y float64
}

func (g *Game) Init(){
    g.timelineX = 0.0
    g.gianaX = 2000.0
    g.lemansX = -939.0
    g.lemansY = -1000.0
    g.ghost1X = 0
    g.ghost1Y = 10
    g.ghost2X = 0
    g.ghost2Y = 10
    g.ghost3X = 0
    g.ghost3Y = 10
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
    } else if (g.timer > 10.2){
        g.timelineX--
        g.ghost1X = g.timelineX
        g.ghost2X = g.timelineX
        g.ghost3X = g.timelineX
        if (g.timer > 11.0){

            if (g.lemansX <=0){
                g.lemansX +=2
            } else {
                g.lemansY += 2
            }
        }
        if (g.timer > 48.0){
            g.gianaX -= 5
            dragonGif.Update()
        }
    }

    log.Println(g.timer)
	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
    op := &ebiten.DrawImageOptions{}

	if (g.timer < 7.68){
	    logo1Gif.Draw(screen, float64(0), 0)
	} else if (g.timer < 10.2){
        titleGif.Draw(screen, float64(0), 0)
    } else if (g.timer > 11.0 ){
        lemansRiverraidStageDraw(screen, g)
    }
    if (g.timer > 48.0){
        gianaStageDraw(screen, g)
    }

    if (g.timer > 10.2){
        op.GeoM.Reset()
        op.GeoM.Translate(g.timelineX, 0)
        screen.DrawImage(timeline, op)
        op.GeoM.Translate(2092, 124)
        screen.DrawImage(ghost1, op)
        screen.DrawImage(ghost2, op)
        screen.DrawImage(ghost3, op)
    }
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	s := ebiten.Monitor().DeviceScaleFactor()
	return int(float64(outsideWidth) * s), int(float64(outsideHeight) * s)
}

