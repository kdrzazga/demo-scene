.const top_boundary = 24 + 24 //right below border
.const bottom_boundary = 24 + 24 + 16*8+4 //row 16 of text mode

move_ball:
    inc 1024 + 19*40 //TODO: remove
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
    jmp check_horizontal_deflection
move_ball_up:
    dec ball_y_address
    jmp check_horizontal_deflection
move_ball_left:
    dec ball_x_address
    jmp end_movement
move_ball_right:
    inc ball_x_address
    jmp end_movement

check_horizontal_deflection:
    lda ball_y_address
    cmp #top_boundary
    beq ceiling_deflection
    cmp #bottom_boundary
    beq floor_deflection
    jmp check_horizontal_move

ceiling_deflection:
    lda #DOWN
    sta ball_movement_vertical
    jmp check_horizontal_move

floor_deflection:
    lda #UP
    sta ball_movement_vertical
    jmp check_horizontal_move

end_movement:
    rts
