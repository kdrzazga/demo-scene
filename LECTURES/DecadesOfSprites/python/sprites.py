#pip install arcade
import arcade

# Constants
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
SCREEN_TITLE = "Arcade Animation Example"

class MyGame(arcade.Window):
    def __init__(self):
        super().__init__(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_TITLE)
        self.x = 50
        self.y = SCREEN_HEIGHT // 2
        self.change_x = 2

    def on_draw(self):
        arcade.start_render()
        arcade.draw_circle_filled(self.x, self.y, 20, arcade.color.BLUE)

    def on_update(self, delta_time):
        self.x += self.change_x

        if self.x > SCREEN_WIDTH - 20 or self.x < 20:
            self.change_x *= -1

def main():
    game = MyGame()
    arcade.run()

if __name__ == "__main__":
    main()