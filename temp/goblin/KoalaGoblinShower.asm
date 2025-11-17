.const screenRamArea = $0c00
.const colorRamArea = $1c00 //or $1000
.const bitmapArea = $2000
:BasicUpstart2(start)
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//  					KOALA SHOWER
//
//This code displays the Koala picture in the file picture.prg
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
			.var picture = LoadBinary("wolfrider.kla", BF_KOALA)

start:
            lda #%00111000 //least significant bytes 0011 -> screenRamArea = $0c00 //0110 -> $1800
			sta $d018
			lda #11011000
			sta $d016
			lda #%00111011
			sta $d011
			lda #RED
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

WAIT_KEY:
			jsr $ffe4        // Calling KERNAL GETIN
			beq WAIT_KEY

			rts

.print "Begin ScreenRam 1: $" + toHexString(screenRamArea) + " [" + screenRamArea +"]"
*=screenRamArea	"ScreenRam"; 			.fill picture.getScreenRamSize(), picture.getScreenRam(i)
.print "End ScreenRam 1: $" + toHexString(*) + " [" + * +"]"
.print "Size = " +(*-screenRamArea)
.print "-----------------"

.print "Begin ColorRam 1: $" + toHexString(colorRamArea) + " [" + colorRamArea +"]"
*=colorRamArea	"ColorRam:"; colorRam: 	.fill picture.getColorRamSize(), picture.getColorRam(i)
.print "End ColorRam 1: $" + toHexString(*) + " [" + * +"]"
.print "Size = " +(*-colorRamArea)
.print "-----------------"

.print "Begin bitmap 1: $" + toHexString(bitmapArea) + " [" + bitmapArea +"]"
*=bitmapArea	"Bitmap";				.fill picture.getBitmapSize(), picture.getBitmap(i)
.print "End bitmap 1: $" + toHexString(*) + " [" + * +"]"
.print "Size = " +(*-bitmapArea)
