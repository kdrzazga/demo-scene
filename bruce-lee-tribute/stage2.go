package main

import (
	"runtime"
	"image/color"
	_ "image/jpeg"

	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/text/v2"
)

func stage2(screen *ebiten.Image) {
	drawBackground(screen, orangeFlyingKickImg, 20 - 200, 20-99, 2555, 705)
    msg := "Entering castle of the SORCERER...\n"

	if runtime.GOOS == "js" {
		msg += "Press F or touch the screen to enter fullscreen (again).\n"
	}

    animateText(screen, msg, 12, 50, 750)
    msg = story()
    animateText(screen, msg, 30, 610, 400-counter)
}

func animateText(screen *ebiten.Image, msg string, size float64, x float64, y float64){

	scale := ebiten.Monitor().DeviceScaleFactor()
    textOp := &text.DrawOptions{}

    textOp.GeoM.Translate(x, y)
    textOp.ColorScale.ScaleWithColor(color.White)
    textOp.LineSpacing = size * scale * 2
    text.Draw(screen, msg, &text.GoTextFace{
    	Source: mplusFaceSource,
    	Size:   size * scale,
    }, textOp)
}

func story() string {
    return `BOARDS DON'T HIT BACK....`
}
