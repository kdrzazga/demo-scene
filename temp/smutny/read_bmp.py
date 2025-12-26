def load_bitmap(file_path):
    with open(file_path, 'rb') as bmp_file:
        # Read the BMP header (first 14 bytes)
        header = bmp_file.read(14)
        # Read the DIB header (next 40 bytes for BITMAPINFOHEADER)
        dib_header = bmp_file.read(40)

        # Extract some header information
        file_size = int.from_bytes(header[2:6], byteorder='little')
        pixel_data_offset = int.from_bytes(header[10:14], byteorder='little')

        width = int.from_bytes(dib_header[4:8], byteorder='little')
        height = int.from_bytes(dib_header[8:12], byteorder='little')
        bits_per_pixel = int.from_bytes(dib_header[14:16], byteorder='little')

        print(f"File Size: {file_size} bytes")
        print(f"Pixel Data Offset: {pixel_data_offset} bytes")
        print(f"Width: {width} pixels")
        print(f"Height: {height} pixels")
        print(f"Bits per pixel: {bits_per_pixel}")

        # Read pixel data
        bmp_file.seek(pixel_data_offset)
        pixel_data = bmp_file.read()

        # You can process pixel_data as needed
        print(f"Pixel data length: {len(pixel_data)} bytes")

# Usage example:
if __name__ == "__main__":
    filename = 'bw.bmp'  # Replace with your BMP file path
    load_bitmap(filename)
