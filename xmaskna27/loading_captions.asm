.const CAPTION_GAP_LEFT = 12
.const CAPTION_GAP_RIGHT = 32
.const FIRST_CAPTIONS_FRAMES = 350
.const INTRO_SCREEN_DATA = $2800
.const INTRO_COLOR_DATA = $2be8

.var firstCaptions = List().add(
    List().add(17, List().add("KOMODA ", RED, "& ", BLACK, "AMIGA ", BLUE, "+", BLACK)),
    List().add(19, List().add("WISHES ", BLACK, "YOU", PURPLE)),
    List().add(21, List().add("ALL THE BEST", BLACK)),
    List().add(23, List().add("FOR ", BLACK, "CHRISTMAS", RED))).lock()

.var secondCaptions = List().add(
    List().add(17, List().add("AND ", BLACK, "HAPPY NEW YEAR", PURPLE)),
    List().add(19, List().add("2028", RED))).lock()

.function captionLength(segments) {
    .var length = 0
    .for (var i = 0; i < segments.size(); i = i + 2) {
        .eval length = length + segments.get(i).size()
    }
    .return length
}

.function captionColumn(segments) {
    .return floor((CAPTION_GAP_LEFT + CAPTION_GAP_RIGHT + 1 - captionLength(segments)) / 2)
}

.macro WriteCaption(caption) {
    .var row = caption.get(0)
    .var segments = caption.get(1)
    .var target = row * 40 + captionColumn(segments)
    ldx #captionLength(segments) - 1
!:	lda captionChars, x
    sta SCREEN + target, x
    lda captionColors, x
    sta $d800 + target, x
    dex
    bpl !-
    jmp captionWritten
captionChars:
    .encoding "screencode_upper"
    .for (var i = 0; i < segments.size(); i = i + 2) {
        .text segments.get(i)
    }
captionColors:
    .for (var segment = 0; segment < segments.size(); segment = segment + 2) {
        .fill segments.get(segment).size(), segments.get(segment + 1)
    }
captionWritten:
}

.macro RestoreCaptionArea(caption) {
    .var segments = caption.get(1)
    .var target = caption.get(0) * 40 + captionColumn(segments)
    ldx #captionLength(segments) - 1
!:	lda INTRO_SCREEN_DATA + target, x
    sta SCREEN + target, x
    lda INTRO_COLOR_DATA + target, x
    sta $d800 + target, x
    dex
    bpl !-
}

showFirstCaptions:
    .for (var i = 0; i < firstCaptions.size(); i++) {
        :WriteCaption(firstCaptions.get(i))
    }
    lda #<FIRST_CAPTIONS_FRAMES
    sta captionTimer
    lda #>FIRST_CAPTIONS_FRAMES
    sta captionTimer + 1
    rts

showSecondCaptions:
    .for (var i = 0; i < firstCaptions.size(); i++) {
        :RestoreCaptionArea(firstCaptions.get(i))
    }
    .for (var i = 0; i < secondCaptions.size(); i++) {
        :WriteCaption(secondCaptions.get(i))
    }
    rts

tickCaptions:
    lda captionTimer
    ora captionTimer + 1
    beq captionsDone
    lda captionTimer
    bne !+
    dec captionTimer + 1
!:  dec captionTimer
    lda captionTimer
    ora captionTimer + 1
    bne captionsDone
    jsr showSecondCaptions
captionsDone:
    rts

captionTimer:
    .word 0
