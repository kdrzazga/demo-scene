handle_skater:
    inc skater_x
    inc skater_x2

    lda counter

    jmp set_skater2
    rts

    set_skater1:

	lda #%00111111
	sta sprites_enable
    rts

    set_skater2:
	lda #%01111111
	sta sprites_enable
    rts