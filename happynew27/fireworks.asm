#import "krissz-screen.asm"
#import "kna-sprites.asm"

.var drawing = krisszDataBytes("screen.asm")
.assert "screen.asm must hold a 2k charset, 1000 screen codes and 1000 colors", drawing.size(), KRISSZ_DATA_SIZE
.var music = LoadSid("Space_Bass.sid")
.var champagne = LoadBinary("champagne.kla", BF_KOALA)
.var commodore = LoadBinary("logo.kla", BF_KOALA)

.const CODE_START = $2000

BasicUpstart2(start)
*=CODE_START "Code"

.const SCREEN = $0400
.const COLOR_RAM = $d800
.const BORDER = $d020
.const BACKGROUND = $d021
.const SCREEN_CONTROL = $d011
.const HORIZONTAL_CONTROL = $d016
.const MEMORY_SETUP = $d018
.const RASTER = $d012
.const INTERRUPT_STATUS = $d019
.const INTERRUPT_ENABLE = $d01a
.const CIA1_INTERRUPT_CONTROL = $dc0d
.const CIA1_TIMER_A_CONTROL = $dc0e
.const CIA_TIMER_A_INTERRUPT_ON = $81
.const CIA_TIMER_A_START_CONTINUOUS = $11
.const CIA2_BANK_SELECT = $dd00
.const IRQ_VECTOR = $0314
.const IRQ_EXIT = $ea81
.const KERNAL_CLEAR_SCREEN = $e544

.const DRAWING_CHARS = $0810
.const DRAWING_COLORS = DRAWING_CHARS + KRISSZ_SCREEN_SIZE
.const TEXT_SCREEN_WITH_ROM_CHARSET = $15
.const TEXT_MODE = $1b
.const RASTER_IRQ_LINE = $fc
.const FRAMES_PER_SECOND = 50
.const FIREWORKS_ONLY_FRAMES = 3 * FRAMES_PER_SECOND
.const FIREWORKS_WITH_DRAWING_FRAMES = 5 * FRAMES_PER_SECOND
.const CHAMPAGNE_SCENE_FRAMES = 7 * FRAMES_PER_SECOND
.const FIRST_CAPTION_FRAMES = 1
.const CAPTION_INTERVAL_FRAMES = FRAMES_PER_SECOND / 2
.const LOGO_CAPTION_TOTAL = 6
.const FULL_CAPTION_HOLD_FRAMES = 5 * FRAMES_PER_SECOND
.const COMMODORE_SCENE_FRAMES = FIRST_CAPTION_FRAMES + (LOGO_CAPTION_TOTAL - 1) * CAPTION_INTERVAL_FRAMES + FULL_CAPTION_HOLD_FRAMES
.const CAPTION_RECORD_HEADER_SIZE = 8

.const KOALA_SCREEN_SIZE = 1000
.const KOALA_BITMAP_SIZE = 8000
.const SPRITES_IN_BANK = $0000
.const SCREEN_IN_BANK = $0400
.const COLORS_IN_BANK = $0800
.const BACKGROUND_IN_BANK = COLORS_IN_BANK + KOALA_SCREEN_SIZE
.const BITMAP_IN_BANK = $2000
.const SPRITE_POINTERS_IN_SCREEN = $03f8
.const PICTURE_SPRITE_POINTER = SPRITES_IN_BANK / 64
.const CHAMPAGNE_BANK = $4000
.const COMMODORE_BANK = $8000
.const CHAMPAGNE_BANK_BITS = %10
.const COMMODORE_BANK_BITS = %01
.const VIC_BANK_MASK = %11111100
.const PICTURE_SCREEN_AND_BITMAP = $18
.const MULTICOLOR_MODE = $d8
.const BITMAP_MODE = $3b
.const PICTURE_BORDER_COLOR = WHITE
.const SCENE_CHAMPAGNE = 0
.const SCENE_COMMODORE = 1

.const SPRITE_X = $d000
.const SPRITE_Y = $d001
.const SPRITE_X_HIGH_BITS = $d010
.const SPRITES_ENABLED = $d015
.const SPRITES_EXPANDED_Y = $d017
.const SPRITES_MULTICOLOR = $d01c
.const SPRITES_EXPANDED_X = $d01d
.const SPRITE_SHARED_COLOR_1 = $d025
.const SPRITE_SHARED_COLOR_2 = $d026
.const SPRITE_COLORS = $d027
.const SPRITE_WIDTH = 24
.const SPRITE_HEIGHT = 21
.const SCREEN_LEFT_IN_SPRITE_COORDINATES = 24
.const SCREEN_TOP_IN_SPRITE_COORDINATES = 50
.const LOGO_ELLIPSE_STEPS = 256

.var champagneEllipse = Hashtable().put("centerLeft", 192, "centerTop", 130, "radiusX", 28, "radiusY", 40).lock()
.var commodoreEllipse = Hashtable().put("centerLeft", 112, "centerTop", 170, "radiusX", 112, "radiusY", 0).lock()
.const HIDDEN_IN_LEFT_BORDER = 0

.function logoLeftAt(ellipse, step) {
    .var angle = toRadians(step * 360 / LOGO_ELLIPSE_STEPS)
    .return SCREEN_LEFT_IN_SPRITE_COORDINATES + ellipse.get("centerLeft") + round(ellipse.get("radiusX") * cos(angle))
}

.function logoTopAt(ellipse, step) {
    .var angle = toRadians(step * 360 / LOGO_ELLIPSE_STEPS)
    .return SCREEN_TOP_IN_SPRITE_COORDINATES + ellipse.get("centerTop") + round(ellipse.get("radiusY") * sin(angle))
}

.function logoSpriteXAt(ellipse, step, column) {
    .return max(HIDDEN_IN_LEFT_BORDER, logoLeftAt(ellipse, step) + column * SPRITE_WIDTH)
}

.function logoHighBitsAt(ellipse, step) {
    .var highBits = 0
    .for (var column = 0; column < KNA_SPRITE_COLUMNS; column++) {
        .if (logoSpriteXAt(ellipse, step, column) > 255) {
            .eval highBits = highBits | (1 << column) | (1 << (column + KNA_SPRITE_COLUMNS))
        }
    }
    .return highBits
}

.macro LogoPathTables(ellipse) {
lefts:
    .for (var column = 0; column < KNA_SPRITE_COLUMNS; column++) {
        .fill LOGO_ELLIPSE_STEPS, <logoSpriteXAt(ellipse, i, column)
    }
highBits:
    .fill LOGO_ELLIPSE_STEPS, logoHighBitsAt(ellipse, i)
tops:
    .fill LOGO_ELLIPSE_STEPS, logoTopAt(ellipse, i)
}

.macro MoveLogoAlong(path) {
    .for (var column = 0; column < KNA_SPRITE_COLUMNS; column++) {
        lda path.lefts + column * LOGO_ELLIPSE_STEPS,x
        sta SPRITE_X + column * 2
        sta SPRITE_X + (column + KNA_SPRITE_COLUMNS) * 2
    }
    lda path.highBits,x
    sta SPRITE_X_HIGH_BITS
    lda path.tops,x
    .for (var column = 0; column < KNA_SPRITE_COLUMNS; column++) {
        sta SPRITE_Y + column * 2
    }
    clc
    adc #SPRITE_HEIGHT
    .for (var column = 0; column < KNA_SPRITE_COLUMNS; column++) {
        sta SPRITE_Y + (column + KNA_SPRITE_COLUMNS) * 2
    }
    rts
}

.macro ShowPictureFromBank(bank, bankBits) {
    lda CIA2_BANK_SELECT
    and #VIC_BANK_MASK
    ora #bankBits
    sta CIA2_BANK_SELECT
    lda bank + BACKGROUND_IN_BANK
    sta BACKGROUND
    .for (var quarter = 0; quarter < 4; quarter++) {
        ldx #0
    copyQuarter:
        lda bank + COLORS_IN_BANK + quarter * 250,x
        sta COLOR_RAM + quarter * 250,x
        inx
        cpx #250
        bne copyQuarter
    }
    rts
}

.macro PictureBank(bank, picture) {
    *=bank + SPRITES_IN_BANK "Logo sprites"
        :KnaSprites()
    *=bank + SCREEN_IN_BANK "Picture screen"
        .fill KOALA_SCREEN_SIZE, picture.getScreenRam(i)
    *=bank + SCREEN_IN_BANK + SPRITE_POINTERS_IN_SCREEN "Sprite pointers"
        .fill KNA_SPRITE_COUNT, PICTURE_SPRITE_POINTER + i
    *=bank + COLORS_IN_BANK "Picture colors"
        .fill KOALA_SCREEN_SIZE, picture.getColorRam(i)
        .byte picture.getBackgroundColor()
    *=bank + BITMAP_IN_BANK "Picture bitmap"
        .fill KOALA_BITMAP_SIZE, picture.getBitmap(i)
}
.const SID = $d400
.const SID_REGISTER_COUNT = $19
.const SID_FREQUENCY_LOW = SID
.const SID_FREQUENCY_HIGH = SID + 1
.const SID_CONTROL = SID + 4
.const SID_ATTACK_DECAY = SID + 5
.const SID_SUSTAIN_RELEASE = SID + 6
.const SID_FILTER_CUTOFF_HIGH = SID + $16
.const SID_FILTER_ROUTING = SID + $17
.const SID_VOLUME_FILTER_MODE = SID + $18
.const NOISE_GATE_OFF = $80
.const NOISE_GATE_ON = $81
.const BOOM_FREQUENCY_HIGH = $06
.const BOOM_ATTACK_DECAY = $0a
.const BOOM_SUSTAIN_RELEASE = $00
.const BOOM_FILTER_CUTOFF = $30
.const RESONANT_FILTER_ON_ALL_VOICES = $f7
.const LOWPASS_FULL_VOLUME = $1f

.const SCREEN_COLUMNS = 40
.const SCREEN_ROWS = 25

.const CHAR_SPACE = 32
.const CHAR_ROCKET = 33
.const CHAR_DOT = 46
.const CHAR_CIRCLE = 87
.const CHAR_BACKSLASH = 77
.const CHAR_SLASH = 78
.const CHAR_VERTICAL = 93
.const CHAR_HORIZONTAL = 67

.const STYLE_ERASE = 0
.const STYLE_DOT = 1
.const STYLE_LINE = 2

.const PHASE_WAITING = 0
.const PHASE_ROCKET_FLY = 1
.const PHASE_DOTS_AROUND = 2
.const PHASE_CIRCLE_GONE = 3
.const PHASE_FIRST_LINES = 4
.const PHASE_SPREAD = 5
.const PHASE_FADE = 6
.const PHASE_VANISH = 7

.const SLOT_COUNT = 4
.const SPARK_COUNT = 16
.const LAUNCH_ROW = 24
.const FORK_RING = 4
.const LAST_RADIUS = 7
.const ROCKET_COLOR = WHITE
.const ROCKET_STEP_FRAMES = 3
.const BURST_STEP_FRAMES = 6
.const MIN_PAUSE_FRAMES = 8
.const PAUSE_RANDOM_MASK = 63
.const FIRST_LAUNCH_COLUMN = 6
.const LAUNCH_COLUMN_RANGE = 28
.const FIRST_BURST_ROW = 4
.const BURST_ROW_MASK = 7
.const COLOR_PAIR_MASK = 7

.const screenPointer = $fb
.const colorPointer = $fd
.const phaseJump = $f7
.const drawingPointer = $f9
.const captionPointer = $fb
.const captionBitmapPointer = $fd
.const captionScreenPointer = $f7
.const captionColorPointer = $f9

.macro DrawRing(ringRadius, style) {
    lda #ringRadius
    sta radius
    lda #style
    sta ringStyle
    jsr drawRing
}

.macro NextPhase(nextPhase, frames) {
    lda #nextPhase
    sta phase
    lda #frames
    sta timer
}

.macro WaitFrames(frames) {
    lda #frames
    sta framesToWait
waitForFrames:
    lda framesToWait
    bne waitForFrames
}

start:
    lda #BLACK
    sta BORDER
    sta BACKGROUND
    lda #TEXT_SCREEN_WITH_ROM_CHARSET
    sta MEMORY_SETUP
    jsr KERNAL_CLEAR_SCREEN
    jsr initSound
    jsr startFrameInterrupt

    :WaitFrames(FIREWORKS_ONLY_FRAMES)
    jsr showDrawing
    :WaitFrames(FIREWORKS_WITH_DRAWING_FRAMES)
    jsr startPictures
stayInPictures:
    jmp stayInPictures

startFrameInterrupt:
    sei
    lda #$7f
    sta CIA1_INTERRUPT_CONTROL
    lda CIA1_INTERRUPT_CONTROL
    lda #<frameInterrupt
    sta IRQ_VECTOR
    lda #>frameInterrupt
    sta IRQ_VECTOR + 1
    lda #RASTER_IRQ_LINE
    sta RASTER
    lda #TEXT_MODE
    sta SCREEN_CONTROL
    lda #1
    sta INTERRUPT_ENABLE
    sta INTERRUPT_STATUS
    cli
    rts

frameInterrupt:
    lda #1
    sta INTERRUPT_STATUS
    lda framesToWait
    beq framesCounted
    dec framesToWait
framesCounted:
    lda fireworksRunning
    beq frameDone
    jsr updateFireworks
frameDone:
    jmp IRQ_EXIT

showDrawing:
    lda #1
    sta drawingShown
    ldx #0
copyDrawing:
    .for (var quarter = 0; quarter < 4; quarter++) {
        lda DRAWING_CHARS + quarter * 250,x
        sta SCREEN + quarter * 250,x
        lda DRAWING_COLORS + quarter * 250,x
        sta COLOR_RAM + quarter * 250,x
    }
    inx
    cpx #250
    bne copyDrawing
    rts

startPictures:
    sei
    lda #0
    sta fireworksRunning
    sta SPRITES_ENABLED
    lda #SCENE_CHAMPAGNE
    sta currentScene
    jsr showCurrentScene
    jsr setupLogoSprites
    lda #PICTURE_SCREEN_AND_BITMAP
    sta MEMORY_SETUP
    lda #MULTICOLOR_MODE
    sta HORIZONTAL_CONTROL
    lda #PICTURE_BORDER_COLOR
    sta BORDER
    lda #BITMAP_MODE
    sta SCREEN_CONTROL
    jsr animateLogo
    lda #$ff
    sta SPRITES_ENABLED
    jsr startMusic
    cli
    rts

setupLogoSprites:
    lda #0
    sta SPRITES_EXPANDED_X
    sta SPRITES_EXPANDED_Y
    lda #$ff
    sta SPRITES_MULTICOLOR
    lda #KNA_SHARED_COLOR_1
    sta SPRITE_SHARED_COLOR_1
    lda #KNA_SHARED_COLOR_2
    sta SPRITE_SHARED_COLOR_2
    lda #KNA_SPRITE_COLOR
    ldx #KNA_SPRITE_COUNT - 1
colorLogoSprite:
    sta SPRITE_COLORS,x
    dex
    bpl colorLogoSprite
    rts

startMusic:
    lda #music.startSong - 1
    jsr music.init
    lda #CIA_TIMER_A_START_CONTINUOUS
    sta CIA1_TIMER_A_CONTROL
    lda #CIA_TIMER_A_INTERRUPT_ON
    sta CIA1_INTERRUPT_CONTROL
    lda CIA1_INTERRUPT_CONTROL
    lda #<pictureInterrupt
    sta IRQ_VECTOR
    lda #>pictureInterrupt
    sta IRQ_VECTOR + 1
    rts

pictureInterrupt:
    lda INTERRUPT_STATUS
    and #1
    beq checkMusicTimer
    sta INTERRUPT_STATUS
    jsr animateLogo
    jsr countSceneFrames
    jsr tickCaptions
checkMusicTimer:
    lda CIA1_INTERRUPT_CONTROL
    and #1
    beq pictureInterruptDone
    jsr music.play
pictureInterruptDone:
    jmp IRQ_EXIT

countSceneFrames:
    lda sceneFramesLeft
    bne decrementLowByte
    dec sceneFramesLeft + 1
decrementLowByte:
    dec sceneFramesLeft
    lda sceneFramesLeft
    ora sceneFramesLeft + 1
    bne sceneContinues
    lda currentScene
    eor #1
    sta currentScene
    cli
    jmp showCurrentScene
sceneContinues:
    rts

showCurrentScene:
    ldx currentScene
    lda sceneFramesLow,x
    sta sceneFramesLeft
    lda sceneFramesHigh,x
    sta sceneFramesLeft + 1
    lda #0
    sta logoPhase
    sta captionsShown
    lda #<FIRST_CAPTION_FRAMES
    sta captionFramesLeft
    lda #>FIRST_CAPTION_FRAMES
    sta captionFramesLeft + 1
    lda currentScene
    bne showCommodoreWithoutCaptions
    jmp showChampagne
showCommodoreWithoutCaptions:
    jsr clearLogoCaptions
    jmp showCommodore

tickCaptions:
    lda currentScene
    cmp #SCENE_COMMODORE
    bne captionsIdle
    lda captionsShown
    cmp #logoCaptionsHigh - logoCaptionsLow
    beq captionsIdle
    lda captionFramesLeft
    bne decrementCaptionLowByte
    dec captionFramesLeft + 1
decrementCaptionLowByte:
    dec captionFramesLeft
    lda captionFramesLeft
    ora captionFramesLeft + 1
    bne captionsIdle
    lda #CAPTION_INTERVAL_FRAMES
    sta captionFramesLeft
    ldx captionsShown
    inc captionsShown
    lda #1
    jmp drawLogoCaption
captionsIdle:
    rts

clearLogoCaptions:
    ldx #0
clearNextCaption:
    stx captionIndex
    lda #0
    jsr drawLogoCaption
    ldx captionIndex
    inx
    cpx #logoCaptionsHigh - logoCaptionsLow
    bne clearNextCaption
    rts

drawLogoCaption:
    sta captionVisible
    lda logoCaptionsLow,x
    sta captionPointer
    lda logoCaptionsHigh,x
    sta captionPointer + 1
captionRecord:
    ldy #0
    lda (captionPointer),y
    beq captionDrawn
    sta captionBytes
    iny
    lda (captionPointer),y
    sta captionCells
    iny
    lda (captionPointer),y
    sta captionScreenValue
    iny
    lda (captionPointer),y
    sta captionColorValue
    iny
    lda (captionPointer),y
    sta captionBitmapPointer
    iny
    lda (captionPointer),y
    sta captionBitmapPointer + 1
    iny
    lda (captionPointer),y
    sta captionScreenPointer
    sta captionColorPointer
    iny
    lda (captionPointer),y
    clc
    adc #>(COMMODORE_BANK + SCREEN_IN_BANK)
    sta captionScreenPointer + 1
    lda (captionPointer),y
    clc
    adc #>COLOR_RAM
    sta captionColorPointer + 1
    lda #CAPTION_RECORD_HEADER_SIZE
    jsr advanceCaptionPointer
    lda captionVisible
    beq clearCaptionBitmap
    ldy captionCells
    dey
paintCaptionCells:
    lda captionScreenValue
    sta (captionScreenPointer),y
    lda captionColorValue
    sta (captionColorPointer),y
    dey
    bpl paintCaptionCells
    ldy captionBytes
    dey
copyCaptionBitmap:
    lda (captionPointer),y
    sta (captionBitmapPointer),y
    dey
    bpl copyCaptionBitmap
    jmp nextCaptionRecord
clearCaptionBitmap:
    ldy captionBytes
    dey
    lda #0
clearCaptionByte:
    sta (captionBitmapPointer),y
    dey
    bpl clearCaptionByte
nextCaptionRecord:
    lda captionBytes
    jsr advanceCaptionPointer
    jmp captionRecord
captionDrawn:
    rts

advanceCaptionPointer:
    clc
    adc captionPointer
    sta captionPointer
    bcc captionPointerAdvanced
    inc captionPointer + 1
captionPointerAdvanced:
    rts

showChampagne:
    :ShowPictureFromBank(CHAMPAGNE_BANK, CHAMPAGNE_BANK_BITS)

showCommodore:
    :ShowPictureFromBank(COMMODORE_BANK, COMMODORE_BANK_BITS)

animateLogo:
    inc logoPhase
    ldx logoPhase
    lda currentScene
    beq moveLogoOnChampagne
    jmp moveLogoOnCommodore

moveLogoOnChampagne:
    :MoveLogoAlong(champagnePath)

moveLogoOnCommodore:
    :MoveLogoAlong(commodorePath)

updateFireworks:
    ldx #0
slotLoop:
    stx currentSlot
    dec slotTimers,x
    bne nextSlot
    jsr loadSlot
    jsr runPhase
    jsr storeSlot
nextSlot:
    ldx currentSlot
    inx
    cpx #SLOT_COUNT
    bne slotLoop
    rts

loadSlot:
    ldx currentSlot
    lda slotPhases,x
    sta phase
    lda slotCenterColumns,x
    sta centerColumn
    lda slotCenterRows,x
    sta centerRow
    lda slotLineColors,x
    sta lineColor
    lda slotDotColors,x
    sta dotColor
    lda slotSpreadRadii,x
    sta spreadRadius
    lda slotRocketRows,x
    sta rocketRow
    rts

storeSlot:
    ldx currentSlot
    lda phase
    sta slotPhases,x
    lda timer
    sta slotTimers,x
    lda centerColumn
    sta slotCenterColumns,x
    lda centerRow
    sta slotCenterRows,x
    lda lineColor
    sta slotLineColors,x
    lda dotColor
    sta slotDotColors,x
    lda spreadRadius
    sta slotSpreadRadii,x
    lda rocketRow
    sta slotRocketRows,x
    rts

runPhase:
    lda phase
    asl
    tax
    lda phaseHandlers,x
    sta phaseJump
    lda phaseHandlers + 1,x
    sta phaseJump + 1
    jmp (phaseJump)

launchPhase:
    jsr random
    and #31
    cmp #LAUNCH_COLUMN_RANGE
    bcc columnInRange
    sbc #LAUNCH_COLUMN_RANGE
columnInRange:
    clc
    adc #FIRST_LAUNCH_COLUMN
    sta centerColumn
    jsr random
    and #BURST_ROW_MASK
    clc
    adc #FIRST_BURST_ROW
    sta centerRow
    jsr random
    and #COLOR_PAIR_MASK
    tax
    lda lineColors,x
    sta lineColor
    lda dotColors,x
    sta dotColor
    lda #LAUNCH_ROW
    sta rocketRow
    lda #CHAR_ROCKET
    jsr plotRocket
    :NextPhase(PHASE_ROCKET_FLY, ROCKET_STEP_FRAMES)
    rts

rocketFlyPhase:
    lda rocketRow
    cmp centerRow
    beq rocketArrived
    lda #CHAR_SPACE
    jsr plotRocket
    dec rocketRow
    lda #CHAR_ROCKET
    jsr plotRocket
    :NextPhase(PHASE_ROCKET_FLY, ROCKET_STEP_FRAMES)
    rts
rocketArrived:
    lda #CHAR_CIRCLE
    jsr plotCenter
    jsr playBoom
    :NextPhase(PHASE_DOTS_AROUND, BURST_STEP_FRAMES)
    rts

dotsAroundPhase:
    :DrawRing(1, STYLE_DOT)
    :NextPhase(PHASE_CIRCLE_GONE, BURST_STEP_FRAMES)
    rts

circleGonePhase:
    lda #CHAR_SPACE
    jsr plotCenter
    :NextPhase(PHASE_FIRST_LINES, BURST_STEP_FRAMES)
    rts

firstLinesPhase:
    :DrawRing(1, STYLE_LINE)
    lda #2
    sta spreadRadius
    :NextPhase(PHASE_SPREAD, BURST_STEP_FRAMES)
    rts

spreadPhase:
    lda spreadRadius
    sec
    sbc #2
    beq drawTrailDots
    sta radius
    lda #STYLE_ERASE
    sta ringStyle
    jsr drawRing
drawTrailDots:
    ldx spreadRadius
    dex
    stx radius
    lda #STYLE_DOT
    sta ringStyle
    jsr drawRing
    lda spreadRadius
    sta radius
    lda #STYLE_LINE
    sta ringStyle
    jsr drawRing
    inc spreadRadius
    lda spreadRadius
    cmp #LAST_RADIUS + 1
    beq spreadFinished
    :NextPhase(PHASE_SPREAD, BURST_STEP_FRAMES)
    rts
spreadFinished:
    :NextPhase(PHASE_FADE, BURST_STEP_FRAMES)
    rts

fadePhase:
    :DrawRing(LAST_RADIUS - 1, STYLE_ERASE)
    :DrawRing(LAST_RADIUS, STYLE_DOT)
    :NextPhase(PHASE_VANISH, BURST_STEP_FRAMES)
    rts

vanishPhase:
    :DrawRing(LAST_RADIUS, STYLE_ERASE)
    lda #PHASE_WAITING
    sta phase
    jsr random
    and #PAUSE_RANDOM_MASK
    clc
    adc #MIN_PAUSE_FRAMES
    sta timer
    rts

plotRocket:
    sta plotChar
    lda centerColumn
    sta plotColumn
    lda rocketRow
    sta plotRow
    lda #ROCKET_COLOR
    sta plotColor
    jmp plot

plotCenter:
    sta plotChar
    lda centerColumn
    sta plotColumn
    lda centerRow
    sta plotRow
    lda lineColor
    sta plotColor
    jmp plot

drawRing:
    ldx #0
ringSpark:
    stx spark
    lda radius
    cmp sparkFirstRings,x
    bcc nextSpark

    lda centerColumn
    ldy radius
stepColumn:
    clc
    adc sparkColumnSteps,x
    dey
    bne stepColumn
    sta plotColumn
    lda centerRow
    ldy radius
stepRow:
    clc
    adc sparkRowSteps,x
    dey
    bne stepRow
    sta plotRow

    lda radius
    sec
    sbc sparkFirstRings,x
    tay
    iny
    sty forkSteps
    lda plotColumn
forkColumn:
    clc
    adc sparkForkColumnSteps,x
    dey
    bne forkColumn
    sta plotColumn
    lda plotRow
    ldy forkSteps
forkRow:
    clc
    adc sparkForkRowSteps,x
    dey
    bne forkRow
    sta plotRow

    lda ringStyle
    beq eraseStyle
    cmp #STYLE_DOT
    beq dotStyle
    lda sparkLineChars,x
    sta plotChar
    lda lineColor
    jmp plotSpark
dotStyle:
    lda #CHAR_DOT
    sta plotChar
    lda dotColor
    jmp plotSpark
eraseStyle:
    lda #CHAR_SPACE
    sta plotChar
    lda #BLACK
plotSpark:
    sta plotColor
    jsr plot
nextSpark:
    ldx spark
    inx
    cpx #SPARK_COUNT
    beq ringDone
    jmp ringSpark
ringDone:
    rts

plot:
    ldx plotRow
    cpx #SCREEN_ROWS
    bcs plotOutside
    ldy plotColumn
    cpy #SCREEN_COLUMNS
    bcs plotOutside
    lda drawingShown
    beq plotOnScreen
    lda drawingRowsLow,x
    sta drawingPointer
    lda drawingRowsHigh,x
    sta drawingPointer + 1
    lda (drawingPointer),y
    cmp #CHAR_SPACE
    bne plotOutside
plotOnScreen:
    lda screenRowsLow,x
    sta screenPointer
    sta colorPointer
    lda screenRowsHigh,x
    sta screenPointer + 1
    clc
    adc #>(COLOR_RAM - SCREEN)
    sta colorPointer + 1
    lda plotChar
    sta (screenPointer),y
    lda plotColor
    sta (colorPointer),y
plotOutside:
    rts

initSound:
    ldx #SID_REGISTER_COUNT - 1
    lda #0
clearSidRegister:
    sta SID,x
    dex
    bpl clearSidRegister
    lda #BOOM_FILTER_CUTOFF
    sta SID_FILTER_CUTOFF_HIGH
    lda #RESONANT_FILTER_ON_ALL_VOICES
    sta SID_FILTER_ROUTING
    lda #LOWPASS_FULL_VOLUME
    sta SID_VOLUME_FILTER_MODE
    rts

playBoom:
    ldx currentSlot
    ldy boomVoiceOffsets,x
    lda #NOISE_GATE_OFF
    sta SID_CONTROL,y
    lda #0
    sta SID_FREQUENCY_LOW,y
    lda #BOOM_FREQUENCY_HIGH
    sta SID_FREQUENCY_HIGH,y
    lda #BOOM_ATTACK_DECAY
    sta SID_ATTACK_DECAY,y
    lda #BOOM_SUSTAIN_RELEASE
    sta SID_SUSTAIN_RELEASE,y
    lda #NOISE_GATE_ON
    sta SID_CONTROL,y
    rts

random:
    lda randomSeed
    asl
    bcc keepSeed
    eor #$1d
keepSeed:
    sta randomSeed
    rts

phaseHandlers:
    .word launchPhase, rocketFlyPhase, dotsAroundPhase, circleGonePhase
    .word firstLinesPhase, spreadPhase, fadePhase, vanishPhase

screenRowsLow:
    .fill SCREEN_ROWS, <(SCREEN + i * SCREEN_COLUMNS)
screenRowsHigh:
    .fill SCREEN_ROWS, >(SCREEN + i * SCREEN_COLUMNS)
drawingRowsLow:
    .fill SCREEN_ROWS, <(DRAWING_CHARS + i * SCREEN_COLUMNS)
drawingRowsHigh:
    .fill SCREEN_ROWS, >(DRAWING_CHARS + i * SCREEN_COLUMNS)

sparkColumnSteps:
    .byte 0, 1, 1, 1, 0, $ff, $ff, $ff
    .byte 0, 0, 1, 1, 0, 0, $ff, $ff
sparkRowSteps:
    .byte $ff, $ff, 0, 1, 1, 1, 0, $ff
    .byte $ff, $ff, 0, 0, 1, 1, 0, 0
sparkForkColumnSteps:
    .byte 0, 0, 0, 0, 0, 0, 0, 0
    .byte $ff, 1, 0, 0, $ff, 1, 0, 0
sparkForkRowSteps:
    .byte 0, 0, 0, 0, 0, 0, 0, 0
    .byte 0, 0, $ff, 1, 0, 0, $ff, 1
sparkFirstRings:
    .fill 8, 1
    .fill 8, FORK_RING
sparkLineChars:
    .byte CHAR_VERTICAL, CHAR_SLASH, CHAR_HORIZONTAL, CHAR_BACKSLASH
    .byte CHAR_VERTICAL, CHAR_SLASH, CHAR_HORIZONTAL, CHAR_BACKSLASH
    .byte CHAR_BACKSLASH, CHAR_SLASH, CHAR_SLASH, CHAR_BACKSLASH
    .byte CHAR_SLASH, CHAR_BACKSLASH, CHAR_BACKSLASH, CHAR_SLASH

lineColors:
    .byte YELLOW, LIGHT_RED, LIGHT_BLUE, LIGHT_GREEN, WHITE, CYAN, PURPLE, ORANGE
dotColors:
    .byte ORANGE, RED, BLUE, GREEN, LIGHT_GRAY, LIGHT_BLUE, BROWN, BROWN

boomVoiceOffsets: .byte 0, 7, 14, 0

slotPhases: .fill SLOT_COUNT, PHASE_WAITING
slotTimers: .byte 1, 30, 60, 90
slotCenterColumns: .fill SLOT_COUNT, 0
slotCenterRows: .fill SLOT_COUNT, 0
slotLineColors: .fill SLOT_COUNT, 0
slotDotColors: .fill SLOT_COUNT, 0
slotSpreadRadii: .fill SLOT_COUNT, 0
slotRocketRows: .fill SLOT_COUNT, 0

randomSeed: .byte $a7
currentSlot: .byte 0
phase: .byte 0
timer: .byte 0
centerColumn: .byte 0
centerRow: .byte 0
lineColor: .byte 0
dotColor: .byte 0
rocketRow: .byte 0
radius: .byte 0
spreadRadius: .byte 0
ringStyle: .byte 0
spark: .byte 0
forkSteps: .byte 0
plotColumn: .byte 0
plotRow: .byte 0
plotChar: .byte 0
plotColor: .byte 0
framesToWait: .byte 0
fireworksRunning: .byte 1
drawingShown: .byte 0
currentScene: .byte SCENE_CHAMPAGNE
sceneFramesLeft: .word CHAMPAGNE_SCENE_FRAMES
sceneFramesLow: .byte <CHAMPAGNE_SCENE_FRAMES, <COMMODORE_SCENE_FRAMES
sceneFramesHigh: .byte >CHAMPAGNE_SCENE_FRAMES, >COMMODORE_SCENE_FRAMES
captionsShown: .byte 0
captionFramesLeft: .word FIRST_CAPTION_FRAMES
captionIndex: .byte 0
captionVisible: .byte 0
captionBytes: .byte 0
captionCells: .byte 0
captionScreenValue: .byte 0
captionColorValue: .byte 0
logoPhase: .byte 0

champagnePath: :LogoPathTables(champagneEllipse)
commodorePath: :LogoPathTables(commodoreEllipse)

.assert "Code must end below the champagne bank", * <= CHAMPAGNE_BANK, true

*=DRAWING_CHARS "Drawing screen codes"
    .fill KRISSZ_SCREEN_SIZE, drawing.get(KRISSZ_CHARSET_SIZE + i)
*=DRAWING_COLORS "Drawing colors"
    .fill KRISSZ_SCREEN_SIZE, drawing.get(KRISSZ_CHARSET_SIZE + KRISSZ_SCREEN_SIZE + i)
.assert "Drawing must end below the music", * <= music.location, true

*=music.location "Music"
    .fill music.size, music.getData(i)
.assert "Music must end below the code", * <= CODE_START, true

:PictureBank(CHAMPAGNE_BANK, champagne)
:PictureBank(COMMODORE_BANK, commodore)

.const LOGO_CAPTION_BITMAP = COMMODORE_BANK + BITMAP_IN_BANK
*=COMMODORE_BANK + COLORS_IN_BANK + $400 "Logo captions"
#import "logo_captions.asm"
.assert "Logo captions must end below the Commodore bitmap", * <= LOGO_CAPTION_BITMAP, true
.assert "LOGO_CAPTION_TOTAL must match logo_captions.asm", LOGO_CAPTION_COUNT, LOGO_CAPTION_TOTAL

.disk [filename="happynew27.d64", name="HAPPY NEW 2027", id="27"] {
    [name="HAPPYNEW27", type="prg", segments="Default"],
}
