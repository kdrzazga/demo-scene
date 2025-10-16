package org.kd;

public enum SpritePicture {
    TANK("images/tank.png"),
    SKULL("images/skull.png"),
    MONSTER("images/monster.png");

    private final String filePath;

    SpritePicture(String filePath) {
        this.filePath = filePath;
    }

    public String getFilePath() {
        return filePath;
    }
}
