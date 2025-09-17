package main

import (
	"fmt"
	"log"
	"image/color"
	_ "image/jpeg"

	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/text/v2"
)

func stage1(screen *ebiten.Image, counter float64) {
    var pic *ebiten.Image

    switch {
    case counter < 1000:
        pic = pic4
    case counter < 2000:
        pic = pic1nun
    case counter < 3000:
        pic = pic2nun
    case counter < 4000:
        pic = pic3nun
    default:
        pic = orangeFlyingKickImg
    }

    pos :=  int((counter)/15)
    if (pic == orangeFlyingKickImg || pic == pic3nun){
        pos = 20
    }

    if (pic == orangeFlyingKickImg){
        orangeFlyingKickGif.Draw(screen, float64(0), float64(0));
        orangeFlyingKickGif.Update();
    } else {
        drawBackground(screen, pic, pos - 200, pos-99, 2555, 705)
    }

    if player == nil{
        player, err = initAudio(stage2MusicPath)
        player.Play()

        if err != nil {
        	log.Fatal(err)
        }
    }

	scale := ebiten.Monitor().DeviceScaleFactor()

	sw, sh := screen.Bounds().Dx(), screen.Bounds().Dy()
	fw, fh := ebiten.Monitor().Size()

	msg := fmt.Sprintf("Bruce Lee (Lee Jun-fan)\n")
	msg += fmt.Sprintf("Born: November 27, 1940 in San Francisco, California\n")
	msg += fmt.Sprintf("Died: July 20, 1973 in Kowloon, Hong Kong\n")
	msg += fmt.Sprintf("\n\nBeware of fat YAMO and the Ninja...\n")

	log.Printf("Screen size in fullscreen: %d, %d\n", fw, fh)
	log.Printf("Game's screen size: %d, %d\n", sw, sh)
	log.Printf("Device scale factor: %0.2f\n", scale)

	textOp := &text.DrawOptions{}
	textOp.GeoM.Translate(830*scale, 700*scale)
	textOp.ColorScale.ScaleWithColor(color.White)
	textOp.LineSpacing = 12 * ebiten.Monitor().DeviceScaleFactor() * 1.5
	text.Draw(screen, msg, &text.GoTextFace{
		Source: mplusFaceSource,
		Size:   12 * ebiten.Monitor().DeviceScaleFactor(),
	}, textOp)

    msg = story()
	textOp.GeoM.Translate(10*scale, (400-counter)*scale)
	textOp.LineSpacing = 30 * ebiten.Monitor().DeviceScaleFactor() * 2
	text.Draw(screen, msg, &text.GoTextFace{
		Source: mplusFaceSource,
		Size:   30 * ebiten.Monitor().DeviceScaleFactor(),
	}, textOp)
}
