.const KRISSZ_CHARSET_SIZE = 2048
.const KRISSZ_SCREEN_SIZE = 1000
.const KRISSZ_DATA_SIZE = KRISSZ_CHARSET_SIZE + KRISSZ_SCREEN_SIZE * 2
.const ASCII_DOLLAR = 36
.const ASCII_ZERO = 48
.const ASCII_NINE = 57
.const ASCII_UPPER_A = 65
.const ASCII_UPPER_F = 70
.const ASCII_LOWER_A = 97
.const ASCII_LOWER_F = 102
.var charsetOriginMarker = List().add(42, 61, 36, 50, 48, 48, 48).lock()

.function isHexDigit(code) {
    .var isDecimal = code >= ASCII_ZERO && code <= ASCII_NINE
    .var isUpperHex = code >= ASCII_UPPER_A && code <= ASCII_UPPER_F
    .var isLowerHex = code >= ASCII_LOWER_A && code <= ASCII_LOWER_F
    .return isDecimal || isUpperHex || isLowerHex
}

.function hexValue(code) {
    .if (code <= ASCII_NINE) .return code - ASCII_ZERO
    .if (code <= ASCII_UPPER_F) .return code - ASCII_UPPER_A + 10
    .return code - ASCII_LOWER_A + 10
}

.function markerAt(source, index) {
    .for (var offset = 0; offset < charsetOriginMarker.size(); offset++) {
        .if (source.get(index + offset) != charsetOriginMarker.get(offset)) .return false
    }
    .return true
}

.function krisszDataBytes(fileName) {
    .var source = LoadBinary(fileName)
    .var size = source.getSize()
    .var values = List()
    .var index = 0
    .while (index < size - charsetOriginMarker.size() && !markerAt(source, index)) {
        .eval index = index + 1
    }
    .eval index = index + charsetOriginMarker.size()
    .while (index < size - 2) {
        .if (source.get(index) == ASCII_DOLLAR && isHexDigit(source.get(index + 1)) && isHexDigit(source.get(index + 2))) {
            .if (index + 3 >= size || !isHexDigit(source.get(index + 3))) {
                .eval values.add(hexValue(source.get(index + 1)) * 16 + hexValue(source.get(index + 2)))
            }
            .eval index = index + 3
        } else {
            .eval index = index + 1
        }
    }
    .return values
}
