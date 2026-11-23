.var music = LoadSid("Danger_Castle_64.sid")
:BasicUpstart2(start)

.const BANK0_BITMAP = $2000
.const BANK0_SCREEN = $0400
.const BANK0_COLORS = $8000
.const BANK0_DD00 = %11
.const BANK0_D018 = %00011000

.const BANK1_BITMAP = $6000
.const BANK1_SCREEN = $4800
.const BANK1_COLORS = $8400
.const BANK1_DD00 = %10
.const BANK1_D018 = %00101000

.const KOALA_BITMAP_SIZE = 8000
.const KOALA_SCREEN_SIZE = 1000
.const KOALA_COLORS_SIZE = 1000
.const KOALA_BACKGROUND_SIZE = 1
.const KILOBYTE_PAGES = 4

.const WELCOME_SCREEN = $8800
.const WELCOME_DD00 = %01
.const WELCOME_D018 = %00100100
.const WELCOME_TEXT_COLOR = WHITE
.const SCREEN_COLUMNS = 40
.const WELCOME_FIRST_ROW = 11
.const SPACE_SCREEN_CODE = $20

.const SCREEN_VISIBLE_TEXT = %00011011
.const SCREEN_VISIBLE_BITMAP = %00111011
.const HIRES_40_COLUMNS = %11001000
.const MULTICOLOR_40_COLUMNS = %11011000
.const MUSIC_RASTER_LINE = $80
.const FIRST_BORDER_LINE = $fb

.macro CopyPages(source, target, pageCount) {
			ldx #0
			.for (var page=0; page<pageCount; page++) {
!:				lda source+page*$100,x
				sta target+page*$100,x
				inx
				bne !-
			}
}

start:
			lda #BLACK
			sta $d020
			sta $d021
			jsr showWelcomeScreen
			jsr startMusic
			jsr fastLoaderInstall

pictureLoop:
			jsr loadPictureIntoHiddenBank
			bcs nextPicture
			jsr waitForBottomBorder
			jsr showHiddenPicture
nextPicture:
			inc pictureIndex
			lda pictureIndex
			cmp #PICTURE_COUNT
			bne pictureLoop
			lda #0
			sta pictureIndex
			jmp pictureLoop

showWelcomeScreen:
			ldx #0
!:			lda #SPACE_SCREEN_CODE
			.for (var page=0; page<KILOBYTE_PAGES; page++) {
				sta WELCOME_SCREEN+page*$100,x
			}
			lda #WELCOME_TEXT_COLOR
			.for (var page=0; page<KILOBYTE_PAGES; page++) {
				sta $d800+page*$100,x
			}
			inx
			bne !-
			ldx #welcomeTitleEnd-welcomeTitle-1
!:			lda welcomeTitle,x
			sta WELCOME_SCREEN+WELCOME_FIRST_ROW*SCREEN_COLUMNS+(SCREEN_COLUMNS-(welcomeTitleEnd-welcomeTitle))/2,x
			dex
			bpl !-
			ldx #welcomeLoadingEnd-welcomeLoading-1
!:			lda welcomeLoading,x
			sta WELCOME_SCREEN+(WELCOME_FIRST_ROW+2)*SCREEN_COLUMNS+(SCREEN_COLUMNS-(welcomeLoadingEnd-welcomeLoading))/2,x
			dex
			bpl !-
			lda $dd00
			and #%11111100
			ora #WELCOME_DD00
			sta $dd00
			lda #WELCOME_D018
			sta $d018
			lda #HIRES_40_COLUMNS
			sta $d016
			lda #SCREEN_VISIBLE_TEXT
			sta $d011
			rts

startMusic:
			ldx #0
			ldy #0
			lda #music.startSong-1
			jsr music.init
			sei
			lda #<musicIrq
			sta $0314
			lda #>musicIrq
			sta $0315
			asl $d019
			lda #%01111111
			sta $dc0d
			lda #%10000001
			sta $d01a
			lda #MUSIC_RASTER_LINE
			sta $d012
			cli
			rts

musicIrq:
			asl $d019
			jsr music.play
			pla
			tay
			pla
			tax
			pla
			rti

loadPictureIntoHiddenBank:
			ldx pictureIndex
			lda pictureBorderColors,x
			sta nextBorderColor
			lda pictureNameLengths,x
			ldy pictureNamesHigh,x
			pha
			lda pictureNamesLow,x
			tax
			pla
			jsr fastLoadSetName
			lda hiddenBank
			bne loadIntoBank1
			ldx #<bank0Segments
			ldy #>bank0Segments
			jmp fastLoad
loadIntoBank1:
			ldx #<bank1Segments
			ldy #>bank1Segments
			jmp fastLoad

waitForBottomBorder:
			lda #FIRST_BORDER_LINE
!:			cmp $d012
			bne !-
			rts

showHiddenPicture:
			lda nextBorderColor
			sta $d020
			lda #MULTICOLOR_40_COLUMNS
			sta $d016
			lda hiddenBank
			bne showBank1
			lda $dd00
			and #%11111100
			ora #BANK0_DD00
			sta $dd00
			lda #BANK0_D018
			sta $d018
			lda bank0Background
			sta $d021
			lda #SCREEN_VISIBLE_BITMAP
			sta $d011
			CopyPages(BANK0_COLORS, $d800, KILOBYTE_PAGES)
			lda #1
			sta hiddenBank
			rts
showBank1:
			lda $dd00
			and #%11111100
			ora #BANK1_DD00
			sta $dd00
			lda #BANK1_D018
			sta $d018
			lda bank1Background
			sta $d021
			lda #SCREEN_VISIBLE_BITMAP
			sta $d011
			CopyPages(BANK1_COLORS, $d800, KILOBYTE_PAGES)
			lda #0
			sta hiddenBank
			rts

bank0Segments:
			.word BANK0_BITMAP, KOALA_BITMAP_SIZE
			.word BANK0_SCREEN, KOALA_SCREEN_SIZE
			.word BANK0_COLORS, KOALA_COLORS_SIZE
			.word bank0Background, KOALA_BACKGROUND_SIZE
			.word 0, 0
bank1Segments:
			.word BANK1_BITMAP, KOALA_BITMAP_SIZE
			.word BANK1_SCREEN, KOALA_SCREEN_SIZE
			.word BANK1_COLORS, KOALA_COLORS_SIZE
			.word bank1Background, KOALA_BACKGROUND_SIZE
			.word 0, 0

pictureIndex:		.byte 0
hiddenBank:			.byte 0
nextBorderColor:	.byte BLACK

.encoding "screencode_upper"
welcomeTitle:		.text "WELCOME TO PICTURE VIEWER"
welcomeTitleEnd:
welcomeLoading:		.text "LOADING ..."
welcomeLoadingEnd:
bank0Background:	.byte BLACK
bank1Background:	.byte BLACK

#import "PictureList.asm"
#import "FastLoader.asm"

.pc=music.location "Music"
.fill music.size, music.getData(i)
