    init_sprites:
    
	// set sprite multicolors
	lda main_color1
	sta $d025
	lda #BLACK
	sta $d026

    
	// colorize sprites
	lda main_color1
	sta $d027
	lda #BLACK
	sta $d028
	lda main_color1
	sta $d029
	lda main_color1
	sta $d02A
	lda #BLACK
	sta $d02B
	lda #BLACK
	sta $d02C
	lda #BLACK
	sta $d02D
	lda #BLACK
	sta $d02E

    
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

	// positioning sprites
	lda #$78
	sta $d000	// #0. sprite X low byte
	lda #$45
	sta $d001	// #0. sprite Y
	lda #$E0
	sta $d002	// #1. sprite X low byte
	lda #$39
	sta $d003	// #1. sprite Y
	lda #$22
	sta $d004	// #2. sprite X low byte  sprite Joint
	lda #$CC
	sta $d005	// #2. sprite Y  sprite Joint
	lda #$B9
	sta $d006	// #3. sprite X low byte
	lda #$C2
	sta $d007	// #3. sprite Y
	lda #$30
	sta $d008	// #4. sprite X low byte
	lda #$9A
	sta $d009	// #4. sprite Y
	lda #$69
	sta $d00A	// #5. sprite X low byte
	lda #$3C
	sta $d00B	// #5. sprite Y
    lda #30
    sta $d00C	// #6. sprite X low byte   sprite Face
    lda #50
    sta $d00D	// #6. sprite Y   sprite Face
	lda #180
	sta $d00E	// #7. sprite X low byte   sprite Face
	lda #136
	sta $d00F	// #7. sprite Y   sprite Face

	// X coordinate high bits
	lda #%00010100
	sta $d010

	// expand sprites
	lda #$02
	sta $d01d
	lda #$09
	sta $d017

	// set multicolor flags
	lda #$C0
	sta $d01c

	// set screen-sprite priority flags
	lda #$00
	sta $d01b

	// turn on sprites
	lda #%11111111
	sta $d015

