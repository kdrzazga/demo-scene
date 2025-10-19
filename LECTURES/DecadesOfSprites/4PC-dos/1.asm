ASSUME cs:CODE

DATA SEGMENT
text    db 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0
        db 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0
        db 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0
        db 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0
        db 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0

X EQU 50
Y EQU 50

DATA ENDS

CODE SEGMENT

start:

    ; Copy sprite data into video memory at segment 0xA000
    lea si, [text]
    mov di, X + Y           ; Start at offset 320*x+y in video memory
    mov ax, 0b800h
    mov es, ax
    mov cx, 24    ; one row (24 pixels)

    ; Copy data directly
    rep movsb

    ; Wait for key press
    mov ah, 1
    int 21h

    ; Exit
    mov ax, 4C00h
    int 21h

CODE ENDS
END start
