//CMP
//Compare Accumulator
//Compare sets processor flags as if a subtraction had been carried out.
//
//If the accumulator and the compared value are equal, the result of the subtraction is zero and the Zero (Z) flag is set. If the accumulator is equal or greater than the compared value, the Carry (C) flag is set.

BasicUpstart2(start)

start:
    lda #'s'
    jsr $ffd2

    clc
    lda #82
    cmp #81

    bcs greater
    bcc lesser

    jmp *

greater:
    .print("wieksze")
    lda #'w'
    sta 2000

    jmp *

lesser:
    lda #'m'
    sta 2000

    jmp *



