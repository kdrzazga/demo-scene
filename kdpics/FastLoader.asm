.const KERNAL_SECOND = $ff93
.const KERNAL_CIOUT = $ffa8
.const KERNAL_UNLSN = $ffae
.const KERNAL_LISTEN = $ffb1
.const LAST_USED_DEVICE = $ba
.const DEFAULT_DEVICE = 8
.const COMMAND_CHANNEL = $6f
.const UPLOAD_CHUNK_SIZE = 32

.const C64_SERIAL_PORT = $dd00
.const C64_KEEP_BITS = %00000111
.const C64_ATN_OUT = %00001000

.const BLOCK_END = $00
.const BLOCK_ERROR = $ff

.const DRIVE_CODE_ADDRESS = $0500
.const DRIVE_JOB0 = $00
.const DRIVE_JOB0_TRACK = $06
.const DRIVE_JOB0_SECTOR = $07
.const DRIVE_JOB_READ = $80
.const DRIVE_JOB_FIRST_ERROR = $02
.const DRIVE_SECTOR_BUFFER = $0300
.const DRIVE_COMMAND_NAME_LENGTH = $0205
.const DRIVE_COMMAND_NAME = $0206
.const DRIVE_SERIAL_PORT = $1800
.const DRIVE_VIA1_PORT_A = $1801
.const DRIVE_VIA1_IER = $180e
.const DRIVE_ATN_IRQ = %00000010
.const DRIVE_BUSY = $00
.const DRIVE_READY = $08
.const DRIVE_ATN_ACK = $10
.const DIRECTORY_TRACK = 18
.const DIRECTORY_SECTOR = 1
.const DIRECTORY_ENTRY_SIZE = 32
.const DIRECTORY_NAME_SIZE = 16
.const DIRECTORY_NAME_PADDING = $a0
.const SECTOR_DATA_SIZE = 254

.encoding "petscii_upper"

.macro SendCommandPrefix(commandLetter) {
			jsr listenCommandChannel
			lda #'M'
			jsr KERNAL_CIOUT
			lda #'-'
			jsr KERNAL_CIOUT
			lda #commandLetter
			jsr KERNAL_CIOUT
}

.macro ReceivePair(atnState) {
			lda atnState
			sta C64_SERIAL_PORT
			lsr receivedByte
			lsr receivedByte
			nop
			nop
			nop
			nop
			lda C64_SERIAL_PORT
			and #%11000000
			ora receivedByte
			sta receivedByte
}

.macro DriveSendNextPair(atnAsserted) {
			lda driveOutByte
			lsr
			lsr
			sta driveOutByte
			and #%00000011
			tax
			lda drivePairBits,x
			.if (atnAsserted) {
				ora #DRIVE_ATN_ACK
			}
!:			bit DRIVE_SERIAL_PORT
			.if (atnAsserted) {
				bpl !-
			} else {
				bmi !-
			}
			sta DRIVE_SERIAL_PORT
}

fastLoaderInstall:
			lda LAST_USED_DEVICE
			bne !+
			lda #DEFAULT_DEVICE
!:			sta driveDevice
			lda #<driveCodeImage
			sta uploadSource+1
			lda #>driveCodeImage
			sta uploadSource+2
			lda #<DRIVE_CODE_ADDRESS
			sta uploadTarget
			lda #>DRIVE_CODE_ADDRESS
			sta uploadTarget+1
			lda #UPLOAD_CHUNK_COUNT
			sta uploadChunksLeft
uploadChunk:
			SendCommandPrefix('W')
			lda uploadTarget
			jsr KERNAL_CIOUT
			lda uploadTarget+1
			jsr KERNAL_CIOUT
			lda #UPLOAD_CHUNK_SIZE
			jsr KERNAL_CIOUT
			lda #0
			sta uploadIndex
uploadByte:
			ldx uploadIndex
uploadSource:
			lda $ffff,x
			jsr KERNAL_CIOUT
			inc uploadIndex
			lda uploadIndex
			cmp #UPLOAD_CHUNK_SIZE
			bne uploadByte
			jsr KERNAL_UNLSN
			lda uploadSource+1
			clc
			adc #UPLOAD_CHUNK_SIZE
			sta uploadSource+1
			bcc !+
			inc uploadSource+2
!:			lda uploadTarget
			clc
			adc #UPLOAD_CHUNK_SIZE
			sta uploadTarget
			bcc !+
			inc uploadTarget+1
!:			dec uploadChunksLeft
			bne uploadChunk
			rts

fastLoadSetName:
			sta nameLength
			stx nameSource+1
			sty nameSource+2
			rts

fastLoad:
			stx segmentTableRead+1
			sty segmentTableRead+2
			lda #0
			sta segmentTableOffset
			jsr startNextSegment
			SendCommandPrefix('E')
			lda #<DRIVE_CODE_ADDRESS
			jsr KERNAL_CIOUT
			lda #>DRIVE_CODE_ADDRESS
			jsr KERNAL_CIOUT
			lda nameLength
			jsr KERNAL_CIOUT
			lda #0
			sta nameIndex
sendNameCharacter:
			ldx nameIndex
nameSource:
			lda $ffff,x
			jsr KERNAL_CIOUT
			inc nameIndex
			lda nameIndex
			cmp nameLength
			bne sendNameCharacter
			jsr KERNAL_UNLSN
			lda C64_SERIAL_PORT
			and #C64_KEEP_BITS
			sta atnReleased
			ora #C64_ATN_OUT
			sta atnAsserted
			lda #2
			sta loadAddressBytesLeft
receiveBlock:
			jsr waitForDriveReady
			jsr receiveByte
			beq fileReceived
			cmp #BLOCK_ERROR
			beq fileFailed
			sta blockBytesLeft
receiveBlockByte:
			jsr receiveByte
			ldx loadAddressBytesLeft
			bne skipLoadAddressByte
			ldx segmentActive
			beq blockByteDone
storeByte:
			sta $ffff
			inc storeByte+1
			bne !+
			inc storeByte+2
!:			lda segmentBytesLeft
			bne !+
			dec segmentBytesLeft+1
!:			dec segmentBytesLeft
			lda segmentBytesLeft
			ora segmentBytesLeft+1
			bne blockByteDone
			jsr startNextSegment
blockByteDone:
			dec blockBytesLeft
			bne receiveBlockByte
			beq receiveBlock
skipLoadAddressByte:
			dec loadAddressBytesLeft
			jmp blockByteDone
fileReceived:
			jsr waitForDriveToReturn
			clc
			rts
fileFailed:
			jsr waitForDriveToReturn
			sec
			rts

startNextSegment:
			ldy segmentTableOffset
			jsr readSegmentTableByte
			sta storeByte+1
			jsr readSegmentTableByte
			sta storeByte+2
			jsr readSegmentTableByte
			sta segmentBytesLeft
			jsr readSegmentTableByte
			sta segmentBytesLeft+1
			sty segmentTableOffset
			ora segmentBytesLeft
			sta segmentActive
			rts

readSegmentTableByte:
segmentTableRead:
			lda $ffff,y
			iny
			rts

listenCommandChannel:
			lda driveDevice
			jsr KERNAL_LISTEN
			lda #COMMAND_CHANNEL
			jmp KERNAL_SECOND

waitForDriveReady:
			ldx #20
!:			dex
			bne !-
!:			bit C64_SERIAL_PORT
			bvs !-
			.for (var i=0; i<10; i++) {
				nop
			}
			rts

waitForDriveToReturn:
			ldy #2
			ldx #0
!:			dex
			bne !-
			dey
			bne !-
			rts

receiveByte:
			ReceivePair(atnAsserted)
			ReceivePair(atnReleased)
			ReceivePair(atnAsserted)
			ReceivePair(atnReleased)
			lda receivedByte
			eor #$ff
			rts

driveDevice:			.byte DEFAULT_DEVICE
uploadTarget:			.word 0
uploadChunksLeft:		.byte 0
uploadIndex:			.byte 0
nameLength:				.byte 0
nameIndex:				.byte 0
atnAsserted:			.byte 0
atnReleased:			.byte 0
loadAddressBytesLeft:	.byte 0
blockBytesLeft:			.byte 0
receivedByte:			.byte 0
segmentTableOffset:		.byte 0
segmentBytesLeft:		.word 0
segmentActive:			.byte 0

driveCodeImage:
.pseudopc DRIVE_CODE_ADDRESS {
driveEntry:
			lda #DRIVE_ATN_IRQ
			sta DRIVE_VIA1_IER
			lda #DRIVE_BUSY
			sta DRIVE_SERIAL_PORT
			lda DRIVE_COMMAND_NAME_LENGTH
			sta driveNameLength
			lda #DIRECTORY_TRACK
			ldx #DIRECTORY_SECTOR
driveSearchDirectorySector:
			jsr driveReadSector
			bcs driveFileFailed
			ldx #0
driveCheckEntry:
			stx driveEntryOffset
			lda DRIVE_SECTOR_BUFFER+2,x
			beq driveNextEntry
			ldy #0
driveCompareName:
			lda DRIVE_COMMAND_NAME,y
			cmp DRIVE_SECTOR_BUFFER+5,x
			bne driveNextEntry
			inx
			iny
			cpy driveNameLength
			bne driveCompareName
			cpy #DIRECTORY_NAME_SIZE
			beq driveFileFound
			lda DRIVE_SECTOR_BUFFER+5,x
			cmp #DIRECTORY_NAME_PADDING
			beq driveFileFound
driveNextEntry:
			lda driveEntryOffset
			clc
			adc #DIRECTORY_ENTRY_SIZE
			tax
			bne driveCheckEntry
			ldx DRIVE_SECTOR_BUFFER+1
			lda DRIVE_SECTOR_BUFFER
			bne driveSearchDirectorySector
driveFileFailed:
			lda #BLOCK_ERROR
			jsr driveSendSingleByte
			jmp driveReturnToDos
driveFileFound:
			ldy driveEntryOffset
			ldx DRIVE_SECTOR_BUFFER+4,y
			lda DRIVE_SECTOR_BUFFER+3,y
driveSendFileSector:
			jsr driveReadSector
			bcs driveFileFailed
			lda #SECTOR_DATA_SIZE
			ldx DRIVE_SECTOR_BUFFER
			bne driveSendSectorData
			ldx DRIVE_SECTOR_BUFFER+1
			dex
			txa
			beq driveFileEnd
driveSendSectorData:
			sta driveBlockLength
			sei
			ldx #DRIVE_READY
			stx DRIVE_SERIAL_PORT
			jsr driveSendByte
			ldy #0
driveSendDataByte:
			lda DRIVE_SECTOR_BUFFER+2,y
			jsr driveSendByte
			iny
			cpy driveBlockLength
			bne driveSendDataByte
			lda #DRIVE_BUSY
			sta DRIVE_SERIAL_PORT
			cli
			ldx DRIVE_SECTOR_BUFFER+1
			lda DRIVE_SECTOR_BUFFER
			bne driveSendFileSector
driveFileEnd:
			lda #BLOCK_END
			jsr driveSendSingleByte
driveReturnToDos:
			lda DRIVE_VIA1_PORT_A
			lda #$80 | DRIVE_ATN_IRQ
			sta DRIVE_VIA1_IER
			rts

driveSendSingleByte:
			sei
			ldx #DRIVE_READY
			stx DRIVE_SERIAL_PORT
			jsr driveSendByte
			lda #DRIVE_BUSY
			sta DRIVE_SERIAL_PORT
			cli
			rts

driveReadSector:
			sta DRIVE_JOB0_TRACK
			stx DRIVE_JOB0_SECTOR
			lda #DRIVE_JOB_READ
			sta DRIVE_JOB0
			cli
!:			lda DRIVE_JOB0
			bmi !-
			cmp #DRIVE_JOB_FIRST_ERROR
			rts

driveSendByte:
			sta driveOutByte
			and #%00000011
			tax
			lda drivePairBits,x
			ora #DRIVE_ATN_ACK
!:			bit DRIVE_SERIAL_PORT
			bpl !-
			sta DRIVE_SERIAL_PORT
			DriveSendNextPair(false)
			DriveSendNextPair(true)
			DriveSendNextPair(false)
			rts

drivePairBits:		.byte $00, $08, $02, $0a
driveNameLength:	.byte 0
driveEntryOffset:	.byte 0
driveBlockLength:	.byte 0
driveOutByte:		.byte 0
}
driveCodeImageEnd:

.label UPLOAD_CHUNK_COUNT = ceil((driveCodeImageEnd - driveCodeImage) / UPLOAD_CHUNK_SIZE)
