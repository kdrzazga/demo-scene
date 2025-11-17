handle_snow:

    .var snowYs = List().add(snow1y, snow2y, snow3y, snow4y, snow5y)
    .for (var i = 0; i <snowYs.size(); i++){
        inc snowYs.get(i)
        lda snowYs.get(i)
        cmp #140
        bne exit_loop_snow
        lda #20
        sta snowYs.get(i)
        exit_loop_snow:
    }
    rts
