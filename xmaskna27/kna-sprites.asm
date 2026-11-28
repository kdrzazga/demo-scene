.const KNA_SPRITE_COLUMNS = 4
.const KNA_SPRITE_ROWS = 2
.const KNA_SPRITE_COUNT = KNA_SPRITE_COLUMNS * KNA_SPRITE_ROWS
.const KNA_SHARED_COLOR_1 = BLACK
.const KNA_SHARED_COLOR_2 = BLUE
.const KNA_SPRITE_COLOR = RED

.var knaLogo = List().add(
    "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
    "K...........KKKKKKKKKK...KKKKKKKKKKKKKKKKKKKKKKK",
    "K..........KBBBBBBBBB.....BBBBBBBBBBBBBBBBBBBBBK",
    "K..........BBBBBBBBBB.....BBBBBBBBBBBBBBBBBBBBBK",
    "K.........KBBBBBBBBBB.....BBBBBBBBBBBBBBBBBBBBK.",
    "K.........BBBBBBBBBBB.....BBBBBBBBBBBBBBBBBBBBK.",
    "K........KBBBBBBBBBBB.....BBBBBBBBBBBBBBBBBBBK..",
    "K........BBBBBBBBBBBB.....BBBBBBBBBBBBBBBBBBBK..",
    "K.......KBBBBBBBBBBB.......BBBBBBBBBBBBBBBBBK...",
    "K.......BBBB.BBBBBBB.......BBBBBBBBBBBBBBBBBK...",
    "K......KBBB.B.BBBBBB..B....BBBBBBBBBBBBBBBBK....",
    "K......BBB.BB.BBBBBB..BB...BBBBBBBBBBBBBBBK.....",
    "KKKKKKKBBB.B.BBBBBBB..BB...BBBBBBBBBBBBBBBK.....",
    "KKKKKKKBBBB...BBBBBB..BB...BBBBBBBBBBBBBBK......",
    "KKKKKKKKKK.KK.K.KKK...KK...KKKKKKKKKKKKKKK......",
    "KKKKKKKRRR.RRR.RRRR...RR....RRRRRRRRRRRRRRK.....",
    "K......RRR.RR..RRRR.........RRRRRRR.RRRRRRK.....",
    "K......KRRR..RR.RRR.........RRRRRRR.RRRRRRRK....",
    "K.......RRRRRRRRRRR.........RRRRRRR.RRRRRRRRK...",
    "K.......KRRRRRRRRR..........RRR..RR.RR.R.RR.K...",
    "K........RRRRRRRRR...RRRR....RR.R.R.RR.R.R.RK...",
    "K........KRRR........RRRR....RR.R.R.RR.R.R..RK..",
    "K.........RRR........RRRR....RR..RR.RR.R.RR.RK..",
    "K.........KRRR.......RRRR....RR.RRRR.RR.RR.RRRK.",
    "K..........RRR........RR......R.RRRRRRRRRRRRRRRK",
    "K..........KRRR.......RR.......RRRRRRRRRRRRRRRRK",
    "K...........KKK.......KK.......KKKKKKKKKKKKKKKKK",
    "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
    "................................................",
    "................................................",
    "................................................",
    "................................................",
    "................................................",
    "................................................",
    "................................................",
    "................................................",
    "................................................",
    "................................................",
    "................................................",
    "................................................",
    "................................................",
    "................................................").lock()

.function knaPixelBits(symbol) {
    .if (symbol == "K") {
        .return %01
    } else .if (symbol == "R") {
        .return %10
    } else .if (symbol == "B") {
        .return %11
    } else {
        .return %00
    }
}

.macro KnaSprites() {
    .for (var spriteRow = 0; spriteRow < KNA_SPRITE_ROWS; spriteRow++) {
        .for (var spriteColumn = 0; spriteColumn < KNA_SPRITE_COLUMNS; spriteColumn++) {
            .for (var row = 0; row < 21; row++) {
                .var line = knaLogo.get(spriteRow * 21 + row)
                .for (var byteIndex = 0; byteIndex < 3; byteIndex++) {
                    .var value = 0
                    .for (var pixel = 0; pixel < 4; pixel++) {
                        .var x = spriteColumn * 12 + byteIndex * 4 + pixel
                        .eval value = value | (knaPixelBits(line.substring(x, x + 1)) << (6 - pixel * 2))
                    }
                    .byte value
                }
            }
            .byte 0
        }
    }
}
