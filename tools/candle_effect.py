import math

from PIL import Image, ImageDraw


def draw_ray(angle):
    end_x = center_x + max_radius * math.cos(angle)
    end_y = center_y + max_radius * math.sin(angle)
    # For each line, draw two adjacent pixels at (x,y) and (x+1,y)
    # We'll plot points along the line using small steps
    steps = int(max_radius)
    for i in range(steps):
        t = i / steps
        x = int(center_x + t * (end_x - center_x))
        y = int(center_y + t * (end_y - center_y))
        # Draw two pixels next to each other
        if 0 <= x < width - 1 and 0 <= y < height:
            draw.point((x, y), fill="yellow")
            draw.point((x + 1, y), fill="yellow")


def draw_concentric_ellipses_with_pixels(draw, center, max_radius, step, pixel_color=(255, 255, 0)):
    """
    Draws concentric ellipses centered at 'center' with radius increasing by 'step'.
    Adds two pixels at (x, y) and (x+1, y) on the ellipse perimeter at angle 0.

    Args:
        draw: ImageDraw object.
        center: Tuple (x, y) for center of ellipses.
        max_radius: Maximum radius for the largest ellipse.
        step: Distance between each ellipse.
        pixel_color: Color of the added pixels.
    """
    cx, cy = center
    num_ellipses = int(max_radius // step)
    for i in range(1, num_ellipses + 1):
        rx = ry = i * step
        bbox = [cx - rx, cy - ry, cx + rx, cy + ry]
        draw.ellipse(bbox, width = 2, outline=None)


width, height = 320, 200

# Create a new black image
img = Image.new("RGB", (width, height), "black")
draw = ImageDraw.Draw(img)

# Candle position (center of the screen)
center_x, center_y = 160, 100

# Parameters
angle_increment = math.pi / 90  # PI/30
max_radius = 320  # maximum length of the line to the edge of the screen

# Draw lines radiating out from the candle
angle = 0

while angle <= 2 * math.pi:
    draw_ray(angle)
    angle += angle_increment

draw_concentric_ellipses_with_pixels(draw, (center_x, center_y), max_radius=max(width, height) // 2, step=3)

# Save the image
img.save("candle_illumination.png")
