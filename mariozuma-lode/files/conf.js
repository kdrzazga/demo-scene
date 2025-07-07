const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    scene: [SceneIntro, Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10
            , Scene11, Scene12, Scene13, Scene14, Scene15, Scene16, Scene17, Scene18, Scene19, Scene20
            , Scene21, Scene22, Scene23, Scene24, Scene25, Scene26, Scene27
            , SceneKamikaze, SceneMontezuma, SceneCages, SceneTreasure],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 500,
                x: 0,
            },
            debug: false,
        }
    }
};

function start(){
    const game = new Phaser.Game(config)
    return game;
}

const g = start();
