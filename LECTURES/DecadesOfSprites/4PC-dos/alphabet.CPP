void main() {
    _asm {
	mov dl, 'a'
	}
label:
    _asm {
	mov ah, 02h

	int 21h
	inc dl
	cmp dl, 'z'+1
	jne label

	mov ah, 8
	int 21h
    }
}

