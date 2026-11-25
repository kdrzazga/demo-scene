.var snowflakeSmall = List().add(
    "...#...",
    ".#.#.#.",
    "..###..",
    "#######",
    "..###..",
    ".#.#.#.",
    "...#...").lock()

.var snowflakeStar = List().add(
    "....#....",
    ".#..#..#.",
    "..#.#.#..",
    "...###...",
    "#########",
    "...###...",
    "..#.#.#..",
    ".#..#..#.",
    "....#....").lock()

.var snowflakeCrystal = List().add(
    ".....#.....",
    "...#.#.#...",
    "....###....",
    ".#...#...#.",
    "..#..#..#..",
    "###########",
    "..#..#..#..",
    ".#...#...#.",
    "....###....",
    "...#.#.#...",
    ".....#.....").lock()

.macro SnowflakeFromRows(rows) {
    .var top = floor((21 - rows.size()) / 2)
    .var left = floor((24 - rows.get(0).size()) / 2)
    .for (var row = 0; row < 21; row++) {
        .for (var column = 0; column < 3; column++) {
            .var value = 0
            .var line = row - top
            .if (line >= 0 && line < rows.size()) {
                .for (var bit = 0; bit < 8; bit++) {
                    .var x = column * 8 + bit - left
                    .if (x >= 0 && x < rows.get(line).size()) {
                        .if (rows.get(line).substring(x, x + 1) == "#") {
                            .eval value = value | (1 << (7 - bit))
                        }
                    }
                }
            }
            .byte value
        }
    }
    .byte 0
}

.macro MoreSnowflakes() {
    :SnowflakeFromRows(snowflakeSmall)
    :SnowflakeFromRows(snowflakeStar)
    :SnowflakeFromRows(snowflakeCrystal)
}
