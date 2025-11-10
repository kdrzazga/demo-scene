.var music = LoadSid("Modem.sid") //only P-SIDs supported

//#import "basic-code-hf-load.asm"
:BasicUpstart2(main)

*=2286-$6a "main"
main:
	// set to 25 line text mode and turn on the screen
	lda #$1b
	sta $d011

	// disable shift-commodore
	lda #$80
	sta $0291

	// set screen memory ($0400) and charset bitmap offset ($2000)
	lda #$18
	sta $d018

	// set border color
	lda #$0a
	sta $d020

	// set background color
	sta $d021

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

	// colorize sprites
	lda #$0
	sta $d027
	sta $d028
	sta $d029
	sta $d02a
	sta $d02b
	sta $d02c
	sta $d02d
	sta $d02e

	// positioning sprites
	lda #50
	sta $d000	// #0. sprite x low .byte
	sta $d004	// #2. sprite x low .byte
	sta $d006	// #3. sprite x low .byte
	sta $d00c	// #6. sprite x low .byte
	lda #75
	sta $d002	// #1. sprite x low .byte
	lda #77
	sta $d008	// #4. sprite x low .byte
	sta $d00a	// #5. sprite x low .byte
	sta $d00e	// #7. sprite x low .byte

	lda #120
	sta $d001	// #0. sprite y
	lda #122
	sta $d003	// #1. sprite y

	lda #162
	sta $d005	// #2. sprite y
	sta $d009	// #4. sprite y

	lda #205
	sta $d007	// #3. sprite y
	sta $d00b	// #5. sprite y

	lda #253
	sta $d00d	// #6. sprite y
	sta $d00f	// #7. sprite y

	// x coordinate high bits
	lda #$00
	sta $d010

	// expand sprites
	lda #$00
	sta $d01d
	lda #$ff
	sta $d017

	// set multicolor flags
	lda #$00
	sta $d01c

	// set screen-sprite priority flags
	lda #%11111111
	sta $d01b

	// set sprite pointers
	lda #$80
	sta $07F8
	lda #$81
	sta $07F9
	lda #$82
	sta $07FA
	lda #$83
	sta $07FB
	lda #$84
	sta $07FC
	lda #$85
	sta $07FD
	lda #$86
	sta $07FE
	lda #$87
	sta $07ff

	// turn on sprites
	lda #$ff
	sta $d015

   //-------

    ldx #0
    ldy #0
    lda #music.startSong-1
    jsr music.init
    sei
    lda #<irq1
    sta $0314
    lda #>irq1
    sta $0315
    asl $d019   //Interrupt status register
    lda #%01111011
    sta $dc0d   //Interrupt control and status register.
    lda #%10000001
    sta $d01a   //Interrupt control register
    lda #$1b
    sta $d011   //Screen control register #1
    lda #%10000000
    sta $d012   //Raster line to generate interrupt at (bits #0-#7).
    cli
this:
	jmp this


irq1:
    asl $d019   //Interrupt status register
    jsr music.play
    pla
    tay
    pla
    tax
    pla
	jmp move_bars
rti


move_bars:

	inc $d001
	inc $d003
	inc $d005
	inc $d007
	inc $d009
	inc $d00b
	inc $d00d
	inc $d00f

	lda $d001
	cmp #248
	//beq reset_initial_bars

	lda $d005
	cmp #248
	beq reset_top_bars
	lda $d007
	cmp #248
	beq reset_bottom_bars
	rti
	lda $d00d
	cmp #248
	beq reset_middle_bars
	rti
	// wait for keypress
	lda $c6
	beq *-2
	rti

reset_initial_bars:

	lda #(162-42)
	sta $d001	// #0. sprite y
	sta $d003	// #1. sprite y
	rti
reset_top_bars:

	lda #(162-42)
	sta $d005	// #2. sprite y
	sta $d009	// #4. sprite y
	rti

reset_bottom_bars:

	lda #(162-42)
	sta $d007	// #3. sprite y
	sta $d00b	// #5. sprite y
	rti

reset_middle_bars:

	lda #(162-42)
	sta $d00d	// #6. sprite y
	sta $d00f	// #7. sprite y
	rti


// sprite bitmaps 6 x 64 .bytes
*=$2000 "sprite bitmaps"
// sprite #0 - bar1
	.byte $0a, $fe, $01, $0b, $fc, $03, $1f, $fc, $01, $1f, $f8, $02, $0f, $fb, $80, $07, $fe, $00, $17, $f8, $00
	.byte $1f, $f9, $02, $06, $fe, $03, $0e, $fc, $00, $08, $f8, $00, $0f, $fe, $00, $07, $f8, $00, $03, $f0, $00
	.byte $07, $fc, $03, $0f, $f0, $03, $0f, $f8, $03, $07, $fc, $00, $03, $f8, $00, $07, $f8, $00, $07, $fc, $00
	.byte 0

// sprite #1 - another bar
	.byte $0a, $fe, $01, $0b, $fc, %10000000, $1f, $fc, $00, $1f, $f8, $00, $0f, $fb, $80, $07, $fe, $00, $17, $f8, $00
	.byte $1f, $f9, $01, $06, $fe, %10000000, $0e, $fc, $00, $08, $f8, $00, $0f, $fe, $00, $07, $f8, $00, $03, $f0, $00
	.byte $07, $fc, $01, $0f, $f0, %10000000, $0f, $f8, $00, $07, $fc, $00, $03, $f8, $00, $07, $f8, $00, $07, $fc, $00
	.byte 0

// sprite #2
	.byte $0a, $fe, $00, $0b, $fc, $00, $1f, $fc, $00, $1f, $f8, $00, $0f, $fb, $80, $07, $fe, $00, $17, $f8, $00
	.byte $1f, $f9, $00, $06, $fe, $00, $0e, $fc, $00, $08, $f8, $00, $0f, $fe, $00, $07, $f8, $00, $03, $f0, $00
	.byte $07, $fc, $00, $0f, $f0, $00, $0f, $f8, $00, $07, $fc, $00, $03, $f8, $00, $07, $f8, $00, $07, $fc, $00
	.byte 0

// sprite #3
	.byte $0f, $f8, $00, $03, $ff, $00, $1f, $fc, $00, $1f, $f8, $00, $0f, $f9, $80, $07, $fe, $00, $07, $f8, $00
	.byte $07, $fb, $00, $18, $fd, $00, $1f, $fc, $00, $07, $f8, $00, $07, $fe, $00, $0f, $fa, $00, $03, $f8, $00
	.byte $07, $fe, $00, $03, $fc, $00, $1f, $f8, $00, $06, $fc, $00, $04, $fa, $00, $0f, $f9, $00, $1f, $fb, $00
	.byte 0

// sprite #4
	.byte $09, $fe, $00, $0b, $fc, $00, $1f, $fc, $00, $1f, $f8, $00, $0e, $fb, $80, $07, $fe, $00, $19, $f8, $00
	.byte $1f, $f9, $00, $08, $fd, $00, %1110, $fc, $00, $07, $f8, $00, $0f, $fe, $00, $07, $f8, $00, $03, $f0, $00
	.byte $07, $fc, $00, $0f, $f0, $00, $0f, $f8, $00, $07, $fc, $00, $03, $f8, $00, $07, $f8, $00, $07, $fc, $00
	.byte 0

// sprite #5
	.byte $0f, $f8, $00, $03, $ff, $00, $1f, $fc, $00, $1f, $f8, $00, $0f, $f9, $80, $07, $fe, $00, $07, $f8, $00
	.byte $07, $fb, $00, $17, $fd, $00, $1f, $fc, $00, $05, $f8, $00, $07, $fe, $00, $0f, $fa, $00, $03, $f8, $00
	.byte $07, $fe, $00, $03, $fc, $00, $1f, $f8, $00, $07, $fc, $00, $03, $fa, $00, $0f, $f8, $00, $1f, $fc, $00
	.byte 0

// sprite #6
	.byte $09, $fe, $00, $0b, $fc, $00, $1f, $fc, $00, $1f, $f8, $00, $0f, $fb, $80, $07, $fe, $00, $17, $f8, $00
	.byte $1f, $f9, $00, $08, $ff, $00, %1110, $fc, $00, $07, $f8, $00, $0f, $fe, $00, $07, $f8, $00, $03, $f0, $00
	.byte $07, $fc, $00, $0f, $f0, $00, $0f, $f5, $00, $07, $fc, $00, $03, $f8, $00, $07, $f8, $00, $07, $fc, $00
	.byte 0

// sprite #7
	.byte $0f, $f8, $00, $03, $ff, $00, $1f, $fc, $00, $1f, $f8, $00, $0f, $f9, $80, $07, $fe, $00, $06, $f8, $00
	.byte $07, $fb, $00, $18, $fc, $00, $1f, $fc, $00, $08, $f8, $00, $07, $fe, $00, $0f, $fb, $00, $04, $f8, $00
	.byte $07, $fe, $00, $03, $fc, $00, $1f, $f8, $00, $09, $fc, $00, $03, $fa, $00, $0f, $f7, $00, $1f, $fc, $00
	.byte 0



*=$2800 "screen character data"
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $a0, $a0, $aa, $a0, $88, $85, $81, $84, $e0, $93, $88, $89, $94, $e0, $aa, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $86, $b1, $e0, $8e, $8f, $92, $8d, $81, $8c, $e0, $8d, $8f, $84, $85, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $86, $b3, $e0, $94, $95, $92, $82, $8f, $e0, $e0, $8d, $8f, $84, $85, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $92, $85, $94, $95, $92, $8e, $e0, $ad, $e0, $91, $95, $89, $94, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$20, $20, $20, $20, $6d, $20, $20, $5d, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $6d, $20, $20, $5d, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $6d, $20, $20, $e6, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $e6, $20, $20, $5d, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $6d, $20, $20, $5d, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $6d, $20, $20, $5d, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $6d, $20, $20, $5d, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $6d, $20, $20, $5d, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $23, $20, $20, $e6, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $6d, $20, $20, $5d, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $6d, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20

*=$2be8 "screen color data"
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0b
	.byte	$0e, $0e, $00, $00, $00, $0e, $0e, $00, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $00, $0e, $0e, $00, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $00, $0e, $0e, $00, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $00, $0e, $0e, $00, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $00, $0e, $0e, $00, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $00, $00, $00, $0e, $0e, $00, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $00, $0e, $0e, $00, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $00, $0e, $0e, $00, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $00, $0e, $0e, $00, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $00, $0e, $0e, $00, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $00, $0e, $0e, $00, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e

.pc=music.location "Music"
    .fill music.size, music.getData(i)

    .print ""
    .print "SID Data"
    .print "--------"
    .print "location=$"+toHexString(music.location)
    .print "init=$"+toHexString(music.init)
    .print "play=$"+toHexString(music.play)
    .print "songs="+music.songs
    .print "startSong="+music.startSong
    .print "size=$"+toHexString(music.size)
    .print "name="+music.name
    .print "author="+music.author
    .print "copyright="+music.copyright
    .print ""
    .print "Additional tech data"
    .print "--------------------"
    .print "header="+music.header
    .print "header version="+music.version
    .print "flags="+toBinaryString(music.flags)
    .print "speed="+toBinaryString(music.speed)
    .print "startpage="+music.startpage
    .print "pagelength="+music.pagelength
