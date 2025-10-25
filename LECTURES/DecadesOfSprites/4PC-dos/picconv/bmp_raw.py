import struct

# Color mapping based on pixel value
color_map = {
    0: '0',   # black
    1: '6',   # blue
    11: 'e',   # cyan
    6: '9',   # red
    5: '5',   # purple
    12: '1',   # brown
    7: '8',   # lightgray
    8: '7',   # darkgray
    9: '4',   # light blue
    10: 'a',  # light green
    14: 'b',  # cyan
    4: 'c',  # pink
    13: 'd',  # light purple
    3: '3',  # yellow
    15: 'f'   # white
}

def read_4bit_bmp_and_convert(input_file, output_file):
    with open(input_file, 'rb') as f:
        # Read BMP header
        f.seek(0)
        header_field = f.read(2)
        if header_field != b'BM':
            print("Not a BMP file.")
            return

        # Read file size and pixel data offset
        f.seek(10)
        pixel_offset = struct.unpack('<I', f.read(4))[0]

        # Read DIB header size
        f.seek(14)
        dib_header_size = struct.unpack('<I', f.read(4))[0]

        # Read image width and height
        f.seek(18)
        width = struct.unpack('<I', f.read(4))[0]
        height = struct.unpack('<I', f.read(4))[0]

        # Read bits per pixel
        f.seek(28)
        bpp = struct.unpack('<H', f.read(2))[0]
        if bpp != 4:
            print("This program only supports 4-bit BMP files.")
            return

        # Read palette (assumed 16 colors)
        palette_offset = 14 + dib_header_size
        f.seek(palette_offset)
        palette = []
        for _ in range(16):
            b, g, r, _ = struct.unpack('BBBB', f.read(4))
            palette.append((r, g, b))

        # Read pixel data
        f.seek(pixel_offset)
        row_size = ((width + 1) // 2 + 3) // 4 * 4  # row size in bytes, aligned to 4 bytes
        pixels_data = []

        for _ in range(height):
            row_bytes = f.read(row_size)
            pixels_data.append(row_bytes[:(width + 1) // 2])  # only pixel data, ignoring padding

        # Process bottom-up
        with open(output_file, 'w') as out_f:
            for row in reversed(pixels_data):
                row_colors = []
                for byte in row:
                    high_nibble = byte >> 4
                    low_nibble = byte & 0x0F

                    # Append high nibble color
                    row_colors.append(color_map.get(high_nibble, '0'))

                    # Append low nibble color if it exists (for odd width)
                    # Only if this pixel is within the width
                    pixel_index = len(row_colors)
                    if pixel_index < width:
                        row_colors.append(color_map.get(low_nibble, '0'))
                # Join all pixel color codes for the row
                out_f.write(''.join(row_colors[:width]) + '\n')

# Usage
input_bmp = 'viking2.bmp'
output_txt = 'output.txt'
read_4bit_bmp_and_convert(input_bmp, output_txt)
