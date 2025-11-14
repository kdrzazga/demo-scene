.var music = LoadSid("In_Yer_Face.sid") //only P-SIDs supported
.const sys = $9e00
.const init_basic = $080b

.const charBitmapDataAddress = $2800
.const screenData = $2800
.const screenColorData = $2be8
.const screenMemory = $0400

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
	lda #%00011011
	sta $d011

	// disable shift-commodore
	lda #%10000000
	sta $0291

	// set screen memory ($0400) and charset bitmap offset ($2000)
	//lda #%00011000
	//sta $d018

	// set border color
	lda bkg_color1
	sta $d020

	// turn on multicolor mode
	lda #%11011000
	sta $D016 //Bit #4: 1 = Multicolor mode on, Default: $C8, %11001000.

	// set multicolor 1
	lda #$01
	sta $d022

	// set multicolor 2
	lda #$00
	sta $d023

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
	cmp #10
	beq color_set1
	cmp #(10+3)
	beq default_color_set
	cmp #(10+3+6)
	beq color_set2
	cmp #(10+3+6+3)
	beq yellow_color_set
	cmp #(10+3+6+3+3)
	beq color_chg_counter_reset
	rti

default_color_set:
    lda #BLACK
    sta $d020
    lda #YELLOW
    sta main_color1
    jsr colorize_sprites
    jsr draw_screen
    rti

yellow_color_set:
    lda #YELLOW
    sta $d020
    sta main_color1
    jsr colorize_sprites
    jsr draw_screen
    rti

color_set1:
    lda #BLACK
    sta $d020
    lda #CYAN
    sta main_color1
    jsr colorize_sprites
    jsr draw_screen
    rti

color_set2:
    lda #BLACK
    sta $d020
    lda #WHITE
    sta main_color1
    jsr colorize_sprites
    jsr draw_screen
    rti

color_chg_counter_reset:
    lda #0
    sta color_chg_counter
    rti

color_chg_counter:
    .byte 0
main_color1:
    .byte YELLOW
bkg_color1:
    .byte BLACK //better don't change it

draw_screen:

	// set background color
	lda main_color1
	sta $d021

	lda #$00
	sta $fb

	lda #<screenData
	sta $f7

	lda #>screenData
	sta $fc

    lda #<screenMemory
	sta $fd
	lda #>screenMemory
	sta $fe

	lda #<screenColorData
	sta $f9
	lda #>screenColorData
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
*=charBitmapDataAddress
	.byte	$6c, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $62, $7b
	.byte	$e1, $60, $60, $20, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $20, $20, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $20, $20, $20, $20, $20, $20, $20, $20, $20, $61
	.byte	$e1, $60, $20, $60, $60, $e9, $a2, $df, $60, $60, $60, $60, $e9, $e0, $df, $60, $60, $20, $60, $cf, $e0, $d0, $60, $60, $60, $60, $20, $20, $20, $60, $20, $20, $20, $68, $66, $68, $60, $20, $20, $61
	.byte	$e1, $df, $60, $60, $e9, $e0, $e0, $e0, $df, $60, $60, $e9, $e0, $e0, $e0, $df, $20, $20, $cf, $e0, $e0, $e0, $d0, $20, $20, $62, $62, $62, $62, $a0, $20, $20, $e9, $e0, $e0, $e0, $df, $20, $e9, $61
	.byte	$e1, $e0, $cf, $d0, $e0, $e0, $e0, $e0, $e0, $cf, $d0, $e0, $e0, $e0, $e0, $e0, $cf, $d0, $e0, $e4, $e0, $e4, $e0, $cf, $d0, $e0, $f9, $e0, $f9, $a0, $f4, $ea, $e0, $e0, $e0, $e0, $e0, $e9, $e0, $61
	.byte	$e1, $e0, $e5, $e7, $e0, $d7, $e0, $d7, $e0, $e5, $d5, $e0, $d7, $e0, $d7, $e0, $c9, $7f, $e0, $d7, $e0, $d7, $e0, $ff, $e7, $e0, $d7, $e0, $d7, $a0, $f4, $bc, $e0, $d7, $e0, $d7, $e0, $be, $e0, $61
	.byte	$e1, $a1, $e5, $e7, $e0, $e0, $a3, $e0, $e0, $e5, $ca, $e0, $e0, $9e, $e0, $e0, $cb, $ff, $e0, $e0, $9e, $e0, $e0, $7f, $e7, $e0, $e0, $d1, $e0, $e0, $f4, $ea, $e0, $e0, $d8, $e0, $e0, $f4, $e0, $61
	.byte	$e1, $e0, $e5, $e7, $e0, $e0, $e0, $e0, $e0, $e5, $e7, $e0, $e0, $e0, $e0, $e0, $e5, $ea, $e0, $f0, $c3, $ee, $e0, $e5, $e7, $e0, $e0, $e0, $e0, $e0, $f4, $ea, $e0, $d5, $f2, $c9, $e0, $f4, $e0, $61
	.byte	$e1, $e0, $cc, $fa, $e0, $ca, $c3, $cb, $e0, $cc, $fa, $e0, $d5, $c3, $c9, $e0, $cc, $fa, $e0, $ca, $c3, $cb, $e0, $cc, $fa, $e0, $ca, $c3, $cb, $e0, $cc, $fa, $e0, $ca, $c3, $cb, $e0, $cc, $e0, $61
	.byte	$e1, $69, $60, $60, $cd, $e0, $e0, $e0, $ce, $60, $60, $cd, $e0, $e0, $e0, $ce, $e0, $e0, $cd, $e0, $e0, $e0, $ce, $e0, $e0, $cd, $e0, $e0, $e0, $ce, $ef, $ef, $cd, $e0, $e0, $e0, $ce, $20, $5f, $61
	.byte	$e1, $60, $60, $60, $5f, $cd, $ef, $ce, $69, $60, $60, $5f, $cd, $ef, $ce, $69, $20, $20, $5f, $cd, $ef, $ce, $69, $20, $20, $5f, $cd, $ef, $ce, $69, $20, $20, $5f, $cd, $ef, $ce, $69, $20, $20, $61
	.byte	$e1, $60, $60, $60, $20, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $20, $20, $20, $20, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $e4, $69, $20, $20, $20, $61
	.byte	$e1, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $60, $05, $20, $20, $20, $13, $20, $20, $20, $20, $20, $20, $20, $20, $06, $20, $01, $20, $03, $20, $05, $20, $13, $20, $20, $61
	.byte	$e1, $60, $60, $60, $60, $e9, $a2, $a2, $a2, $a2, $a2, $df, $60, $10, $60, $60, $20, $14, $20, $60, $60, $03, $20, $20, $20, $09, $60, $60, $60, $20, $60, $2c, $2e, $2c, $60, $60, $60, $20, $20, $61
	.byte	$e1, $df, $60, $60, $e9, $e0, $e0, $e0, $a0, $a0, $a0, $e0, $df, $60, $60, $68, $e6, $e6, $e6, $68, $20, $60, $20, $09, $20, $20, $60, $20, $20, $20, $e9, $a7, $a2, $a2, $df, $20, $60, $20, $e9, $61
	.byte	$e1, $e0, $cf, $d0, $e0, $e4, $e4, $e4, $a0, $e4, $e4, $e4, $e0, $cf, $d0, $dc, $e0, $e0, $e0, $e0, $5c, $60, $20, $df, $20, $e9, $60, $cf, $d0, $55, $e0, $e0, $e0, $e0, $e0, $49, $cf, $d0, $e0, $61
	.byte	$e1, $e0, $e5, $e7, $e0, $a8, $ae, $a9, $a0, $a8, $ae, $a9, $e0, $f4, $ea, $dc, $d7, $e0, $d7, $e0, $5c, $20, $e9, $e0, $e0, $e0, $df, $e5, $e7, $5d, $e0, $d3, $e0, $d3, $e0, $5d, $e5, $e7, $e0, $61
	.byte	$e1, $a1, $e5, $e7, $e0, $e0, $e3, $e0, $ae, $a0, $e3, $a0, $e0, $f4, $ea, $dc, $e0, $da, $e0, $e0, $5c, $20, $e0, $d7, $e0, $d7, $e0, $e5, $e7, $5d, $e0, $e0, $a3, $e0, $e0, $5d, $e5, $e7, $e0, $61
	.byte	$e1, $e0, $e5, $e7, $e0, $e0, $e0, $a0, $a0, $a0, $a0, $a0, $e0, $f4, $ea, $d4, $e0, $e0, $e0, $e0, $e5, $20, $e0, $e0, $ab, $e0, $e0, $e5, $e7, $20, $e0, $e0, $e0, $e0, $e0, $20, $e5, $e7, $e0, $61
	.byte	$e1, $e0, $cc, $fa, $e0, $ca, $c3, $c0, $c0, $c0, $cb, $e0, $a0, $cc, $fa, $d4, $d5, $c3, $c9, $e0, $f4, $20, $e0, $ca, $c3, $cb, $e0, $cc, $fa, $e9, $e0, $ca, $c3, $cb, $e0, $df, $cc, $fa, $e0, $61
	.byte	$e1, $69, $60, $60, $cd, $e0, $86, $80, $db, $a0, $e0, $e0, $ce, $60, $20, $cd, $e0, $e0, $e0, $ce, $69, $60, $cd, $ef, $ef, $ef, $ce, $60, $e9, $a0, $cd, $e0, $e0, $e0, $a0, $a0, $df, $20, $5f, $61
	.byte	$e1, $60, $60, $60, $5f, $cd, $ef, $ef, $ef, $ef, $ef, $ce, $69, $60, $60, $5f, $cd, $ef, $ce, $69, $20, $60, $5f, $e2, $e2, $e2, $69, $60, $e0, $a0, $a0, $cd, $ef, $ce, $a0, $a0, $a0, $20, $20, $61
	.byte	$e1, $60, $60, $60, $20, $e0, $2a, $2a, $2a, $2a, $2a, $e0, $20, $60, $60, $20, $e0, $e0, $e0, $20, $20, $60, $20, $20, $20, $20, $20, $60, $5f, $e0, $a0, $e0, $aa, $e0, $e0, $e0, $69, $20, $20, $61
	.byte	$e1, $e2, $e2, $e2, $e2, $e2, $e2, $e2, $a0, $e2, $a0, $e2, $e2, $e2, $e2, $e2, $e2, $e2, $a0, $e2, $e2, $e2, $e2, $e2, $e2, $e2, $a0, $e2, $e2, $e2, $e4, $e2, $e2, $e2, $e4, $e2, $e2, $e2, $e0, $61
	.byte	$a0, $10, $05, $14, $13, $03, $09, $09, $20, $2b, $20, $13, $10, $12, $09, $14, $05, $13, $20, $0b, $12, $09, $13, $14, $0f, $06, $20, $04, $2e, $20, $0b, $26, $01, $20, $10, $0c, $15, $13, $20, $20

// screen color data
*=screenColorData
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
