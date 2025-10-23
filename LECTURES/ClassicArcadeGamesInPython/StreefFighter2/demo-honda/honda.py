import arcade

SCREEN_WIDTH = 527
SCREEN_HEIGHT = 800
SCREEN_TITLE = "HONDA Demo"
SPRITE_SCALING = 0.5
FRAME_DURATION = 0.4

class MyGame(arcade.Window):
    def __init__(self):
        super().__init__(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_TITLE)

        self.frames = [
            arcade.load_texture("resources/honda_punch.png"),
            arcade.load_texture("resources/honda_punch_hl.png"),
            arcade.load_texture("resources/honda_punch_lr.png"),
            arcade.load_texture("resources/honda_punch_hr.png"),
            arcade.load_texture("resources/honda_punch_ll.png"),
        ]

        self.sprites = arcade.SpriteList()

        self.sprite = arcade.Sprite()
        self.sprite.texture = self.frames[0]
        self.sprite.center_x = SCREEN_WIDTH // 2
        self.sprite.center_y = SCREEN_HEIGHT // 2

        self.sprites.append(self.sprite)
        # Animation control
        self.current_frame = 0
        self.time_since_last_frame = 0

    def on_update(self, delta_time):
        # Update the animation timer
        self.time_since_last_frame += delta_time
        if self.time_since_last_frame > FRAME_DURATION:

            self.current_frame = (self.current_frame + 1) % len(self.frames)
            self.sprite.texture = self.frames[self.current_frame]
            self.time_since_last_frame = 0

    def on_draw(self):
        self.clear()
        self.sprites.draw()

def main():
    game = MyGame()
    arcade.run()

if __name__ == "__main__":
    main()
