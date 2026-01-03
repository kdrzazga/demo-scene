import time
from PIL import Image


def split_image_vertically(image_path, N):
    img = Image.open(image_path)
    width, height = img.size
    piece_width = width // N

    timestamp = int(time.time() * 1000)

    for i in range(N):
        left = i * piece_width
        right = (left + piece_width) if i < N - 1 else width
        box = (left, 0, right, height)
        piece = img.crop(box)
        filename = f"pic/pic{i}.png"
        piece.save(filename)


if __name__ == "__main__":
	split_image_vertically("pic/Apple1.jpg", 10)
