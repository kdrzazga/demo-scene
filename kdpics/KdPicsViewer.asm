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
.const KOALA_SCREEN_OFFSET = KOALA_BITMAP_SIZE
.const KOALA_COLORS_OFFSET = KOALA_SCREEN_OFFSET + KOALA_SCREEN_SIZE
.const KOALA_BACKGROUND_OFFSET = KOALA_COLORS_OFFSET + KOALA_COLORS_SIZE
.const KILOBYTE_PAGES = 4

.const WELCOME_SCREEN = $8800
.const WELCOME_DD00 = %01
.const WELCOME_D018 = %00100100
.const WELCOME_TEXT_COLOR = WHITE
.const WELCOME_WARNING_COLOR = YELLOW
.const SCREEN_COLUMNS = 40
.const WELCOME_TITLE_ROW = 11
.const WELCOME_LOADING_ROW = 13
.const WELCOME_WARNING_ROW = 17
.const SPACE_SCREEN_CODE = $20

.const SCREEN_VISIBLE_TEXT = %00011011
.const SCREEN_VISIBLE_BITMAP = %00111011
.const HIRES_40_COLUMNS = %11001000
.const MULTICOLOR_40_COLUMNS = %11011000
.const MUSIC_RASTER_LINE = $80
.const FIRST_BORDER_LINE = $fb

#if SD2IEC
.const KERNAL_SETMSG = $ff90
.const KERNAL_SETLFS = $ffba
.const KERNAL_SETNAM = $ffbd
.const KERNAL_LOAD = $ffd5
.const LAST_USED_DEVICE = $ba
.const DEFAULT_DEVICE = 8
.const PICTURE_FILE_NUMBER = 1
.const LOAD_TO_GIVEN_ADDRESS = 0
.const LOAD_BUFFER = $8c00
.const PROCESSOR_PORT = $01
.const RAM_UNDER_BASIC_WITH_IO_AND_KERNAL = $36
#endif

.macro CopyPages(source, target, pageCount) {
			ldx #0
			.for (var page=0; page<pageCount; page++) {
!:				lda source+page*$100,x
				sta target+page*$100,x
				inx
				bne !-
			}
}

.macro CopyBytes(source, target, count) {
			.var fullPages = floor(count/$100)
			.var remainder = count - fullPages*$100
			CopyPages(source, target, fullPages)
			.if (remainder > 0) {
				ldx #0
!:				lda source+fullPages*$100,x
				sta target+fullPages*$100,x
				inx
				cpx #remainder
				bne !-
			}
}

.macro PrintCentered(text, textEnd, row, color) {
			ldx #textEnd-text-1
!:			lda text,x
			sta WELCOME_SCREEN+row*SCREEN_COLUMNS+floor((SCREEN_COLUMNS-(textEnd-text))/2),x
			lda #color
			sta $d800+row*SCREEN_COLUMNS+floor((SCREEN_COLUMNS-(textEnd-text))/2),x
			dex
			bpl !-
}

start:
			lda #BLACK
			sta $d020
			sta $d021
#if SD2IEC
			lda #RAM_UNDER_BASIC_WITH_IO_AND_KERNAL
			sta PROCESSOR_PORT
#endif
			jsr showWelcomeScreen
			CopyBytes(musicData, music.location, music.size)
			jsr startMusic
#if SD2IEC
			jsr kernalLoaderInstall
#else
			jsr fastLoaderInstall
#endif

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
			inx
			bne !-
			PrintCentered(welcomeTitle, welcomeTitleEnd, WELCOME_TITLE_ROW, WELCOME_TEXT_COLOR)
			PrintCentered(welcomeLoading, welcomeLoadingEnd, WELCOME_LOADING_ROW, WELCOME_TEXT_COLOR)
#if !SD2IEC
			PrintCentered(welcomeWarning1, welcomeWarning1End, WELCOME_WARNING_ROW, WELCOME_WARNING_COLOR)
			PrintCentered(welcomeWarning2, welcomeWarning2End, WELCOME_WARNING_ROW+1, WELCOME_WARNING_COLOR)
			PrintCentered(welcomeWarning3, welcomeWarning3End, WELCOME_WARNING_ROW+3, WELCOME_WARNING_COLOR)
#endif
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

#if SD2IEC
kernalLoaderInstall:
			lda LAST_USED_DEVICE
			bne !+
			lda #DEFAULT_DEVICE
!:			sta pictureDevice
			lda #0
			jmp KERNAL_SETMSG

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
			jsr KERNAL_SETNAM
			lda #PICTURE_FILE_NUMBER
			ldx pictureDevice
			ldy #LOAD_TO_GIVEN_ADDRESS
			jsr KERNAL_SETLFS
			lda #0
			ldx #<LOAD_BUFFER
			ldy #>LOAD_BUFFER
			jsr KERNAL_LOAD
			bcc pictureLoaded
			rts
pictureLoaded:
			lda hiddenBank
			beq copyIntoBank0
			jmp copyIntoBank1
copyIntoBank0:
			CopyBytes(LOAD_BUFFER, BANK0_BITMAP, KOALA_BITMAP_SIZE)
			CopyBytes(LOAD_BUFFER+KOALA_SCREEN_OFFSET, BANK0_SCREEN, KOALA_SCREEN_SIZE)
			CopyBytes(LOAD_BUFFER+KOALA_COLORS_OFFSET, BANK0_COLORS, KOALA_COLORS_SIZE)
			lda LOAD_BUFFER+KOALA_BACKGROUND_OFFSET
			sta bank0Background
			clc
			rts
copyIntoBank1:
			CopyBytes(LOAD_BUFFER, BANK1_BITMAP, KOALA_BITMAP_SIZE)
			CopyBytes(LOAD_BUFFER+KOALA_SCREEN_OFFSET, BANK1_SCREEN, KOALA_SCREEN_SIZE)
			CopyBytes(LOAD_BUFFER+KOALA_COLORS_OFFSET, BANK1_COLORS, KOALA_COLORS_SIZE)
			lda LOAD_BUFFER+KOALA_BACKGROUND_OFFSET
			sta bank1Background
			clc
			rts
#else
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
#endif

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

#if !SD2IEC
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
#endif

pictureIndex:		.byte 0
hiddenBank:			.byte 0
nextBorderColor:	.byte BLACK
bank0Background:	.byte BLACK
bank1Background:	.byte BLACK
#if SD2IEC
pictureDevice:		.byte DEFAULT_DEVICE
#endif

.encoding "screencode_upper"
welcomeTitle:		.text "WELCOME TO PICTURE VIEWER"
welcomeTitleEnd:
welcomeLoading:		.text "LOADING ..."
welcomeLoadingEnd:
#if !SD2IEC
welcomeWarning1:	.text "THIS WILL NOT WORK ON SD2IEC"
welcomeWarning1End:
welcomeWarning2:	.text "(DISK DRIVE RAM REQUIRED)"
welcomeWarning2End:
welcomeWarning3:	.text "FOR SD2IEC RUN KDPICSSD.PRG"
welcomeWarning3End:
#endif

#import "PictureList.asm"
#if !SD2IEC
#import "FastLoader.asm"
#endif

musicData:
			.fill music.size, music.getData(i)
