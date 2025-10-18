package org.kd;

import com.badlogic.gdx.backends.lwjgl.LwjglApplication;
import com.badlogic.gdx.backends.lwjgl.LwjglApplicationConfiguration;

public class Main {
    public static void main (String[] arg) {
        var config = new LwjglApplicationConfiguration();
        config.title = "My LibGDX Game";
        config.width = 800;
        config.height = 600;

        new LwjglApplication(new MyGdxGame(), config);
    }
}
