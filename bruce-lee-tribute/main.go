package main

import (
    "runtime"
	"bytes"
	"image"
	_ "image/jpeg"
	"time"
	"flag"
	"log"
	"os"

	"github.com/hajimehoshi/ebiten/v2"
    "github.com/hajimehoshi/ebiten/v2/audio"
	"github.com/hajimehoshi/ebiten/v2/text/v2"
    "github.com/hajimehoshi/ebiten/v2/audio/wav"
	"github.com/hajimehoshi/ebiten/v2/inpututil"
	"github.com/hajimehoshi/ebiten/v2/examples/resources/fonts"
)

var (
    err                         error
	background          *ebiten.Image
	background2         *ebiten.Image
	pic1nun             *ebiten.Image
	pic2nun             *ebiten.Image
	pic3nun             *ebiten.Image
	pic4                *ebiten.Image
	projectileImg       *ebiten.Image
	orangeFlyingKickImg *ebiten.Image
	orangeFlyingKickGif *GIFAnimator
	mplusFaceSource     *text.GoTextFaceSource
    context         *audio.Context
    player          *audio.Player
    player2         *audio.Player
    themePlayer     *audio.Player
    counter         float64

    shiftX       int
    shiftY       int
    currentStage int

    startTime time.Time
)

const (
    stage1Timeout = 5000
    stage2Timeout = 1900 + stage1Timeout
    stage3Timeout = 24000 + stage2Timeout
    stage4Timeout = 53000 + stage3Timeout
    stageOutroTimeout = stage4Timeout + 9000

    final = stageOutroTimeout + 100

    stage2MusicPath = "audio/Boards dont hit back.wav"
    stage3MusicPath = "audio/BruceLee.wav"
    stage4MusicPath = "audio/Enter The Dragon - Full.wav"

    moveSpeed = 2
)

func init() {
    ebiten.SetCursorMode(ebiten.CursorModeHidden)

    shiftX = 0
    shiftY = 0

    context = audio.NewContext(44100)

    orangeFlyingKickImg, err = loadImage("pics/orange-flying-kick.png")
    if err != nil {
        log.Fatal(err)
    }

    orangeFlyingKickGif, err = NewGIFAnimator("pics/orange-flying-kick.gif", false)
    if err != nil {
        log.Fatal(err)
    }

    pic1nun, err = loadImage("pics/bruce-lee-nunchako1.png")
    if err != nil {
        log.Fatal(err)
    }
    pic2nun, err = loadImage("pics/bruce-lee-nunchako2.png")
    if err != nil {
        log.Fatal(err)
    }
    pic3nun, err = loadImage("pics/bruce-lee2.png")
    if err != nil {
        log.Fatal(err)
    }
    pic4, err = loadImage("pics/bl.png")
    if err != nil {
        log.Fatal(err)
    }
    projectileImg, err = loadImage("pics/projectile.png")
    if err != nil {
        log.Fatal(err)
    }

	s, err := text.NewGoTextFaceSource(bytes.NewReader(fonts.MPlus1pRegular_ttf))
	if err != nil {
		log.Fatal(err)
	}
	mplusFaceSource = s

	initStage3()
	initStage4()
	initStageOutro()
}

func initAudio(path string) (*audio.Player, error) {
    f, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    stream, err := wav.Decode(context, f)
    if err != nil {
        return nil, err
    }

    localPlayer, err := audio.NewPlayer(context, stream)
    if err != nil {
        return nil, err
    }

    //defer f.Close()
    return localPlayer, nil
}

type Game struct {
	count int
}

func (g *Game) Update() error {
	g.count++

	if (counter > final) {
        elapsed := time.Since(startTime)
        log.Printf("Execution time: %v\n", elapsed)
        return ebiten.Termination
    }

	if runtime.GOOS == "js" {
		if ebiten.IsKeyPressed(ebiten.KeyF) || len(inpututil.AppendJustPressedTouchIDs(nil)) > 0 {
			ebiten.SetFullscreen(true)
		}
	}
    playbackDone := player == nil || !player.IsPlaying()

	if runtime.GOOS != "js" && (ebiten.IsKeyPressed(ebiten.KeyQ) || playbackDone) {
	    //fmt.Print(counter)
		return nil
	}

    if (counter - stage1Timeout <1.0 || counter - stage2Timeout <1.0 || counter - stage3Timeout <1.0 || counter - stage4Timeout <1.0){
        elapsed := time.Since(startTime)
        log.Printf("Execution time: %v\n", elapsed)
    }

	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
    counter += 7
    if (counter < stage1Timeout) {
        stage1(screen, counter)
    }else if (counter < stage2Timeout) {
        stage2(screen)
    } else if (counter < stage3Timeout) {
        stage3(screen, counter)
    } else if (counter < stage4Timeout) {
        stage4(screen, counter)
    }else  {
        stageOutro(screen)
    }
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	s := ebiten.Monitor().DeviceScaleFactor()
	return int(float64(outsideWidth) * s), int(float64(outsideHeight) * s)
}

func main() {
    startTime = time.Now()

    analyzeArguments()

    ebiten.SetFullscreen(true)
	ebiten.SetWindowTitle("BRUCE LEE TRIBUTE")
	if err := ebiten.RunGame(&Game{}); err != nil {
		log.Fatal(err)
	}
}

func analyzeArguments(){
    name := flag.String("stage", "1", "a number of stage to start with")
    flag.Parse()
    stage := string(*name)
    switch(stage){
        case "2":
            counter = stage1Timeout
        case "3":
            counter = stage2Timeout
        case "4":
            counter = stage3Timeout
        case "4.5":
            counter = 30000 + stage3Timeout
        case "outro":
            counter = stage4Timeout
    }
}

func drawBackgroundScaled(screen, bg *ebiten.Image, x, y, w, h int, scale float64) {
    subImg := bg.SubImage(image.Rect(x, y, w, h)).(*ebiten.Image)
    op := &ebiten.DrawImageOptions{}
    op.GeoM.Scale(scale, scale)
    screen.DrawImage(subImg, op)
}

func drawBackground(screen, bg *ebiten.Image, x, y, w, h int) {
    drawBackgroundScaled(screen, bg, x, y, w, h, 2.0)
}

func loadImage(path string) (*ebiten.Image, error) {
    file, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    defer file.Close()
    img, _, err := image.Decode(file)
    if err != nil {
        return nil, err
    }
    return ebiten.NewImageFromImage(img), nil
}
