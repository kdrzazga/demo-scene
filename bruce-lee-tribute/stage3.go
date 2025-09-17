package main

import (
	"math"
	"log"
	"image/color"
	_ "image/jpeg"

	"github.com/hajimehoshi/ebiten/v2"
)

type projectile struct {
    minX float64
    x float64
    y float64
    maxX float64
    velocity float64
}


var (
    projectiles = []projectile{
        {minX: 195, x: 205, y: 265, maxX: 222, velocity: 0.3},
        {minX: 530, x: 530, y: 290, maxX: 530+17, velocity: 0.3},
        {minX: 9, x: 9, y: 330, maxX: 31, velocity: 0.3},
        {minX: 766, x: 766, y: 425, maxX: 805, velocity: 0.3},
        {minX: 1660, x: 1660, y: 555, maxX: 1900, velocity: 1.0},
        {minX: 1660, x: 1660, y: 610, maxX: 1900, velocity: 1.3},
        {minX: 1660, x: 1660, y: 645, maxX: 1900, velocity: 2.3},
    }

    floorProjectiles = []projectile{
        {minX: 38, x: 38, y: 505, maxX: 278, velocity: 3},
        {minX: 670, x: 670, y: 520, maxX: 833, velocity: 2.9},
        {minX: 1004, x: 1004, y: 578, maxX: 1224, velocity: 2.1},
        {minX: 1004, x: 1004, y: 616, maxX: 1224, velocity: 2.5},
        {minX: 1004, x: 1004, y: 658, maxX: 1224, velocity: 2.3},
        {minX: 975, x: 975, y: 698, maxX: 1224, velocity: 2.7},
    }

    dragons = []projectile{
        {minX: -200, x: 1800, y: 265, maxX: 1800, velocity: 1},
        {minX: -530, x: 2300, y: 290, maxX: 3300, velocity: 2.2},
        {minX: -530, x: 3300, y: 290, maxX: 3800, velocity: 3.2},
    }

    gifAnimator [3]*GIFAnimator

	enemiesPic      *ebiten.Image
)

func initStage3(){
    var err error

    for i := range gifAnimator{
        gifAnimator[i], err = NewGIFAnimator("pics/drag-on.gif", true)
        if err != nil {
            log.Fatal(err)
        }
    }
    background2, err = loadImage("pics/brusli2.png")
    if err != nil {
        log.Fatal(err)
    }
    background, err = loadImage("pics/brusli.png")
    if err != nil {
        log.Fatal(err)
    }

    enemiesPic, err = loadImage("pics/enemies.png")
    if err != nil {
        log.Fatal(err)
    }
}

func stage3(screen *ebiten.Image, counter float64){
    var bgPic *ebiten.Image
    if float64(int(counter)%(7*50)) > 7*25 {
        bgPic = background
    } else {
        bgPic = background2
    }
    drawBackground(screen, bgPic, shiftX, shiftY, 2555, 705)
    drawProjectiles(screen, projectileImg, projectiles)

    rectImg := ebiten.NewImage(8, 2)
    rectImg.Fill(color.RGBA{255, 255, 255, 255})

    drawProjectiles(screen, rectImg, floorProjectiles)

    if player2 == nil{
        player2, err = initAudio(stage3MusicPath)
        player2.Play()

        if err != nil {
        	log.Fatal(err)
        }
    }

    moveBackground(counter)
    moveProjectiles()
    moveDragon()

    log.Println(counter)

    enemiesPicCounterMin := 16950.0
    if (counter > enemiesPicCounterMin && counter < 20390){
        drawSquaredPic(screen, enemiesPic, 0, 900, counter- enemiesPicCounterMin)
    }

    for i := range gifAnimator {
        gifAnimator[i].Update()
        gifAnimator[i].Draw(screen, dragons[i].x, dragons[i].y)
        //log.Printf("%f, %f, %f \t", dragons[i].x, dragons[i].y, dragons[i].minX)
    }
}

func drawProjectiles(screen *ebiten.Image, projectilePic *ebiten.Image, projectiles []projectile){
    for i := range projectiles {
        op := &ebiten.DrawImageOptions{}
        op.GeoM.Translate(float64(-shiftX) + projectiles[i].x, float64(-shiftY) + projectiles[i].y)
        op.GeoM.Scale(2, 2)
        screen.DrawImage(projectilePic, op)
        //fmt.Printf("Projectile %d: x=%f, y=%f\n", i, projectiles[i].x, projectiles[i].y)
    }
}

func moveBackground(counter float64) {
    if (shiftX > moveSpeed) && (ebiten.IsKeyPressed(ebiten.KeyA) || ebiten.IsKeyPressed(ebiten.KeyArrowLeft)) {
        shiftX -= moveSpeed
    } else if ebiten.IsKeyPressed(ebiten.KeyD) || ebiten.IsKeyPressed(ebiten.KeyArrowRight) {
        shiftX += moveSpeed
    }
    if (shiftY > moveSpeed) && (ebiten.IsKeyPressed(ebiten.KeyW) || ebiten.IsKeyPressed(ebiten.KeyArrowUp)) {
        shiftY -= moveSpeed
    } else if ebiten.IsKeyPressed(ebiten.KeyS) || ebiten.IsKeyPressed(ebiten.KeyArrowDown) {
        shiftY += moveSpeed
    }

    s := int(moveSpeed/2)
    switch {
        case counter < 6000 + stage2Timeout:
            shiftX += s

        case counter >= 6000 + stage2Timeout && counter < 10000+ stage2Timeout:
            shiftX -= s
            if int(counter) % 3 == 0 {
                shiftY += s
            }

        case counter >= 10000+ stage2Timeout && counter < 12000 + stage2Timeout:
            shiftX -= s

        case counter >= 12000+ stage2Timeout && counter < 15000 + stage2Timeout:
            shiftX += moveSpeed

        case counter >= 15000+ stage2Timeout:
            shiftX += s
            //log.Printf("%d ", shiftY)
            if (shiftY < 350) {
                shiftY += s
            }
    }
}

func moveProjectiles() {
    for i := range projectiles {
        if (projectiles[i].x < projectiles[i].maxX){
            projectiles[i].x += projectiles[i].velocity
        } else {
            projectiles[i].x = projectiles[i].minX
        }
    }
    for i := range floorProjectiles {
        if (floorProjectiles[i].x < floorProjectiles[i].maxX){
            floorProjectiles[i].x += floorProjectiles[i].velocity
        } else {
            floorProjectiles[i].x = floorProjectiles[i].minX
        }
    }
}

func moveDragon(){
    for i := range dragons {
        if (dragons[i].x > dragons[i].minX){
            dragons[i].x -= dragons[i].velocity
        } else {
            dragons[i].x = dragons[i].maxX
        }
        dragons[i].y = 300*math.Sin(dragons[i].x/float64(400) + float64(i)*math.Pi) + 300
    }
}

func drawSquaredPic(screen *ebiten.Image,pic *ebiten.Image, x, y int, counter float64) {
    picWidth := 1386.0
    picHeight := 305.0
    op := &ebiten.DrawImageOptions{}
    op.GeoM.Translate(float64(x), float64(y))
    op.GeoM.Scale(0.75, 0.75)
    screen.DrawImage(pic, op)

    centerX := float64(x) + picWidth/2
    centerY := float64(y) + picHeight/2

    squareWidth := int(math.Abs(float64(picWidth - counter))) + 1
    squareHeight := int(math.Abs(float64(picHeight - counter))) + 1
    blackSquare := ebiten.NewImage(squareWidth, squareHeight)
    blackSquare.Fill(color.Black)

    opSquare := &ebiten.DrawImageOptions{}
    opSquare.GeoM.Translate(centerX, centerY)
    opSquare.GeoM.Scale(0.75, 0.75)

    screen.DrawImage(blackSquare, opSquare)
    //log.Println("counter = ", counter);
}

