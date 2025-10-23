#https://www.youtube.com/watch?v=R7TnIkTOSO8
import arcade

import arcade.future.background as background

SCREEN_WIDTH = 2048//4
SCREEN_HEIGHT = 400
SCREEN_TITLE = "Double Python"

class DoubleDragonPython(arcade.Window):
    def __init__(self):
        super().__init__(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_TITLE)

        self.counter = 0
        self.background =  background.Background.from_file("resources/Mission1.png")
        self.garage_door_y = 175

        door = arcade.Sprite()
        door.texture = arcade.load_texture("resources/door.png")
        door.center_x = 109
        door.center_y = self.garage_door_y

        billy = arcade.Sprite()
        billy.texture = arcade.load_texture("resources/billy1.png")
        billy.center_x = 109
        billy.center_y = self.garage_door_y - 15

        over_garage = arcade.Sprite()
        over_garage.texture = arcade.load_texture("resources/overGarage.png")
        over_garage.center_x = 85
        over_garage.center_y = 320

        self.bg_sprite_list = arcade.SpriteList()
        self.bg_sprite_list.append(billy)
        self.bg_sprite_list.append(door)
        self.bg_sprite_list.append(over_garage)

    def on_update(self, delta_time):
        self.counter += 1
        print("update ", self.counter)
        self.conditionally_move_garage_door()

    def on_draw(self):
        print("draw")
        self.background.draw()
        self.bg_sprite_list.draw()

    def conditionally_move_garage_door(self):
        if self.counter > 300 and self.counter < 800:
            self.bg_sprite_list[1].center_y += 0.3

def main():
    game = DoubleDragonPython()
    arcade.run()

if __name__ == "__main__":
    main()
