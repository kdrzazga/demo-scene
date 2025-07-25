class DemoSprite {

    constructor(scene, limitX = 805){
        this.scene = scene;
        this.limitX = limitX;
        this.minX = -10;
        this.walkingLeft = true;
        this.speed = 1;
    }

    move(yPos){
        if (this.walkingLeft)
            this.moveLeft();
        else
            this.moveRight();

        if (this.sprite.x >= this.limitX)
            this.walkingLeft = true;
        else if (this.sprite.x < 1)
            this.walkingLeft = false;
    }

    moveLeft(){
        this.sprite.flipX = true;
        if (this.sprite.x > this.minX){
            this.sprite.x -= this.speed;
        }
    }

    moveRight(){
        this.sprite.flipX = false;
        if (this.sprite.x < this.limitX){
            this.sprite.x += this.speed;
        }
    }
}

class DigDug extends DemoSprite{
    constructor(scene, limitX){
        super(scene, 750);
        this.scene.anims.create({
            key: 'dig-dug-walk',
            frames: [
                { key: 'dig-dug1' },
                { key: 'dig-dug2' },
                { key: 'dig-dug3' }
            ],
            frameRate: 7,
            repeat: -1
        });
        this.sprite = scene.add.sprite(500, 450, 'dig-dug');
        this.sprite.setDepth(-5);
        this.sprite.play('dig-dug-walk');
    }
}

class Saboteur extends DemoSprite{
    constructor(scene){
        super(scene, 1111);
        this.scene.anims.create({
            key: 'saboteur-walk',
            frames: [
                { key: 'saboteur1' },
                { key: 'saboteur2' },
                { key: 'saboteur3' }
            ],
            frameRate: 7,
            repeat: -1
        });
        this.sprite = scene.add.sprite(100, 545, 'saboteur1');
        this.sprite.setDepth(-5);
        this.sprite.play('saboteur-walk');
        this.speed = 1;
        this.walkingLeft = false;
    }
}

class SpriteManager {

    static createSaboteur(scene){
        return new Saboteur(scene);
    }

    static createDigDug(scene, limitX){
        return new DigDug(scene, limitX);
    }


    static createGianaCalm(scene){
        scene.anims.create({
            key: 'karateka-walk',
            frames: [
                { key: 'giana-calm1' },
                { key: 'giana-calm2' },
                { key: 'giana-calm3' }
            ],
            frameRate: 3,
            repeat: -1
        });
    }

    static createGianaCrazy(scene){
        scene.anims.create({
            key: 'karateka-walk',
            frames: [
                { key: 'giana-crazy1' },
                { key: 'giana-crazy2' },
                { key: 'giana-crazy3' }
            ],
            frameRate: 3,
            repeat: -1
        });
    }
}
