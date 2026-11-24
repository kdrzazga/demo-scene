.encoding "screencode_upper"

#import "merry_sprites.asm"

.var music = LoadSid("Hej_Koleda.sid")
.var kna = LoadBinary("KNA.kla", BF_KOALA)

.const SETLFS = $ffba
.const SETNAM = $ffbd
.const LOAD = $ffd5
.const CLEAR_SCREEN = $e544
.const IRQ_EXIT = $ea81
.const LAST_DEVICE = $ba
.const TEXT_COLOR = $0286
.const CASE_SWITCH_LOCK = $0291

.const TEXT_SCREEN = $0400
.const COLOR_RAM = $d800
.const SPRITE_DATA = $4000
.const SCREEN = $4400
.const SPRITE_POINTERS = SCREEN + $3f8
.const BITMAP_BACKUP = $4800
.const SCREEN_BACKUP = $4c00
.const COLOR_BACKUP = $4c80
.const BITMAP = $6000
.const KOALA_SCREEN = $7f40
.const KOALA_COLOR = $8328
.const KOALA_BACKGROUND = $8710

.const IRQ_LINE = 250
.const SCENE_FRAMES = 1100

.const AREA_LEFT = 33 * 2
.const AREA_RIGHT = 108 * 2
.const LETTER_CENTER_Y = 75
.const LETTER_SPRITE_Y = 50 + LETTER_CENTER_Y - GLYPH_HEIGHT
.const LETTER_STEP = floor((AREA_RIGHT - AREA_LEFT - GLYPH_WIDTH * 2) / 4)
.const BOUNCE_AMPLITUDE = 5
.const BOUNCE_PHASE_STEP = 10
.var letterColors = List().add(RED, GREEN, RED, GREEN, RED).lock()

.const RECT_COL = 8
.const RECT_ROW = 6
.const RECT_WIDTH = 20
.const RECT_HEIGHT = 6
.const KNA_COL = 12
.const KNA_WIDTH = 13
.const KNA_HEIGHT = 6

.const BITMAP_RECT = BITMAP + RECT_ROW * 320 + RECT_COL * 8
.const SCREEN_RECT = SCREEN + RECT_ROW * 40 + RECT_COL
.const COLOR_RECT = COLOR_RAM + RECT_ROW * 40 + RECT_COL
.const BITMAP_KNA = BITMAP + RECT_ROW * 320 + KNA_COL * 8
.const SCREEN_KNA = SCREEN + RECT_ROW * 40 + KNA_COL
.const COLOR_KNA = COLOR_RAM + RECT_ROW * 40 + KNA_COL

.var greetingRows = List().add(7, 9, 11, 13).lock()
.var greetingLines = List().add(
    List().add("KOMODA", LIGHT_RED, " & ", BLACK, "AMIGA", BLUE, " +", BLACK),
    List().add("SENDS BEST ", BLACK, "WISHES", PURPLE),
    List().add("TO ALL ", BLACK, "READERS", BLUE),
    List().add("AND ALL RETRO FANS", BLACK)).lock()

.function lineLength(segments) {
    .var length = 0
    .for (var i = 0; i < segments.size(); i = i + 2) {
        .eval length = length + segments.get(i).size()
    }
    .return length
}

.function linePadding(segments) {
    .return floor((40 - lineLength(segments)) / 2)
}

.function letterX(index) {
    .return 24 + AREA_LEFT + index * LETTER_STEP
}

.macro LineChars(segments) {
    .fill linePadding(segments), $20
    .for (var i = 0; i < segments.size(); i = i + 2) {
        .text segments.get(i)
    }
    .fill 40 - linePadding(segments) - lineLength(segments), $20
}

.macro LineColors(segments) {
    .fill linePadding(segments), BLACK
    .for (var segment = 0; segment < segments.size(); segment = segment + 2) {
        .fill segments.get(segment).size(), segments.get(segment + 1)
    }
    .fill 40 - linePadding(segments) - lineLength(segments), BLACK
}

.macro CopyRows(source, sourceStride, target, targetStride, width, rows) {
    .for (var row = 0; row < rows; row++) {
        ldx #width
    !:  lda source + row * sourceStride - 1, x
        sta target + row * targetStride - 1, x
        dex
        bne !-
    }
}

.macro ClearRows(target, targetStride, width, rows) {
    lda #0
    .for (var row = 0; row < rows; row++) {
        ldx #width
    !:  sta target + row * targetStride - 1, x
        dex
        bne !-
    }
}

BasicUpstart2(start)

* = $0810 "Code"
start:
        lda #$80
        sta CASE_SWITCH_LOCK
        lda #LIGHT_GRAY
        sta $d020
        sta $d021
        lda #BLACK
        sta TEXT_COLOR
        jsr CLEAR_SCREEN
        lda #$15
        sta $d018
        jsr printGreetings

        lda #music.startSong - 1
        jsr music.init
        jsr setupIrq

        jsr loadPicture
        jsr showPicture
        jsr backupRect
        jsr setupSprites

sceneLoop:
        lda #%00011111
        sta $d015
        jsr waitScene
        lda #0
        sta $d015
        jsr showKnaFragment
        jsr waitScene
        jsr restoreRect
        jmp sceneLoop

printGreetings:
        ldx #39
!:
        .for (var i = 0; i < greetingRows.size(); i++) {
            lda greetingChars + i * 40, x
            sta TEXT_SCREEN + greetingRows.get(i) * 40, x
            lda greetingColors + i * 40, x
            sta COLOR_RAM + greetingRows.get(i) * 40, x
        }
        dex
        bpl !-
        rts

setupIrq:
        sei
        lda #$7f
        sta $dc0d
        lda $dc0d
        lda #<irq
        sta $0314
        lda #>irq
        sta $0315
        lda #IRQ_LINE
        sta $d012
        lda $d011
        and #$7f
        sta $d011
        lda #$01
        sta $d01a
        sta $d019
        cli
        rts

irq:
        lda #$01
        sta $d019
        jsr music.play
        jsr animateLetters
        jsr tickSceneTimer
        jmp IRQ_EXIT

animateLetters:
        inc bouncePhase
        .for (var i = 0; i < 5; i++) {
            lda bouncePhase
            clc
            adc #i * BOUNCE_PHASE_STEP
            and #63
            tax
            lda bounceTable, x
            clc
            adc #LETTER_SPRITE_Y
            sta $d001 + i * 2
        }
        rts

tickSceneTimer:
        lda sceneTimer
        bne decrementLow
        lda sceneTimer + 1
        beq timerDone
        dec sceneTimer + 1
decrementLow:
        dec sceneTimer
timerDone:
        rts

waitScene:
        sei
        lda #<SCENE_FRAMES
        sta sceneTimer
        lda #>SCENE_FRAMES
        sta sceneTimer + 1
        cli
!:      sei
        lda sceneTimer
        ora sceneTimer + 1
        cli
        bne !-
        rts

loadPicture:
        lda #pictureNameEnd - pictureName
        ldx #<pictureName
        ldy #>pictureName
        jsr SETNAM
        lda #1
        ldx LAST_DEVICE
        cpx #8
        bcs !+
        ldx #8
!:      ldy #1
        jsr SETLFS
        lda #0
        jsr LOAD
        bcs loadPicture
        rts

showPicture:
        lda #$0b
        sta $d011
        ldx #0
!:
        .for (var i = 0; i < 4; i++) {
            lda KOALA_SCREEN + i * 250, x
            sta SCREEN + i * 250, x
            lda KOALA_COLOR + i * 250, x
            sta COLOR_RAM + i * 250, x
        }
        inx
        cpx #250
        bne !-
        lda KOALA_BACKGROUND
        sta $d021
        lda $dd00
        and #%11111100
        ora #%00000010
        sta $dd00
        lda #$18
        sta $d018
        lda #$18
        sta $d016
        lda #$3b
        sta $d011
        rts

setupSprites:
        ldx #63
!:
        .for (var i = 0; i < 5; i++) {
            lda merrySprites + i * 64, x
            sta SPRITE_DATA + i * 64, x
        }
        dex
        bpl !-
        .for (var i = 0; i < 5; i++) {
            lda #((SPRITE_DATA & $3fff) / 64) + i
            sta SPRITE_POINTERS + i
            lda #letterX(i)
            sta $d000 + i * 2
            lda #letterColors.get(i)
            sta $d027 + i
        }
        lda #0
        sta $d010
        sta $d01b
        sta $d01c
        lda #%00011111
        sta $d017
        sta $d01d
        rts

backupRect:
        :CopyRows(BITMAP_RECT, 320, BITMAP_BACKUP, RECT_WIDTH * 8, RECT_WIDTH * 8, RECT_HEIGHT)
        :CopyRows(SCREEN_RECT, 40, SCREEN_BACKUP, RECT_WIDTH, RECT_WIDTH, RECT_HEIGHT)
        :CopyRows(COLOR_RECT, 40, COLOR_BACKUP, RECT_WIDTH, RECT_WIDTH, RECT_HEIGHT)
        rts

restoreRect:
        :CopyRows(BITMAP_BACKUP, RECT_WIDTH * 8, BITMAP_RECT, 320, RECT_WIDTH * 8, RECT_HEIGHT)
        :CopyRows(SCREEN_BACKUP, RECT_WIDTH, SCREEN_RECT, 40, RECT_WIDTH, RECT_HEIGHT)
        :CopyRows(COLOR_BACKUP, RECT_WIDTH, COLOR_RECT, 40, RECT_WIDTH, RECT_HEIGHT)
        rts

showKnaFragment:
        :ClearRows(BITMAP_RECT, 320, RECT_WIDTH * 8, RECT_HEIGHT)
        :CopyRows(knaBitmap, KNA_WIDTH * 8, BITMAP_KNA, 320, KNA_WIDTH * 8, KNA_HEIGHT)
        :CopyRows(knaScreen, KNA_WIDTH, SCREEN_KNA, 40, KNA_WIDTH, KNA_HEIGHT)
        :CopyRows(knaColor, KNA_WIDTH, COLOR_KNA, 40, KNA_WIDTH, KNA_HEIGHT)
        rts

* = music.location "Music"
        .fill music.size, music.getData(i)

* = music.location + music.size "Data"
pictureName:
        .encoding "petscii_upper"
        .text "MCH2"
        .encoding "screencode_upper"
pictureNameEnd:

bouncePhase:
        .byte 0
sceneTimer:
        .word 0

bounceTable:
        .fill 64, (round(BOUNCE_AMPLITUDE * sin(toRadians(i * 360 / 64))) + 256) & 255

greetingChars:
        .for (var i = 0; i < greetingLines.size(); i++) {
            :LineChars(greetingLines.get(i))
        }
greetingColors:
        .for (var i = 0; i < greetingLines.size(); i++) {
            :LineColors(greetingLines.get(i))
        }

merrySprites:
        :MerrySprites()

knaBitmap:
        .for (var row = 0; row < KNA_HEIGHT; row++) {
            .fill KNA_WIDTH * 8, kna.getBitmap(row * 320 + i)
        }
knaScreen:
        .for (var row = 0; row < KNA_HEIGHT; row++) {
            .fill KNA_WIDTH, kna.getScreenRam(row * 40 + i)
        }
knaColor:
        .for (var row = 0; row < KNA_HEIGHT; row++) {
            .fill KNA_WIDTH, kna.getColorRam(row * 40 + i)
        }

.assert "Data must end below sprite bank", * <= SPRITE_DATA, true

.disk [filename="demo.d64", name="KOMODA XMAS", id="KA"] {
    [name="MERRY XMAS", type="prg", segments="Default"],
    [name="MCH2", type="prg", prgFiles="mch2.kla"],
}
