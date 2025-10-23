import arcade

import arcade.future.background as background

SCREEN_WIDTH = 1024//4
SCREEN_HEIGHT = 200
SCREEN_TITLE = "Double Python"

class DoubleDragonPython(arcade.Window):
    def __init__(self):
        super().__init__(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_TITLE)
        self.background =  background.Background.from_file("resources/Mission1.png")

    def on_update(self, delta_time):
        print("update")

    def on_draw(self):
        print("draw")
        self.background.draw(scale=3)


def main():
    game = DoubleDragonPython()
    arcade.run()

if __name__ == "__main__":
    main()
