//.var music = LoadSid("Modem.sid") //only P-SIDs supported

#import "basic-code-pong-load.asm"

*=2534 "main"
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
	lda #$08
	sta $d020

	// set background color
	lda #$08
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

	// set sprite multicolors
	lda #$02
	sta $d025
	lda #$06
	sta $d026

	// colorize sprites
	lda #$01
	sta $d027
	lda #$0d
	sta $d028
	lda #$0d
	sta $d029
	lda #$01
	sta $d02a
	lda #$01
	sta $d02b
	lda #$07
	sta $d02c

	// positioning sprites
	lda #$ff
	sta $d000	// #0. sprite x low .byte
	lda #$6f
	sta $d001	// #0. sprite y
	lda #$12
	sta $d002	// #1. sprite x low .byte
	lda #$34
	sta $d003	// #1. sprite y
	lda #$12
	sta $d004	// #2. sprite x low .byte
	lda #$49
	sta $d005	// #2. sprite y
	lda #$de
	sta $d006	// #3. sprite x low .byte
	lda #$34
	sta $d007	// #3. sprite y
	lda #$de
	sta $d008	// #4. sprite x low .byte
	lda #$49
	sta $d009	// #4. sprite y
	lda #$77
	sta $d00a	// #5. sprite x low .byte
	lda #$6a
	sta $d00b	// #5. sprite y

	// x coordinate high bits
	lda #$00
	sta $d010

	// expand sprites
    lda #$00
	sta $d01d
	lda #%00011110
	sta $d017

	// set multicolor flags
	lda #$01
	sta $d01c

	// set screen-sprite priority flags
	lda #$00
	sta $d01b

	// set sprite pointers
	lda #$c0  //points to $40 * $c0 = $3000
	sta $07F8
	lda #$c1 //points to $40 * $c1 = $3040
	sta $07F9
	lda #$c2
	sta $07FA
	lda #$c3
	sta $07FB
	lda #$c4
	sta $07FC
	lda #$c5
	sta $07FD
	lda #$c6
	sta $07FE
	lda #$c7
	sta $07ff

	// turn on sprites
	lda #$3f
	sta $d015

	// wait for keypress
	lda $c6
	beq *-2

	rts

#import "data.asm"
