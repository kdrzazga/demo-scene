import sys
import struct
from PIL import Image

BLACK = (0, 0, 0)
WHITE = (0xff, 0xff, 0xff)
RED = (0x92, 0x4a, 0x40)
CYAN = (0x83, 0xc5, 0xc5)
PURPLE = (204, 68, 204)
GREEN = (0, 204, 85)
BLUE = (0,0,170)
YELLOW = (238,238, 119)
ORANGE = (221, 136, 85)
BROWN = (102, 68, 0)
PINK = (255, 119, 119)
GRAY11 = (0x60, 0x60, 0x60) #(51, 51, 51)
GRAY12 = (0x8a, 0x8a, 0x8a) #(119, 119, 119)
LIGHTGREEN = (170,255,102)
LIGHTBLUE = (0,136,102)
GRAY15 = (0xb3, 0xb3, 0xb3) #(187, 187, 187)
GRAY_WIN = (0xaa, 0xaa, 0xaa)

background_color = GRAY_WIN


class PutPixels:
    def __init__(self, filename):
        self.bits_per_pixel = None
        self.height = None
        self.pixel_data = None
        self.width = None
        self.pixel_offset = None
        self.dib_header = None
        self.header = None
        self.filename = filename
        self.coords = set()

        self.load_bitmap()

    def load_bitmap(self):
        with open(self.filename, 'rb') as f:
            self.header = f.read(14)
            self.dib_header = f.read(40)
            self.pixel_offset = struct.unpack('<I', self.header[10:14])[0]
            self.width = struct.unpack('<I', self.dib_header[4:8])[0]
            self.height = struct.unpack('<I', self.dib_header[8:12])[0]
            self.bits_per_pixel = struct.unpack('<H', self.dib_header[14:16])[0]
            if self.bits_per_pixel != 24:
                raise ValueError("Only 24-bit BMP files are supported.")
            f.seek(self.pixel_offset)
            self.pixel_data = bytearray(f.read())

    def smart_background_fill(self, color, distance):
        """
        Fill the background with a default color, then draw solid lines from both edges
        stopping 'distance' pixels before the first different pixel.
        """
        # Fill entire background with the default background color if needed
        # (Optional: if you want to initialize background, uncomment the following)
        # for y in range(self.height):
        #     for x in range(self.width):
        #         self.put_pixel(x, y, color)

        for y in range(self.height):
            # Convert y to index in pixel_data
            row_start = (self.height - 1 - y) * self.width * 3  # const

            # Left to right
            for x in range(0, self.width):
                idx = row_start + x * 3
                pixel_color = tuple(self.pixel_data[idx:idx + 3])
                if pixel_color != background_color:
                    # Stop drawing from left at x - distance, but not less than 0
                    stop_x = max(x - distance, 0)
                    for fill_x in range(0, stop_x, 2):
                        fill_idx = row_start + fill_x * 3
                        self.pixel_data[fill_idx:fill_idx + 3] = bytes(color)
                    break
            else:
                # If no break, fill entire line with background from the start
                for fill_x in range(self.width):
                    fill_idx = row_start + fill_x * 3
                    self.pixel_data[fill_idx:fill_idx + 3] = bytes(color)

            # Right to left
            for x in range(self.width - 1, -1, -1):

                idx = row_start + x * 3
                pixel_color = tuple(self.pixel_data[idx:idx + 3])
                if pixel_color != background_color:
                    stop_x = min(x + distance, self.width - 1)
                    for fill_x in range(self.width - 1, stop_x, -1):
                        fill_idx = row_start + fill_x * 3
                        self.pixel_data[fill_idx:fill_idx + 3] = bytes(color)
                    break
            else:
                # If no break, fill entire line with background from the end
                for fill_x in range(self.width):
                    fill_idx = row_start + fill_x * 3
                    self.pixel_data[fill_idx:fill_idx + 3] = bytes(color)

    def save_bitmap(self):
        with open(self.filename, 'rb') as f:
            data = bytearray(f.read())
        data[self.pixel_offset:self.pixel_offset + len(self.pixel_data)] = self.pixel_data
        save_name = self.filename.rsplit('.', 1)[0] + 'PP.bmp'
        with open(save_name, 'wb') as fw:
            fw.write(data)

    def save_as_png(self):
        img = Image.new('RGB', (self.width, self.height))
        # Convert pixel_data to a list of (R, G, B) tuples
        pixels = [
            tuple(self.pixel_data[i:i + 3])
            for i in range(0, len(self.pixel_data), 3)
        ]
        img.putdata(pixels)
        png_name = self.filename.rsplit('.', 1)[0] + '.png'
        img.save(png_name)

    def put_pixels(self, color):
        for (x, y) in self.coords:
            if 0 <= x < self.width and 0 <= y < self.height:
                row = self.height - 1 - y
                pixel_index = (row * self.width + x) * 3
                self.pixel_data[pixel_index:pixel_index + 3] = bytes(color)


################ END CLASSDEF ###########################

pp = PutPixels("bw.bmp")

colors = (BROWN, YELLOW, GRAY15, BLUE, ORANGE, GRAY11, BROWN, BLACK, GRAY12, BLACK)
distance = 3 + 15 * len(colors)
for color in colors:
    pp.smart_background_fill(color, distance)
    distance -= 15

for x_gray in (4, 5, 8, 9):
    for y_gray in range(4, 200, 4):
        pp.coords.add((x_gray, y_gray))
        pp.coords.add((x_gray + 1, y_gray + 1))

pp.put_pixels(GRAY15)

pp.coords = set()
for x_black in (4, 5, 8, 9, 297, 298, 301, 302, 305, 306, 309, 310):
    for y_black in range(5, 200, 4):
        if x_black < 290 and y_black < 170:
            pp.coords.add((x_black, y_black))
            pp.coords.add((x_black + 1, y_black + 2))
pp.put_pixels(BLACK)

pp.coords = set()
for x_gray in (4, 5, 8, 9, 297, 298, 301, 302, 305, 306, 309, 310):
    for y_gray in range(5, 170, 4):
        pp.coords.add((x_gray, y_gray))
pp.put_pixels(GRAY11)

pp.save_bitmap()
pp.save_as_png()
