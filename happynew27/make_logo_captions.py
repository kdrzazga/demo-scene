from pathlib import Path

from edit_champagne_kla import CELL_COLUMNS, CELL_HEIGHT, CELL_WIDTH, decode

PURPLE, GREEN, GREY = 4, 5, 12

LEFT_CAPTIONS = [(" UP", PURPLE), (" TO", GREEN), ("DATE", GREY)]
RIGHT_CAPTIONS = [("EVEN", GREEN), (" IN", GREY), ("2027", PURPLE)]
CAPTION_CELL_ROWS = [3, 7, 11]
LEFT_CAPTION_X = 4
RIGHT_CAPTION_RIGHT_EDGE = 155
SCALE_X = 2
SCALE_Y = 3
LETTER_GAP = 1
SPACE_WIDTH = 3
TOP_PADDING = 1
LETTER_BITS = 0b10

HERE = Path(__file__).parent
PICTURE = HERE / "logo.kla"
OUTPUT = HERE / "logo_captions.asm"

FONT = {
    "A": [".#.", "#.#", "#.#", "###", "#.#", "#.#", "#.#"],
    "D": ["##.", "#.#", "#.#", "#.#", "#.#", "#.#", "##."],
    "E": ["###", "#..", "#..", "##.", "#..", "#..", "###"],
    "I": ["###", ".#.", ".#.", ".#.", ".#.", ".#.", "###"],
    "N": ["#..#", "##.#", "##.#", "#.##", "#.##", "#..#", "#..#"],
    "O": [".#.", "#.#", "#.#", "#.#", "#.#", "#.#", ".#."],
    "P": ["##.", "#.#", "#.#", "##.", "#..", "#..", "#.."],
    "T": ["###", ".#.", ".#.", ".#.", ".#.", ".#.", ".#."],
    "U": ["#.#", "#.#", "#.#", "#.#", "#.#", "#.#", "###"],
    "V": ["#.#", "#.#", "#.#", "#.#", "#.#", "#.#", ".#."],
    "0": [".#.", "#.#", "#.#", "#.#", "#.#", "#.#", ".#."],
    "2": ["##.", "..#", "..#", ".#.", "#..", "#..", "###"],
    "7": ["###", "..#", "..#", ".#.", ".#.", ".#.", ".#."],
}
GLYPH_ROWS = 7


def text_columns(text):
    columns = []
    for index, character in enumerate(text):
        if character == " ":
            columns.extend([[False] * GLYPH_ROWS] * SPACE_WIDTH)
        else:
            glyph = FONT[character]
            columns.extend([[glyph[row][x] == "#" for row in range(GLYPH_ROWS)] for x in range(len(glyph[0]))])
        if index < len(text) - 1:
            columns.extend([[False] * GLYPH_ROWS] * LETTER_GAP)
    return columns


def text_width(text):
    return len(text_columns(text)) * SCALE_X


def caption_pixels(text, left, top):
    pixels = set()
    for column_index, column in enumerate(text_columns(text)):
        for row, lit in enumerate(column):
            if lit:
                for dx in range(SCALE_X):
                    for dy in range(SCALE_Y):
                        pixels.add((left + column_index * SCALE_X + dx, top + row * SCALE_Y + dy))
    return pixels


def caption_records(pixels, color, background_pixels):
    records = []
    cell_rows = sorted({y // CELL_HEIGHT for _, y in pixels})
    for cell_row in cell_rows:
        row_pixels = [(x, y) for x, y in pixels if y // CELL_HEIGHT == cell_row]
        first_cell = min(x for x, _ in row_pixels) // CELL_WIDTH
        last_cell = max(x for x, _ in row_pixels) // CELL_WIDTH
        bitmap = []
        for cell_column in range(first_cell, last_cell + 1):
            for line in range(CELL_HEIGHT):
                y = cell_row * CELL_HEIGHT + line
                value = 0
                for pair in range(CELL_WIDTH):
                    x = cell_column * CELL_WIDTH + pair
                    assert background_pixels[y][x], f"caption overlaps the picture at {x},{y}"
                    if (x, y) in pixels:
                        value |= LETTER_BITS << (6 - pair * 2)
                bitmap.append(value)
        cell = cell_row * CELL_COLUMNS + first_cell
        records.append((cell, last_cell - first_cell + 1, color, bitmap))
    return records


def all_captions():
    widest_right = max(text_width(text) for text, _ in RIGHT_CAPTIONS)
    right_left = RIGHT_CAPTION_RIGHT_EDGE + 1 - widest_right
    captions = []
    for (text, color), cell_row in zip(LEFT_CAPTIONS, CAPTION_CELL_ROWS):
        captions.append((text, color, LEFT_CAPTION_X, cell_row * CELL_HEIGHT + TOP_PADDING))
    for (text, color), cell_row in zip(RIGHT_CAPTIONS, CAPTION_CELL_ROWS):
        captions.append((text, color, right_left, cell_row * CELL_HEIGHT + TOP_PADDING))
    return captions


def asm_lines(records_per_caption):
    lines = [f".const LOGO_CAPTION_COUNT = {len(records_per_caption)}", ""]
    for index, records in enumerate(records_per_caption):
        lines.append(f"logoCaption{index}:")
        for cell, cell_count, color, bitmap in records:
            lines.append(f"    .byte {len(bitmap)}, {cell_count}, ${color << 4 | color:02x}, {color}")
            lines.append(f"    .word LOGO_CAPTION_BITMAP + {cell * 8}, {cell}")
            for start in range(0, len(bitmap), 16):
                lines.append("    .byte " + ", ".join(f"${value:02x}" for value in bitmap[start:start + 16]))
        lines.append("    .byte 0")
    lines.append("logoCaptionsLow:")
    lines.append("    .byte " + ", ".join(f"<logoCaption{index}" for index in range(len(records_per_caption))))
    lines.append("logoCaptionsHigh:")
    lines.append("    .byte " + ", ".join(f">logoCaption{index}" for index in range(len(records_per_caption))))
    return lines


def main():
    pixels, background = decode(PICTURE.read_bytes())
    background_pixels = [[value == background for value in row] for row in pixels]
    records_per_caption = []
    for text, color, left, top in all_captions():
        records_per_caption.append(caption_records(caption_pixels(text, left, top), color, background_pixels))
    OUTPUT.write_text("\n".join(asm_lines(records_per_caption)) + "\n")
    print(f"wrote {OUTPUT.name}: {len(records_per_caption)} captions")


if __name__ == "__main__":
    main()
