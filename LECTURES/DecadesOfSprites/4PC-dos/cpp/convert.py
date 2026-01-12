def read_bmp_4bit(filename):
    with open(filename, 'rb') as f:
        bmp = f.read()

    # BMP header sizes
    offset = int.from_bytes(bmp[10:14], 'little')
    width = int.from_bytes(bmp[18:22], 'little')
    height = int.from_bytes(bmp[22:26], 'little')
    bpp = int.from_bytes(bmp[28:30], 'little')

    # Color palette starts at byte 54
    palette_start = 54
    palette = []
    for i in range(16):
        start = palette_start + i * 4
        blue = bmp[start]
        green = bmp[start + 1]
        red = bmp[start + 2]
        palette.append((red, green, blue))
    
    # Pixel data starts at offset
    pixel_data = bmp[offset:]
    
    # Each row is padded to 4-byte boundary
    row_bytes = (width + 1) // 2
    padding = (4 - (row_bytes % 4)) % 4
    
    pixels = []

    for row in range(height):
        row_start = row * (row_bytes + padding)
        row_end = row_start + row_bytes
        row_data = pixel_data[row_start:row_end]
        for byte in row_data:
            high_nibble = (byte >> 4) & 0xF
            low_nibble = byte & 0xF
            pixels.append(high_nibble)
            if len(pixels) < width * height:
                pixels.append(low_nibble)

    # BMP stores pixels bottom-up
    pixels.reverse()
    return pixels, palette

def classify_color(r, g, b):
    # Define thresholds for black, red, gray shades
    if r < 50 and g < 50 and b < 50:
        return 0  # black
    elif r < 50 and g < 50 and b > 100:
        return 1  # blu
    elif r < 50 and g >200 and b < 50:
        return 2  # grn
    elif r < 50 and g >200 and b > 200:
        return 3  # cyan
    elif r > 200 and g < 50 and b < 50:
        return 4  # red
    elif r > 200 and g < 50 and b > 200:
        return 5
    elif r > 200 and g > 200 and b < 50:
        return 6
    elif r > 200 and g > 200 and b > 200:
        return 7 #wht
    elif r < 50 and g < 50 and b > 200:
        return 9
    else:
        return 8  # other shades

def process_pixels(pixels, palette):
    result = []
    for color_index in pixels:
        r, g, b = palette[color_index]
        color_code = classify_color(r, g, b)
        result.append(str(color_code))
    return result

def main():
    input_bmp = 'sh2.bmp'   # Replace with your bitmap filename
    output_text = 'output.txt'

    pixels, palette = read_bmp_4bit(input_bmp)
    processed = process_pixels(pixels, palette)
    # Output as text
    with open(output_text, 'w') as f:
        for i, val in enumerate(processed):
            f.write(val)
            if (i + 1) % 640 == 0:
                f.write('\n')  # Wrap lines for readability

if __name__ == "__main__":
    main()
    