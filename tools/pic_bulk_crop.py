import os
from PIL import Image


def bulk_image_crop(directory: str, max_y: int):
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff')):
            try:
                with Image.open(file_path) as img:
                    width, height = img.size
                    crop_y = min(max_y, height)
                    crop_box = (0, 0, width, crop_y)
                    cropped_img = img.crop(crop_box)
                    cropped_img.save(file_path)
                    print(f"Cropped and saved: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")


bulk_image_crop("pics-to-crop", 550)
