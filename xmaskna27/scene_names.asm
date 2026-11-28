.const NAMES_AT_TOP = 1
.const NAMES_AT_BOTTOM = 2
.const NAME_MARGIN = 1
.const NAMES_BELOW_LOGO = 3
.const NAMES_ABOVE_LOGO = 2
.const NAME_LAYOUT_SEED = 2027
.const THANKS_SOURCE_ROW = 20
.const THANKS_TARGET_ROW = 10
.const THANKS_LINES = 2
.const NAME_CELL_ROWS = 2
.const NAME_SLOT_COLUMNS = 13
.const NAMES_PER_KOALA_ROW = 3
.const NAMES_PICTURE = $a000
.const NAMES_PICTURE_SCREEN = NAMES_PICTURE + 8000
.const NAMES_PICTURE_COLOR = NAMES_PICTURE + 9000
.const NAME_SCENE_BITMAP = $6000
.const NAME_SCENE_SCREEN = $4400
.const NAME_SCENE_COLOR = $d800
.var bottomNameRows = List().add(15, 16, 17, 18, 19, 20).lock()
.var topNameRows = List().add(5, 6).lock()

.var namesPicture = LoadBinary("NAMES.kla", BF_KOALA)
.var scenePicture = LoadBinary("SCENE.kla", BF_KOALA)

.function sceneCellEmpty(row, column) {
    .var empty = true
    .for (var line = 0; line < 8; line++) {
        .if (scenePicture.getBitmap((row * 40 + column) * 8 + line) != 0) {
            .eval empty = false
        }
    }
    .return empty
}

.function nameSlotCell(index) {
    .return floor(index / NAMES_PER_KOALA_ROW) * NAME_CELL_ROWS * 40 + mod(index, NAMES_PER_KOALA_ROW) * NAME_SLOT_COLUMNS
}

.function nameCells(index) {
    .var cells = 0
    .for (var row = 0; row < NAME_CELL_ROWS; row++) {
        .for (var column = 0; column < NAME_SLOT_COLUMNS; column++) {
            .var cell = nameSlotCell(index) + row * 40 + column
            .if (cell < 1000) {
                .for (var line = 0; line < 8; line++) {
                    .if (namesPicture.getBitmap(cell * 8 + line) != 0) {
                        .eval cells = max(cells, column + 1)
                    }
                }
            }
        }
    }
    .return cells
}

.var nameWidths = List()
.var scanning = true
.for (var index = 0; index < 25 / NAME_CELL_ROWS * NAMES_PER_KOALA_ROW; index++) {
    .if (scanning) {
        .var cells = nameCells(index)
        .if (cells > 0) {
            .eval nameWidths.add(cells)
        } else {
            .eval scanning = false
        }
    }
}
.const NAME_COUNT = nameWidths.size()

.var placementNames = List()
.var placementCells = List()
.var groupStarts = List()
.var nextName = 0
.var groupCount = 0
.var randomState = NAME_LAYOUT_SEED
.var finished = false
.while (!finished) {
    .eval groupStarts.add(placementNames.size())
    .var areaRows = mod(groupCount, 2) == 0 ? bottomNameRows : topNameRows
    .var capacity = mod(groupCount, 2) == 0 ? NAMES_BELOW_LOGO : NAMES_ABOVE_LOGO
    .var placedRows = List()
    .var placedColumns = List()
    .var placedWidths = List()
    .var groupOpen = true
    .while (groupOpen && nextName < NAME_COUNT && placedRows.size() < capacity) {
        .var width = nameWidths.get(nextName)
        .eval randomState = mod(randomState * 75 + 74, 65537)
        .var firstRow = mod(randomState, areaRows.size())
        .var placed = false
        .for (var rowTry = 0; rowTry < areaRows.size(); rowTry++) {
            .var row = areaRows.get(mod(firstRow + rowTry, areaRows.size()))
            .var rowFree = !placed
            .for (var other = 0; other < placedRows.size(); other++) {
                .if (placedRows.get(other) == row) {
                    .eval rowFree = false
                }
            }
            .if (rowFree) {
                .var columns = List()
                .for (var column = 0; column + width <= 40; column++) {
                    .var fits = true
                    .for (var cellRow = row; cellRow < row + NAME_CELL_ROWS; cellRow++) {
                        .for (var cellColumn = column; cellColumn < column + width; cellColumn++) {
                            .if (fits && !sceneCellEmpty(cellRow, cellColumn)) {
                                .eval fits = false
                            }
                        }
                    }
                    .for (var other = 0; other < placedRows.size(); other++) {
                        .var rowsOverlap = row < placedRows.get(other) + NAME_CELL_ROWS + NAME_MARGIN && placedRows.get(other) < row + NAME_CELL_ROWS + NAME_MARGIN
                        .var columnsOverlap = column < placedColumns.get(other) + placedWidths.get(other) + NAME_MARGIN && placedColumns.get(other) < column + width + NAME_MARGIN
                        .if (rowsOverlap && columnsOverlap) {
                            .eval fits = false
                        }
                    }
                    .if (fits) {
                        .eval columns.add(column)
                    }
                }
                .if (columns.size() > 0) {
                    .eval randomState = mod(randomState * 75 + 74, 65537)
                    .var column = columns.get(mod(randomState, columns.size()))
                    .eval placedRows.add(row)
                    .eval placedColumns.add(column)
                    .eval placedWidths.add(width)
                    .eval placementNames.add(nextName)
                    .eval placementCells.add(row * 40 + column)
                    .eval nextName = nextName + 1
                    .eval placed = true
                }
            }
        }
        .if (!placed) {
            .eval groupOpen = false
        }
    }
    .eval groupCount = groupCount + 1
    .if (nextName == NAME_COUNT) {
        .eval nextName = 0
        .if (mod(groupCount, 2) == 0) {
            .eval finished = true
        }
    }
}
.eval groupStarts.add(placementNames.size())

.const THANKS_FIRST_PLACEMENT = placementNames.size()
.for (var thanksLine = 0; thanksLine < THANKS_LINES; thanksLine++) {
    .var sourceRow = THANKS_SOURCE_ROW + thanksLine * NAME_CELL_ROWS
    .var lineCells = 0
    .for (var row = sourceRow; row < sourceRow + NAME_CELL_ROWS; row++) {
        .for (var column = 0; column < 40; column++) {
            .for (var line = 0; line < 8; line++) {
                .if (namesPicture.getBitmap((row * 40 + column) * 8 + line) != 0) {
                    .eval lineCells = max(lineCells, column + 1)
                }
            }
        }
    }
    .eval nameWidths.add(lineCells)
    .eval placementNames.add(NAME_COUNT + thanksLine)
    .eval placementCells.add((THANKS_TARGET_ROW + thanksLine * NAME_CELL_ROWS) * 40 + floor((40 - lineCells) / 2))
}
.eval placementNames.lock()
.eval placementCells.lock()
.eval groupStarts.lock()
.eval nameWidths.lock()
.const NAME_GROUP_COUNT = groupCount

.macro CellToBitmapAddress(cell, base, target) {
    lda cell
    sta target + 1
    lda cell + 1
    asl target + 1
    rol
    asl target + 1
    rol
    asl target + 1
    rol
    sta target + 2
    clc
    lda target + 1
    adc #<base
    sta target + 1
    lda target + 2
    adc #>base
    sta target + 2
}

.macro CellToAddress(cell, base, target) {
    clc
    lda cell
    adc #<base
    sta target + 1
    lda cell + 1
    adc #>base
    sta target + 2
}

showThanks:
	lda thanksRequest
	bne !+
	rts
!:	lda #0
	sta thanksRequest
	lda #1
	sta pasteMode
	.for (var thanksLine = 0; thanksLine < THANKS_LINES; thanksLine++) {
		ldx #THANKS_FIRST_PLACEMENT + thanksLine
		jsr pasteName
	}
	rts

cycleNames:
	lda namesRequest
	bne !+
	rts
!:	lda #0
	sta namesRequest
	lda previousNameGroup
	bmi pasteNameGroup
	lda #0
	sta pasteMode
	ldx previousNameGroup
	jsr processNameGroup
pasteNameGroup:
	lda #1
	sta pasteMode
	ldx nameGroup
	stx previousNameGroup
	jsr processNameGroup
	inc nameGroup
	lda nameGroup
	cmp #NAME_GROUP_COUNT
	bne !+
	lda #0
	sta nameGroup
!:	rts

processNameGroup:
	lda nameGroupStarts, x
	sta currentPlacement
	lda nameGroupStarts + 1, x
	sta groupEndPlacement
	cmp currentPlacement
	beq groupProcessed
processNextName:
	ldx currentPlacement
	jsr pasteName
	inc currentPlacement
	lda currentPlacement
	cmp groupEndPlacement
	bne processNextName
groupProcessed:
	rts

pasteName:
	ldy placementName, x
	lda nameSourceCellLow, y
	sta sourceCell
	lda nameSourceCellHigh, y
	sta sourceCell + 1
	lda nameCellCount, y
	sta cellCount
	asl
	asl
	asl
	sta bitmapByteCount
	lda placementCellLow, x
	sta targetCell
	lda placementCellHigh, x
	sta targetCell + 1
	lda #NAME_CELL_ROWS
	sta nameRowsLeft
pasteNameRow:
	:CellToBitmapAddress(sourceCell, NAMES_PICTURE, readNameBitmap)
	:CellToBitmapAddress(targetCell, NAME_SCENE_BITMAP, writeNameBitmap)
	:CellToAddress(sourceCell, NAMES_PICTURE_SCREEN, readNameScreen)
	:CellToAddress(sourceCell, NAMES_PICTURE_COLOR, readNameColor)
	:CellToAddress(targetCell, NAME_SCENE_SCREEN, writeNameScreen)
	:CellToAddress(targetCell, NAME_SCENE_COLOR, writeNameColor)
	lda pasteMode
	bne copyNameRow
	lda writeNameBitmap + 1
	sta eraseNameBitmap + 1
	lda writeNameBitmap + 2
	sta eraseNameBitmap + 2
	lda #0
	ldy bitmapByteCount
!:	dey
eraseNameBitmap:
	sta $ffff, y
	cpy #0
	bne !-
	jmp nameRowDone
copyNameRow:
	ldy bitmapByteCount
!:	dey
readNameBitmap:
	lda $ffff, y
writeNameBitmap:
	sta $ffff, y
	cpy #0
	bne !-
	ldy cellCount
!:	dey
readNameScreen:
	lda $ffff, y
writeNameScreen:
	sta $ffff, y
readNameColor:
	lda $ffff, y
writeNameColor:
	sta $ffff, y
	cpy #0
	bne !-
nameRowDone:
	clc
	lda sourceCell
	adc #40
	sta sourceCell
	bcc !+
	inc sourceCell + 1
!:	clc
	lda targetCell
	adc #40
	sta targetCell
	bcc !+
	inc targetCell + 1
!:	dec nameRowsLeft
	beq !+
	jmp pasteNameRow
!:	rts

namesRequest:
	.byte 0
thanksRequest:
	.byte 0
pasteMode:
	.byte 0
previousNameGroup:
	.byte $ff
nameGroup:
	.byte 0
currentPlacement:
	.byte 0
groupEndPlacement:
	.byte 0
sourceCell:
	.word 0
targetCell:
	.word 0
cellCount:
	.byte 0
bitmapByteCount:
	.byte 0
nameRowsLeft:
	.byte 0

nameGroupStarts:
	.fill groupStarts.size(), groupStarts.get(i)
nameCellCount:
	.fill NAME_COUNT + THANKS_LINES, nameWidths.get(i)
nameSourceCellLow:
	.fill NAME_COUNT, <nameSlotCell(i)
	.fill THANKS_LINES, <((THANKS_SOURCE_ROW + i * NAME_CELL_ROWS) * 40)
nameSourceCellHigh:
	.fill NAME_COUNT, >nameSlotCell(i)
	.fill THANKS_LINES, >((THANKS_SOURCE_ROW + i * NAME_CELL_ROWS) * 40)
placementName:
	.fill placementNames.size(), placementNames.get(i)
placementCellLow:
	.fill placementCells.size(), <placementCells.get(i)
placementCellHigh:
	.fill placementCells.size(), >placementCells.get(i)

.for (var index = 0; index < NAME_COUNT; index++) {
	.assert "Name " + index + " must fit one copy loop", nameWidths.get(index) <= 31, true
}
.for (var group = 0; group < NAME_GROUP_COUNT; group++) {
	.assert "Name group " + group + " must not be empty", groupStarts.get(group + 1) > groupStarts.get(group), true
}
.assert "Name placements must fit one byte index", placementNames.size() < 256, true
