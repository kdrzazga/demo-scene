package org.kd;

import com.badlogic.gdx.ApplicationAdapter;
import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.Sprite;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;

public class MyGdxGame extends ApplicationAdapter {
    SpriteBatch batch;
    Texture texture;
    Sprite sprite;

    @Override
    public void create () {
        batch = new SpriteBatch();
        // Load the texture from a file in the assets folder
        texture = new Texture(Gdx.files.internal("skull.bmp"));
        // Create a sprite from the texture
        sprite = new Sprite(texture);
        // Optionally set position, scale, rotation
        sprite.setPosition(100, 100);
        sprite.setScale(2.0f);
    }

    @Override
    public void render () {
        Gdx.gl.glClearColor(0, 0, 0, 1);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        batch.begin();
        sprite.draw(batch); // draw the sprite
        batch.end();
    }

    @Override
    public void dispose () {
        batch.dispose();
        texture.dispose();
    }
}
