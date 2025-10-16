package org.kd;

public class Sprite {

    private String path;

    public Sprite(SpritePicture picture){
        this.path = picture.getFilePath();
    }
}
