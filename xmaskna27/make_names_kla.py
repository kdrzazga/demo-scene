NAMES = [
    "KOMEK", "TOMXX", "KD", "TECT", "LEON", "VOID", "PHOWIEC", "PIANA",
    "DON RAFITO", "ARI", "RETRO CHŁOP", "ERIK", "BESZCZA", "LOUIE", "SLEEVA",
    "RETRO BAJTEL", "JACKAL", "BOBER8BIT", "EDIMAN", "ZSOMBOR", "HERY",
    "ENEY666", "JACKMF", "DRAKON", "M.SOBCZYK", "DEADMAN",
]
NAMES_PER_ROW = 3
NAME_SLOT_COLUMNS = 13
NAME_CELL_ROWS = 2
FONT_SCALE_Y = 2
WHITE, RED, PURPLE, GREEN, BLUE = 1, 2, 4, 5, 6
LETTER_COLORS = [RED, BLUE, PURPLE, GREEN]
BACKGROUND_COLOR = WHITE
LETTER_BITS = 0b10
LETTER_GAP = 1
SPACE_WIDTH = 3
OUTPUT_PATH = "NAMES.kla"
NAME_PIXEL_ROWS = NAME_CELL_ROWS * 8

FONT = {
    "A": [".#.", "#.#", "#.#", "###", "#.#", "#.#", "#.#"],
    "B": ["##.", "#.#", "#.#", "##.", "#.#", "#.#", "##."],
    "C": [".##", "#..", "#..", "#..", "#..", "#..", ".##"],
    "D": ["##.", "#.#", "#.#", "#.#", "#.#", "#.#", "##."],
    "E": ["###", "#..", "#..", "##.", "#..", "#..", "###"],
    "F": ["###", "#..", "#..", "##.", "#..", "#..", "#.."],
    "G": [".##", "#..", "#..", "#.#", "#.#", "#.#", ".##"],
    "H": ["#.#", "#.#", "#.#", "###", "#.#", "#.#", "#.#"],
    "I": ["###", ".#.", ".#.", ".#.", ".#.", ".#.", "###"],
    "J": ["..#", "..#", "..#", "..#", "..#", "#.#", ".#."],
    "K": ["#.#", "#.#", "##.", "##.", "#.#", "#.#", "#.#"],
    "L": ["#..", "#..", "#..", "#..", "#..", "#..", "###"],
    "Ł": [".#..", ".#..", ".##.", "##..", ".#..", ".#..", ".###"],
    "M": ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
    "N": ["#..#", "##.#", "##.#", "#.##", "#.##", "#..#", "#..#"],
    "O": [".#.", "#.#", "#.#", "#.#", "#.#", "#.#", ".#."],
    "P": ["##.", "#.#", "#.#", "##.", "#..", "#..", "#.."],
    "Q": [".#.", "#.#", "#.#", "#.#", "#.#", "##.", ".##"],
    "R": ["##.", "#.#", "#.#", "##.", "#.#", "#.#", "#.#"],
    "S": [".##", "#..", "#..", ".#.", "..#", "..#", "##."],
    "T": ["###", ".#.", ".#.", ".#.", ".#.", ".#.", ".#."],
    "U": ["#.#", "#.#", "#.#", "#.#", "#.#", "#.#", "###"],
    "V": ["#.#", "#.#", "#.#", "#.#", "#.#", "#.#", ".#."],
    "W": ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
    "X": ["#.#", "#.#", "#.#", ".#.", "#.#", "#.#", "#.#"],
    "Y": ["#.#", "#.#", "#.#", ".#.", ".#.", ".#.", ".#."],
    "Z": ["###", "..#", "..#", ".#.", "#..", "#..", "###"],
    "0": [".#.", "#.#", "#.#", "#.#", "#.#", "#.#", ".#."],
    "1": [".#.", "##.", ".#.", ".#.", ".#.", ".#.", "###"],
    "2": ["##.", "..#", "..#", ".#.", "#..", "#..", "###"],
    "3": ["##.", "..#", "..#", ".#.", "..#", "..#", "##."],
    "4": ["#.#", "#.#", "#.#", "###", "..#", "..#", "..#"],
    "5": ["###", "#..", "#..", "##.", "..#", "..#", "##."],
    "6": [".##", "#..", "#..", "##.", "#.#", "#.#", ".#."],
    "7": ["###", "..#", "..#", ".#.", ".#.", ".#.", ".#."],
    "8": [".#.", "#.#", "#.#", ".#.", "#.#", "#.#", ".#."],
    "9": [".#.", "#.#", "#.#", ".##", "..#", "..#", "##."],
    ".": [".", ".", ".", ".", ".", ".", "#"],
}


def name_pixels(name):
    columns = []
    for index, character in enumerate(name):
        if character == " ":
            columns.extend([[False] * NAME_PIXEL_ROWS for _ in range(SPACE_WIDTH)])
            continue
        glyph = FONT[character]
        for x in range(len(glyph[0])):
            columns.append([row // FONT_SCALE_Y < len(glyph) and glyph[row // FONT_SCALE_Y][x] == "#" for row in range(NAME_PIXEL_ROWS)])
        if index < len(name) - 1 and name[index + 1] != " ":
            columns.extend([[False] * NAME_PIXEL_ROWS for _ in range(LETTER_GAP)])
    return columns


def build_koala():
    bitmap = bytearray(8000)
    screen = bytearray(1000)
    colors = bytearray(1000)
    for index, name in enumerate(NAMES):
        cell_row = (index // NAMES_PER_ROW) * NAME_CELL_ROWS
        first_column = (index % NAMES_PER_ROW) * NAME_SLOT_COLUMNS
        columns = name_pixels(name)
        cells = (len(columns) + 3) // 4
        assert cells <= NAME_SLOT_COLUMNS, name
        letter_color = LETTER_COLORS[index % len(LETTER_COLORS)]
        for row_offset in range(NAME_CELL_ROWS):
            for cell_offset in range(cells):
                cell = (cell_row + row_offset) * 40 + first_column + cell_offset
                screen[cell] = letter_color
                colors[cell] = letter_color
                for row in range(8):
                    value = 0
                    for pixel in range(4):
                        x = cell_offset * 4 + pixel
                        if x < len(columns) and columns[x][row_offset * 8 + row]:
                            value |= LETTER_BITS << (6 - 2 * pixel)
                    bitmap[cell * 8 + row] = value
    return bytes([0x00, 0x60]) + bitmap + screen + colors + bytes([BACKGROUND_COLOR])


def main():
    assert ((len(NAMES) + NAMES_PER_ROW - 1) // NAMES_PER_ROW) * NAME_CELL_ROWS <= 25
    open(OUTPUT_PATH, "wb").write(build_koala())


main()
