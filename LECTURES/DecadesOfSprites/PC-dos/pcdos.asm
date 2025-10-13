ASSUME cs:CODE
CODE SEGMENT

current_color db 1

main:
	mov ax,0013h
	int 10h
