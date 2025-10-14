ASSUME cs:CODE
CODE SEGMENT

current_color db 1

main:
	mov ax,0013h
	int 10h
	
	mov cx, 6400
	mov al, 3 
	mov dx, 0a000h
	mov es, dx
	mov di, 57600
	cld
	rep stosb

	mov ah, 8
	int 21h
	
	mov ax, 4c01h
	int 21h
CODE ends
end main
