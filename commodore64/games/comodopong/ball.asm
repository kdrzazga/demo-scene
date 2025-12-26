.const sprite_sprite_collision_cell = 53278//$d01e
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
    jmp check_bat_deflection
move_ball_right:
    inc ball_x_address
    jmp check_bat_deflection

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

check_bat_deflection:
    .var andConditions = List().add(/*right bat collisions*/ %00010000, %00001000, /*left bat collisions*/ %01000000, %00100000)
    .for(var i = 0; i <= 1; i++){
        lda sprite_sprite_collision_cell
        and #andConditions.get(i)
        beq right_bat_deflection
        lda sprite_sprite_collision_cell
        and #andConditions.get(i + 2)
        beq left_bat_deflection
    }
    jmp end_movement

left_bat_deflection:
    lda #RIGHT
    sta ball_movement_horizontal
    jmp end_movement

right_bat_deflection:
    lda #LEFT
    sta ball_movement_horizontal
    jmp end_movement

end_movement:
    rts
