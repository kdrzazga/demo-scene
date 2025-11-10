.var music = LoadSid("Modem.sid") //only P-SIDs supported

#import "basic-code-hf-load.asm"
//:BasicUpstart2(main)

*=2534 "main"
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

    jsr draw_screen

	lda #BLACK
	jsr colorize_sprites

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
	lda #$c0  //points to $40 * $c0 = $3000
	sta $07F8
	lda #$c1 //points to
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

colorize_sprites:
	sta $d027
	sta $d028
	sta $d029
	sta $d02a
	sta $d02b
	sta $d02c
	sta $d02d
	sta $d02e
	rts

draw_screen:
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
	rts

reverse:
	dec $d001
	dec $d003
	dec $d005
	dec $d007
	dec $d009
	dec $d00b
	dec $d00d
	dec $d00f

	jmp counter_handling

move_bars:

    lda reverse_bool
    cmp #1
    beq reverse
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
	jmp counter_handling

reset_top_bars:

	lda #(162-42)
	sta $d005	// #2. sprite y
	sta $d009	// #4. sprite y
	jmp counter_handling

reset_bottom_bars:

	lda #(162-42)
	sta $d007	// #3. sprite y
	sta $d00b	// #5. sprite y
	jmp counter_handling

reset_middle_bars:

	lda #(162-42)
	sta $d00d	// #6. sprite y
	sta $d00f	// #7. sprite y
    rti

 counter_handling:
    inc counter
    lda counter
    // sta 1024 //useful for debaug
    cmp #7
    beq color_set1
    cmp #10
    beq color_set_default
    cmp #15
    beq color_set_white
    cmp #18
    beq color_set_default
    cmp #23
    beq color_set4
    cmp #26
    beq color_set_default
    cmp #31
    beq color_set_cyan
    cmp #35
    beq color_set_default
    cmp #80
    beq enable_reverse
    cmp #100
    beq reset_counter_reverse
	rti

color_set1:
    lda #12
    sta $d020
    lda #15
    sta $d021
    rti

color_set_default:
    lda #10
    sta $d020
    sta $d021
    rti

color_set_white:
    lda #WHITE
    sta $d020
    sta $d021
    rti

color_set4:
    lda #0
    sta $d020
    lda #15
    sta $d021
    rti

color_set_cyan:
    lda #CYAN
    sta $d020
    sta $d021
    rti

reset_counter_reverse:
    lda #0
    sta counter
    lda #0
    sta reverse_bool
    rti

enable_reverse:
    lda #1
    sta reverse_bool
    rti

.print "End code: $"  + toHexString(*) + "["+ * + "]"

counter:
    .byte 0
reverse_bool:
    .byte 0
#import "data.asm"
