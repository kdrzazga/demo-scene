import arcade
import random

SPRITE_SCALING = 2.5

WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
WINDOW_TITLE = "Arcade Python Sprites"

MOVEMENT_SPEED = 2

VIEWPORT_MARGIN = 250
HORIZONTAL_BOUNDARY = WINDOW_WIDTH / 2.0 - VIEWPORT_MARGIN
VERTICAL_BOUNDARY = WINDOW_HEIGHT / 2.0 - VIEWPORT_MARGIN
# If the player moves further than this boundary away from
# the camera we use a constraint to move the camera
CAMERA_BOUNDARY = arcade.LRBT(
    -HORIZONTAL_BOUNDARY,
    HORIZONTAL_BOUNDARY,
    -VERTICAL_BOUNDARY,
    VERTICAL_BOUNDARY,
)


class GameView(arcade.View):

    def __init__(self):
        super().__init__()

        # Variables that will hold sprite lists
        self.player_list = None
        self.enemy_list = None

        self.player = None

        # Track the current state of what key is pressed
        self.left_pressed = False
        self.right_pressed = False
        self.up_pressed = False
        self.down_pressed = False

        self.physics_engine = None

        # Camera for scrolling
        self.camera = None

        # Set the background color
        self.background_color = arcade.color.BLACK

    def setup(self):
        self.camera = arcade.Camera2D()

        self.player_list = arcade.SpriteList()
        self.enemy_list = arcade.SpriteList()

        self.player = arcade.Sprite("../pics/tank.bmp")
        self.player.center_x = 50
        self.player.center_y = 350
        self.player_list.append(self.player)

        enemy = arcade.Sprite("../pics/monster.bmp",scale=SPRITE_SCALING,)
        enemy.center_x = 350
        enemy.center_y = 350
        self.enemy_list.append(enemy)

        enemySkull = arcade.Sprite("../pics/skull.bmp",scale=SPRITE_SCALING,)
        enemySkull.center_x = 500
        enemySkull.center_y = 200
        self.enemy_list.append(enemySkull)

        self.physics_engine = arcade.PhysicsEngineSimple(
            self.player,
        )

    def on_draw(self):
        self.clear()

        # Draw all the sprites.
        self.player_list.draw()
        self.enemy_list.draw()

        for enemy in self.enemy_list:
            color = arcade.color.RED
            arcade.draw_line(self.player.center_x,
                             self.player.center_y,
                             enemy.center_x,
                             enemy.center_y,
                             color,
                             2)

    def on_update(self, delta_time):
        """ Movement and game logic """

        # Calculate speed based on the keys pressed
        self.player.change_x = 0
        self.player.change_y = 0

        if self.up_pressed and not self.down_pressed:
            self.player.change_y = MOVEMENT_SPEED
        elif self.down_pressed and not self.up_pressed:
            self.player.change_y = -MOVEMENT_SPEED
        if self.left_pressed and not self.right_pressed:
            self.player.change_x = -MOVEMENT_SPEED
        elif self.right_pressed and not self.left_pressed:
            self.player.change_x = MOVEMENT_SPEED

        self.physics_engine.update()

        # --- Manage Scrolling ---
        self.camera.position = arcade.camera.grips.constrain_boundary_xy(
            self.camera.view_data, CAMERA_BOUNDARY, self.player.position
        )
        self.camera.use()

    def on_key_press(self, key, modifiers):

        if key == arcade.key.UP:
            self.up_pressed = True
        elif key == arcade.key.DOWN:
            self.down_pressed = True
        elif key == arcade.key.LEFT:
            self.left_pressed = True
        elif key == arcade.key.RIGHT:
            self.right_pressed = True

    def on_key_release(self, key, modifiers):

        if key == arcade.key.UP:
            self.up_pressed = False
        elif key == arcade.key.DOWN:
            self.down_pressed = False
        elif key == arcade.key.LEFT:
            self.left_pressed = False
        elif key == arcade.key.RIGHT:
            self.right_pressed = False


def main():
    window = arcade.Window(WINDOW_WIDTH, WINDOW_HEIGHT, WINDOW_TITLE)

    game = GameView()
    game.setup()

    window.show_view(game)
    arcade.run()


if __name__ == "__main__":
    main()
