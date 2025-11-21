.var music = LoadSid("Popcorn.sid") //only P-SIDs supported
#import "PseudoCmds.lib"
#import "basic-code-pong-load.asm"
.print "basic loader ends " + toHexString(*) + "[" + * + "]"

.const ball_x_address = $d00a
.const ball_y_address = $d00b

.const UP = 0
.const DOWN = 1
.const LEFT = 2
.const RIGHT = 3

.struct Sprite{id, x, y, color}

*=2534 "main"
	poke $d011 : #$1b // set to 25 line text mode and turn on the screen
	poke $0291 : #$80 // disable shift-commodore
	poke $d018 : #$18 // set screen memory ($0400) and charset bitmap offset ($2000)

	// set border-background color
	poke 53280 : #8
	poke 53281 : #8

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

	.var knaSprite = Sprite(1, 255, 111, 1)
    .var sprite2 = Sprite(2, $12, $34, LIGHT_GREEN)
    .var sprite3 = Sprite(3, $12, $49, LIGHT_GREEN)
    .var sprite4 = Sprite(4, $de, $34, 1)
    .var sprite5 = Sprite(5, $de, $49, 1)
    .var sprite6 = Sprite(6, $77, $6a, YELLOW)

    .var allSprites = List().add(knaSprite, sprite2, sprite3, sprite4, sprite5, sprite6)

    .for(var i = 0; i < allSprites.size(); i++){
        poke $d000 + 2*i : #allSprites.get(i).x
        poke $d001 + 2*i : #allSprites.get(i).y

        poke $d027 + i: #allSprites.get(i).color
    }

	// set sprite multicolors
	lda #RED
	sta $d025
	lda #BLUE
	sta $d026

	// x coordinate high bits
	lda #$00
	sta $d010

	// expand sprites
	poke $d01d :#0
	poke $d017 : #%00011110

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
	lda #%00111111//#$3f
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
	//jmp move_ball

move_ball:
    inc 1024 + 16*40 //TODO: remove
    lda ball_movement_vertical
    cmp #DOWN
    beq move_ball_down
    jmp move_ball_up
check_horizontal_move:
    lda ball_movement_horizontal
    cmp #LEFT
    beq move_ball_left
    jmp move_ball_right

move_ball_down:
    inc ball_y_address
    jmp check_horizontal_move
move_ball_up:
    dec ball_y_address
    jmp check_horizontal_move
move_ball_left:
    dec ball_x_address
    jmp end_movement
move_ball_right:
    inc ball_x_address

end_movement:
    rti

counter:
    .byte 0
ball_movement_vertical:
    .byte UP
ball_movement_horizontal:
    .byte LEFT

#import "data.asm"
