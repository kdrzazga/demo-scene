#import "kna-sprites.asm"

.const SCREEN = $0400
.const SPRITE_POINTERS = SCREEN + $3f8
.const SPRITE_DATA = $2000
.const CLEAR_SCREEN = $e544
.const LOGO_WIDTH = KNA_SPRITE_COLUMNS * 48
.const LOGO_HEIGHT = KNA_SPRITE_ROWS * 42
.const LOGO_SPRITE_X = 24 + (320 - LOGO_WIDTH) / 2
.const LOGO_SPRITE_Y = 50 + (200 - LOGO_HEIGHT) / 2

BasicUpstart2(start)

* = $0810 "Code"
start:
        lda #LIGHT_GRAY
        sta $d020
        lda #WHITE
        sta $d021
        jsr CLEAR_SCREEN
        .for (var i = 0; i < KNA_SPRITE_COUNT; i++) {
            lda #SPRITE_DATA / 64 + i
            sta SPRITE_POINTERS + i
            lda #LOGO_SPRITE_X + mod(i, KNA_SPRITE_COLUMNS) * 48
            sta $d000 + i * 2
            lda #LOGO_SPRITE_Y + floor(i / KNA_SPRITE_COLUMNS) * 42
            sta $d001 + i * 2
            lda #KNA_SPRITE_COLOR
            sta $d027 + i
        }
        lda #KNA_SHARED_COLOR_1
        sta $d025
        lda #KNA_SHARED_COLOR_2
        sta $d026
        lda #0
        sta $d010
        sta $d01b
        lda #$ff
        sta $d01c
        sta $d017
        sta $d01d
        sta $d015
        jmp *

* = SPRITE_DATA "Sprites"
        :KnaSprites()
