package org.kd;

import com.badlogic.gdx.ApplicationAdapter;
import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.Sprite;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class MyGdxGame extends ApplicationAdapter {
    SpriteBatch batch;
    Texture texture;
    List<Sprite> sprites;

    @Override
    public void create() {
        this.sprites = new ArrayList<>(3);
        batch = new SpriteBatch();
        // Load the texture from a file in the assets folder
        var positions = Arrays.asList(50, 50, 250, 50, 250, 250);
        AtomicInteger index = new AtomicInteger(0);
        Arrays.asList("skull.bmp", "monster.bmp", "tank.bmp").forEach(file -> {
            texture = new Texture(Gdx.files.internal(file));
            // Create a sprite from the texture
            var sprite = new Sprite(texture);
            // Optionally set position, scale, rotation
            sprite.setPosition(positions.get(index.get()), positions.get(index.get() +1));
            index.addAndGet(2);
            sprite.setScale(2.0f);
            sprites.add(sprite);
        });

        var monster = sprites.get(1);
        //monster.rotate90(false);
        //monster.setFlip(false,true);
        //monster.setAlpha(0.5f); //whole sprite becomes partly transparent, not only backgound
        //monster.setScale(10,3);
    }

    @Override
    public void render() {
        Gdx.gl.glClearColor(0, 0, 0, 1);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        batch.begin();
        sprites.forEach(s -> s.draw(batch));

        var skull = sprites.get(0);
        skull.setPosition(skull.getX()+1, skull.getY());
        batch.end();
    }

    @Override
    public void dispose() {
        batch.dispose();
        texture.dispose();
    }
}
