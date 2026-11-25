.encoding "screencode_upper"

#import "merry_sprites.asm"
#import "kna-sprites.asm"

.var music = LoadSid("Hej_Koleda.sid")

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
.const MERRY_BACKUP = $4800
.const CAPTION_BACKUP = $4d00
.const BITMAP = $6000
.const KOALA_SCREEN = $7f40
.const KOALA_COLOR = $8328
.const KOALA_BACKGROUND = $8710

.const IRQ_LINE = 250
.const SCENE_FRAMES = 1100
.const REVEAL_FRAMES = 100
.const FIRST_SCREEN_HOLD_FRAMES = 150
.const SECOND_SCREEN_DELAY_FRAMES = 50

.const AREA_LEFT = 33 * 2
.const AREA_RIGHT = 108 * 2
.const LETTER_CENTER_Y = 75
.const LETTER_SPRITE_Y = 50 + LETTER_CENTER_Y - GLYPH_HEIGHT
.const LETTER_GAP = 3
.const LETTER_STEP = GLYPH_WIDTH * 2 + LETTER_GAP
.const LETTERS_LEFT = floor((AREA_LEFT + AREA_RIGHT - (4 * LETTER_STEP + GLYPH_WIDTH * 2)) / 2)
.const BOUNCE_AMPLITUDE = 5
.const BOUNCE_PHASE_STEP = 10
.var letterColors = List().add(RED, GREEN, RED, GREEN, RED).lock()

.const MERRY_COL = 8
.const MERRY_ROW = 6
.const MERRY_WIDTH = 20
.const MERRY_HEIGHT = 6
.const CAPTION_COL = 5
.const CAPTION_ROW = 12
.const CAPTION_WIDTH = 31
.const CAPTION_HEIGHT = 6

.function knaVisibleRows() {
    .var visibleRows = 0
    .for (var row = 0; row < knaLogo.size(); row++) {
        .var line = knaLogo.get(row)
        .for (var x = 0; x < line.size(); x++) {
            .if (line.substring(x, x + 1) != ".") {
                .eval visibleRows = row + 1
            }
        }
    }
    .return visibleRows
}

.const MERRY_SPRITE_POINTER = (SPRITE_DATA & $3fff) / 64
.const LOGO_SPRITE_POINTER = MERRY_SPRITE_POINTER + 5
.const CLEARED_LEFT = CAPTION_COL * 8
.const CLEARED_RIGHT = (CAPTION_COL + CAPTION_WIDTH) * 8
.const CLEARED_TOP = MERRY_ROW * 8
.const CLEARED_BOTTOM = (CAPTION_ROW + CAPTION_HEIGHT) * 8
.const LOGO_WIDTH = KNA_SPRITE_COLUMNS * 48
.const LOGO_VISIBLE_HEIGHT = knaVisibleRows() * 2
.const LOGO_SHIFT_LEFT = 25
.const LOGO_LEFT = floor((CLEARED_LEFT + CLEARED_RIGHT - LOGO_WIDTH) / 2) - LOGO_SHIFT_LEFT
.const LOGO_TOP = floor((CLEARED_TOP + CLEARED_BOTTOM - LOGO_VISIBLE_HEIGHT) / 2)
.const LOGO_CIRCLE_RADIUS = 12
.const STAR_LEFT = 31 * 8
.const LOGO_CIRCLE_STEPS = 256

.var greetingRows = List().add(7, 9, 11, 13, 15).lock()
.var greetingLines = List().add(
    List().add("KOMODA", LIGHT_RED, " & ", BLACK, "AMIGA", BLUE, " +", BLACK),
    List().add("SENDS BEST ", BLACK, "WISHES", PURPLE),
    List().add("TO ALL ", BLACK, "READERS", BLUE),
    List().add("AND ALL RETRO FANS", BLACK),
    List().add("DEC 24, 2026", BLUE)).lock()

.var greetingRows2 = List().add(9, 11, 13).lock()
.var greetingLines2 = List().add(
    List().add("LET", BLACK, " SID ", LIGHT_RED, "PLAY YOUR CAROLS.", BLACK),
    List().add("LET ", BLACK, "VIC-II", PURPLE, " SHINE YOUR XMAS TREE LAMPS", BLACK),
    List().add("AND ALWAYS KEEP ", BLACK, "MOS 6510", BLUE, " IN YOUR HEART!", BLACK)).lock()

.var allGreetingRows = List()
.var allGreetingLines = List()
.for (var i = 0; i < greetingLines.size(); i++) {
    .eval allGreetingRows.add(greetingRows.get(i))
    .eval allGreetingLines.add(greetingLines.get(i))
}
.for (var i = 0; i < greetingLines2.size(); i++) {
    .eval allGreetingRows.add(greetingRows2.get(i))
    .eval allGreetingLines.add(greetingLines2.get(i))
}
.eval allGreetingRows.lock()
.eval allGreetingLines.lock()
.const FIRST_SCREEN_LINES = greetingLines.size()

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
    .return 24 + LETTERS_LEFT + index * LETTER_STEP
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

.macro BackupRect(column, row, width, height, backup) {
    :CopyRows(BITMAP + row * 320 + column * 8, 320, backup, width * 8, width * 8, height)
    :CopyRows(SCREEN + row * 40 + column, 40, backup + width * 8 * height, width, width, height)
    :CopyRows(COLOR_RAM + row * 40 + column, 40, backup + width * 9 * height, width, width, height)
}

.macro RestoreRect(column, row, width, height, backup) {
    :CopyRows(backup, width * 8, BITMAP + row * 320 + column * 8, 320, width * 8, height)
    :CopyRows(backup + width * 8 * height, width, SCREEN + row * 40 + column, 40, width, height)
    :CopyRows(backup + width * 9 * height, width, COLOR_RAM + row * 40 + column, 40, width, height)
}

.macro ClearRect(column, row, width, height) {
    :ClearRows(BITMAP + row * 320 + column * 8, 320, width * 8, height)
}

BasicUpstart2(start)

* = $0810 "Code"
start:
        lda #$80
        sta CASE_SWITCH_LOCK
        lda #WHITE
        sta $d020
        sta $d021
        lda #BLACK
        sta TEXT_COLOR
        jsr CLEAR_SCREEN
        lda #$15
        sta $d018

        lda #music.startSong - 1
        jsr music.init
        jsr setupIrq

        jsr loadPicture
        jsr waitGreetings
        jsr showPicture
        jsr backupRect
        jsr copySprites

sceneLoop:
        jsr showMerry
        jsr waitScene
        jsr hideSprites
        jsr clearCaption
        jsr showLogo
        jsr waitScene
        jsr hideSprites
        jsr restoreRect
        jmp sceneLoop

printGreetingLine:
        lda greetingCharsLow, x
        sta readChar + 1
        lda greetingCharsHigh, x
        sta readChar + 2
        lda greetingColorsLow, x
        sta readColor + 1
        lda greetingColorsHigh, x
        sta readColor + 2
        lda greetingScreenLow, x
        sta writeChar + 1
        sta writeColor + 1
        lda greetingScreenHigh, x
        sta writeChar + 2
        clc
        adc #>(COLOR_RAM - TEXT_SCREEN)
        sta writeColor + 2
        ldy #39
readChar:
        lda $ffff, y
writeChar:
        sta $ffff, y
readColor:
        lda $ffff, y
writeColor:
        sta $ffff, y
        dey
        bpl readChar
        rts

revealGreetings:
        lda revealTimer
        ora revealTimer + 1
        beq revealNextLine
        lda revealTimer
        bne !+
        dec revealTimer + 1
!:      dec revealTimer
        rts
revealNextLine:
        ldx revealedLines
        cpx #FIRST_SCREEN_LINES
        bne !+
        lda firstScreenCleared
        bne !+
        inc firstScreenCleared
        jsr clearTextScreen
        lda #<SECOND_SCREEN_DELAY_FRAMES
        ldy #>SECOND_SCREEN_DELAY_FRAMES
        jmp setRevealTimer
!:      cpx #allGreetingLines.size()
        beq revealDone
        jsr printGreetingLine
        inc revealedLines
        lda #<REVEAL_FRAMES
        ldy #>REVEAL_FRAMES
        ldx revealedLines
        cpx #FIRST_SCREEN_LINES
        bne setRevealTimer
        lda #<FIRST_SCREEN_HOLD_FRAMES
        ldy #>FIRST_SCREEN_HOLD_FRAMES
setRevealTimer:
        sta revealTimer
        sty revealTimer + 1
revealDone:
        rts

clearTextScreen:
        lda #$20
        ldx #0
!:
        .for (var i = 0; i < 4; i++) {
            sta TEXT_SCREEN + i * 250, x
        }
        inx
        cpx #250
        bne !-
        rts

waitGreetings:
        sei
        lda revealTimer
        ora revealTimer + 1
        ldx revealedLines
        cli
        cmp #0
        bne waitGreetings
        cpx #allGreetingLines.size()
        bne waitGreetings
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
        jsr revealGreetings
        lda logoMode
        bne !+
        jsr animateLetters
        jmp !++
!:      jsr animateLogo
!:      jsr tickSceneTimer
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

copySprites:
        ldx #0
!:
        .for (var page = 0; page < 4; page++) {
            lda allSprites + page * 256, x
            sta SPRITE_DATA + page * 256, x
        }
        inx
        bne !-
        lda #0
        sta $d01b
        lda #$ff
        sta $d017
        sta $d01d
        rts

showMerry:
        sei
        lda #0
        sta logoMode
        sta $d010
        sta $d01c
        .for (var i = 0; i < 5; i++) {
            lda #MERRY_SPRITE_POINTER + i
            sta SPRITE_POINTERS + i
            lda #letterX(i)
            sta $d000 + i * 2
            lda #letterColors.get(i)
            sta $d027 + i
        }
        jsr animateLetters
        lda #%00011111
        sta $d015
        cli
        rts

showLogo:
        sei
        lda #1
        sta logoMode
        lda #$ff
        sta $d01c
        lda #KNA_SHARED_COLOR_1
        sta $d025
        lda #KNA_SHARED_COLOR_2
        sta $d026
        .for (var i = 0; i < KNA_SPRITE_COUNT; i++) {
            lda #LOGO_SPRITE_POINTER + i
            sta SPRITE_POINTERS + i
            lda #KNA_SPRITE_COLOR
            sta $d027 + i
        }
        jsr animateLogo
        lda #$ff
        sta $d015
        cli
        rts

hideSprites:
        lda #0
        sta $d015
        rts

backupRect:
        :BackupRect(MERRY_COL, MERRY_ROW, MERRY_WIDTH, MERRY_HEIGHT, MERRY_BACKUP)
        :BackupRect(CAPTION_COL, CAPTION_ROW, CAPTION_WIDTH, CAPTION_HEIGHT, CAPTION_BACKUP)
        rts

restoreRect:
        :RestoreRect(MERRY_COL, MERRY_ROW, MERRY_WIDTH, MERRY_HEIGHT, MERRY_BACKUP)
        :RestoreRect(CAPTION_COL, CAPTION_ROW, CAPTION_WIDTH, CAPTION_HEIGHT, CAPTION_BACKUP)
        rts

clearCaption:
        :ClearRect(MERRY_COL, MERRY_ROW, MERRY_WIDTH, MERRY_HEIGHT)
        :ClearRect(CAPTION_COL, CAPTION_ROW, CAPTION_WIDTH, CAPTION_HEIGHT)
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
revealTimer:
        .word 0
revealedLines:
        .byte 0
firstScreenCleared:
        .byte 0
logoMode:
        .byte 0
circlePhase:
        .byte 0
logoHighX:
        .byte 0

bounceTable:
        .fill 64, (round(BOUNCE_AMPLITUDE * sin(toRadians(i * 360 / 64))) + 256) & 255

greetingChars:
        .for (var i = 0; i < allGreetingLines.size(); i++) {
            :LineChars(allGreetingLines.get(i))
        }
greetingColors:
        .for (var i = 0; i < allGreetingLines.size(); i++) {
            :LineColors(allGreetingLines.get(i))
        }

greetingCharsLow:
        .fill allGreetingLines.size(), <(greetingChars + i * 40)
greetingCharsHigh:
        .fill allGreetingLines.size(), >(greetingChars + i * 40)
greetingColorsLow:
        .fill allGreetingLines.size(), <(greetingColors + i * 40)
greetingColorsHigh:
        .fill allGreetingLines.size(), >(greetingColors + i * 40)
greetingScreenLow:
        .fill allGreetingLines.size(), <(TEXT_SCREEN + allGreetingRows.get(i) * 40)
greetingScreenHigh:
        .fill allGreetingLines.size(), >(TEXT_SCREEN + allGreetingRows.get(i) * 40)

logoXTable:
        .fill LOGO_CIRCLE_STEPS, 24 + LOGO_LEFT + round(LOGO_CIRCLE_RADIUS * cos(toRadians(i * 360 / LOGO_CIRCLE_STEPS)))
logoYTable:
        .fill LOGO_CIRCLE_STEPS, 50 + LOGO_TOP + round(LOGO_CIRCLE_RADIUS * sin(toRadians(i * 360 / LOGO_CIRCLE_STEPS)))

allSprites:
        :MerrySprites()
        :KnaSprites()

.assert "Every greeting line needs a row", greetingRows.size() == greetingLines.size(), true
.assert "Every second greeting line needs a row", greetingRows2.size() == greetingLines2.size(), true
.assert "Data must end below sprite bank", * <= SPRITE_DATA, true
.assert "Sprites must end below screen", SPRITE_DATA + (5 + KNA_SPRITE_COUNT) * 64 <= SCREEN, true
.assert "Logo must stay left of the star", LOGO_LEFT + LOGO_CIRCLE_RADIUS + LOGO_WIDTH <= STAR_LEFT, true
.assert "Logo must stay inside the cleared rows", LOGO_TOP + LOGO_CIRCLE_RADIUS + LOGO_VISIBLE_HEIGHT <= CLEARED_BOTTOM, true
.assert "Merry backup must end below caption backup", MERRY_BACKUP + MERRY_WIDTH * 10 * MERRY_HEIGHT <= CAPTION_BACKUP, true
.assert "Caption backup must end below bitmap", CAPTION_BACKUP + CAPTION_WIDTH * 10 * CAPTION_HEIGHT <= BITMAP, true

.disk [filename="demo.d64", name="KOMODA XMAS", id="KA"] {
    [name="MERRY XMAS", type="prg", segments="Default"],
    [name="MCH2", type="prg", prgFiles="mch2.kla"],
}
