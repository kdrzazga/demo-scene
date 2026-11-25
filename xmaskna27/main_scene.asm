#import "kna-sprites.asm"

.const SETLFS = $ffba
.const SETNAM = $ffbd
.const LOAD = $ffd5
.const LAST_DEVICE = $ba
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

loadMainScene:
	lda #mainSceneNameEnd - mainSceneName
	ldx #<mainSceneName
	ldy #>mainSceneName
	jsr SETNAM
	lda #1
	ldx LAST_DEVICE
	cpx #8
	bcs !+
	ldx #8
!:	ldy #1
	jsr SETLFS
	lda #0
	jsr LOAD
	bcs loadMainScene
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
	lda #$ff
	sta $d015
	cli
	rts

mainSceneIrq:
	lda #$01
	sta $d019
	jsr music.play
	jsr animateLogo
	jmp IRQ_EXIT

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
	rts

mainSceneName:
	.encoding "petscii_upper"
	.text "SCENE"
	.encoding "screencode_upper"
mainSceneNameEnd:

circlePhase:
	.byte 0
logoHighX:
	.byte 0

logoXTable:
	.fill LOGO_CIRCLE_STEPS, 24 + LOGO_LEFT + round(LOGO_CIRCLE_RADIUS * cos(toRadians(i * 360 / LOGO_CIRCLE_STEPS)))
logoYTable:
	.fill LOGO_CIRCLE_STEPS, 50 + LOGO_TOP + round(LOGO_CIRCLE_RADIUS * sin(toRadians(i * 360 / LOGO_CIRCLE_STEPS)))

logoSprites:
	:KnaSprites()

.assert "Logo sprites must fit below the main scene screen", MAIN_SCENE_SPRITES + KNA_SPRITE_COUNT * 64 <= MAIN_SCENE_SCREEN, true
.assert "Logo sprites must be whole pages", mod(KNA_SPRITE_COUNT * 64, 256) == 0, true
