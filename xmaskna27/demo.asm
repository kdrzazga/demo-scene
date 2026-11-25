#import "snowflakes.asm"

.var music = LoadSid("Hej_Koleda.sid")

.const IRQ_EXIT = $ea81
.const RESET_VECTOR = $fffc
.const SID = $d400
.const SID_REGISTER_COUNT = $19
.const MUSIC_LENGTH_FRAMES = 8578 - 85 * 50 / 10
.const MUSIC_END_CALL = MUSIC_LENGTH_FRAMES + 1
.const FAREWELL_CALL = MUSIC_END_CALL - 4 * 50
.const SCREEN = $0400
.const SCROLL_LINE = SCREEN + 24 * 40
.const FRAME_IRQ_LINE = $fc
.const CHARSET = $2000
.const SCROLL_FIRST_CHAR = 128
.const SCROLL_PASSES = 1
.const SCROLL_OUT_GLYPHS = 41
.const SNOW_STOP_LEAD_GLYPHS = 25
.const SCROLL_CHAR_DATA = CHARSET + SCROLL_FIRST_CHAR * 8
.const KOALA_START = $6000
.const KOALA_END = $8711
.const SNOW_SPRITES = $0a00
.const SNOW_SPRITE_POINTER = SNOW_SPRITES / 64
.const SNOW_DESIGN_COUNT = 4
.const SNOWFLAKE_COUNT = 8
.const SNOW_COLUMN_SPACING = 40
.const SNOW_FIRST_COLUMN = 20
.const SWAY_AMPLITUDE = 12
.const SNOW_VISIBLE_TOP = 30
.const SNOW_VISIBLE_BOTTOM = 250
.var snowColors = List().add(CYAN, BLUE, LIGHT_BLUE, LIGHT_GRAY).lock()
.var snowFallSpeeds = List().add($90, $c0, $70, $e0, $a0, $80, $d0, $b0).lock()
.var snowSwaySpeeds = List().add(1, 2, 1, 3, 2, 1, 2, 3).lock()
.var snowStartRows = List().add(10, 70, 140, 200, 40, 110, 230, 170).lock()

.function snowBaseX(index) {
    .return 24 + SNOW_FIRST_COLUMN + index * SNOW_COLUMN_SPACING - SWAY_AMPLITUDE
}

// 10 SYS2061
*=$0801
	.byte $0B, $08, $0A, $00, $9E, $32, $30, $36, $31, $00, $00, $00

*=$080d
	// set to 25 line text mode and turn on the screen
	lda #$1B
	sta $D011

	// disable SHIFT-Commodore
	lda #$80
	sta $0291

	// set screen memory ($0400) and charset bitmap offset ($2000)
	lda #$18
	sta $D018

	// set border color
	lda #WHITE
	sta $D020

	// set background color
	lda #$01
	sta $D021

	// draw screen
	lda #$00
	sta $fb
	sta $fd
	sta $f7

	lda #$28
	sta $fc

	lda #$04
	sta $fe

	lda #$e8
	sta $f9
	lda #$2b
	sta $fa

	lda #$d8
	sta $f8

	ldx #$00
	ldy #$00
	lda ($fb),y
	sta ($fd),y
	lda ($f9),y
	sta ($f7),y
	iny
	bne *-9

	inc $fc
	inc $fe
	inc $fa
	inc $f8

	inx
	cpx #$04
	bne *-24

	// set sprite multicolors
	lda #$02
	sta $d025
	lda #$06
	sta $d026

	// colorize sprites
	lda #$0E
	sta $d027

	// positioning sprites
	lda #$18
	sta $d000	// #0. sprite X low byte
	lda #$00
	sta $d001	// #0. sprite Y

	// X coordinate high bits
	lda #$00
	sta $d010

	// expand sprites
	lda #$00
	sta $d01d
	lda #$00
	sta $d017

	// set multicolor flags
	lda #$00
	sta $d01c

	// set screen-sprite priority flags
	lda #$00
	sta $d01b

	// set sprite pointers
	lda #$28
	sta $07F8

	// turn on sprites
	lda #$01
	sta $d015

	jmp startDemo

// Sprite bitmaps 1 x 64 bytes
*=$0A00
// sprite #0
	.byte $00, $00, $00, $00, $00, $00, $00, $22, $00, $00, $14, $80, $01, $08, $90, $05, $08, $A0, $02, $08, $40
	.byte $0D, $08, $B8, $00, $89, $00, $00, $4A, $08, $10, $24, $10, $08, $1B, $E0, $07, $D8, $10, $08, $24, $08
	.byte $10, $52, $00, $00, $91, $00, $0D, $10, $B0, $02, $10, $40, $05, $10, $A0, $09, $28, $80, $00, $44, $00
	.byte 0


// Character bitmap definitions 2k
*=$2000
	.byte	$1C, $22, $4A, $56, $4C, $20, $1E, $00
	.byte	$18, $24, $42, $7E, $42, $42, $42, $00
	.byte	$7C, $22, $22, $3C, $22, $22, $7C, $00
	.byte	$1C, $22, $40, $40, $40, $22, $1C, $00
	.byte	$78, $24, $22, $22, $22, $24, $78, $00
	.byte	$7E, $40, $40, $78, $40, $40, $7E, $00
	.byte	$7E, $40, $40, $78, $40, $40, $40, $00
	.byte	$1C, $22, $40, $4E, $42, $22, $1C, $00
	.byte	$42, $42, $42, $7E, $42, $42, $42, $00
	.byte	$1C, $08, $08, $08, $08, $08, $1C, $00
	.byte	$0E, $04, $04, $04, $04, $44, $38, $00
	.byte	$42, $44, $48, $70, $48, $44, $42, $00
	.byte	$40, $40, $40, $40, $40, $40, $7E, $00
	.byte	$42, $66, $5A, $5A, $42, $42, $42, $00
	.byte	$42, $62, $52, $4A, $46, $42, $42, $00
	.byte	$18, $24, $42, $42, $42, $24, $18, $00
	.byte	$7C, $42, $42, $7C, $40, $40, $40, $00
	.byte	$18, $24, $42, $42, $4A, $24, $1A, $00
	.byte	$7C, $42, $42, $7C, $48, $44, $42, $00
	.byte	$3C, $42, $40, $3C, $02, $42, $3C, $00
	.byte	$3E, $08, $08, $08, $08, $08, $08, $00
	.byte	$42, $42, $42, $42, $42, $42, $3C, $00
	.byte	$42, $42, $42, $24, $24, $18, $18, $00
	.byte	$42, $42, $42, $5A, $5A, $66, $42, $00
	.byte	$42, $42, $24, $18, $24, $42, $42, $00
	.byte	$22, $22, $22, $1C, $08, $08, $08, $00
	.byte	$7E, $02, $04, $18, $20, $40, $7E, $00
	.byte	$3C, $20, $20, $20, $20, $20, $3C, $00
	.byte	$00, $40, $20, $10, $08, $04, $02, $00
	.byte	$3C, $04, $04, $04, $04, $04, $3C, $00
	.byte	$00, $08, $1C, $2A, $08, $08, $08, $08
	.byte	$00, $00, $10, $20, $7F, $20, $10, $00
	.byte	$00, $00, $00, $00, $00, $00, $00, $00
	.byte	$08, $08, $08, $08, $00, $00, $08, $00
	.byte	$24, $24, $24, $00, $00, $00, $00, $00
	.byte	$24, $24, $7E, $24, $7E, $24, $24, $00
	.byte	$08, $1E, $28, $1C, $0A, $3C, $08, $00
	.byte	$00, $62, $64, $08, $10, $26, $46, $00
	.byte	$30, $48, $48, $30, $4A, $44, $3A, $00
	.byte	$04, $08, $10, $00, $00, $00, $00, $00
	.byte	$04, $08, $10, $10, $10, $08, $04, $00
	.byte	$20, $10, $08, $08, $08, $10, $20, $00
	.byte	$08, $2A, $1C, $3E, $1C, $2A, $08, $00
	.byte	$00, $08, $08, $3E, $08, $08, $00, $00
	.byte	$00, $00, $00, $00, $00, $08, $08, $10
	.byte	$00, $00, $00, $7E, $00, $00, $00, $00
	.byte	$00, $00, $00, $00, $00, $18, $18, $00
	.byte	$00, $02, $04, $08, $10, $20, $40, $00
	.byte	$3C, $42, $46, $5A, $62, $42, $3C, $00
	.byte	$08, $18, $28, $08, $08, $08, $3E, $00
	.byte	$3C, $42, $02, $0C, $30, $40, $7E, $00
	.byte	$3C, $42, $02, $1C, $02, $42, $3C, $00
	.byte	$04, $0C, $14, $24, $7E, $04, $04, $00
	.byte	$7E, $40, $78, $04, $02, $44, $38, $00
	.byte	$1C, $20, $40, $7C, $42, $42, $3C, $00
	.byte	$7E, $42, $04, $08, $10, $10, $10, $00
	.byte	$3C, $42, $42, $3C, $42, $42, $3C, $00
	.byte	$3C, $42, $42, $3E, $02, $04, $38, $00
	.byte	$00, $00, $08, $00, $00, $08, $00, $00
	.byte	$00, $00, $08, $00, $00, $08, $08, $10
	.byte	$0E, $18, $30, $60, $30, $18, $0E, $00
	.byte	$00, $00, $7E, $00, $7E, $00, $00, $00
	.byte	$70, $18, $0C, $06, $0C, $18, $70, $00
	.byte	$3C, $42, $02, $0C, $10, $00, $10, $00
	.byte	$00, $00, $00, $00, $FF, $00, $00, $00
	.byte	$08, $1C, $3E, $7F, $7F, $1C, $3E, $00
	.byte	$10, $10, $10, $10, $10, $10, $10, $10
	.byte	$00, $00, $00, $FF, $00, $00, $00, $00
	.byte	$00, $00, $FF, $00, $00, $00, $00, $00
	.byte	$FF, $00, $00, $00, $00, $00, $00, $00
	.byte	$00, $00, $00, $00, $00, $FF, $00, $00
	.byte	$20, $20, $20, $20, $20, $20, $20, $20
	.byte	$04, $04, $04, $04, $04, $04, $04, $04
	.byte	$00, $00, $00, $00, $E0, $10, $08, $08
	.byte	$08, $08, $08, $04, $03, $00, $00, $00
	.byte	$08, $08, $08, $10, $E0, $00, $00, $00
	.byte	$80, $80, $80, $80, $80, $80, $80, $FF
	.byte	$80, $40, $20, $10, $08, $04, $02, $01
	.byte	$01, $02, $04, $08, $10, $20, $40, $80
	.byte	$FF, $80, $80, $80, $80, $80, $80, $80
	.byte	$FF, $01, $01, $01, $01, $01, $01, $01
	.byte	$00, $3C, $7E, $7E, $7E, $7E, $3C, $00
	.byte	$00, $00, $00, $00, $00, $00, $FF, $00
	.byte	$36, $7F, $7F, $7F, $3E, $1C, $08, $00
	.byte	$40, $40, $40, $40, $40, $40, $40, $40
	.byte	$00, $00, $00, $00, $03, $04, $08, $08
	.byte	$81, $42, $24, $18, $18, $24, $42, $81
	.byte	$00, $3C, $42, $42, $42, $42, $3C, $00
	.byte	$08, $1C, $2A, $77, $2A, $08, $08, $00
	.byte	$02, $02, $02, $02, $02, $02, $02, $02
	.byte	$08, $1C, $3E, $7F, $3E, $1C, $08, $00
	.byte	$08, $08, $08, $08, $FF, $08, $08, $08
	.byte	$A0, $50, $A0, $50, $A0, $50, $A0, $50
	.byte	$08, $08, $08, $08, $08, $08, $08, $08
	.byte	$00, $00, $01, $3E, $54, $14, $14, $00
	.byte	$FF, $7F, $3F, $1F, $0F, $07, $03, $01
	.byte	$00, $00, $00, $00, $00, $00, $00, $00
	.byte	$F0, $F0, $F0, $F0, $F0, $F0, $F0, $F0
	.byte	$00, $00, $00, $00, $FF, $FF, $FF, $FF
	.byte	$FF, $00, $00, $00, $00, $00, $00, $00
	.byte	$00, $00, $00, $00, $00, $00, $00, $FF
	.byte	$80, $80, $80, $80, $80, $80, $80, $80
	.byte	$AA, $55, $AA, $55, $AA, $55, $AA, $55
	.byte	$01, $01, $01, $01, $01, $01, $01, $01
	.byte	$00, $00, $00, $00, $AA, $55, $AA, $55
	.byte	$FF, $FE, $FC, $F8, $F0, $E0, $C0, $80
	.byte	$01, $01, $01, $01, $01, $01, $01, $01
	.byte	$08, $08, $08, $08, $0F, $08, $08, $08
	.byte	$00, $00, $00, $00, $0F, $0F, $0F, $0F
	.byte	$08, $08, $08, $08, $0F, $00, $00, $00
	.byte	$00, $00, $00, $00, $F8, $08, $08, $08
	.byte	$00, $00, $00, $00, $00, $00, $00, $FF
	.byte	$00, $00, $00, $00, $0F, $08, $08, $08
	.byte	$08, $08, $08, $08, $FF, $00, $00, $00
	.byte	$00, $00, $00, $00, $FF, $08, $08, $08
	.byte	$08, $08, $08, $08, $F8, $08, $08, $08
	.byte	$C0, $C0, $C0, $C0, $C0, $C0, $C0, $C0
	.byte	$E0, $E0, $E0, $E0, $E0, $E0, $E0, $E0
	.byte	$07, $07, $07, $07, $07, $07, $07, $07
	.byte	$FF, $FF, $00, $00, $00, $00, $00, $00
	.byte	$FF, $FF, $FF, $00, $00, $00, $00, $00
	.byte	$00, $00, $00, $00, $00, $FF, $FF, $FF
	.byte	$01, $01, $01, $01, $01, $01, $01, $FF
	.byte	$00, $00, $00, $00, $F0, $F0, $F0, $F0
	.byte	$0F, $0F, $0F, $0F, $00, $00, $00, $00
	.byte	$08, $08, $08, $08, $F8, $00, $00, $00
	.byte	$F0, $F0, $F0, $F0, $00, $00, $00, $00
	.byte	$F0, $F0, $F0, $F0, $0F, $0F, $0F, $0F
	.byte	$E3, $DD, $B5, $A9, $B3, $DF, $E1, $FF
	.byte	$E7, $DB, $BD, $81, $BD, $BD, $BD, $FF
	.byte	$83, $DD, $DD, $C3, $DD, $DD, $83, $FF
	.byte	$E3, $DD, $BF, $BF, $BF, $DD, $E3, $FF
	.byte	$87, $DB, $DD, $DD, $DD, $DB, $87, $FF
	.byte	$81, $BF, $BF, $87, $BF, $BF, $81, $FF
	.byte	$81, $BF, $BF, $87, $BF, $BF, $BF, $FF
	.byte	$E3, $DD, $BF, $B1, $BD, $DD, $E3, $FF
	.byte	$BD, $BD, $BD, $81, $BD, $BD, $BD, $FF
	.byte	$E3, $F7, $F7, $F7, $F7, $F7, $E3, $FF
	.byte	$F1, $FB, $FB, $FB, $FB, $BB, $C7, $FF
	.byte	$BD, $BB, $B7, $8F, $B7, $BB, $BD, $FF
	.byte	$BF, $BF, $BF, $BF, $BF, $BF, $81, $FF
	.byte	$BD, $99, $A5, $A5, $BD, $BD, $BD, $FF
	.byte	$BD, $9D, $AD, $B5, $B9, $BD, $BD, $FF
	.byte	$E7, $DB, $BD, $BD, $BD, $DB, $E7, $FF
	.byte	$83, $BD, $BD, $83, $BF, $BF, $BF, $FF
	.byte	$E7, $DB, $BD, $BD, $B5, $DB, $E5, $FF
	.byte	$83, $BD, $BD, $83, $B7, $BB, $BD, $FF
	.byte	$C3, $BD, $BF, $C3, $FD, $BD, $C3, $FF
	.byte	$C1, $F7, $F7, $F7, $F7, $F7, $F7, $FF
	.byte	$BD, $BD, $BD, $BD, $BD, $BD, $C3, $FF
	.byte	$BD, $BD, $BD, $DB, $DB, $E7, $E7, $FF
	.byte	$BD, $BD, $BD, $A5, $A5, $99, $BD, $FF
	.byte	$BD, $BD, $DB, $E7, $DB, $BD, $BD, $FF
	.byte	$DD, $DD, $DD, $E3, $F7, $F7, $F7, $FF
	.byte	$81, $FD, $FB, $E7, $DF, $BF, $81, $FF
	.byte	$C3, $DF, $DF, $DF, $DF, $DF, $C3, $FF
	.byte	$FF, $BF, $DF, $EF, $F7, $FB, $FD, $FF
	.byte	$C3, $FB, $FB, $FB, $FB, $FB, $C3, $FF
	.byte	$FF, $F7, $E3, $D5, $F7, $F7, $F7, $F7
	.byte	$FF, $FF, $EF, $DF, $80, $DF, $EF, $FF
	.byte	$FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF
	.byte	$F7, $F7, $F7, $F7, $FF, $FF, $F7, $FF
	.byte	$DB, $DB, $DB, $FF, $FF, $FF, $FF, $FF
	.byte	$DB, $DB, $81, $DB, $81, $DB, $DB, $FF
	.byte	$F7, $E1, $D7, $E3, $F5, $C3, $F7, $FF
	.byte	$FF, $9D, $9B, $F7, $EF, $D9, $B9, $FF
	.byte	$CF, $B7, $B7, $CF, $B5, $BB, $C5, $FF
	.byte	$FB, $F7, $EF, $FF, $FF, $FF, $FF, $FF
	.byte	$FB, $F7, $EF, $EF, $EF, $F7, $FB, $FF
	.byte	$DF, $EF, $F7, $F7, $F7, $EF, $DF, $FF
	.byte	$F7, $D5, $E3, $C1, $E3, $D5, $F7, $FF
	.byte	$FF, $F7, $F7, $C1, $F7, $F7, $FF, $FF
	.byte	$FF, $FF, $FF, $FF, $FF, $F7, $F7, $EF
	.byte	$FF, $FF, $FF, $81, $FF, $FF, $FF, $FF
	.byte	$FF, $FF, $FF, $FF, $FF, $E7, $E7, $FF
	.byte	$FF, $FD, $FB, $F7, $EF, $DF, $BF, $FF
	.byte	$C3, $BD, $B9, $A5, $9D, $BD, $C3, $FF
	.byte	$F7, $E7, $D7, $F7, $F7, $F7, $C1, $FF
	.byte	$C3, $BD, $FD, $F3, $CF, $BF, $81, $FF
	.byte	$C3, $BD, $FD, $E3, $FD, $BD, $C3, $FF
	.byte	$FB, $F3, $EB, $DB, $81, $FB, $FB, $FF
	.byte	$81, $BF, $87, $FB, $FD, $BB, $C7, $FF
	.byte	$E3, $DF, $BF, $83, $BD, $BD, $C3, $FF
	.byte	$81, $BD, $FB, $F7, $EF, $EF, $EF, $FF
	.byte	$C3, $BD, $BD, $C3, $BD, $BD, $C3, $FF
	.byte	$C3, $BD, $BD, $C1, $FD, $FB, $C7, $FF
	.byte	$FF, $FF, $F7, $FF, $FF, $F7, $FF, $FF
	.byte	$FF, $FF, $F7, $FF, $FF, $F7, $F7, $EF
	.byte	$F1, $E7, $CF, $9F, $CF, $E7, $F1, $FF
	.byte	$FF, $FF, $81, $FF, $81, $FF, $FF, $FF
	.byte	$8F, $E7, $F3, $F9, $F3, $E7, $8F, $FF
	.byte	$C3, $BD, $FD, $F3, $EF, $FF, $EF, $FF
	.byte	$FF, $FF, $FF, $FF, $00, $FF, $FF, $FF
	.byte	$F7, $E3, $C1, $80, $80, $E3, $C1, $FF
	.byte	$EF, $EF, $EF, $EF, $EF, $EF, $EF, $EF
	.byte	$FF, $FF, $FF, $00, $FF, $FF, $FF, $FF
	.byte	$FF, $FF, $00, $FF, $FF, $FF, $FF, $FF
	.byte	$FF, $00, $FF, $FF, $FF, $FF, $FF, $FF
	.byte	$FF, $FF, $FF, $FF, $FF, $00, $FF, $FF
	.byte	$DF, $DF, $DF, $DF, $DF, $DF, $DF, $DF
	.byte	$FB, $FB, $FB, $FB, $FB, $FB, $FB, $FB
	.byte	$FF, $FF, $FF, $FF, $1F, $EF, $F7, $F7
	.byte	$F7, $F7, $F7, $FB, $FC, $FF, $FF, $FF
	.byte	$F7, $F7, $F7, $EF, $1F, $FF, $FF, $FF
	.byte	$7F, $7F, $7F, $7F, $7F, $7F, $7F, $00
	.byte	$7F, $BF, $DF, $EF, $F7, $FB, $FD, $FE
	.byte	$FE, $FD, $FB, $F7, $EF, $DF, $BF, $7F
	.byte	$00, $7F, $7F, $7F, $7F, $7F, $7F, $7F
	.byte	$00, $FE, $FE, $FE, $FE, $FE, $FE, $FE
	.byte	$FF, $C3, $81, $81, $81, $81, $C3, $FF
	.byte	$FF, $FF, $FF, $FF, $FF, $FF, $00, $FF
	.byte	$C9, $80, $80, $80, $C1, $E3, $F7, $FF
	.byte	$BF, $BF, $BF, $BF, $BF, $BF, $BF, $BF
	.byte	$FF, $FF, $FF, $FF, $FC, $FB, $F7, $F7
	.byte	$7E, $BD, $DB, $E7, $E7, $DB, $BD, $7E
	.byte	$FF, $C3, $BD, $BD, $BD, $BD, $C3, $FF
	.byte	$F7, $E3, $D5, $88, $D5, $F7, $F7, $FF
	.byte	$FD, $FD, $FD, $FD, $FD, $FD, $FD, $FD
	.byte	$F7, $E3, $C1, $80, $C1, $E3, $F7, $FF
	.byte	$F7, $F7, $F7, $F7, $00, $F7, $F7, $F7
	.byte	$5F, $AF, $5F, $AF, $5F, $AF, $5F, $AF
	.byte	$F7, $F7, $F7, $F7, $F7, $F7, $F7, $F7
	.byte	$FF, $FF, $FE, $C1, $AB, $EB, $EB, $FF
	.byte	$00, $80, $C0, $E0, $F0, $F8, $FC, $FE
	.byte	$FF, $FF, $FF, $FF, $FF, $FF, $FF, $FF
	.byte	$0F, $0F, $0F, $0F, $0F, $0F, $0F, $0F
	.byte	$FF, $FF, $FF, $FF, $00, $00, $00, $00
	.byte	$00, $FF, $FF, $FF, $FF, $FF, $FF, $FF
	.byte	$FF, $FF, $FF, $FF, $FF, $FF, $FF, $00
	.byte	$7F, $7F, $7F, $7F, $7F, $7F, $7F, $7F
	.byte	$55, $AA, $55, $AA, $55, $AA, $55, $AA
	.byte	$FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE
	.byte	$FF, $FF, $FF, $FF, $55, $AA, $55, $AA
	.byte	$00, $01, $03, $07, $0F, $1F, $3F, $7F
	.byte	$FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC
	.byte	$F7, $F7, $F7, $F7, $F0, $F7, $F7, $F7
	.byte	$FF, $FF, $FF, $FF, $F0, $F0, $F0, $F0
	.byte	$F7, $F7, $F7, $F7, $F0, $FF, $FF, $FF
	.byte	$FF, $FF, $FF, $FF, $07, $F7, $F7, $F7
	.byte	$FF, $FF, $FF, $FF, $FF, $FF, $00, $00
	.byte	$FF, $FF, $FF, $FF, $F0, $F7, $F7, $F7
	.byte	$F7, $F7, $F7, $F7, $00, $FF, $FF, $FF
	.byte	$FF, $FF, $FF, $FF, $00, $F7, $F7, $F7
	.byte	$F7, $F7, $F7, $F7, $07, $F7, $F7, $F7
	.byte	$3F, $3F, $3F, $3F, $3F, $3F, $3F, $3F
	.byte	$1F, $1F, $1F, $1F, $1F, $1F, $1F, $1F
	.byte	$F8, $F8, $F8, $F8, $F8, $F8, $F8, $F8
	.byte	$00, $00, $FF, $FF, $FF, $FF, $FF, $FF
	.byte	$00, $00, $00, $FF, $FF, $FF, $FF, $FF
	.byte	$FF, $FF, $FF, $FF, $FF, $00, $00, $00
	.byte	$FE, $FE, $FE, $FE, $FE, $FE, $FE, $00
	.byte	$FF, $FF, $FF, $FF, $0F, $0F, $0F, $0F
	.byte	$F0, $F0, $F0, $F0, $FF, $FF, $FF, $FF
	.byte	$F7, $F7, $F7, $F7, $07, $FF, $FF, $FF
	.byte	$0F, $0F, $0F, $0F, $FF, $FF, $FF, $FF
	.byte	$0F, $0F, $0F, $0F, $F0, $F0, $F0, $F0

// screen character data
*=$2800
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $4E, $4D, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $4E, $E9, $DF, $4D, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $4E, $E9, $E0, $E0, $DF, $4D, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $4E, $E9, $E0, $D7, $E0, $E0, $DF, $4D, $20, $20, $20, $20, $20, $0D, $05, $12, $12, $19, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $45, $4E, $E9, $E0, $E0, $DF, $4D, $45, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $4E, $E9, $E0, $E0, $E0, $E0, $DF, $4D, $20, $20, $20, $03, $08, $12, $09, $13, $14, $0D, $01, $13, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $68, $68, $20, $20, $20, $20, $68, $68, $68, $68, $20, $4E, $E9, $E0, $D7, $E0, $E0, $E0, $E0, $DF, $4D, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $68, $20, $68, $20, $20, $20, $20, $68, $68, $20, $20, $4E, $E9, $E0, $E0, $E0, $E0, $E0, $D7, $E0, $E0, $DF, $4D, $20, $20, $20, $32, $30, $32, $37, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $68, $68, $68, $20, $20, $20, $20, $20, $20, $20, $20, $45, $4E, $E9, $E0, $E0, $E0, $E0, $E0, $E0, $DF, $4D, $45, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $68, $68, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $68, $68, $20, $20, $20, $4E, $E9, $E0, $E0, $E0, $E0, $E0, $E0, $E0, $E0, $DF, $4D, $20, $20, $20, $20, $20, $20, $20, $68, $68, $20, $20, $20, $20, $68, $20, $20
	.byte	$20, $20, $68, $68, $68, $68, $20, $20, $20, $20, $20, $4E, $E9, $E0, $D7, $E0, $E0, $E0, $E0, $E0, $E0, $E0, $E0, $DF, $4D, $20, $20, $20, $20, $20, $68, $68, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $4E, $E9, $E0, $E0, $E0, $E0, $E0, $E0, $E0, $E0, $E0, $D7, $E0, $E0, $DF, $4D, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $68, $68, $20, $20
	.byte	$20, $20, $20, $68, $68, $68, $68, $20, $20, $20, $45, $45, $45, $45, $45, $45, $45, $E7, $E7, $45, $45, $45, $45, $45, $45, $45, $20, $20, $20, $68, $68, $68, $68, $20, $68, $68, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $68, $68, $68, $68, $68, $20, $20, $20, $20, $20, $20, $E7, $E7, $20, $20, $20, $20, $20, $20, $68, $68, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $68, $68, $68, $68, $68, $68, $20, $20, $20, $20, $20, $20, $20, $20, $68, $20, $20, $20, $68, $68, $68, $68, $20, $68, $68, $68, $20, $20, $20, $20
	.byte	$20, $20, $20, $26, $4E, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $4F, $63, $50, $20, $20, $20, $20, $4D, $4E, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $65, $20, $6A, $20, $20, $20, $4F, $50, $4F, $50, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $4D, $4E, $20, $20, $20, $20
	.byte	$20, $20, $4C, $6F, $7A, $20, $20, $20, $4C, $7A, $4C, $7A, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $4F, $50, $4F, $50, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $4F, $50, $4F, $50, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $4C, $7A, $4C, $7A, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $4C, $7A, $4C, $7A, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $4F, $50, $4F, $50, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $4C, $7A, $4C, $7A, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20

// screen color data
*=$2be8
	.byte	$06, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $05, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $05, $05, $05, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $05, $05, $05, $05, $05, $0E, $0E, $0E, $0E, $0E, $04, $04, $04, $04, $04, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$05, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $05, $05, $05, $05, $05, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $05, $05, $05, $05, $05, $0E, $0E, $0E, $04, $04, $04, $04, $04, $04, $04, $04, $04, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $03, $0E, $0E, $0E, $0E, $03, $03, $0E, $0E, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $0E, $0E, $0E, $04, $04, $04, $04, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $03, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $03, $03, $03, $03, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $05, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $03, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $05, $05, $05, $05, $05, $05, $05, $08, $08, $05, $05, $05, $05, $05, $05, $05, $0E, $0E, $0E, $03, $03, $03, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $03, $03, $03, $03, $03, $0E, $0E, $0E, $0E, $0E, $0E, $08, $08, $0E, $0E, $0E, $0E, $0E, $0E, $03, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $03, $03, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $06, $06, $06, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $06, $06, $06, $0E, $0E, $0E, $04, $04, $04, $0E, $0E, $0E, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $06, $0E, $06, $0E, $0E, $0E, $04, $04, $04, $04, $0E, $0E, $03, $0E, $09, $03, $03, $03, $03, $03, $03, $03, $03, $03, $03, $03, $03, $03, $0E, $0E, $0E, $04, $02, $02, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $06, $06, $06, $0E, $0E, $0E, $04, $04, $04, $04, $0E, $0E, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $0E, $0E, $0E, $02, $02, $02, $04, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $04, $04, $04, $04, $0E, $0E, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $0E, $0E, $0E, $02, $02, $02, $02, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $04, $04, $04, $04, $0E, $0E, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $0E, $0E, $0E, $02, $02, $02, $02, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $0E, $0E, $0E, $02, $02, $02, $02, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
	.byte	$0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $03, $03, $03, $03, $03, $03, $03, $03, $03, $03, $03, $03, $03, $03, $03, $03, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E, $0E
*=SNOW_SPRITES + 64 "More snowflakes"
	:MoreSnowflakes()

#import "loading_captions.asm"
#import "scene_names.asm"
.assert "Captions must end below the music", * <= music.location, true

*=music.location "Music"
	.fill music.size, music.getData(i)

*=$3000 "Demo"
startDemo:
	sei
	lda #$7f
	sta $dc0d
	lda $dc0d
	lda #music.startSong - 1
	jsr music.init
	jsr setupScroll
	jsr setupSnow
	lda #<introIrq
	sta $0314
	lda #>introIrq
	sta $0315
	lda #FRAME_IRQ_LINE
	sta $d012
	lda $d011
	and #$7f
	sta $d011
	lda #$01
	sta $d01a
	sta $d019
	cli
waitForSnowToSettle:
	lda snowActive
	bne waitForSnowToSettle
	jsr showFirstCaptions
	jsr loadMainScene
waitForSecondCaptions:
	sei
	lda captionTimer
	ora captionTimer + 1
	cli
	cmp #0
	bne waitForSecondCaptions
	jsr showMainScene
mainLoop:
	jsr cycleNames
	jsr showThanks
	jmp mainLoop

introIrq:
	lda #$01
	sta $d019
	jsr playMusicOnce
	lda scrollFinished
	bne !+
	jsr moveScroll
	jmp !++
!:	lda #1
	sta snowStopping
!:	jsr animateSnow
	jsr tickCaptions
	jmp IRQ_EXIT

playMusicOnce:
	inc musicFramesPlayed
	bne !+
	inc musicFramesPlayed + 1
!:	lda musicFramesPlayed + 1
	cmp #>FAREWELL_CALL
	bne !+
	lda musicFramesPlayed
	cmp #<FAREWELL_CALL
	bne !+
	lda #0
	sta $d015
	lda #1
	sta logoKilled
	sta thanksRequest
!:	lda musicFramesPlayed + 1
	cmp #>MUSIC_END_CALL
	bne !+
	lda musicFramesPlayed
	cmp #<MUSIC_END_CALL
	beq softReset
!:	jmp music.play

softReset:
	sei
	lda #0
	ldx #SID_REGISTER_COUNT - 1
!:	sta SID, x
	dex
	bpl !-
	jmp (RESET_VECTOR)

musicFramesPlayed:
	.word 0

setupScroll:
	ldx #39
!:	txa
	clc
	adc #SCROLL_FIRST_CHAR
	sta SCROLL_LINE, x
	dex
	bpl !-
	lda #0
	ldx #40 * 8 / 2
!:	sta SCROLL_CHAR_DATA - 1, x
	sta SCROLL_CHAR_DATA + 40 * 8 / 2 - 1, x
	dex
	bne !-
	rts

moveScroll:
	lda glyphBitsLeft
	bne shiftScroll
	jsr nextScrollGlyph
shiftScroll:
	dec glyphBitsLeft
	.for (var row = 0; row < 8; row++) {
		asl incomingGlyph + row
		.for (var column = 39; column >= 0; column--) {
			rol SCROLL_CHAR_DATA + column * 8 + row
		}
	}
	rts

nextScrollGlyph:
	lda scrollPasses
	cmp #SCROLL_PASSES
	bcc readScrollText
	lda #0
	ldx #7
!:	sta incomingGlyph, x
	dex
	bpl !-
	lda #8
	sta glyphBitsLeft
	inc blankGlyphs
	lda blankGlyphs
	cmp #SCROLL_OUT_GLYPHS - SNOW_STOP_LEAD_GLYPHS
	bne !+
	lda #1
	sta snowStopping
!:	lda blankGlyphs
	cmp #SCROLL_OUT_GLYPHS
	bne !+
	inc scrollFinished
!:	rts

readScrollText:
	lda scrollText
	cmp #$ff
	bne !+
	inc scrollPasses
	lda #<scrollText
	sta readScrollText + 1
	lda #>scrollText
	sta readScrollText + 2
	jmp nextScrollGlyph
!:	inc readScrollText + 1
	bne !+
	inc readScrollText + 2
!:	ldx #0
	stx glyphAddressHigh
	asl
	rol glyphAddressHigh
	asl
	rol glyphAddressHigh
	asl
	rol glyphAddressHigh
	clc
	adc #<CHARSET
	sta readGlyph + 1
	lda glyphAddressHigh
	adc #>CHARSET
	sta readGlyph + 2
	ldx #7
readGlyph:
	lda $ffff, x
	sta incomingGlyph, x
	dex
	bpl readGlyph
	lda #8
	sta glyphBitsLeft
	rts

setupSnow:
	ldx #SNOWFLAKE_COUNT - 1
!:	lda snowPointers, x
	sta SCREEN + $3f8, x
	lda snowSpriteColors, x
	sta $d027, x
	dex
	bpl !-
	lda #0
	sta $d01b
	sta $d01c
	sta $d017
	sta $d01d
	jsr animateSnow
	lda #$ff
	sta $d015
	rts

animateSnow:
	lda #0
	sta snowHighX
	ldx #SNOWFLAKE_COUNT - 1
snowLoop:
	lda snowActive
	and spriteBits, x
	beq nextSnowflake
	lda snowYFraction, x
	clc
	adc snowFallSpeed, x
	sta snowYFraction, x
	lda snowY, x
	adc #0
	sta snowY, x
	lda snowPhase, x
	clc
	adc snowSwaySpeed, x
	sta snowPhase, x
	tay
	lda swayTable, y
	clc
	adc snowBaseXLow, x
	sta snowXLow
	lda snowBaseXHigh, x
	adc #0
	beq !+
	lda snowHighX
	ora spriteBits, x
	sta snowHighX
!:	txa
	asl
	tay
	lda snowXLow
	sta $d000, y
	lda snowY, x
	sta $d001, y
	lda snowStopping
	beq nextSnowflake
	lda snowY, x
	cmp #SNOW_VISIBLE_TOP
	bcc hideSnowflake
	cmp #SNOW_VISIBLE_BOTTOM
	bcc nextSnowflake
hideSnowflake:
	lda spriteBits, x
	eor #$ff
	and snowActive
	sta snowActive
nextSnowflake:
	dex
	bpl snowLoop
	lda snowHighX
	sta $d010
	lda snowActive
	sta $d015
	rts

#import "main_scene.asm"

glyphBitsLeft:
	.byte 0
scrollPasses:
	.byte 0
blankGlyphs:
	.byte 0
scrollFinished:
	.byte 0
glyphAddressHigh:
	.byte 0
incomingGlyph:
	.fill 8, 0
snowHighX:
	.byte 0
snowActive:
	.byte $ff
snowStopping:
	.byte 0
snowXLow:
	.byte 0
snowY:
	.fill SNOWFLAKE_COUNT, snowStartRows.get(i)
snowYFraction:
	.fill SNOWFLAKE_COUNT, 0
snowPhase:
	.fill SNOWFLAKE_COUNT, i * 37
snowFallSpeed:
	.fill SNOWFLAKE_COUNT, snowFallSpeeds.get(i)
snowSwaySpeed:
	.fill SNOWFLAKE_COUNT, snowSwaySpeeds.get(i)
snowBaseXLow:
	.fill SNOWFLAKE_COUNT, <snowBaseX(i)
snowBaseXHigh:
	.fill SNOWFLAKE_COUNT, >snowBaseX(i)
snowPointers:
	.fill SNOWFLAKE_COUNT, SNOW_SPRITE_POINTER + mod(i, SNOW_DESIGN_COUNT)
snowSpriteColors:
	.fill SNOWFLAKE_COUNT, snowColors.get(mod(i + floor(i / SNOW_DESIGN_COUNT), snowColors.size()))
spriteBits:
	.fill 8, 1 << i
swayTable:
	.fill 256, SWAY_AMPLITUDE + round(SWAY_AMPLITUDE * sin(toRadians(i * 360 / 256)))

scrollText:
	.encoding "screencode_upper"
	.text "KOMODA & AMIGA + SEND BEST CHRISTMAS WISHES TO ALL READERS AND ALL FANS OF RETRO MACHINES....    "
	.byte $ff

.assert "Demo must end below the Koala picture", * <= KOALA_START, true
.assert "Demo code must end below the main scene sprites", * <= MAIN_SCENE_SPRITES, true

.disk [filename="demo.d64", name="KA+ XMAS 27", id="KA"] {
	[name="KA+XMAS-27", type="prg", segments="Default"],
	[name="SCENE", type="seq", prgFiles="SCENE.kla"],
	[name="NAMES", type="seq", prgFiles="NAMES.kla"],
}
