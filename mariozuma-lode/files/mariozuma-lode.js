class MainScene extends ExtendedScene {

    static PLAYER_SPEED = 2;

    constructor(name){
        super(name);
        this.player = null;
        this.animKey = 'stand';
        this.backgroundColor = 0x880015;

        this.nonBrickRows = [];
        this.nonBrickColumns = [];
        this.skullRows= [];
        this.kupaRows= [];
        this.snakeRows= [];
        this.aztecSnakesRows = [];
        this.aztecEagleRows = [];
        this.aztecMonkeyRows = [];
        this.bullets = [];
        this.conveyors = [];
        this.keyRows = [];
        this.doorTiles = [];
        this.enemyTextures = ['skull', 'kupa', 'snake', 'bullet'];
        this.ladderColumns = [];

        this.exits = {
            'top': {
                'x': '',
                'y': ''
            },
            'bottom': {
                'bottomX': '',
                'bottomY': ''
            },
            'left': {
                'leftX': '',
                'leftY': ''
            },
            'right': {
                'rightX': '',
                'rightY': ''
            }
        };

        this.nextScene = {
            'top': '',
            'topX': '',
            'topY': '',
            'bottom': '',
            'bottomX': '',
            'bottomY': '',
            'left': '',
            'leftX': '',
            'leftY': '',
            'right': '',
            'rightX': '',
            'rightY': ''
        };

        MainScene.PLAYER_SPEED = Globals.debug ? 5 : 2;
    }

    preload(){
        this.load.image('intro-text', 'files/intro.png');
        this.load.image('montezuma-castle', 'files/background/montezuma-castle.png');
        this.load.image('flag', 'files/background/flag.png');
        this.load.image('sign', 'files/background/sign.png');

        this.load.image('player',  'files/character/stand.png');
        this.load.image('player1', 'files/character/m1.png');
        this.load.image('player2', 'files/character/m2.png');
        this.load.image('player3', 'files/character/m3.png');

        this.load.image('bullet', 'files/enemies/bullet.png');

        this.load.image('skull1', 'files/enemies/skull/skull1.gif');
        this.load.image('skull2', 'files/enemies/skull/skull2.gif');
        this.load.image('skull3', 'files/enemies/skull/skull3.gif');
        this.load.image('skull4', 'files/enemies/skull/skull4.gif');
        this.load.image('skull5', 'files/enemies/skull/skull5.gif');

        this.load.image('snake1', 'files/enemies/snake/snake (1).gif');
        this.load.image('snake2', 'files/enemies/snake/snake (2).gif');
        this.load.image('snake3', 'files/enemies/snake/snake (3).gif');
        this.load.image('snake4', 'files/enemies/snake/snake (4).gif');
        this.load.image('snake5', 'files/enemies/snake/snake (5).gif');

        this.load.image('kupa1', 'files/enemies/kupa/kupa (1).png');
        this.load.image('kupa2', 'files/enemies/kupa/kupa (2).png');
        this.load.image('kupa3', 'files/enemies/kupa/kupa (3).png');
        this.load.image('kupa4', 'files/enemies/kupa/kupa (4).png');
        this.load.image('kupa5', 'files/enemies/kupa/kupa (5).png');
        this.load.image('kupa6', 'files/enemies/kupa/kupa (6).png');
        this.load.image('kupa7', 'files/enemies/kupa/kupa (7).png');
        this.load.image('kupa8', 'files/enemies/kupa/kupa (8).png');
        this.load.image('kupa9', 'files/enemies/kupa/kupa (9).png');
        this.load.image('kupa10', 'files/enemies/kupa/kupa (10).png');
        this.load.image('kupa11', 'files/enemies/kupa/kupa (11).png');
        this.load.image('kupa12', 'files/enemies/kupa/kupa (12).png');
        this.load.image('kupa13', 'files/enemies/kupa/kupa (13).png');
        this.load.image('kupa14', 'files/enemies/kupa/kupa (14).png');

        this.load.image('princess', '../common/pics/princess.png');
        this.load.image('cage', '../common/pics/cage.png');
        this.load.image('save-me', '../common/pics/saveMe.png');
        this.load.image('thank-you', '../common/pics/thankYou.png');
        this.load.image('help', '../common/pics/help.png');
        this.load.image('nothing', '../common/pics/nothing.png');
        this.load.image('panama-joe', 'files/background/panamaJoe.png');

        this.load.image('brick',  'files/background/brick/brick.png');
        this.load.image('brick1', 'files/background/brick/dissolve1.png');
        this.load.image('brick2', 'files/background/brick/dissolve2.png');
        this.load.image('pipe-down', 'files/background/pipeD.png');
        this.load.image('pipe-short', 'files/background/pipe-short.png');

        this.load.image('lightpoint1', 'files/background/brick/lightpoint165.png');
        this.load.image('lightpoint2', 'files/background/brick/lightpoint220.png');
        this.load.image('lightpoint3', 'files/background/brick/lightpoint305.png');

        this.load.image('fire1', 'files/background/fire/fire (1).gif');
        this.load.image('fire2', 'files/background/fire/fire (2).gif');
        this.load.image('fire3', 'files/background/fire/fire (3).gif');
        this.load.image('fire4', 'files/background/fire/fire (4).gif');
        this.load.image('fire5', 'files/background/fire/fire (5).gif');
        this.load.image('fire6', 'files/background/fire/fire (6).gif');
        this.load.image('fire7', 'files/background/fire/fire (7).gif');
        this.load.image('fire8', 'files/background/fire/fire (8).gif');
        this.load.image('fire9', 'files/background/fire/fire (9).gif');
        this.load.image('fire10', 'files/background/fire/fire (10).gif');
        this.load.image('fire11', 'files/background/fire/fire (11).gif');
        this.load.image('fire12', 'files/background/fire/fire (12).gif');
        this.load.image('fire13', 'files/background/fire/fire (13).gif');
        this.load.image('fire14', 'files/background/fire/fire (14).gif');
        this.load.image('fire15', 'files/background/fire/fire (15).gif');
        this.load.image('fire16', 'files/background/fire/fire (16).gif');
        this.load.image('fire17', 'files/background/fire/fire (17).gif');
        this.load.image('fire18', 'files/background/fire/fire (18).gif');
        this.load.image('fire19', 'files/background/fire/fire (19).gif');
        this.load.image('fire20', 'files/background/fire/fire (20).gif');
        this.load.image('fire21', 'files/background/fire/fire (21).gif');
        this.load.image('fire22', 'files/background/fire/fire (22).gif');
        this.load.image('fire23', 'files/background/fire/fire (23).gif');
        this.load.image('fire24', 'files/background/fire/fire (24).gif');
        this.load.image('fire25', 'files/background/fire/fire (25).gif');
        this.load.image('fire26', 'files/background/fire/fire (26).gif');
        this.load.image('smoke-cloud', 'files/background/fire/smoke-cloud.png');

        this.load.image('lode-runner1', 'files/background/lode-runner/lode-runner (1).gif');
        this.load.image('lode-runner2', 'files/background/lode-runner/lode-runner (2).gif');
        this.load.image('lode-runner3', 'files/background/lode-runner/lode-runner (3).gif');
        this.load.image('lode-runner4', 'files/background/lode-runner/lode-runner (4).gif');
        this.load.image('lode-runner5', 'files/background/lode-runner/lode-runner (5).gif');
        this.load.image('lode-runner6', 'files/background/lode-runner/lode-runner (6).gif');
        this.load.image('lode-runner7', 'files/background/lode-runner/lode-runner (7).gif');
        this.load.image('lode-runner8', 'files/background/lode-runner/lode-runner (8).gif');
        this.load.image('lode-runner9', 'files/background/lode-runner/lode-runner (9).gif');
        this.load.image('lode-runner10', 'files/background/lode-runner/lode-runner (10).gif');
        this.load.image('lode-runner11', 'files/background/lode-runner/lode-runner (11).gif');
        this.load.image('lode-runner12', 'files/background/lode-runner/lode-runner (12).gif');
        this.load.image('lode-runner13', 'files/background/lode-runner/lode-runner (13).gif');
        this.load.image('lode-runner14', 'files/background/lode-runner/lode-runner (14).gif');
        this.load.image('lode-runner15', 'files/background/lode-runner/lode-runner (15).gif');
        this.load.image('lode-runner16', 'files/background/lode-runner/lode-runner (16).gif');
        this.load.image('lode-runner17', 'files/background/lode-runner/lode-runner (17).gif');
        this.load.image('lode-runner18', 'files/background/lode-runner/lode-runner (18).gif');
        this.load.image('lode-runner19', 'files/background/lode-runner/lode-runner (19).gif');
        this.load.image('lode-runner20', 'files/background/lode-runner/lode-runner (20).gif');
        this.load.image('lode-runner21', 'files/background/lode-runner/lode-runner (21).gif');
        this.load.image('lode-runner22', 'files/background/lode-runner/lode-runner (22).gif');
        this.load.image('lode-runner23', 'files/background/lode-runner/lode-runner (23).gif');
        this.load.image('lode-runner24', 'files/background/lode-runner/lode-runner (24).gif');
        this.load.image('lode-runner25', 'files/background/lode-runner/lode-runner (25).gif');
        this.load.image('lode-runner26', 'files/background/lode-runner/lode-runner (26).gif');

        this.load.image('conveyor1', 'files/background/conveyor/conveyor (1).png');
        this.load.image('conveyor2', 'files/background/conveyor/conveyor (2).png');
        this.load.image('conveyor3', 'files/background/conveyor/conveyor (3).png');
        this.load.image('conveyor4', 'files/background/conveyor/conveyor (4).png');
        this.load.image('conveyor5', 'files/background/conveyor/conveyor (5).png');
        this.load.image('conveyor6', 'files/background/conveyor/conveyor (6).png');
        this.load.image('conveyor7', 'files/background/conveyor/conveyor (7).png');
        this.load.image('conveyor8', 'files/background/conveyor/conveyor (8).png');
        this.load.image('conveyor9', 'files/background/conveyor/conveyor (9).png');

        this.load.image('aztec-calendar', 'files/background/aztec/calendar.png');
        this.load.image('aztec-snake', 'files/background/aztec/coatl-snake.png');
        this.load.image('aztec-eagle', 'files/background/aztec/cuauhtli-eagle.png');
        this.load.image('aztec-monkey', 'files/background/aztec/ozomahtli-monkey.png');

        this.load.image('black-strip', 'files/background/black-strip.png');
        this.load.image('montezuma', 'files/background/montezuma.png');
        this.load.image('skull-pile', 'files/background/skulls.png');
        this.load.image('treasure', 'files/background/treasure.jpg');

        this.load.image('ladder', 'files/background/ladder.png');
        this.load.image('door-red', 'files/background/door/redDoor2.png');
        this.load.image('door-green', 'files/background/door/greenDoor.png');
        this.load.image('door-blue', 'files/background/door/blueDoor.png');
        this.load.image('key-red', 'files/items/key-red.png');
        this.load.image('key-green', 'files/items/key-green.png');
        this.load.image('key-blue', 'files/items/key-blue.png');
    }

    create(){
        super.create();

        let levelDiv = document.getElementById('room-number');
        let name = this.scene.key;
        levelDiv.innerText = 'ROOM' + name.replace('Scene', ' ');

        this.cursors = this.input.keyboard.createCursorKeys();

        this.anims.create({
            key: 'flickering-light',
            frames: [
                {key: 'lightpoint1'},
                {key: 'lightpoint2'},
                {key: 'lightpoint3'},
                {key: 'lightpoint2'}
            ],
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'speech-bubble',
            frames: [
                {key: 'nothing'},
                {key: 'help'},
                {key: 'nothing'},
                {key: 'nothing'},
                {key: 'save-me'}
            ],
            frameRate: 0.3,
            repeat: 30
        });

        this.anims.create({
            key: 'skull-move',
            frames: [
                { key: 'skull1' },
                { key: 'skull2' },
                { key: 'skull3' },
                { key: 'skull4' },
                { key: 'skull5' }
            ],
            frameRate: 7,
            repeat: -1
        });

        this.anims.create({
            key: 'snake-move',
            frames: [
                { key: 'snake1' },
                { key: 'snake2' },
                { key: 'snake3' },
                { key: 'snake4' },
                { key: 'snake5' }
            ],
            frameRate: 7,
            repeat: -1
        });

        this.anims.create({
            key: 'kupa-move',
            frames: [
                { key: 'kupa1' },
                { key: 'kupa2' },
                { key: 'kupa3' },
                { key: 'kupa4' },
                { key: 'kupa5' },
                { key: 'kupa6' },
                { key: 'kupa7' },
                { key: 'kupa8' },
                { key: 'kupa9' },
                { key: 'kupa10' },
                { key: 'kupa11' },
                { key: 'kupa12' },
                { key: 'kupa13' },
                { key: 'kupa14' }
            ],
            frameRate: 7,
            repeat: -1
        });

        this.anims.create({
            key: 'brick-dissolve',
            frames: [
                { key: 'brick' },
                { key: 'brick1' },
                { key: 'brick2' }
            ],
            frameRate: 3,
            repeat: 0
        });

        this.anims.create({
            key: 'player-walk',
            frames: [
                { key: 'player1' },
                { key: 'player2' },
                { key: 'player3' }
            ],
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'conveyor-move',
            frames: [
                { key: 'conveyor1' },
                { key: 'conveyor2' },
                { key: 'conveyor3' },
                { key: 'conveyor4' },
                { key: 'conveyor5' },
                { key: 'conveyor6' },
                { key: 'conveyor7' },
                { key: 'conveyor8' },
                { key: 'conveyor9' }
            ],
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'fire',
            frames: [
                { key: 'fire1' },
                { key: 'fire2' },
                { key: 'fire3' },
                { key: 'fire4' },
                { key: 'fire5' },
                { key: 'fire6' },
                { key: 'fire7' },
                { key: 'fire8' },
                { key: 'fire9' },
                { key: 'fire10' },
                { key: 'fire11' },
                { key: 'fire12' },
                { key: 'fire13' },
                { key: 'fire14' },
                { key: 'fire15' },
                { key: 'fire16' },
                { key: 'fire17' },
                { key: 'fire18' },
                { key: 'fire19' },
                { key: 'fire20' },
                { key: 'fire21' },
                { key: 'fire22' },
                { key: 'fire23' },
                { key: 'fire24' },
                { key: 'fire25' },
                { key: 'fire26' }
            ],
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'lode-runner',
            frames: [
                { key: 'lode-runner1' },
                { key: 'lode-runner2' },
                { key: 'lode-runner3' },
                { key: 'lode-runner4' },
                { key: 'lode-runner5' },
                { key: 'lode-runner6' },
                { key: 'lode-runner7' },
                { key: 'lode-runner8' },
                { key: 'lode-runner9' },
                { key: 'lode-runner10' },
                { key: 'lode-runner11' },
                { key: 'lode-runner12' },
                { key: 'lode-runner13' },
                { key: 'lode-runner14' },
                { key: 'lode-runner15' },
                { key: 'lode-runner16' },
                { key: 'lode-runner17' },
                { key: 'lode-runner18' },
                { key: 'lode-runner19' }
            ],
            frameRate: 20,
            repeat: -1
        });

        this.player = this.add.sprite(Globals.INITIAL_PLAYER_X, Globals.INITIAL_PLAYER_Y, 'player');
        this.player.setDepth(2);

        let rectangle = this.add.graphics();
        rectangle.lineStyle(4, 0xffff00);
        rectangle.strokeRect(0, 0, Globals.TILE_WIDTH, Globals.TILE_WIDTH);
        rectangle.generateTexture('highlight', Globals.TILE_WIDTH, Globals.TILE_WIDTH);
        rectangle.destroy();
        this.rectSprite = this.add.sprite(Globals.PLAYER_X, Globals.PLAYER_Y + Globals.TILE_WIDTH, 'highlight');
        this.rectSprite.setDepth(4);
    }

    update(time, delta) {
        super.update(time, delta);
        this.checkFireKeys()
        this.movePlayer(time);
        this.checkJumpKeys(1400);
        this.checkExit();

        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)) {
                if (child.x < child.minX || child.x > child.maxX && child.minX < child.maxX){
                    child.speedX = -child.speedX;
                    child.setFlipX(child.speedX < 0);
                }
            }
        });

        this.checkEnemyCollision();
        this.checkKeyGrab();
        this.checkDoor();
    }

    checkFireKeys(){
        const keys = [
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M)
        ];

        for (let key of keys) {
            if (Phaser.Input.Keyboard.JustDown(key)) {
                //console.log(`Key ${key.keyCode} was pressed!`);
                let toBeDissolved = this.calculateHighlightSquare(this.player);

                this.spriteGroup.children.iterate(sprite => {
                    if (sprite.texture.key === 'brick')
                        if (sprite.posX === toBeDissolved[0] && sprite.posY === toBeDissolved[1])
                            sprite.play('brick-dissolve');
                });
            }
        }
    }

    walkPlayer(left) {
        this.player.setFlipX(left);
        const condition = left ? this.player.x > MainScene.PLAYER_SPEED : this.player.x < this.sys.canvas.width
        if (condition){
            const movement = left ? -MainScene.PLAYER_SPEED : MainScene.PLAYER_SPEED;
            this.player.x += movement;
            Globals.PLAYER_X = this.player.x;
            this.moveHighlight();
        }
    }

    movePlayer(time){
        let newAnimKey = 'player';

        const playerTileX = Math.ceil(this.player.x/Globals.TILE_WIDTH);
        const playerTileY = Math.ceil(this.player.y/Globals.TILE_WIDTH);
        const playerTile = this.getTextureAt(playerTileX, playerTileY);
        const tileAbove = this.getTextureAt(playerTileX, playerTileY - 1);

        if (this.cursors.right.isDown && playerTile !== 'ladder') {
            this.walkPlayer(false);
            newAnimKey = 'player-walk';
        }

        else if (this.cursors.left.isDown && playerTile !== 'ladder') {
            this.walkPlayer(true);
            newAnimKey = 'player-walk';
        }

        else {
            const underlyingSquareCoords = this.calculateHighlightSquare(this.player);
            const underlyingTile =  this.getTextureAt(underlyingSquareCoords[0], underlyingSquareCoords[1]);

            if (this.cursors.down.isDown && underlyingTile === 'ladder' && underlyingSquareCoords[0] == playerTileX)
                this.player.y += MainScene.PLAYER_SPEED;
            else if (this.cursors.up.isDown && (playerTile === 'ladder' || tileAbove === 'ladder') && underlyingSquareCoords[0] == playerTileX)
                this.player.y -= MainScene.PLAYER_SPEED;

            newAnimKey = 'player';
        }
        if (newAnimKey !== this.animKey) {
            this.animKey = newAnimKey;

            if (newAnimKey === 'player'){
                this.player.anims.stop();
                this.player.setTexture('player')
            }
            else
                this.player.play(this.animKey);
        }
    }

    createEnemy(rowConfig, texture, speed, scale){
        let x = config.width / 2;

        const y = rowConfig.row * Globals.TILE_WIDTH;
        let s = this.add.sprite(x, y , texture);
        Globals.ENEMIES_COUNT += 1;
        s.speedY = 0;

        if (rowConfig.side === 'right'){
            s.x += config.width /4;
            s.minX = config.width/2;
            s.maxX = config.width - 15;
        }
        else {
             s.minX = 15;
             s.maxX = 3*config.width/4 - 15;
        }

        if (texture === 'bullet')
            s.maxX += 1000;

        s.speedX = speed + (Globals.ENEMIES_COUNT % 5)/5;
        s.setScale(scale);
        if (scale < 1)
            s.y += (scale/6) * Globals.TILE_WIDTH;

        const textureAnimationJson = {
            'skull1': 'skull-move',
            'kupa1' : 'kupa-move',
            'snake1' : 'snake-move'
        }
        if (textureAnimationJson[texture] != null)
            s.play(textureAnimationJson[texture]);
        s.setDepth(5);

        return s;
    }

    createSpriteGroup() {

        for (let j = 0; j < 14; j++){
            if (!this.nonBrickRows.includes(j))
                for (let i = 0; i < 14; i++) {
                    if (!this.nonBrickColumns.includes(i))
                    {
                        const x = i * Globals.TILE_WIDTH;
                        const y = j * Globals.TILE_WIDTH;
                        let texture = 'brick';
                        const brickSprite = this.add.sprite(x, y, texture);
                        brickSprite.setDepth(3);
                        brickSprite.posX = i;
                        brickSprite.posY = j;
                        this.spriteGroup.add(brickSprite);
                    }
                }
        }

        const createSpritesForRows = (rows, symbolKey) => {
          rows.forEach(y => {
            for (let x = 0; x <= 12; x++) {
              this.add.sprite(
                1.5 * x * Globals.TILE_WIDTH,
                (y + 0.25) * Globals.TILE_WIDTH,
                symbolKey
              )
              .setDepth(10)
              .setScale(0.5);
            }
          });
        };

        createSpritesForRows(this.aztecSnakesRows, 'aztec-snake');
        createSpritesForRows(this.aztecEagleRows, 'aztec-eagle');
        createSpritesForRows(this.aztecMonkeyRows, 'aztec-monkey');

        console.log(`${this.constructor.name} skulls count = ${this.skullRows.length}`);
        for (let i = 0; i < this.skullRows.length; i++) {
            let s = this.createEnemy(this.skullRows[i], 'skull1', 1, 1);
            this.spriteGroup.add(s);
        }
        for (let i = 0; i < this.kupaRows.length; i++) {
            let s = this.createEnemy(this.kupaRows[i], 'kupa1', 0, 1);
            this.spriteGroup.add(s);
        }

        for (let i = 0; i < this.snakeRows.length; i++) {
            let s = this.createEnemy(this.snakeRows[i], 'snake1', 0, 0.23);
            this.spriteGroup.add(s);
        }

        for (let i = 0; i < this.keyRows.length; i++) {
            const sceneKey = this.sys.settings.key;
            if (!Globals.doorKeys[sceneKey])
                continue;

            const y = this.keyRows[i].row * Globals.TILE_WIDTH;
            const x = 6 * Globals.TILE_WIDTH;
            let k = this.add.sprite(x, y, this.keyRows[i].color);
            k.setScale(0.3);
            k.setDepth(6);
            this.spriteGroup.add(k);
        }

        for (let i = 0; i < this.doorTiles.length; i++){
            const color = this.doorTiles[i].color;
            const sceneKey = this.sys.settings.key;
            if (!Globals.doors[sceneKey][color])
                continue;

            const y = this.doorTiles[i].tileY * Globals.TILE_WIDTH;
            const x = this.doorTiles[i].tileX * Globals.TILE_WIDTH;
            let d = this.add.sprite(x, y, color);
            this.spriteGroup.add(d);
        }

        this.bullets.forEach(bullet => { //g.scene.scenes[4].getSprites('bullet')[0].y
            let sprite = this.createEnemy(Math.ceil(bullet.y/Globals.TILE_WIDTH), 'bullet', 0, 1);
            console.log(`${sprite.minX} ${sprite.maxX}  `);
            sprite.y = bullet.y;
            sprite.minX = -100 + Globals.ENEMIES_COUNT;
            sprite.setDepth(4);
            this.spriteGroup.add(sprite);
        });

        for (let i = 0; i < this.ladderColumns.length; i++){
            const y1 = this.ladderColumns[i].start * Globals.TILE_WIDTH;
            const y2 = this.ladderColumns[i].end * Globals.TILE_WIDTH;
            const x = this.ladderColumns[i].column * Globals.TILE_WIDTH;

            for (let y = y1; y < y2; y += Globals.TILE_WIDTH){
                const ladderCell = this.add.sprite(x, y, 'ladder');
                ladderCell.setDepth(1);
                this.spriteGroup.add(ladderCell);
            }
        }

        for (let i = 0; i < this.conveyors.length; i++){
            const x = this.conveyors[i].rowX * Globals.TILE_WIDTH;
            const y = this.conveyors[i].rowY * Globals.TILE_WIDTH;
            const conveyor = this.add.sprite(x, y, 'conveyor1');
            conveyor.setDepth(11);
            conveyor.setScale(0.5);
            conveyor.play('conveyor-move');

            this.spriteGroup.add(conveyor);
        }
    }

    conditionallyStopEnemy(enemySprite){
        const underlyingSquareCoords = this.calculateHighlightSquare(enemySprite);

        this.spriteGroup.children.iterate((child)=> {
            if (child.texture.key === 'brick2') {
                const enemyTileX = Math.ceil(child.x/Globals.TILE_WIDTH);
                const enemyTileY = Math.ceil(child.y/Globals.TILE_WIDTH);
                /*console.log(`${child.texture.key}[${child.x}][${child.y}] is non-enemy. [${enemyTileX}][${enemyTileY}]`);
                console.log(`[${underlyingSquareCoords[0]}][${underlyingSquareCoords[1]}]`);
                */
                if (enemyTileX === (underlyingSquareCoords[0]) && enemyTileY === underlyingSquareCoords[1]){
                    //console.log(child.texture.key);
                    enemySprite.speedX = 0;
                    enemySprite.x = child.x;
                    enemySprite.y = child.y;
                    child.setTexture('brick1');

                    this.time.delayedCall(3000, () => {
                        child.setTexture('brick');
                    });
                }
            }
        });
    }

    //@Override
    moveEnemies(time){
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child) || child.texture.key ==='flag') {
                child.x -= child.speedX;
                child.y += child.speedY;
                this.conditionallyStopEnemy(child);
            }
        });
    }

    calculateSpriteSquare(sprite){
        const x = Math.floor(sprite.x / Globals.TILE_WIDTH);
        const y = Math.floor(sprite.y / Globals.TILE_WIDTH);

        return [x, y];
    }

    calculateHighlightSquare(sprite){
        const spriteSquare = this.calculateSpriteSquare(sprite);
        const y = spriteSquare[1] + 1;
        let x = spriteSquare[0];
        if (!this.player.flipX)
            x += 1;

        return[x, y];
    }

    moveHighlight(){
        const highlightSquare = this.calculateHighlightSquare(this.player);
        this.rectSprite.x = highlightSquare[0] * Globals.TILE_WIDTH;
        this.rectSprite.y = highlightSquare[1] * Globals.TILE_WIDTH;
    }

    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['top', 'bottom', 'left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    Globals.PLAYER_X = Globals.TILE_WIDTH * 12;
                    Globals.INITIAL_PLAYER_X = Globals.PLAYER_X;
                }
                else if (d === 'right'){
                    Globals.PLAYER_X = Globals.TILE_WIDTH * 1;
                    Globals.INITIAL_PLAYER_X = Globals.PLAYER_X;
                }
                else if (d === 'top'){
                    Globals.PLAYER_Y = Globals.TILE_WIDTH * 10;
                    Globals.INITIAL_PLAYER_Y = Globals.PLAYER_Y;
                }
            }
        });
    }

    //@Override
    checkEnemyCollision() {
        if (this.spriteGroup == undefined)
            return;

        this.enemyTextures.forEach(enemyTexture => {
            const allTextureSprites = this.getSprites(enemyTexture);
            allTextureSprites.forEach(enemy => {
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                if (distance < 3*Globals.TILE_WIDTH/4) {
                    this.scene.restart();
                }
            });
        });
    }

    checkKeyGrab(){
        let doorKeys = this.getSprites('key-');
        if (doorKeys.length <= 0)
            return;

        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, doorKeys[0].x, doorKeys[0].y);
        if (distance > 3*Globals.TILE_WIDTH/4)
            return;

        let keyCell = document.getElementById(doorKeys[0].texture.key);
        if (keyCell.innerText === ''){
            keyCell.innerText = 'KEY';
            const sceneKey = this.sys.settings.key;
            Globals.doorKeys[sceneKey] = false;
            doorKeys[0].y = 2000;
        }
    }

    checkDoor(){
        let doors = this.getSprites('door-');
        if (doors.length <= 0)
            return;

        const keyElementPairs = {
          'red': document.getElementById('key-red'),
          'green': document.getElementById('key-green'),
          'blue': document.getElementById('key-blue')
        };

        doors.forEach(door => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y);
            if (distance > 1.1*Globals.TILE_WIDTH)
                return;

            const doorColor = door.texture.key.replace('door-', '');
            const keyElement = keyElementPairs[doorColor];

            if (keyElement) {
                if (keyElement.innerText === 'KEY') {
                    //console.log('Key matches door:', doorColor);
                    door.y = 2000;
                    keyElement.innerText = '';

                    const sceneKey = this.sys.settings.key;
                    Globals.doors[sceneKey][door.texture.key] = false;
                }
                else {
                    let diff = door.x - this.player.x;
                    this.player.x -= Globals.TILE_WIDTH * Math.sign(diff);
                }
            } else {
                console.warn(`DOOR REMAINS CLOSE. No key element found for color: ${doorColor}`);

            }
        });
    }

    getTextureAt(row, column){
        let texture = '';
        this.spriteGroup.children.iterate(sprite => {
                const posX = Math.floor(sprite.x / Globals.TILE_WIDTH);
                const posY = Math.floor(sprite.y / Globals.TILE_WIDTH);
                if (posX === row && posY === column){
                    texture = sprite.texture.key;
                }
            });
        return texture;
    }

    addKeyToInventory(color){
        const keyCellSelector = color + '-item';
        const keyCell = document.getElementById(keyCellSelector);
        keyCell.innerText = 'KEY';
    }

    removeKeyFromInventory(color){
        const keyCellSelector = color + '-item';
        const keyCell = document.getElementById(keyCellSelector);
        keyCell.innerText = '';
    }

    getSprites(textureKey){
        const allChildren = this.spriteGroup.getChildren();

        const sprites = allChildren.filter((child) => {
            return child.texture && child.texture.key.startsWith(textureKey);
        });

        return sprites;
    }

    debugWriteAllSprites(){
        //usage: g.scene.scenes[0].debugWriteAllSprites();
        this.spriteGroup.children.iterate(sprite => {
            const posX = Math.floor(sprite.x / Globals.TILE_WIDTH);
            const posY = Math.floor(sprite.y / Globals.TILE_WIDTH);
            console.log(posX + `${sprite.texture.key} at [${sprite.posX}, ${sprite.posY}]}`);
        });
    }

    setGlobalInitialPos(tileX, tileY){
        Globals.PLAYER_X = Globals.TILE_WIDTH * tileX;
        Globals.INITIAL_PLAYER_X = Globals.PLAYER_X;
        Globals.PLAYER_Y = Globals.TILE_WIDTH * tileY;
        Globals.INITIAL_PLAYER_Y = Globals.PLAYER_Y;
    }
}
