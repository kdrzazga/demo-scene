package main

import (
    "log"

	"github.com/hajimehoshi/ebiten/v2"
)

var (
    returnOfFuryAnimator *GIFAnimator
    chuckNorrisAnimator *GIFAnimator
    kickdownAnimator *GIFAnimator
    kickingAnimator *GIFAnimator
    c64gameAnimator *GIFAnimator
    returnOfFuryImg *ebiten.Image
	bigPic          *ebiten.Image
	c64Pic          *ebiten.Image
	flyingKickPic   *ebiten.Image
	bleePic         *ebiten.Image
	bigPicY             int
	shiftX4             int
	extraDelay          int
	bruceleePosition    int
)

func initStage4(){
    var err error

    returnOfFuryAnimator, err = NewGIFAnimator("pics/return-of-fury.gif", false)
    if err != nil {
        log.Fatal(err)
    }
    chuckNorrisAnimator, err = NewGIFAnimator("pics/brucelee-chucknorris.gif", false)
    if err != nil {
        log.Fatal(err)
    }
    kickdownAnimator, err = NewGIFAnimator("pics/kickdown.gif", false)
    if err != nil {
        log.Fatal(err)
    }
    returnOfFuryImg, err = loadImage("pics/return-of-fury.jpg")
    if err != nil {
        log.Fatal(err)
    }
    kickingAnimator, err = NewGIFAnimator("pics/kicking.gif", false)
    if err != nil {
        log.Fatal(err)
    }
    bigPic, err = loadImage("pics/big3.png")
    if err != nil {
        log.Fatal(err)
    }
    c64Pic, err = loadImage("pics/c64.png")
    if err != nil {
        log.Fatal(err)
    }
    flyingKickPic, err = loadImage("pics/fk.png")
    if err != nil {
        log.Fatal(err)
    }
    bleePic, err = loadImage("pics/blee.png")
    if err != nil {
        log.Fatal(err)
    }
    c64gameAnimator, err = NewGIFAnimator("pics/c64game.gif", false)
    if err != nil {
        log.Fatal(err)
    }

    extraDelay = 0
    bigPicY = 2500
    shiftX4 = 0
    bruceleePosition = -4500
}

func stage4(screen *ebiten.Image, counter float64){
    extraDelay += 1
    //log.Println(extraDelay, (extraDelay % 3), (extraDelay %3 == 0), bigPicY)
    if (extraDelay % 4 > 0 && bigPicY > 0){
        bigPicY -= 1
    }
    if (counter > (30000 + stage3Timeout)){
        bruceleePosition += 2

        drawRealBruceLee(screen, float64(bruceleePosition))
        drawAnimator(screen, 606, 224)
        if (bruceleePosition > 550 - 60 && bruceleePosition < 1030 - 60){
             drawC64BruceLee(screen, float64(bruceleePosition+30))
        }
        drawC64(screen)

    } else if (counter > (25000 + stage3Timeout)){
        bigPicY += 2
    } else if (counter > 15000 + stage3Timeout){
        shiftX4 -= 1
    }

    if (counter < (30000 + stage3Timeout)){
        drawBackground(screen, bigPic, shiftX4, bigPicY, 940,811)
    }

    if (counter < 2000 + stage3Timeout) {
        returnOfFuryAnimator.Update()
        returnOfFuryAnimator.Draw(screen, float64(shiftX4), 0)
    } else if ((counter < 3000 + stage3Timeout) || (counter > 12000 + stage3Timeout && counter < 13000 + stage3Timeout)) {
        drawBackgroundScaled(screen, returnOfFuryImg, 0, 0, 400+shiftX4, 245, float64(1))
        chuckNorrisAnimator.Update()
        chuckNorrisAnimator.Draw(screen, 400+float64(shiftX4), 245)
    } else if (counter < 8300 + stage3Timeout){
        drawBackgroundScaled(screen, returnOfFuryImg, 0, 0, 400+shiftX4, 245, float64(1))
        chuckNorrisAnimator.Draw(screen, 400+float64(shiftX4), 245)
        kickingAnimator.Update()
        kickingAnimator.Draw(screen, 10+float64(shiftX4), 245+280)
    } else if (counter < 30000 + stage3Timeout){
        drawBackgroundScaled(screen, returnOfFuryImg, shiftX4, 0, 400, 245, float64(1))
        chuckNorrisAnimator.Draw(screen, 400+float64(shiftX4), 245)

        kickingAnimator.Draw(screen, 10+float64(shiftX4), 245+280)

        kickdownAnimator.Draw(screen, 400+468+float64(shiftX4), 245+280)
        kickdownAnimator.Update()
        chuckNorrisAnimator.Reset()
    }

    if themePlayer == nil{
        themePlayer, err = initAudio(stage4MusicPath)
        themePlayer.Play()

        if err != nil {
        	log.Fatal(err)
        }
    }
}

func drawRealBruceLee(screen *ebiten.Image, position float64) {
    op := &ebiten.DrawImageOptions{}
    op.GeoM.Reset()
    translation := float64(0)
    if (position > 900){
        translation = 193
    }

    if (position < 850-193 || position > 930){
        op.GeoM.Translate(position - translation, 350)
        screen.DrawImage(flyingKickPic, op)
    }
}

func drawC64BruceLee(screen *ebiten.Image, position float64) {
    op := &ebiten.DrawImageOptions{}
    op.GeoM.Reset()
    op.GeoM.Translate(2*position + 20, 2*432) // 350 + 30
    op.GeoM.Scale(0.5, 0.5)
    screen.DrawImage(bleePic, op)
}

func drawAnimator(screen *ebiten.Image, x, y float64) {
    c64gameAnimator.Draw(screen, x, y)
    c64gameAnimator.Update()
}

func drawC64(screen *ebiten.Image) {
    drawBackgroundScaled(screen, c64Pic, 0, 0, 1200, 722, 1)
}

