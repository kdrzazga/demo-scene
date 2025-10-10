.macro WAIT(duration) {
		php
        ldy #duration
        dey
        bne *-1
		plp
}


:BasicUpstart2(start)
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//  					KOALA SHOWER
//
//This code displays the Koala picture in the file picture.prg
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
			.var picture = LoadBinary("1.koa", BF_KOALA)
			.var picture2 = LoadBinary("houz2.prg", BF_KOALA)

start:  	lda #$38
			sta $d018
			lda #$d8
			sta $d016
			lda #$3b
			sta $d011
			lda #BLACK
			sta $d020
			lda #picture.getBackgroundColor()
			sta $d021
			ldx #0

loop1:		.for (var i=0; i<4; i++) {
				lda colorRam+i*$100,x
				sta $d800+i*$100,x
			}
			inx
			bne loop1
			
			.for (var i=0; i<400; i++) {
				nop
			}

loop2:		.for (var i=0; i<4; i++) {
				lda colorRam2+i*$100,y
				sta $d800+i*$100,y
			}
			iny
			bne loop2
			
			.for (var i=0; i<90; i++) {
				nop
			}			
			
			jmp loop1

*=$0c00	"ScreenRam"; 			.fill picture.getScreenRamSize(), picture.getScreenRam(i)
*=$1c00	"ColorRam:"; colorRam: 	.fill picture.getColorRamSize(), picture.getColorRam(i)
*=$2000	"Bitmap";				.fill picture.getBitmapSize(), picture.getBitmap(i)
*=$4000 "ColorRam2:"; colorRam2: 	.fill picture2.getColorRamSize(), picture2.getColorRam(i)
*=$4401	"Bitmap2";				.fill picture2.getBitmapSize(), picture2.getBitmap(i)



