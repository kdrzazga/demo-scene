import os
from PIL import Image

def bulk_vertical_merge(directory: str, output_filename: str):
    images = []
    for filename in os.listdir(directory):
        if filename.lower().endswith('.gif'):
            try:
                img_path = os.path.join(directory, filename)
                with Image.open(img_path) as img:
                    images.append(img.convert('RGBA'))
            except Exception as e:
                print(f"Error loading {filename}: {e}")
    if not images:
        print("No GIF images found in the directory.")
        return
    total_height = sum(img.height for img in images)
    max_width = max(img.width for img in images)
    merged_image = Image.new('RGBA', (max_width, total_height))
    y_offset = 0
    for img in images:
        merged_image.paste(img, (0, y_offset))
        y_offset += img.height
    merged_image.save(output_filename, format='PNG')
    print(f"Merged image saved as {output_filename}")

# Example usage:
bulk_vertical_merge('pics-to-crop', 'output_merged.png')