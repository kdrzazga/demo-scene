import sys
from pathlib import Path

from edit_champagne_kla import BLACK, CELL_COLUMNS, CELL_ROWS, CYAN, HEIGHT, WHITE, WIDTH, decode, encode_cell

HERE = Path(__file__).parent
MIN_FLUID_RUN = 3


def wide_cyan_pixels(pixels):
    wide = set()
    for y in range(HEIGHT):
        x = 0
        while x < WIDTH:
            run_end = x
            while run_end < WIDTH and pixels[y][run_end] == CYAN:
                run_end += 1
            if run_end - x >= MIN_FLUID_RUN:
                wide.update((column, y) for column in range(x, run_end))
            x = max(run_end, x + 1)
    return wide


def cyan_regions(pixels):
    unvisited = wide_cyan_pixels(pixels)
    regions = []
    while unvisited:
        region = [unvisited.pop()]
        frontier = list(region)
        while frontier:
            x, y = frontier.pop()
            for neighbour in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if neighbour in unvisited:
                    unvisited.remove(neighbour)
                    region.append(neighbour)
                    frontier.append(neighbour)
        regions.append(region)
    return regions


def keep_only_fluid(pixels):
    regions = cyan_regions(pixels)
    fluid = set(max(regions, key=len))
    whitened = 0
    for y in range(HEIGHT):
        for x in range(WIDTH):
            if pixels[y][x] == CYAN and (x, y) not in fluid:
                pixels[y][x] = WHITE
                whitened += 1
    return len(fluid), whitened


def touches_black(pixels, x, y):
    for neighbour_y in range(max(y - 1, 0), min(y + 2, HEIGHT)):
        for neighbour_x in range(max(x - 1, 0), min(x + 2, WIDTH)):
            if pixels[neighbour_y][neighbour_x] == BLACK:
                return True
    return False


def separate_fluid_from_edge(pixels):
    touching = [(x, y) for y in range(HEIGHT) for x in range(WIDTH)
                if pixels[y][x] == CYAN and touches_black(pixels, x, y)]
    for x, y in touching:
        pixels[y][x] = WHITE
    return len(touching)


def main(path):
    data = bytearray(path.read_bytes())
    pixels, background = decode(data)
    fluid_size, whitened = keep_only_fluid(pixels)
    gap_pixels = separate_fluid_from_edge(pixels)
    print(f"{gap_pixels} fluid pixels touching the black edge made white")
    for cell_row in range(CELL_ROWS):
        for cell_column in range(CELL_COLUMNS):
            encode_cell(data, pixels, background, cell_row, cell_column)
    path.write_bytes(data)
    print(f"fluid {fluid_size} cyan pixels kept, {whitened} stray cyan pixels made white")


if __name__ == "__main__":
    main(Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "glass.kla")
