from pathlib import Path

from edit_champagne_kla import BLACK, CELL_COLUMNS, CELL_ROWS, WHITE, decode, encode_cell

HERE = Path(__file__).parent
SOURCE = HERE / "logo_original.kla"
TARGET = HERE / "logo.kla"


def main():
    data = bytearray(SOURCE.read_bytes())
    pixels, background = decode(data)
    whitened = 0
    for row in pixels:
        for x, value in enumerate(row):
            if value == BLACK:
                row[x] = WHITE
                whitened += 1
    for cell_row in range(CELL_ROWS):
        for cell_column in range(CELL_COLUMNS):
            encode_cell(data, pixels, background, cell_row, cell_column)
    TARGET.write_bytes(data)
    print(f"{whitened} black edge pixels made white")


if __name__ == "__main__":
    main()
