#import "kna-sprites.asm"

.const SETLFS = $ffba
.const SETNAM = $ffbd
.const OPEN = $ffc0
.const CLOSE = $ffc3
.const CHKIN = $ffc6
.const CLRCHN = $ffcc
.const CHRIN = $ffcf
.const READST = $ffb7
.const LAST_DEVICE = $ba
.const SEQUENTIAL_FILE_NUMBER = 2
.const SEQUENTIAL_CHANNEL = 2
.const NAMES_START = $a000
.const NAMES_END = NAMES_START + 10001
.const MEMORY_WITHOUT_BASIC = $36
.const KOALA_SCREEN_DATA = KOALA_START + $1f40
.const KOALA_COLOR_DATA = KOALA_START + $2328
.const KOALA_BACKGROUND_DATA = KOALA_START + $2710
.const MAIN_SCENE_SPRITES = $4000
.const MAIN_SCENE_SCREEN = $4400
.const MAIN_SCENE_SPRITE_POINTER = (MAIN_SCENE_SPRITES & $3fff) / 64
.const MAIN_SCENE_IRQ_LINE = $fc
.const LOGO_LEFT = 68
.const LOGO_TOP = 60
.const LOGO_CIRCLE_RADIUS = 16
.const LOGO_CIRCLE_STEPS = 256
.const LOGO_PAINT_FRAMES = 3
.const LOGO_HOLD_FRAMES = 250
.const LOGO_WAVE_FRAMES = 3
.var logoPaintOrder = List().add(0, 4, 1, 5, 2, 6, 3, 7).lock()

.var logoEffectMasks = List()
.var logoEffectFrames = List()
.var paintedSprites = 0
.for (var step = 0; step < logoPaintOrder.size(); step++) {
    .eval paintedSprites = paintedSprites | (1 << logoPaintOrder.get(step))
    .eval logoEffectMasks.add(paintedSprites)
    .eval logoEffectFrames.add(step == logoPaintOrder.size() - 1 ? LOGO_HOLD_FRAMES : LOGO_PAINT_FRAMES)
}
.for (var waveStep = 0; waveStep < KNA_SPRITE_COLUMNS * 2 - 1; waveStep++) {
    .var column = waveStep < KNA_SPRITE_COLUMNS ? waveStep : KNA_SPRITE_COLUMNS * 2 - 2 - waveStep
    .eval logoEffectMasks.add($ff & ~((1 << column) | (1 << (column + KNA_SPRITE_COLUMNS))))
    .eval logoEffectFrames.add(LOGO_WAVE_FRAMES)
}
.eval logoEffectMasks.add($ff)
.eval logoEffectFrames.add(LOGO_HOLD_FRAMES)
.const LOGO_WAVE_START = logoPaintOrder.size()
.eval logoEffectMasks.lock()
.eval logoEffectFrames.lock()

.macro LoadSequentialFile(fileName, fileNameEnd, target, end) {
loadFile:
	lda #fileNameEnd - fileName
	ldx #<fileName
	ldy #>fileName
	jsr SETNAM
	lda #SEQUENTIAL_FILE_NUMBER
	ldx LAST_DEVICE
	cpx #8
	bcs !+
	ldx #8
!:	ldy #SEQUENTIAL_CHANNEL
	jsr SETLFS
	jsr OPEN
	bcs loadFailed
	ldx #SEQUENTIAL_FILE_NUMBER
	jsr CHKIN
	bcs loadFailed
	lda #<target
	sta storeByte + 1
	lda #>target
	sta storeByte + 2
readByte:
	jsr CHRIN
storeByte:
	sta $ffff
	inc storeByte + 1
	bne !+
	inc storeByte + 2
!:	jsr READST
	beq readByte
	jsr CLRCHN
	lda #SEQUENTIAL_FILE_NUMBER
	jsr CLOSE
	lda storeByte + 1
	cmp #<end
	bne loadFile
	lda storeByte + 2
	cmp #>end
	bne loadFile
	jmp loaded
loadFailed:
	jsr CLRCHN
	lda #SEQUENTIAL_FILE_NUMBER
	jsr CLOSE
	jmp loadFile
loaded:
}

loadMainScene:
	:LoadSequentialFile(mainSceneName, mainSceneNameEnd, KOALA_START, KOALA_END)
	:LoadSequentialFile(namesFileName, namesFileNameEnd, NAMES_START, NAMES_END)
	rts

showMainScene:
	lda #$0b
	sta $d011
	ldx #0
!:
	.for (var i = 0; i < 4; i++) {
		lda KOALA_SCREEN_DATA + i * 250, x
		sta MAIN_SCENE_SCREEN + i * 250, x
		lda KOALA_COLOR_DATA + i * 250, x
		sta $d800 + i * 250, x
	}
	inx
	cpx #250
	bne !-
	ldx #0
!:
	.for (var page = 0; page < KNA_SPRITE_COUNT * 64 / 256; page++) {
		lda logoSprites + page * 256, x
		sta MAIN_SCENE_SPRITES + page * 256, x
	}
	inx
	bne !-

	sei
	lda #MEMORY_WITHOUT_BASIC
	sta $01
	lda #0
	sta $d015
	sta $d01b
	lda #$ff
	sta $d01c
	sta $d017
	sta $d01d
	lda #KNA_SHARED_COLOR_1
	sta $d025
	lda #KNA_SHARED_COLOR_2
	sta $d026
	ldx #KNA_SPRITE_COUNT - 1
!:	txa
	clc
	adc #MAIN_SCENE_SPRITE_POINTER
	sta MAIN_SCENE_SCREEN + $3f8, x
	lda #KNA_SPRITE_COLOR
	sta $d027, x
	dex
	bpl !-
	jsr animateLogo
	lda #<mainSceneIrq
	sta $0314
	lda #>mainSceneIrq
	sta $0315
	lda #MAIN_SCENE_IRQ_LINE
	sta $d012
	lda KOALA_BACKGROUND_DATA
	sta $d021
	lda #RED
	sta $d020
	lda $dd00
	and #%11111100
	ora #%00000010
	sta $dd00
	lda #$18
	sta $d018
	lda #$d8
	sta $d016
	lda #$3b
	sta $d011
	lda #0
	sta logoEffectStep
	sta logoEffectTimer
	cli
	rts

mainSceneIrq:
	lda #$01
	sta $d019
	jsr playMusicOnce
	jsr animateLogo
	jsr runLogoEffects
	jmp IRQ_EXIT

runLogoEffects:
	lda logoEffectTimer
	beq nextLogoEffect
	dec logoEffectTimer
	rts
nextLogoEffect:
	ldx logoEffectStep
	cpx #logoEffectMasks.size()
	bne !+
	ldx #LOGO_WAVE_START
	stx logoEffectStep
!:	lda logoEffectMaskTable, x
	sta $d015
	lda logoEffectFrameTable, x
	sta logoEffectTimer
	inc logoEffectStep
	rts

animateLogo:
	inc circlePhase
	ldx circlePhase
	lda #0
	sta logoHighX
	.for (var column = 0; column < KNA_SPRITE_COLUMNS; column++) {
		lda logoXTable, x
		clc
		adc #column * 48
		sta $d000 + column * 2
		sta $d000 + (column + KNA_SPRITE_COLUMNS) * 2
		bcc !+
		lda logoHighX
		ora #(1 << column) | (1 << (column + KNA_SPRITE_COLUMNS))
		sta logoHighX
	!:
	}
	lda logoHighX
	sta $d010
	lda logoYTable, x
	.for (var column = 0; column < KNA_SPRITE_COLUMNS; column++) {
		sta $d001 + column * 2
	}
	clc
	adc #42
	.for (var column = 0; column < KNA_SPRITE_COLUMNS; column++) {
		sta $d001 + (column + KNA_SPRITE_COLUMNS) * 2
	}
	lda circlePhase
	and #LOGO_CIRCLE_STEPS / 2 - 1
	bne !+
	lda circlePhase
	asl
	lda #NAMES_AT_TOP
	bcc requestNames
	lda #NAMES_AT_BOTTOM
requestNames:
	sta namesRequest
!:	rts

mainSceneName:
	.encoding "petscii_upper"
	.text "SCENE,S,R"
	.encoding "screencode_upper"
mainSceneNameEnd:
namesFileName:
	.encoding "petscii_upper"
	.text "NAMES,S,R"
	.encoding "screencode_upper"
namesFileNameEnd:

circlePhase:
	.byte 0
logoHighX:
	.byte 0
logoEffectStep:
	.byte 0
logoEffectTimer:
	.byte 0
logoEffectMaskTable:
	.fill logoEffectMasks.size(), logoEffectMasks.get(i)
logoEffectFrameTable:
	.fill logoEffectFrames.size(), logoEffectFrames.get(i)

logoXTable:
	.fill LOGO_CIRCLE_STEPS, 24 + LOGO_LEFT + round(LOGO_CIRCLE_RADIUS * cos(toRadians(i * 360 / LOGO_CIRCLE_STEPS)))
logoYTable:
	.fill LOGO_CIRCLE_STEPS, 50 + LOGO_TOP + round(LOGO_CIRCLE_RADIUS * sin(toRadians(i * 360 / LOGO_CIRCLE_STEPS)))

logoSprites:
	:KnaSprites()

.assert "Names must load below the I/O area", NAMES_END <= $d000, true
.assert "Logo sprites must fit below the main scene screen", MAIN_SCENE_SPRITES + KNA_SPRITE_COUNT * 64 <= MAIN_SCENE_SCREEN, true
.assert "Logo sprites must be whole pages", mod(KNA_SPRITE_COUNT * 64, 256) == 0, true
