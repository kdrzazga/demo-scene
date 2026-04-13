# pip install pyinstaller
# pyinstaller --onefile --icon=resources/ibmpc.ico main.py

import arcade

from animated_sprite import AnimatedSprite

class Globals:
    fullscreen = False
    HEIGHT = 750
    WIDTH = 1200


class Stage1(arcade.Window):

    def __init__(self):
        super().__init__(Globals.WIDTH, Globals.HEIGHT, "DEMO")
        self.set_fullscreen(Globals.fullscreen)
        self.timer = 0

        background_music = arcade.load_sound("resources/hoho.mp3")
        self.media_player = background_music.play()
        self.media_player.loop = True

        arcade.set_background_color(arcade.color.BLACK)

        window1 = arcade.get_window()
        current_width = window1.width
        current_height = window1.height

        self.animated_sprite = AnimatedSprite(
            "resources/mikolaje.png",
            position_x=current_width // 2,
            position_y=current_height // 2,
            frame_width=263,
            frame_height=420,
            num_frames=3,
            frame_delay=0.33
        )

    def on_update(self, delta_time):

        self.timer += 1

        if self.timer < 2.5*60:
            self.animated_sprite.update(delta_time,(1,2))
        else:
            self.media_player.volume *= 0.995
            self.animated_sprite.update(delta_time)

        if self.timer > 10*60:
            arcade.exit()

    def on_draw(self):
        self.clear()
        self.animated_sprite.draw()


if __name__ == "__main__":
    window = Stage1()
    arcade.run()
