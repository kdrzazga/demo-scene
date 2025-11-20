#import "PseudoCmds.lib"

.var music = LoadSid("Jingle_Bells_V1.sid") //csdb.dk/sid/?id=44299

.const  snow1y = $d001
.const  snow2y = $d003
.const  snow3y = $d005
.const  snow4y = $d007
.const  snow5y = $d009
.const skater_x = $d00a
.const skater_y = skater_x + 1
.const skater_x2 = $d00c
.const skater_y2 = skater_x2 + 1

.const sprites_enable = $d015

.const IRQcell = $ea31
.const screenRamArea = $2800
.const colorRamArea = $2be8
.const charBitmapDataAddress = $2000
.const spriteDataMultiplier = $39

BasicUpstart2(start)

start:
    //lda #music.startSong
    //jsr music.init

	poke $d011 : #$1b

	// disable shift-commodore
	poke $0291 : #$80

	// set screen memory ($0400) and charset bitmap offset ($2000)
	poke $d018 : #$18

	// set border - background color
	poke 53280 : #BLACK
	poke 53281 : #CYAN

	// draw screen
copy_data_loop:
    .for (var i = 0; i < 4; i++){
        lda screenRamArea +256*i, x
        sta 1024 + 256*i, x

        lda colorRamArea +256*i, x
        sta $d800 + 256*i, x
    }
    inx
    bne copy_data_loop

	// set sprite multicolors
	poke $d01c : #01100000 //multicolor for sprites 5 & 6
	poke $d025 : #RED
	poke $d026 : #BLUE

	// colorize sprites
	.var spriteColors = List().add(WHITE, WHITE, WHITE, WHITE, WHITE, BLACK, BLACK)
	.for (var i = 0; i < spriteColors.size(); i++){
	    lda #spriteColors.get(i)
	    sta $d027 + i
	}

	// positioning sprites
	poke $d000: #$18	// #0. sprite x low .byte
	poke snow1y : #$32	// #0. sprite y snow1y = $d001
	poke $d002 : #$61	// #1. sprite x low .byte
	poke snow2y : #$44	// #1. sprite y  snow2y = $d003
	poke $d004 : #$ab   // #2. sprite x low .byte
	poke snow3y	: #$45  // #2. sprite y  snow3y = $d005
	poke $d006 : #$f5   // #3. sprite x low .byte
	poke snow4y	: #$32  // #3. sprite y  snow4y = $d007
	poke $d008 : #$2a	// #5. sprite x low .byte
	poke snow5y	: #$a7  // #5. sprite y  snow5y = $d00b
	lda #$1b
	sta skater_x	    // #4. sprite x low skater_x = $d008
	sta skater_x2
	lda #$bf
	sta skater_y		// #4. sprite y     skater_y = $d009
	sta skater_y2

	// x coordinate high bits
	poke $d010 : #%01000000

	// expand sprites
	lda #00111111 //#00101111
	sta $d01d
	sta $d017

	// set multicolor flags
	poke $d01c : #%00100000

	// set screen-sprite priority flags
	poke $d01b : #0

	// set sprite pointers
	.var spritePtrList = List().add($07f8, $07f9, $07fa, $07fb, $07fc, $07fd, $07fe).lock()
	.for (var i = 0; i <spritePtrList.size(); i++){
	    lda #(spriteDataMultiplier+i)
	    sta spritePtrList.get(i)
	}

	// turn on sprites
	poke sprites_enable : #%00111111

	sei
	poke $0314 : #<irq1
	poke $0315 : #>irq1
	cli
	jmp *

irq1:
    asl $d019   //Interrupt status register
    dec counter
    jsr handle_snow
    jsr handle_skater
    jsr music.play

    lda counter
    cmp #0
    beq dec_counter2

    jmp IRQcell


dec_counter2:
    dec counter2
    lda counter2
    cmp #251
    beq finish_him
    inc 1024
    jmp IRQcell

finish_him:
    poke sprites_enable : #0

    ldx #0
    copy_data_loop2:
        .for (var i = 0; i < 4; i++){
        lda #32
            sta 1024 + 256*i, x

            lda #BLACK
            sta $d800 + 256*i, x
        }
    inx
    bne copy_data_loop2

    //redirect IRQ
	sei
	poke $0314 : #<irq2
	poke $0315 : #>irq2
	cli

    jmp IRQcell

irq2:
    jsr music.play
    ldx #0
    petla:
    		poke 1024 + 40, x : ending, x
    		inx
    		cpx #(ending_text_term-ending)
    		bne petla
    dec counter3

    lda counter3
    cmp #0
    beq dec_counter4

    jmp IRQcell

dec_counter4:
    dec counter4

    lda counter4
    cmp #0
    beq kill_the_shit
    jmp IRQcell

kill_the_shit:
    jmp $fce2

ending:
    .text "You better stop watching this crap."
    .fill 5, 32
    .text "Go outside and make a snowman."
    .fill 10, 32
    .byte 34
    .text "!inter fake demo"
    .byte 34
    .text " was written in hope  to take the last place."
    .fill 17, 32
    .text "Released on PAT0LA PARTY 2026"
ending_text_term:
    .byte 0
.print "Caption length: " + (ending_text_term-ending)

#import "sprites-snow.asm"
#import "sprites-skater.asm"

counter:
    .byte 255
counter2:
    .byte 255
counter3:
    .byte 255
counter4:
    .byte 3
.print "End code = " + toHexString(*) + " [" + * + "]"

// sprite bitmaps 6 x 64 .bytes
*=spriteDataMultiplier * $40
// sprite #0
	.byte $80, $00, $00, $00, $00, $10, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
	.byte $00, $00, $00, $00, $00, $00, $00, $04, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $20, $00, $00
	.byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $08, $00, $00, $00, $00, $00, $00, $04, $00, $00, $00
	.byte 0

// sprite #1
	.byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $20, $00, $01, $00, $10, $00, $00, $00, $20, $00, $00, $00
	.byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $04, $00, $00, $00, $00, $00, $00, $00, $00
	.byte $00, $00, $00, $00, $00, $20, $00, $00, $00, $00, $00, $00, $00, $00, $00, $04, $00, $00, $00, $00, $00
	.byte 0

// sprite #2
	.byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $80, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
	.byte $00, $00, $00, $00, $00, $00, $40, $00, $20, $00, $08, $00, $00, $00, $00, $01, $00, $00, $00, $00, $00
	.byte $00, $00, $00, $00, $00, $00, $00, $01, $00, $01, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
	.byte 0

// sprite #3
	.byte $00, $00, $00, $12, $00, $00, $0c, $00, $00, $0c, $00, $00, $12, $00, $00, $00, $00, $50, $00, $00, $20
	.byte $00, $00, $50, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $a0, $00, $00, $40, $00, $00, $a0, $00
	.byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $10, $40, $00, $00
	.byte 0

// sprite #4
	.byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $14, $00, $00, $08, $00, $00, $14, $00, $10, $00, $00, $00
	.byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $05, $00
	.byte $00, $02, $00, $00, $05, $00, $00, $00, $00, $04, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
	.byte 0

// sprite #5-skater
     .byte $00, $00, $00, $00, $fc, $00, $00, $cf, $00, $00, $ff, $00, $00, $f0, $00, $00, $10, $00, $00, $10, $00
     .byte $00, $10, $00, $01, $54, $00, $01, $11, $00, $00, $20, $40, $00, $a8, $00, $00, $8a, $00, $00, $82, $00
     .byte $02, $02, $00, $02, $0a, $00, $02, $08, $00, $02, $0f, $c0, $02, $00, $00, $0c, $00, $00, $0f, $c0, $00
     .byte 0

// sprite #6 - skater 2
	.byte $00, $00, $00, $00, $00, $00, $00, $FC, $00, $00, $CF, $00, $00, $FF, $00, $00, $F0, $00, $00, $10, $00
	.byte $00, $10, $00, $00, $54, $00, $01, $11, $00, $01, $20, $40, $00, $68, $00, $00, $8A, $00, $00, $82, $00
	.byte $02, $02, $00, $32, $02, $00, $3A, $02, $00, $30, $08, $00, $30, $08, $00, $00, $08, $00, $00, $0F, $C0
	.byte 0
.print "End sprites data " + toHexString(*)

#import "charset.asm"
// screen character data
*=screenRamArea
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $20, $68, $e6, $68, $20, $68, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $1e, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $76, $fe, $fe, $fe, $fe, $fe, $f6, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $ff, $e3, $7f, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20
	.byte	$20, $76, $fe, $fe, $fe, $a0, $fe, $f6, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $e3, $e3, $e3, $20, $20, $20, $20, $20, $20, $20, $20, $e0, $e0, $e0, $e0, $e0, $e0, $20, $20, $20
	.byte	$20, $76, $fe, $a0, $fe, $fe, $fe, $f6, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $ff, $e3, $e3, $e3, $7f, $20, $20, $20, $20, $20, $20, $20, $76, $fe, $fe, $fe, $fe, $f6, $20, $20, $20
	.byte	$20, $76, $fe, $fe, $fe, $a0, $fe, $f6, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $20, $e3, $e3, $e3, $e3, $e3, $20, $20, $20, $20, $20, $20, $20, $76, $fe, $fe, $fe, $fe, $f6, $20, $20, $20
	.byte	$20, $76, $fe, $a0, $fe, $fe, $fe, $f6, $20, $20, $20, $20, $6f, $20, $20, $20, $20, $20, $ff, $e3, $e3, $e3, $e3, $e3, $7f, $20, $20, $20, $20, $20, $20, $76, $fe, $a0, $fe, $fe, $f6, $20, $20, $20
	.byte	$20, $76, $fe, $fe, $fe, $a0, $fe, $f6, $20, $20, $20, $20, $4f, $7a, $20, $20, $20, $ff, $e3, $e3, $e3, $e3, $e3, $e3, $e3, $7f, $20, $20, $20, $20, $20, $76, $fe, $fe, $fe, $fe, $f6, $20, $6f, $20
	.byte	$20, $76, $a0, $a0, $a0, $a0, $a0, $f6, $20, $20, $20, $20, $4f, $20, $20, $20, $20, $20, $20, $20, $20, $61, $20, $20, $20, $20, $20, $20, $20, $20, $20, $76, $a0, $a0, $a0, $a0, $f6, $20, $4f, $20
	.byte	$e0, $cc, $8f, $84, $8f, $97, $89, $93, $8b, $8f, $e0, $e0, $e0, $e0, $a0, $a0, $a0, $a0, $a0, $a0, $a0, $a0, $a0, $a0, $e0, $a0, $a0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0, $e0
	.byte	$e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9
	.byte	$e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9
	.byte	$e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9
	.byte	$e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9
	.byte	$e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9
	.byte	$e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9
	.byte	$e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9
	.byte	$e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9
	.byte	$e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9
	.byte	$e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9, $e9

// screen color data
*=colorRamArea
	.byte	$0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $05, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0e, $01, $01, $01, $0e, $01, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $0b, $0b, $0b, $0b, $0b, $0b, $0b, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $05, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $02, $02, $02, $02, $02, $02, $02, $05, $05, $05, $05, $05, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $05, $05, $05, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $02, $02, $02, $02, $02, $02, $02, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $05, $05, $05, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0b, $0b, $0b, $0b, $0b, $0b, $0e, $0e, $0e
	.byte	$0e, $02, $02, $02, $02, $02, $02, $02, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $05, $05, $05, $05, $05, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $02, $02, $02, $02, $02, $02, $02, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $05, $05, $05, $05, $05, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $02, $02, $02, $02, $02, $02, $02, $0e, $0e, $0e, $0e, $01, $0e, $0e, $0e, $0e, $0e, $05, $05, $05, $05, $05, $05, $05, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e
	.byte	$0e, $02, $02, $02, $02, $02, $02, $02, $0e, $0e, $0e, $0e, $01, $08, $0e, $0e, $0e, $05, $05, $05, $05, $05, $05, $05, $05, $05, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $01, $0e
	.byte	$0e, $02, $02, $02, $02, $0c, $02, $02, $0e, $0e, $0e, $0e, $01, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $08, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $0e, $00, $0e, $0e, $0e, $01, $05
	.byte	$01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
	.byte	$01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
	.byte	$01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
	.byte	$01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
	.byte	$01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
	.byte	$01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
	.byte	$01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
	.byte	$01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
	.byte	$01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
	.byte	$01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01
	.byte	$01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01, $01

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
