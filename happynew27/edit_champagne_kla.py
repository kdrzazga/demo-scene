from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BLACK, WHITE, RED, CYAN, BLUE, LIGHT_RED, LIGHT_BLUE = 0, 1, 2, 3, 6, 10, 14

WIDTH, HEIGHT = 160, 200
CELL_WIDTH, CELL_HEIGHT = 4, 8
CELL_COLUMNS, CELL_ROWS = 40, 25

GLASS_SOURCE_COLUMNS = range(0, 20)
GLASS_ROWS = range(56, 200)
GLASS_PLACEMENTS = [(range(0, 20), 0), (range(58, 80), 60)]

TEXT_LINES = [("HAPPY NEW", LIGHT_RED, RED), ("YEAR 2027", LIGHT_BLUE, BLUE)]
TEXT_LEFT_LIMIT = 50
TEXT_RIGHT = 157
TEXT_TOP = 3
TEXT_BOTTOM_LIMIT = 54
LINE_GAP = 5
FONT_PATH = "C:/Windows/Fonts/ariblk.ttf"

HERE = Path(__file__).parent
SOURCE = HERE / "champagne_original.kla"
GLASS = HERE / "glass.kla"
TARGET = HERE / "champagne.kla"


def decode(data):
    body = data[2:]
    bitmap, screen, color = body[:8000], body[8000:9000], body[9000:10000]
    background = body[10000] & 15
    pixels = [[0] * WIDTH for _ in range(HEIGHT)]
    for cell_row in range(CELL_ROWS):
        for cell_column in range(CELL_COLUMNS):
            cell = cell_row * CELL_COLUMNS + cell_column
            choices = [background, screen[cell] >> 4, screen[cell] & 15, color[cell] & 15]
            for line in range(CELL_HEIGHT):
                byte = bitmap[cell * 8 + line]
                for pair in range(CELL_WIDTH):
                    pixels[cell_row * 8 + line][cell_column * 4 + pair] = choices[(byte >> (6 - pair * 2)) & 3]
    return pixels, background


def encode_cell(data, pixels, background, cell_row, cell_column):
    cell = cell_row * CELL_COLUMNS + cell_column
    cell_pixels = [pixels[cell_row * 8 + line][cell_column * 4 + pair] for line in range(8) for pair in range(4)]
    foreground = sorted({value for value in cell_pixels if value != background})
    if len(foreground) > 3:
        raise ValueError(f"cell {cell_column},{cell_row} needs colors {foreground}")
    foreground += [0] * (3 - len(foreground))
    bits_by_color = {background: 0, foreground[0]: 1, foreground[1]: 2, foreground[2]: 3}
    for line in range(8):
        byte = 0
        for pair in range(4):
            byte |= bits_by_color[cell_pixels[line * 4 + pair]] << (6 - pair * 2)
        data[2 + cell * 8 + line] = byte
    data[2 + 8000 + cell] = foreground[0] << 4 | foreground[1]
    data[2 + 9000 + cell] = foreground[2]


def place_glasses(pixels, glass_pixels):
    for cleared_columns, left in GLASS_PLACEMENTS:
        for y in GLASS_ROWS:
            for x in cleared_columns:
                pixels[y][x] = WHITE
            for x in GLASS_SOURCE_COLUMNS:
                pixels[y][left + x] = glass_pixels[y][x]


def glass_cells():
    cell_columns = sorted({x // CELL_WIDTH for cleared_columns, _ in GLASS_PLACEMENTS for x in cleared_columns})
    cell_rows = sorted({y // CELL_HEIGHT for y in GLASS_ROWS})
    return [(cell_row, cell_column) for cell_row in cell_rows for cell_column in cell_columns]


def text_mask(text, font):
    left, top, right, bottom = font.getbbox(text)
    canvas = Image.new("L", (right - left, bottom - top), 0)
    ImageDraw.Draw(canvas).text((-left, -top), text, font=font, fill=255)
    wide_pixels = canvas.resize(((right - left + 1) // 2, bottom - top), Image.BOX)
    mask_width, mask_height = wide_pixels.size
    values = list(wide_pixels.getdata())
    return [[values[y * mask_width + x] >= 128 for x in range(mask_width)] for y in range(mask_height)]


def fitting_masks():
    available_width = TEXT_RIGHT - TEXT_LEFT_LIMIT - 1
    available_height = TEXT_BOTTOM_LIMIT - TEXT_TOP - LINE_GAP - 2 * 2
    for size in range(60, 8, -1):
        font = ImageFont.truetype(FONT_PATH, size)
        masks = [text_mask(text, font) for text, _, _ in TEXT_LINES]
        widest = max(len(mask[0]) for mask in masks)
        total_height = sum(len(mask) for mask in masks)
        if widest <= available_width and total_height <= available_height:
            return masks
    raise ValueError("text does not fit")


def draw_outlined_line(pixels, mask, right, top, top_color, bottom_color):
    mask_height, mask_width = len(mask), len(mask[0])
    left = right - mask_width
    for y in range(mask_height):
        for x in range(mask_width):
            if not mask[y][x]:
                continue
            for outline_y in (-1, 0, 1):
                for outline_x in (-1, 0, 1):
                    if pixels[top + y + outline_y][left + x + outline_x] != top_color and \
                            pixels[top + y + outline_y][left + x + outline_x] != bottom_color:
                        pixels[top + y + outline_y][left + x + outline_x] = BLACK
    for y in range(mask_height):
        fill = top_color if y < mask_height // 2 else bottom_color
        for x in range(mask_width):
            if mask[y][x]:
                pixels[top + y][left + x] = fill
    return top - 1, top + mask_height + 1


def draw_greeting(pixels):
    top = TEXT_TOP + 1
    touched_rows = []
    for mask, (_, top_color, bottom_color) in zip(fitting_masks(), TEXT_LINES):
        touched_rows.append(draw_outlined_line(pixels, mask, TEXT_RIGHT, top, top_color, bottom_color))
        top += len(mask) + 2 + LINE_GAP
    return touched_rows


def main():
    data = bytearray(SOURCE.read_bytes())
    pixels, background = decode(data)
    glass_pixels, _ = decode(GLASS.read_bytes())
    place_glasses(pixels, glass_pixels)
    draw_greeting(pixels)
    text_cell_columns = range(TEXT_LEFT_LIMIT // 4 - 1, CELL_COLUMNS)
    text_cell_rows = range(0, TEXT_BOTTOM_LIMIT // 8 + 1)
    for cell_row, cell_column in glass_cells():
        encode_cell(data, pixels, background, cell_row, cell_column)
    for cell_row in text_cell_rows:
        for cell_column in text_cell_columns:
            encode_cell(data, pixels, background, cell_row, cell_column)
    TARGET.write_bytes(data)


if __name__ == "__main__":
    main()
