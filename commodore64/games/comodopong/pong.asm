.var music = LoadSid("Popcorn.sid") //only P-SIDs supported
#import "PseudoCmds.lib"
#import "basic-code-pong-load.asm"
.print "basic loader ends " + toHexString(*) + "[" + * + "]"

.const data_address = $3000
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
    .var leftBatTopSprite = Sprite(2, $12, $34, LIGHT_GREEN)
    .var leftBatBottomSprite = Sprite(3, $12, $49, LIGHT_GREEN)
    .var rightBatTopSprite  = Sprite(4, $de, $34, 1)
    .var rightBatBottomSprite = Sprite(5, $de, $49, 1)
    .var ballSprite = Sprite(6, $77, $6a, YELLOW)

    .var allSprites = List().add(knaSprite, leftBatTopSprite, leftBatBottomSprite, rightBatTopSprite, rightBatBottomSprite, ballSprite)

    .for(var i = 0; i < allSprites.size(); i++){
        poke $d000 + 2*i : #allSprites.get(i).x
        poke $d001 + 2*i : #allSprites.get(i).y

        poke $d027 + i: #allSprites.get(i).color
    }

	// set sprite multicolors
	poke $d025 :#RED
	poke $d026 : #BLUE

	// x coordinate high bits
	poke $d010 : #0

	// expand sprites
	poke $d01d :#0
	poke $d017 : #%00011110

	// set multicolor flags
	poke $d01c : #1

	// set screen-sprite priority flags
	poke $d01b : #0

    .for(var cell=$07f8; cell <=$07ff; cell++) {
        .var i = cell - $07f8
        lda #(data_address/$40 + i)
        sta cell
    }

	// turn on sprites
	poke $d015 : #%00111111//#$3f

   //-------

    ldx #0
    ldy #0
    lda #music.startSong-1
    jsr music.init
    sei
    poke $0314 : #<irq1
    poke $0315 : #>irq1
    asl $d019   //Interrupt status register
    poke $dc0d : #%01111011  //Interrupt control and status register.
    poke $d01a : #%10000001  //Interrupt control register
    poke $d011 : #$1b  //Screen control register #1
    poke $d012 : #%10000000  //Raster line to generate interrupt at (bits #0-#7).
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
