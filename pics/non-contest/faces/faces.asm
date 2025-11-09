.var music = LoadSid("In_Yer_Face.sid") //only P-SIDs supported
.const sys = $9e00
.const init_basic = $080b
.const counter = $fa // a zeropage address to be used as a counter

// 206 SYS2061
*=$0801
    .word init_basic
	.byte 206
	.word sys
	.text "2061"
	.byte $00, $00

*=2061
	// set to 25 line text mode and turn on the screen
	lda #$1B
	sta $D011

	// disable SHIFT-Commodore
	lda #$80
	sta $0291

	// set screen memory ($0400) and charset bitmap offset ($2000)
	//lda #%00011000
	//sta $D018

	// set border color
	lda bkg_color1
	sta $D020

	// turn on multicolor mode
	lda #%11011000
	sta $D016 //Bit #4: 1 = Multicolor mode on, Default: $C8, %11001000.

	// set multicolor 1
	lda #$01
	sta $D022

	// set multicolor 2
	lda #$00
	sta $D023

    jsr draw_screen
    jsr init_sprites

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
	inc $d00c
	dec $d00e
	lda $d00c
	cmp #200
	beq reset_face_sprite_up
	lda $d00e
	cmp #60
	beq reset_face_sprite_down
rti

reset_face_sprite_up:
    lda #30
    sta $d00C	// #6. sprite X low byte   sprite Face
	lda bkg_color1
	sta $d020
    rti

reset_face_sprite_down:
	lda #180
	sta $d00E	// #7. sprite X low byte   sprite Face

	inc color_chg_counter
	lda color_chg_counter
	cmp 150
	beq color_set1
	cmp 200
	beq color_set2
	cmp 0
	beq default_color_set
	rti

default_color_set:
    lda #YELLOW
    sta main_color1
    jsr colorize_sprites
    jsr draw_screen
    rti

color_set1:
    lda #CYAN
    sta main_color1
    jsr colorize_sprites
    jsr draw_screen
    rti

color_set2:
    lda #WHITE
    sta main_color1
    jsr colorize_sprites
    jsr draw_screen
    rti

color_chg_counter:
    .byte 0
main_color1:
    .byte CYAN
bkg_color1:
    .byte BLACK //better don't change it

draw_screen:

	// set background color
	lda main_color1
	sta $D021

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


#import "sprites.asm"

#import "sprites-data.asm"

// screen character data
*=$2800
	.byte	$6C, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $7B
	.byte	$E1, $60, $60, $20, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $20, $20, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $20, $20, $20, $20, $20, $20, $20, $20, $20, $61
	.byte	$E1, $60, $20, $60, $60, $E9, $A2, $DF, $60, $60, $60, $60, $E9, $E0, $DF, $60, $60, $20, $60, $CF, $E0, $D0, $60, $60, $60, $60, $20, $20, $20, $60, $20, $20, $20, $68, $66, $68, $60, $20, $20, $61
	.byte	$E1, $DF, $60, $60, $E9, $E0, $E0, $E0, $DF, $60, $60, $E9, $E0, $E0, $E0, $DF, $20, $20, $CF, $E0, $E0, $E0, $D0, $20, $20, $62, $62, $62, $62, $A0, $20, $20, $E9, $E0, $E0, $E0, $DF, $20, $E9, $61
	.byte	$E1, $E0, $CF, $D0, $E0, $E0, $E0, $E0, $E0, $CF, $D0, $E0, $E0, $E0, $E0, $E0, $CF, $D0, $E0, $E4, $E0, $E4, $E0, $CF, $D0, $E0, $F9, $E0, $F9, $A0, $F4, $EA, $E0, $E0, $E0, $E0, $E0, $E9, $E0, $61
	.byte	$E1, $E0, $E5, $E7, $E0, $D7, $E0, $D7, $E0, $E5, $D5, $E0, $D7, $E0, $D7, $E0, $C9, $7F, $E0, $D7, $E0, $D7, $E0, $FF, $E7, $E0, $D7, $E0, $D7, $A0, $F4, $BC, $E0, $D7, $E0, $D7, $E0, $BE, $E0, $61
	.byte	$E1, $A1, $E5, $E7, $E0, $E0, $A3, $E0, $E0, $E5, $CA, $E0, $E0, $9E, $E0, $E0, $CB, $FF, $E0, $E0, $9E, $E0, $E0, $7F, $E7, $E0, $E0, $D1, $E0, $E0, $F4, $EA, $E0, $E0, $D8, $E0, $E0, $F4, $E0, $61
	.byte	$E1, $E0, $E5, $E7, $E0, $E0, $E0, $E0, $E0, $E5, $E7, $E0, $E0, $E0, $E0, $E0, $E5, $EA, $E0, $F0, $C3, $EE, $E0, $E5, $E7, $E0, $E0, $E0, $E0, $E0, $F4, $EA, $E0, $D5, $F2, $C9, $E0, $F4, $E0, $61
	.byte	$E1, $E0, $CC, $FA, $E0, $CA, $C3, $CB, $E0, $CC, $FA, $E0, $D5, $C3, $C9, $E0, $CC, $FA, $E0, $CA, $C3, $CB, $E0, $CC, $FA, $E0, $CA, $C3, $CB, $E0, $CC, $FA, $E0, $CA, $C3, $CB, $E0, $CC, $E0, $61
	.byte	$E1, $69, $60, $60, $CD, $E0, $E0, $E0, $CE, $60, $60, $CD, $E0, $E0, $E0, $CE, $E0, $E0, $CD, $E0, $E0, $E0, $CE, $E0, $E0, $CD, $E0, $E0, $E0, $CE, $EF, $EF, $CD, $E0, $E0, $E0, $CE, $20, $5F, $61
	.byte	$E1, $60, $60, $60, $5F, $CD, $EF, $CE, $69, $60, $60, $5F, $CD, $EF, $CE, $69, $20, $20, $5F, $CD, $EF, $CE, $69, $20, $20, $5F, $CD, $EF, $CE, $69, $20, $20, $5F, $CD, $EF, $CE, $69, $20, $20, $61
	.byte	$E1, $60, $60, $60, $20, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $20, $20, $20, $20, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $E4, $69, $20, $20, $20, $61
	.byte	$E1, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $05, $20, $20, $20, $13, $20, $20, $20, $20, $20, $20, $20, $20, $06, $20, $01, $20, $03, $20, $05, $20, $13, $20, $20, $61
	.byte	$E1, $60, $60, $60, $60, $E9, $A2, $A2, $A2, $A2, $A2, $DF, $60, $10, $60, $60, $20, $14, $20, $60, $60, $03, $20, $20, $20, $09, $60, $60, $60, $20, $60, $2C, $2E, $2C, $60, $60, $60, $20, $20, $61
	.byte	$E1, $DF, $60, $60, $E9, $E0, $E0, $E0, $A0, $A0, $A0, $E0, $DF, $60, $60, $68, $E6, $E6, $E6, $68, $20, $60, $20, $09, $20, $20, $60, $20, $20, $20, $E9, $A7, $A2, $A2, $DF, $20, $60, $20, $E9, $61
	.byte	$E1, $E0, $CF, $D0, $E0, $E4, $E4, $E4, $A0, $E4, $E4, $E4, $E0, $CF, $D0, $DC, $E0, $E0, $E0, $E0, $5C, $60, $20, $DF, $20, $E9, $60, $CF, $D0, $55, $E0, $E0, $E0, $E0, $E0, $49, $CF, $D0, $E0, $61
	.byte	$E1, $E0, $E5, $E7, $E0, $A8, $AE, $A9, $A0, $A8, $AE, $A9, $E0, $F4, $EA, $DC, $D7, $E0, $D7, $E0, $5C, $20, $E9, $E0, $E0, $E0, $DF, $E5, $E7, $5D, $E0, $D3, $E0, $D3, $E0, $5D, $E5, $E7, $E0, $61
	.byte	$E1, $A1, $E5, $E7, $E0, $E0, $E3, $E0, $AE, $A0, $E3, $A0, $E0, $F4, $EA, $DC, $E0, $DA, $E0, $E0, $5C, $20, $E0, $D7, $E0, $D7, $E0, $E5, $E7, $5D, $E0, $E0, $A3, $E0, $E0, $5D, $E5, $E7, $E0, $61
	.byte	$E1, $E0, $E5, $E7, $E0, $E0, $E0, $A0, $A0, $A0, $A0, $A0, $E0, $F4, $EA, $D4, $E0, $E0, $E0, $E0, $E5, $20, $E0, $E0, $AB, $E0, $E0, $E5, $E7, $20, $E0, $E0, $E0, $E0, $E0, $20, $E5, $E7, $E0, $61
	.byte	$E1, $E0, $CC, $FA, $E0, $CA, $C3, $C0, $C0, $C0, $CB, $E0, $A0, $CC, $FA, $D4, $D5, $C3, $C9, $E0, $F4, $20, $E0, $CA, $C3, $CB, $E0, $CC, $FA, $E9, $E0, $CA, $C3, $CB, $E0, $DF, $CC, $FA, $E0, $61
	.byte	$E1, $69, $60, $60, $CD, $E0, $86, $80, $DB, $A0, $E0, $E0, $CE, $60, $20, $CD, $E0, $E0, $E0, $CE, $69, $60, $CD, $EF, $EF, $EF, $CE, $60, $E9, $A0, $CD, $E0, $E0, $E0, $A0, $A0, $DF, $20, $5F, $61
	.byte	$E1, $60, $60, $60, $5F, $CD, $EF, $EF, $EF, $EF, $EF, $CE, $69, $60, $60, $5F, $CD, $EF, $CE, $69, $20, $60, $5F, $E2, $E2, $E2, $69, $60, $E0, $A0, $A0, $CD, $EF, $CE, $A0, $A0, $A0, $20, $20, $61
	.byte	$E1, $60, $60, $60, $20, $E0, $2A, $2A, $2A, $2A, $2A, $E0, $20, $60, $60, $20, $E0, $E0, $E0, $20, $20, $60, $20, $20, $20, $20, $20, $60, $5F, $E0, $A0, $E0, $AA, $E0, $E0, $E0, $69, $20, $20, $61
	.byte	$E1, $E2, $E2, $E2, $E2, $E2, $E2, $E2, $A0, $E2, $A0, $E2, $E2, $E2, $E2, $E2, $E2, $E2, $A0, $E2, $E2, $E2, $E2, $E2, $E2, $E2, $A0, $E2, $E2, $E2, $E4, $E2, $E2, $E2, $E4, $E2, $E2, $E2, $E0, $61
	.byte	$A0, $10, $05, $14, $13, $03, $09, $09, $20, $2B, $20, $13, $10, $12, $09, $14, $05, $13, $20, $0B, $12, $09, $13, $14, $0F, $06, $20, $04, $2E, $20, $0B, $26, $01, $20, $10, $0C, $15, $13, $20, $20

// screen color data
*=$2be8
    .fill 1000, BLACK

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
