class SceneIntro extends MainScene{

    constructor(){
        super('SceneIntro');
        this.backgroundColor = 'black';

        this.nonBrickRows = [0,1,2,3,4,5,6,7,8,9,10];
        this.skullRows= [ {'row': 3.65, 'side': 'right'}, {'row': 6.15, 'side': 'right'} ];
        this.nextScene['right'] = 'Scene1';
        this.exits['right']['x'] = '8';
        this.exits['right']['y'] = '9';
        this.initialFlagY = 90;
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    preload(){
        super.preload();
        this.alphabet = new Alphabet(this);
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        const castle = this.add.sprite(6.67*Globals.TILE_WIDTH, 5*Globals.TILE_WIDTH, 'montezuma-castle');
        castle.setDepth(0);
        this.getSprites('skull').forEach(skull => skull.setDepth(-1));
        const sign = this.add.sprite(3*Globals.TILE_WIDTH,  8.8*Globals.TILE_WIDTH, 'sign');

        const flag = this.add.sprite(320 + 18, this.initialFlagY, 'flag');
        flag.speedX = 0;
        flag.speedY = 0;
        this.spriteGroup.add(flag);

        this.createDemoCaption();

        this.demoCaption.children.iterate(function (child) {
            child.setScale(0.2);
            child.setDepth(10);
        });

        const introText = this.add.sprite(160, 330, 'intro-text');
    }

    createDemoCaption(){
        if (this.demoCaption != undefined)
            return;

        this.demoCaption = this.alphabet.createCaption('mariozuma', 40, 100,0.3);
        this.alphabet.waveSinusoidally(this.demoCaption, 15);
    }

    movePlayer(time){
        super.movePlayer(time);
        const flag = this.getSprites('flag')[0];

        if (this.player.x > flag.x && flag.y == this.initialFlagY){
            this.time.delayedCall(10200, () => {
                flag.speedY = 0;
            }, [], this);
            flag.speedY=0.6;
        }
    }

    //@Overrride
    checkExit(){
         const coords = this.calculateSpriteSquare(this.player);

        const directions = ['right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);
                if (d === 'right'){
                    this.setGlobalInitialPos(1, 2);
                }
            }
        });
    }
}

class Scene1 extends MainScene{

    constructor(){
        super('Scene1'); //g.scene.scenes[0].sys.settings.key

        this.nonBrickRows = [1,2];
        this.skullRows= [ {'row': 2, 'side': 'right'} ];
        this.aztecSnakesRows = [0, 4, 9];
        this.nextScene['right'] = 'Scene2';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

}

class Scene2 extends MainScene{

    constructor(){
        super('Scene2');

        this.nonBrickRows = [1,2, 4,6, 8];

        this.skullRows= [ {'row': 2, 'side': 'right'}, {'row': 4, 'side': 'right'}
            , {'row': 2, 'side': 'right'}, {'row': 6, 'side': 'left'}
            , {'row': 6, 'side': 'left'}, {'row': 8, 'side': 'right'}
            , {'row': 8, 'side': 'right'}, {'row': 8, 'side': 'left'}
            ];

        this.aztecSnakesRows = [0, 9];

        this.nextScene['left'] = 'Scene1';
        this.nextScene['right'] = 'Scene3';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        const pictograph = this.add.sprite(12*Globals.TILE_WIDTH, 9.2*Globals.TILE_WIDTH, 'aztec-eagle');
        const pictograph2 = this.add.sprite(1*Globals.TILE_WIDTH, 9.2*Globals.TILE_WIDTH, 'aztec-eagle');
        pictograph.setDepth(10);
        pictograph2.setDepth(10);
        pictograph2.flipX = true;

        let increase = 2;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)){
                child.speedX += increase % 4;
                increase = increase + 1;
                //child.x += Globals.TILE_WIDTH*increase/3;
            }
        });
    }
}

class Scene3 extends MainScene{

    constructor(){
        super('Scene3');
        this.backgroundColor = 'black';

        this.nonBrickRows = [0,1,2,3,4,5,6,7,8,9,10];

        this.skullRows= [ {'row': 4, 'side': 'right'}, {'row': 6, 'side': 'left'} , {'row': 8, 'side': 'right'} ];
        this.snakeRows= [ {'row': 4, 'side': 'left'}, {'row': 6, 'side': 'right'} , {'row': 8, 'side': 'right'} ];

        this.nextScene['left'] = 'Scene2';
        this.nextScene['right'] = 'Scene4';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
        const lightpoint = this.add.sprite(Globals.TILE_WIDTH * 6, Globals.TILE_WIDTH*8.5, 'lightpoint1');
        lightpoint.play('flickering-light');
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        let factor = Globals.TILE_WIDTH;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)){
                child.x += factor;
                factor *= -1.6;
            }
        });
    }
}

class Scene4 extends MainScene{
    constructor(){
        super('Scene4');
        this.backgroundColor = 'black';

        this.nonBrickRows = [0,1,2,3,4,5,6,7,8,9,10];
        this.kupaRows= [ {'row': 2, 'side': 'left'} ];
        this.skullRows= [ {'row': 4, 'side': 'left'}, {'row': 5, 'side': 'right'} , {'row': 7, 'side': 'left'} ];
        this.keyRows = [ {'row': 2, 'color': 'key-green'}];

        this.nextScene['left'] = 'Scene3';
        this.nextScene['right'] = 'Scene5';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let increase = 1;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)){
                increase = increase + 0.5;
                if (!child.texture.key.startsWith('kupa'))
                    child.speedX = 1.5 +( increase/6);
                child.x += increase;
            }
        });
        this.time.delayedCall(5155, () => {
            const kupa = Array.from(this.spriteGroup.getChildren()).find(child =>
                child.texture && child.texture.key.startsWith('kupa'));

            kupa.speedY += 1;
        });
    }
}

class Scene5 extends MainScene{

    constructor(){
        super('Scene5');

        this.nonBrickRows = [1,2];
        this.nonBrickColumns = [5];

        const rowNumber = Globals.debug ? 1 : 2;
        const skullRow = {'row': rowNumber, 'side': 'right'};
        this.skullRows= [ skullRow, skullRow, skullRow, skullRow, skullRow, skullRow, skullRow, skullRow, skullRow,skullRow];

        this.bullets = [ //g.scene.scenes[4].getSprites('bullet')
            {x: 900, y: 5*Globals.TILE_WIDTH, speedX: 12},
            {x: 1200, y: 7*Globals.TILE_WIDTH, speedX: 25},
            {x: 1500, y: 8*Globals.TILE_WIDTH, speedX: 8},
            ];
        this.ladderColumns = [ {'column' : 5, 'start' : 3, 'end' : 11}];

        this.nextScene['left'] = 'Scene4';
        this.nextScene['right'] = 'Scene6';
        this.nextScene['bottom'] = 'Scene9';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
        this.exits['bottom']['x'] = '4';
        this.exits['bottom']['y'] = '10';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let increase = 1;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)){
                increase = increase + 0.25;
                child.speedX = 1.5 +( increase/6);
                child.x = 12*Globals.TILE_WIDTH - Globals.TILE_WIDTH*increase;
                child.maxX = 11*Globals.TILE_WIDTH - 6;
            }
        });

        let iter = 0;
        this.getSprites('bullet').forEach(bullet =>{
            bullet.minX -= iter;
            bullet.maxX +=800 + iter;
            bullet.speedX += Math.floor(iter/100);
            iter += 111;

            bullet.x +=400;
        });
    }
}

class Scene6 extends MainScene{

    constructor(){
        super('Scene6');

        this.nonBrickRows = [1,2, 4,6, 8];

        this.skullRows= [ {'row': 2, 'side': 'right'}, {'row': 4, 'side': 'left'}
            , {'row': 2, 'side': 'right'}, {'row': 6, 'side': 'left'}
            , {'row': 6, 'side': 'left'}, {'row': 8, 'side': 'left'}
            , {'row': 8, 'side': 'left'}, {'row': 8, 'side': 'left'}
            ];
        this.aztecSnakesRows = [0, 9];
        this.bullets = [ //g.scene.scenes[4].getSprites('bullet')
                    {x: 900, y: 1*Globals.TILE_WIDTH, speedX: 12},
                    {x: 1200, y: 3*Globals.TILE_WIDTH, speedX: 25},
                    ];

        this.nextScene['left'] = 'Scene5';
        this.nextScene['right'] = 'Scene7';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let increase = 2;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child) && !child.texture.key.startsWith('snake')){
                child.speedX += increase % 4;
                increase = increase + 1;
                //child.x += Globals.TILE_WIDTH*increase/3;
            }
        });
        let iter = 0;
        this.getSprites('bullet').forEach(bullet =>{
            bullet.minX -= iter;
            bullet.maxX +=800 + iter;
            bullet.speedX += Math.floor(iter/100);
            iter += 111;

            bullet.x +=400;
        });
    }
}

class Scene7 extends MainScene{

    constructor(){
        super('Scene7');

        this.nonBrickRows = [1,2];
        this.skullRows= [ {'row': 2, 'side': 'right'} ];
        this.doorTiles = [ {'tileX' : 4, 'tileY': 1.6, 'color': 'door-green' }];
        this.keyRows = [ {'row': 2, 'color': 'key-red'}];
        this.aztecSnakesRows = [0];
        this.nextScene['left'] = 'Scene6';
        this.nextScene['right'] = 'Scene8';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let emptyCells = [[1,4], [1,5], [1,6], [1,7], [1,8], [2,8]
            ,[4,8],[5,8],[6,8],[6,7],[6,6],[6,5],[6,4],[5,4],[4,4],[4,5],[4,6],[4,7]
            ,[8,8],[9,8],[10,7],[10,6],[10,5],[9,4],[8,4],[8,5],[8,6],[8,7]
            ,[12,4], [12,5], [12,6], [12,7], [12,8], [13,8], [13,6], [13,4]];

        emptyCells.forEach(cell => {
            cell[0] *= Globals.TILE_WIDTH;
            cell[1] *= Globals.TILE_WIDTH;
        });

        this.spriteGroup.children.iterate(sprite => {
            if (sprite.texture.key === 'brick'){
                const isEmpty = emptyCells.some(cell => cell[0] === sprite.x && cell[1] === sprite.y);
                if (isEmpty) {
                    sprite.setTexture('ladder');
                }
            }
        });
    }
}

class Scene8 extends MainScene{

    constructor(){
        super('Scene8');

        this.nonBrickRows = [1,2,5,6,7,8,9,10];
        this.skullRows= [ {'row': 2, 'side': 'right'} ];
        this.keyRows = [ {'row': 2, 'color': 'key-blue'}
        ];
        this.aztecSnakesRows = [0];
        this.nextScene['left'] = 'Scene7';
        //no passage to 'Scene9';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        const fireAnimation = this.add.sprite(6*Globals.TILE_WIDTH + 13, 7*Globals.TILE_WIDTH, 'fire1');
        fireAnimation.play('fire');
        const xs = [0,1, 12, 13];
        for(let y = 5; y < 11; y++){
            xs.forEach(x => this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick'));
        }

    }
}

class Scene9 extends MainScene{

    constructor(){
        super('Scene9');

        this.nonBrickRows = [0,1,2, 4,5,6,7, 8,9,10];

        this.skullRows= [ {'row': 2, 'side': 'right'} ];

        this.snakeRows= [ {'row': 2, 'side': 'left'}  ];
        this.keyRows = [ {'row': 2, 'color': 'key-blue'}  ];

        this.ladderColumns = [ {'column' : 2, 'start' : 0, 'end' : 1}, {'column' : 12, 'start' : 0, 'end' : 1}];

        this.nextScene['right'] = 'Scene10';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        const fireAnimation = this.add.sprite(6*Globals.TILE_WIDTH + 13, 6.5*Globals.TILE_WIDTH, 'fire1');
        fireAnimation.play('fire');
        const xs = [0,1, 12, 13];
        for(let y = 4; y < 11; y++){
            xs.forEach(x => this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick'));
        }
    }
}

class Scene10 extends MainScene{

    constructor(){
        super('Scene10');

        this.nonBrickRows = [1,2, 4,6, 8,9,10];

        this.skullRows= [ {'row': 4, 'side': 'right'}
            , {'row': 6, 'side': 'right'}
            , {'row': 6, 'side': 'left'}, {'row': 6, 'side': 'right'}
            , {'row': 4, 'side': 'left'}, {'row': 6, 'side': 'right'}
            ];

        this.snakeRows= [ {'row': 4, 'side': 'right'}
        ];
        this.conveyors= [ {'coveredCells' : [1,9], 'rowX' : 5, 'rowY' : 5}];

        this.doorTiles = [ {'tileX' : 6, 'tileY': 1.6, 'color': 'door-red' },{'tileX' : 9, 'tileY': 1.6, 'color': 'door-blue' }, ];

        this.nextScene['left'] = 'Scene9';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
        this.nextScene['right'] = 'Scene11';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let increase = 6;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child) && !child.texture.key.startsWith('snake')){
                child.speedX += increase;
                increase = increase + 1;
                //child.x += Globals.TILE_WIDTH*increase/3;
            }
        });

        const fireAnimation = this.add.sprite(6*Globals.TILE_WIDTH + 13, 10.5*Globals.TILE_WIDTH, 'fire1');
        fireAnimation.play('fire');
        const xs = [0,1, 12, 13];
        for(let y = 7; y < 11; y++){
            xs.forEach(x => this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick'));
        }
    }
}

class Scene11 extends MainScene{

    constructor(){
        super('Scene11');

        this.nonBrickRows = [1,2, 4,5,6,7, 8,9,10];

        this.kupaRows= [ {'row': 2, 'side': 'left'}, {'row': 2, 'side': 'right'} ];

        this.aztecEagleRows = [0];
        this.nextScene['left'] = 'Scene10';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';

        this.nextScene['right'] = 'Scene12';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        const fireAnimation = this.add.sprite(6*Globals.TILE_WIDTH + 13, 6.5*Globals.TILE_WIDTH, 'fire1');
        fireAnimation.play('fire');
        const xs = [0,1, 12, 13];
        for(let y = 4; y < 11; y++){
            xs.forEach(x => this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick'));
        }
    }

    //@Overrride
    checkExit(){
         const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12, 2);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1.5, 8);                }
            }
        });
    }
}

class Scene12 extends MainScene{

    constructor(){
        super('Scene12'); //g.scene.scenes[0].sys.settings.key

        this.nonBrickRows = [8];
        this.aztecEagleRows = [0];
        this.nextScene['left'] = 'Scene11';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '8';

        this.nextScene['right'] = 'Scene13';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '8';

        this.conveyors= [ {'coveredCells' : [1,9], 'rowX' : 3.2, 'rowY' : 9}, {'coveredCells' : [1,9], 'rowX' : 11.8, 'rowY' : 9}];
    }

    create(){
        super.create();
        this.createSpriteGroup();
        this.playerCanJump = false;
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        const spriteData = [
            { x: 3 * Globals.TILE_WIDTH, y: 6.2 * Globals.TILE_WIDTH, texture: 'aztec-eagle', flipX: true },
            { x: 9 * Globals.TILE_WIDTH, y: 6.2 * Globals.TILE_WIDTH, texture: 'aztec-eagle', flipX: false },
            { x: 3 * Globals.TILE_WIDTH, y: 2 * Globals.TILE_WIDTH, texture: 'aztec-snake', flipX: true },
            { x: 9 * Globals.TILE_WIDTH, y: 2 * Globals.TILE_WIDTH, texture: 'aztec-snake', flipX: false },
            { x: 6 * Globals.TILE_WIDTH, y: 4.1 * Globals.TILE_WIDTH, texture: 'aztec-calendar', flipX: false }
        ];

        spriteData.forEach(data => {
            const sprite = this.add.sprite(data.x, data.y, data.texture);
            sprite.setDepth(10);
            if (data.flipX) {
                sprite.setFlipX(true);
            }
        });
    }

    update(time, delta){
        super.update(time, delta);
        this.player.x -= 1;
    }

    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12,2);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1,9);
                }
            }
        });
    }
}

class Scene13 extends MainScene{

    constructor(){
        super('Scene13');

        this.nonBrickRows = [0, 1,2, 3, 4,5,6, 8,9];
        this.skullRows= Globals.skullSwarm;

        this.doorTiles = [ {'tileX' : 4, 'tileY': 8.6, 'color': 'door-blue' }];

        this.nextScene['left'] = 'Scene12';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '9';

        this.nextScene['right'] = 'Scene14';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '9';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let increase = 1;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)){
                child.speedX += increase;
                increase = (increase + 1)%7;
                //child.x += Globals.TILE_WIDTH*increase/3;
            }
        });

        this.add.sprite(6.75*Globals.TILE_WIDTH, 3.34*Globals.TILE_WIDTH, 'skull-pile');
    }

    //@Overrride
    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12,8);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1,9);
                }
            }
        });
    }
}

class Scene14 extends MainScene{

    constructor(){
        super('Scene14');

        this.nonBrickRows = [0, 1,2, 3, 4,5,6, 8,9];
        this.skullRows= Globals.skullSwarm;
        this.kupaRows= [ {'row': 9, 'side': 'left'}, {'row': 9, 'side': 'right'},{'row': 9, 'side': 'left'}, {'row': 9, 'side': 'right'} ];

        this.nextScene['left'] = 'Scene13';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '9 ';

        this.nextScene['right'] = 'Scene15';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '9';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let increase = 1;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)){
                if (child.texture.key.startsWith('kupa')){
                    child.x += increase*Globals.TILE_WIDTH;
                    child.speedX = Math.cos(Math.PI*increase);
                } else
                    child.speedX += increase;
                increase = (increase + 1)%7;
                //child.x += Globals.TILE_WIDTH*increase/3;
            }
        });

        this.add.sprite(6.75*Globals.TILE_WIDTH, 3.34*Globals.TILE_WIDTH, 'skull-pile');
    }

    //@Overrride
    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12, 9);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1, 9);
                }
            }
        });
    }
}

class Scene15 extends MainScene{

    constructor(){
        super('Scene15'); //g.scene.scenes[14].scene.key

        this.nonBrickRows = [0,1,2,3,4,5,6,8,9];
        this.skullRows= [ {'row': 9, 'side': 'right'} ];
        this.snakeRows= [ {'row': 9, 'side': 'right'} ];
        this.ladderColumns = [ {'column' : 13, 'start' : 0, 'end' : 9}];
        this.keyRows = [ {'row': 9, 'color': 'key-blue'}];

        this.nextScene['left'] = 'Scene14';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '9 ';

        this.nextScene['top'] = 'Scene16';
        this.exits['top']['x'] = '12';
        this.exits['top']['y'] = '0';//g.scene.scenes[14].calculateSpriteSquare(g.scene.scenes[14].player)
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        const fireAnimation = this.add.sprite(6*Globals.TILE_WIDTH + 13, 3.5*Globals.TILE_WIDTH, 'fire1');
        fireAnimation.play('fire');
        const xs = [0,1, 12];
        for(let y = 0; y < 8; y++){
             xs.forEach(x => {
                const b = this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick');
                b.setDepth(10);
             });
        }

    }

    //@Overrride
    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['top', 'bottom'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'top'){
                    Globals.PLAYER_X = 776; //to allow climbing the ladder
                    Globals.INITIAL_PLAYER_X = Globals.PLAYER_X;
                    Globals.PLAYER_Y = Globals.TILE_WIDTH * 9;
                    Globals.INITIAL_PLAYER_Y = Globals.PLAYER_Y;
                }
                else if (d === 'bottom'){
                    this.setGlobalInitialPos(12, 1);
                }
            }
        });
    }
}

class Scene16 extends MainScene{ //g.scene.scenes[14].scene.key

    constructor(){
        super('Scene16');

        this.nonBrickRows = [1,2,4,5,6,7,8,9,10];
        this.ladderColumns = [ {'column' : 13, 'start' : 3, 'end' : 9}];
        this.skullRows= [ {'row': 2, 'side': 'right'},{'row': 2, 'side': 'right'},{'row': 2, 'side': 'right'} ];
        this.aztecMonkeyRows = [0];

        this.nextScene['left'] = 'Scene17';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        const childrenArray = this.spriteGroup.getChildren();
        const skull1 = childrenArray.find(child =>
            child.texture && child.texture.key && child.texture.key.startsWith('skull')
        );

        skull1.speedX = 0;
        skull1.x = Globals.TILE_WIDTH * 12;
        skull1.y = Globals.TILE_WIDTH * 9;

        const fireAnimation = this.add.sprite(6*Globals.TILE_WIDTH + 13, 6.5*Globals.TILE_WIDTH, 'fire1');
        fireAnimation.play('fire');
        const xs = [0,1, 12];
        for(let y = 4; y < 11; y++){
             xs.forEach(x => {
                const b = this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick');
                b.setDepth(10);
             });
        }

    }
    //@Overrride
    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12, 2);
                }
            }
        });
    }
}

class Scene17 extends MainScene{

    constructor(){
        super('Scene17');
        this.backgroundColor = 'black';

        this.nonBrickRows = [0,1,2,3,4,5,6,7,8,9,10];

        this.snakeRows= [ {'row': 2, 'side': 'right'}, {'row': 5, 'side': 'right'} , {'row': 6, 'side': 'left'}
            , {'row': 7, 'side': 'left'} , {'row': 8, 'side': 'left'} , {'row': 9, 'side': 'left'} ];

        this.nextScene['left'] = 'Scene18';
        this.nextScene['right'] = 'Scene16';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }
}

class Scene18 extends MainScene{

    constructor(){
        super('Scene18');
        this.backgroundColor = 'black';

        this.nonBrickRows = [1,2,4,5,6,7,8,9,10];

        this.snakeRows= [ {'row': 4, 'side': 'left'}, {'row': 4, 'side': 'right'} , {'row': 8, 'side': 'right'}
            , {'row': 8, 'side': 'left'} , {'row': 2, 'side': 'left'}];

        this.aztecMonkeyRows = [0];
        this.nextScene['left'] = 'Scene19';
        this.nextScene['right'] = 'Scene17';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        const graphics = this.add.graphics();
        graphics.fillStyle(0x880015, 1);
        graphics.fillRect(0, 0, 800, 3*Globals.TILE_WIDTH);

        const createLightPoint = (x, y, texture='lightpoint1') => {
            const sprite = this.add.sprite(x, y, texture);
            sprite.play('flickering-light');
            return sprite;
        };

        const lightPointsPositions = [
            { x: Globals.TILE_WIDTH * 2, y: Globals.TILE_WIDTH * 8.5 },
            { x: Globals.TILE_WIDTH * 12, y: Globals.TILE_WIDTH * 8.5 },
            { x: Globals.TILE_WIDTH * 5.6, y: Globals.TILE_WIDTH * 6.5 },
            { x: Globals.TILE_WIDTH * 6.5, y: Globals.TILE_WIDTH * 4.5 },
        ];

        const lightPoints = lightPointsPositions.map(pos => createLightPoint.call(this, pos.x, pos.y));

        const getSnakesAtRow = (row) => {
            return this.getSprites('snake').filter(s => Math.round(s.y / Globals.TILE_WIDTH) === row);
        };

        const bottomSnakes = getSnakesAtRow(8);
        const bottomConfigs = [
            {
                index: 0,
                x: 2 * Globals.TILE_WIDTH,
                speedX: 0.1,
                minX: Globals.TILE_WIDTH,
                maxX: 4 * Globals.TILE_WIDTH,
            },
            {
                index: 1,
                x: 10 * Globals.TILE_WIDTH,
                speedX: 0.2,
                minX: 9 * Globals.TILE_WIDTH,
                maxX: 12 * Globals.TILE_WIDTH,
            },
        ];

        bottomConfigs.forEach(config => {
            const snake = bottomSnakes[config.index];
            snake.x = config.x;
            snake.speedX = config.speedX;
            snake.minX = config.minX;
            snake.maxX = config.maxX;
        });

        const midSnakes = getSnakesAtRow(4);
        const midConfigs = [
            {
                index: 0,
                minX: 4 * Globals.TILE_WIDTH,
                maxX: 9 * Globals.TILE_WIDTH,
            },
            {
                index: 1,
                x: 6 * Globals.TILE_WIDTH,
                minX: 4 * Globals.TILE_WIDTH,
                maxX: 9 * Globals.TILE_WIDTH,
            },
        ];

        midConfigs.forEach(config => {
            const snake = midSnakes[config.index];
            if (config.x !== undefined) snake.x = config.x;
            snake.minX = config.minX;
            snake.maxX = config.maxX;
        });
    }
}

class Scene19 extends MainScene{

    constructor(){
        super('Scene19');

        this.nonBrickRows = [1,2,5,6,7,8,9,10];
        this.skullRows= [ {'row': 2, 'side': 'right'} ];
        this.aztecMonkeyRows = [0];
        this.nextScene['right'] = 'Scene18';
        this.nextScene['left'] = 'Scene20';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        const lodeRunnerAnimation = this.add.sprite(6.25*Globals.TILE_WIDTH + 13, 7.5*Globals.TILE_WIDTH, 'lode-runner1');
        lodeRunnerAnimation.setScale(1.1);
        lodeRunnerAnimation.play('lode-runner');
        const xs = [0,1, 12, 13];
        for(let y = 5; y < 11; y++){
            xs.forEach(x => this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick'));
        }
    }
}

class Scene20 extends MainScene{

    constructor(){
        super('Scene20');

        this.nonBrickRows = [ 1,2,  4,5,6, 7,8,9,10];
        this.skullRows= Globals.skullSwarm;

        this.doorTiles = [ {'tileX' : 4, 'tileY': 1.55, 'color': 'door-blue' }];
        this.aztecMonkeyRows = [0];

        this.nextScene['left'] = 'Scene21';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';

        this.nextScene['right'] = 'Scene19';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let increase = 1;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)){
                child.speedX += increase;
                increase = (increase + 1)%7;
                //child.x += Globals.TILE_WIDTH*increase/3;
            }
        });

        this.add.sprite(6.75*Globals.TILE_WIDTH, 7*Globals.TILE_WIDTH, 'skull-pile');
    }

    //@Overrride
    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12, 2);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1,2);
                }
            }
        });
    }
}

class Scene21 extends MainScene{

    constructor(){
        super('Scene21');

        this.nonBrickRows = [ 1,2,  4,5,6, 7,8,9,10];
        this.skullRows= Globals.skullSwarm;
        this.keyRows = [ {'row': 2, 'color': 'key-red'}];
        this.aztecMonkeyRows = [0];

        this.nextScene['left'] = 'Scene22';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';

        this.nextScene['right'] = 'Scene20';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let increase = 1;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)){
                child.speedX += increase;
                increase = (increase + 1)%7;
                //child.x += Globals.TILE_WIDTH*increase/3;
            }
        });

        this.add.sprite(6.75*Globals.TILE_WIDTH, 7*Globals.TILE_WIDTH, 'skull-pile');
    }

    //@Overrride
    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12, 2);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1,2);
                }
            }
        });
    }
}

class Scene22 extends MainScene{

    constructor(){
        super('Scene22');

        this.nonBrickRows = [1,2, 4,5,6,7, 8,9,10];

        this.kupaRows= [ {'row': 2, 'side': 'left'}, {'row': 2, 'side': 'right'} ];
        this.aztecMonkeyRows = [0];

        this.nextScene['left'] = 'Scene23';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';

        this.nextScene['right'] = 'Scene21';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        const fireAnimation = this.add.sprite(6*Globals.TILE_WIDTH + 13, 6.5*Globals.TILE_WIDTH, 'fire1');
        fireAnimation.play('fire');
        const xs = [0,1, 12, 13];
        for(let y = 4; y < 11; y++){
            xs.forEach(x => this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick'));
        }

        let pipe = this.add.sprite(61, 440 -Globals.TILE_WIDTH, 'pipe-down');
        pipe.setDepth(10)
    }

    //@Overrride
    checkExit(){
         const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(0.5, 9);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1,2);
                }
            }
        });
    }
}

class Scene23 extends MainScene{

    constructor(){
        super('Scene23');

        this.nonBrickRows = [0,1,2, 3,4,5,6, 8,9];
        this.keyRows = [ {'row': 8, 'color': 'key-green'}];

        this.nextScene['left'] = 'Scene23';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';

        this.nextScene['right'] = 'Scene24';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '9';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        const fireAnimation = this.add.sprite(6*Globals.TILE_WIDTH + 13, 3.5*Globals.TILE_WIDTH, 'fire1');
        fireAnimation.play('fire');
        const xs = [0,1, 12, 13];
        for(let y = 0; y < 7; y++){
            xs.forEach(x => this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick'));
        }

        let pipe = this.add.sprite(738, 800, 'pipe-down');
        pipe.setFlipX(true);
        pipe.setDepth(10)
        let pipeLeft = this.add.sprite(-3, 235, 'pipe-down');
        pipeLeft.setFlipX(true);
        pipeLeft.setDepth(10)
    }

    //@Overrride
    checkExit(){
         const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12, 2);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(12, 9);
                }
            }
        });
    }
}

class Scene24 extends MainScene{ //multiple pipes to multiple floors

    constructor(){
        super('Scene24');

        this.nonBrickRows = [1,2, 4,6, 8,9];
        this.keyRows = [ {'row': 6, 'color': 'key-blue'}];

        this.skullRows= [ {'row': 2, 'side': 'right'}, {'row': 4, 'side': 'right'}
            , {'row': 2, 'side': 'right'}, {'row': 6, 'side': 'left'}
            , {'row': 6, 'side': 'left'}, {'row': 9, 'side': 'left'}
            , {'row': 8, 'side': 'right'}, {'row': 9, 'side': 'left'}
            ];

        this.conveyors= [ {'coveredCells' : [1,9], 'rowX' : 5, 'rowY' : 7}];

        this.nextScene['left'] = 'Scene26';
        this.nextScene['right'] = 'Scene25';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '9';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '9';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let increase = 2;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)){
                child.speedX += increase % 4;
                increase = increase + 1;
                //child.x += Globals.TILE_WIDTH*increase/3;
            }
        });

    let pipeLeft = this.add.sprite(-3, 235-4*Globals.TILE_WIDTH, 'pipe-down');
    pipeLeft.setFlipX(true);
    pipeLeft.setDepth(10)
    let pipeMid = this.add.sprite(5.5*Globals.TILE_WIDTH, 235-2*Globals.TILE_WIDTH, 'pipe-down');
    pipeMid.setFlipX(true);
    pipeMid.setDepth(10)
    let pipeRight = this.add.sprite(12*Globals.TILE_WIDTH, 235, 'pipe-down');
    pipeLeft.setFlipX(true);
    pipeRight.setDepth(10)
    }

    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12,2);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1,9);
                }
            }
        });
    }
}

class Scene25 extends MainScene{

    constructor(){
        super('Scene25');

        this.nonBrickRows = [1,2, 4,6, 8,9];
        this.keyRows = [ {'row': 6, 'color': 'key-blue'}];

        this.doorTiles = [ {'tileX' : 13, 'tileY': 8.7, 'color': 'door-blue' }];

        this.kupaRows= [ {'row': 2, 'side': 'right'}, {'row': 4, 'side': 'left'}
            , {'row': 2, 'side': 'right'}, {'row': 6, 'side': 'left'}
            , {'row': 6, 'side': 'left'}, {'row': 9, 'side': 'left'}
            , {'row': 9, 'side': 'left'}
            ];
        this.bullets = [ //g.scene.scenes[4].getSprites('bullet')
                    {x: 900, y: 1*Globals.TILE_WIDTH, speedX: 12},
                    {x: 1200, y: 3*Globals.TILE_WIDTH, speedX: 25},
                    ];

        this.nextScene['left'] = 'Scene24';
        this.nextScene['right'] = 'SceneKamikaze';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '9';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '9';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let increase = 2;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child) && !child.texture.key.startsWith('snake')){
                child.speedX += increase % 4;
                increase = increase + 1;
                //child.x += Globals.TILE_WIDTH*increase/3;
            }
        });
        let iter = 0;
        this.getSprites('bullet').forEach(bullet =>{
            bullet.minX -= iter;
            bullet.maxX +=800 + iter;
            bullet.speedX += Math.floor(iter/100);
            iter += 111;

            bullet.x +=400;
        });
    }

    //@Overrride
    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12, 9);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1, 2);
                }
            }
        });
    }
}

class Scene26 extends MainScene{

    constructor(){
        super('Scene26');
        this.backgroundColor = 'black';

        this.nonBrickRows = [1,2,3, 4,5,6,7, 8,9,10];

        this.nextScene['left'] = 'Scene27';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';

        this.nextScene['right'] = 'Scene24';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        const fireAnimation = this.add.sprite(6*Globals.TILE_WIDTH + 13, 6.5*Globals.TILE_WIDTH, 'fire1');
        fireAnimation.play('fire');
        const xs = [0,1, 12, 13];
        for(let y = 3; y < 11; y++){
            xs.forEach(x =>
                {
                    const brick = this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick');
                    this.spriteGroup.add(brick);
                });
        }

        const fireEdgeHiding = this.add.sprite(7*Globals.TILE_WIDTH - 20, 2.5*Globals.TILE_WIDTH, 'black-strip');

        const brickBridgeX = [3.5 ,4, 6.5,7, 9.7, 10];
        brickBridgeX.forEach(x =>{
            const brick = this.add.sprite(x*Globals.TILE_WIDTH, 3*Globals.TILE_WIDTH, 'brick');
            this.spriteGroup.add(brick);
        });
    }

    movePlayer(time){
        super.movePlayer(time);

        const playerTile = this.calculateSpriteSquare(this.player);
        const playerTileY = playerTile[1];
        if (playerTileY >= 2 && this.getTextureAt(playerTile[0], playerTileY + 1) != 'brick'){
            this.player.y += 5;
            if (this.player.y > 550){
                this.player.setTexture('smoke-cloud');
                    this.player.y -= 6;
                    this.player.x -= 1;
                    this.time.delayedCall(1256, () => {
                        this.scene.start('Scene26');
                    });
                }
        }

    }
    //@Overrride
    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12, 8);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1, 9);
                }
            }
        });
    }
}

class SceneKamikaze extends MainScene{

    constructor(){
        super('SceneKamikaze');
        this.backgroundColor = 'black';

        this.nonBrickRows = [0, 1,2,3, 4,5,6,7, 8,9,10];
        this.doorTiles = [ {'tileX' : 12.69, 'tileY': 7.6, 'color': 'door-green' }];
        this.keyRows = [ {'row': 1, 'color': 'key-blue'}];

        this.nextScene['right'] = 'SceneMontezuma';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '8';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        this.kupas = [];

        const fireAnimation = this.add.sprite(6.5*Globals.TILE_WIDTH + 13, 9.5*Globals.TILE_WIDTH, 'fire1');
        fireAnimation.setScale(1.3);
        fireAnimation.play('fire');
        const xs = [0,1, 12, 13];
        for(let y = 9; y < 11; y++){
            xs.forEach(x =>
                {
                    const brick = this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick');
                    this.spriteGroup.add(brick);
                });
        }

        const fireEdgeHiding = this.add.sprite(7*Globals.TILE_WIDTH - 20, 4.25*Globals.TILE_WIDTH, 'black-strip');
        fireEdgeHiding.setScale(1.5);

        const pipe1 = this.add.sprite(Globals.TILE_WIDTH, 3.86 * Globals.TILE_WIDTH, 'pipe-short');
        pipe1.setDepth(10);
        pipe1.scaleY = 0.75;

        const pipeLocationsX = [2.5, 5, 8.5, 11.3];

        pipeLocationsX.forEach(x => {
            const pipe = this.add.sprite(x * Globals.TILE_WIDTH, 3.27 * Globals.TILE_WIDTH, 'pipe-short');
            pipe.setDepth(10);
            const kupa = this.add.sprite(x * Globals.TILE_WIDTH, 0.5*Globals.TILE_WIDTH, 'kupa1');
            kupa.speedY = 0;
            kupa.scaleX = 0.8;
            this.kupas.push(kupa);
        });

        const brickBridgeX = [3.5 ,4, 6.5,7, 9.7, 10];
        brickBridgeX.forEach(x =>{
            const brick = this.add.sprite(x*Globals.TILE_WIDTH, 9*Globals.TILE_WIDTH, 'brick');
            this.spriteGroup.add(brick);
        });

        const doorList = this.getSprites('door');
        if (doorList.length > 0)
            doorList[0].setDepth(11);
    }

    walkPlayer(left){
        super.walkPlayer(left);
        const fallingSpeed = 7;

        const xMinMax = {0: [1.4, 5], 1: [4.5, 7], 2: [10,11], 3:[11,12]}

        const key = this.getSprites('key-')[0];

        for (const [index, [min, max]] of Object.entries(xMinMax)) {
            const minX = min * Globals.TILE_WIDTH;
            const maxX = max * Globals.TILE_WIDTH;

            if (this.player.x > minX && this.player.x < maxX) {
                if (this.kupas && this.kupas[index]) {
                    this.kupas[index].speedY = fallingSpeed;
                }

                if (key) {
                    if (parseInt(index) === 1 && key.y <= 8 * Globals.TILE_WIDTH) {
                        key.speedY = fallingSpeed;
                    } else if (key.y > 8 * Globals.TILE_WIDTH) {
                        key.speedY = 0;
                    }
                }
            }
        }
    }

    update(time,delta){
        super.update(time,delta);
        for(let i = 0; i < this.kupas.length; i++){
            this.kupas[i].y += this.kupas[i].speedY;
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.kupas[i].x, this.kupas[i].y);
            if (distance < 3*Globals.TILE_WIDTH/4) {
                this.scene.restart();
            }
        }

        const key = this.getSprites('key-')[0];
        if (key !=null) key.y += this.kupas[1].speedY;

    }

    movePlayer(time){
        super.movePlayer(time);

        const playerTile = this.calculateSpriteSquare(this.player);
        const playerTileY = playerTile[1];
        if (playerTileY >= 2 && this.getTextureAt(playerTile[0], playerTileY + 1) != 'brick'){
            this.player.y += 5;
            if (this.player.y > 550){
                this.player.setTexture('smoke-cloud');
                    this.player.y -= 6;
                    this.player.x -= 1;
                    this.time.delayedCall(1256, () => {
                        this.scene.start('SceneKamikaze');
                    });
                }
        }

    }
    //@Overrride
    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12, 8);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1, 9);                }
            }
        });
    }
}

class Scene27 extends MainScene{

    constructor(){
        super('Scene27'); //g.scene.scenes[0].sys.settings.key
        this.keyRows = [ {'row': 8, 'color': 'key-blue'}];
        this.nonBrickRows = [8];
        //this.nonBrickRows = [0,1,2,3,4,5,6,7,8,9,10,11];

        this.nextScene['right'] = 'Scene26';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '8';
        //no left exit
        this.conveyors= [ {'coveredCells' : [1,9], 'rowX' : 3.2, 'rowY' : 9}, {'coveredCells' : [1,9], 'rowX' : 11.8, 'rowY' : 9}];
    }

    create(){
        super.create();
        this.createSpriteGroup();
        this.playerCanJump = false;
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        const sprite = this.add.sprite(2.2*Globals.TILE_WIDTH, 2.2*Globals.TILE_WIDTH, 'aztec-calendar');
        sprite.setDepth(10);
    }

    update(time, delta){
        super.update(time, delta);
        if (this.player.x > 3)
            this.player.x -= 1;
    }

    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12,2);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1,2);
                }
            }
        });
    }
}

class SceneMontezuma extends MainScene{

    constructor(){
        super('SceneMontezuma');

        this.nonBrickRows = [0, 1,2, 3, 4,5,6, 8,9,];

        this.bullets = [ //g.scene.scenes[4].getSprites('bullet')
                    {x: 300, y: 9*Globals.TILE_WIDTH, speedX: 7},
                    {x: 1600, y: 8*Globals.TILE_WIDTH, speedX: 12},
                    ];
        this.nextScene['left'] = 'SceneKamikaze';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '9 ';

        this.nextScene['right'] = 'SceneCages';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '9';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        const montezuma = this.add.sprite(6.75*Globals.TILE_WIDTH, 3.35*Globals.TILE_WIDTH, 'montezuma');

        let oldSpeed = 55;
        this.getSprites('bullet').forEach(bullet =>{
            bullet.minX -= 2*oldSpeed;
            bullet.maxX +=800 + oldSpeed;
            bullet.speedX += oldSpeed/11;
            oldSpeed = bullet.speedX;

            bullet.x +=400;
        });
    }

    //@Overrride
    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12,8);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1,9);
                }
            }
        });
    }
}


class SceneCages extends MainScene{

    constructor(){
        super('SceneCages');

        this.nonBrickRows = [5,6,8,9];

        this.doorTiles = [ {'tileX' : 4.8, 'tileY': 5.6, 'color': 'door-red' }
            , {'tileX' : 7.2, 'tileY': 5.6, 'color': 'door-blue' }];

        const rowNumber = Globals.debug ? 8 : 9;
        const skullRow = {'row': rowNumber, 'side': 'right'};
        this.skullRows= [ skullRow, skullRow, skullRow, skullRow, skullRow, skullRow, skullRow, skullRow, skullRow
            , skullRow, skullRow, skullRow, skullRow, skullRow, skullRow, skullRow, skullRow, skullRow, skullRow
            , skullRow, skullRow, skullRow, skullRow];

        this.bullets = [ //g.scene.scenes[4].getSprites('bullet')
            {x: 900, y: 1*Globals.TILE_WIDTH, speedX: 50},
            {x: 900, y: 2*Globals.TILE_WIDTH, speedX: 45},
            {x: 900, y: 3*Globals.TILE_WIDTH, speedX: 33},
            {x: 900, y: 4*Globals.TILE_WIDTH, speedX: 22},
            {x: 900, y: 0, speedX: 18},
            {x: 1200, y: 7*Globals.TILE_WIDTH, speedX: 25},
            {x: 1500, y: 8*Globals.TILE_WIDTH, speedX: 8},
            {x: 1500, y: 9*Globals.TILE_WIDTH, speedX: 4},
            ];

        this.nextScene['left'] = 'SceneMontezuma';
        this.nextScene['right'] = 'SceneTreasure';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '9';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '9';
        
        this.princess;
        this.princessCage;
        this.princessSpeechBubble;
        this.panamaJoe;
        this.panamaJoeCage;
        this.panamaJoeSpeechBubble;
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        let increase = 1;
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)){
                increase = increase + 0.05;
                child.speedX = 1.5 +( increase/6);
                child.x = 12*Globals.TILE_WIDTH - Globals.TILE_WIDTH*increase;
                child.maxX = 11*Globals.TILE_WIDTH - 6;
            }
        });

        this.princess = this.add.sprite(3*Globals.TILE_WIDTH, 5.5 * Globals.TILE_WIDTH +12, 'princess');
        this.princessCage = this.add.sprite(3*Globals.TILE_WIDTH, 5.5 * Globals.TILE_WIDTH +12, 'cage');
        this.princessSpeechBubble =  this.add.sprite(4*Globals.TILE_WIDTH, 4.5 * Globals.TILE_WIDTH, 'speech-bubble');
        this.princessSpeechBubble.setDepth(12);
        this.panamaJoe = this.add.sprite(9*Globals.TILE_WIDTH, 5.5 * Globals.TILE_WIDTH +12, 'panama-joe');
        this.panamaJoeCage = this.add.sprite(9*Globals.TILE_WIDTH, 5.5 * Globals.TILE_WIDTH +12, 'cage');
        this.panamaJoeSpeechBubble =  this.add.sprite(9.5*Globals.TILE_WIDTH, 4.5 * Globals.TILE_WIDTH, 'speech-bubble');
        this.panamaJoeSpeechBubble.setDepth(12);

        this.princessSpeechBubble.play('speech-bubble');
        this.panamaJoeSpeechBubble.play('speech-bubble');
        this.panamaJoeSpeechBubble.anims.timeScale = 2;

        let iter = 0;
        this.getSprites('bullet').forEach(bullet =>{
            bullet.minX -= iter;
            bullet.maxX +=800 + iter;

            bullet.x +=400;
        });
    }

    update(time, delta) {
        super.update(time, delta);

        if(this.princessCage.y > 1000 && this.panamaJoeCage.y > 1000)
            this.time.delayedCall(3456, () => {
                this.scene.start('SceneTreasure');
            });

        else if (this.player.y < Globals.TILE_WIDTH * 7)
            this.time.delayedCall(15456, () => {
                this.scene.start('SceneTreasure');
            });
    }

    //@Override
    checkEnemyCollision() {
        super.checkEnemyCollision();
        
        const cageBubbleSelectorQuartet = [[this.princessCage, this.princessSpeechBubble, "princess", '../common/pics/princess']
            , [this.panamaJoeCage,this.panamaJoeSpeechBubble, "joe-panama", 'files/background/panamaJoe']];

        cageBubbleSelectorQuartet.forEach(quartet => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, quartet[0].x, quartet[0].y);
            if (distance < Globals.TILE_WIDTH){
                quartet[0].y += 2000;
                quartet[1].anims.stop();
                quartet[1].setTexture('thank-you');
                const tdElement = document.getElementById(quartet[2]);
                tdElement.innerHTML = '<img src="'+ quartet[3] + '.png" style="width:35%;">';
            }
        });
    }

    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(6, 9);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1, 9);
                }
            }
        });
    }
}


class SceneTreasure extends MainScene{

    constructor(){
        super('SceneTreasure');

        this.nonBrickRows = [0,1,2,3, 4,5,6, 7,8,9];
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();
        this.add.sprite(6.75*Globals.TILE_WIDTH, 7*Globals.TILE_WIDTH, 'treasure');

        const princessSavedCell = document.getElementById('princess');
        const panamaJoeSavedCell = document.getElementById('joe-panama');
        if (princessSavedCell.innerHTML == '' && panamaJoeSavedCell.innerHTML == '')
            this.proposeRescueMission();
        else
            this.finalTriumph();
    }

    proposeRescueMission(){
        this.time.delayedCall(3456, () => {
            alert("CONGRATULATIONS! You found Montezuma's gold!");
            if (confirm("Do you want to return to previous room and save Panama Joe and the Princess?")){

                this.setGlobalInitialPos(6,6);
                this.scene.start('SceneCages');
            }
            else {
                alert("You keep all the GOLD for YOURSELF! You are selfish and ... rich !");
                alert("GAME OVER! YOU WIN!");
                location.reload();
            }

        });
    }

    finalTriumph(){
        const princessSavedCell = document.getElementById('princess');
        const panamaJoeSavedCell = document.getElementById('joe-panama');
        if (princessSavedCell.innerHTML != ''){
            let princess = this.add.sprite(3*Globals.TILE_WIDTH, 5.5 * Globals.TILE_WIDTH +12, 'princess');
            princess.setDepth(12);
        }

        if (panamaJoeSavedCell.innerHTML != ''){
            let panamaJoe = this.add.sprite(9*Globals.TILE_WIDTH, 5.5 * Globals.TILE_WIDTH +12, 'panama-joe');
            panamaJoe.setDepth(12);
        }

        this.time.delayedCall(3456, () => {
            alert("Now you need to divide the treasure ! Silly!");
            alert("GAME OVER! Let's assume you win :/");
            location.reload();
        });
    }
}

class SceneClassic extends MainScene{

    constructor(){
        super('SceneClassic');
        this.backgroundColor = 'black';

        this.nonBrickRows = [1,2,3, 4,5,6,7, 8,9,10];
        this.ladderColumns = [ {'column' : 6.75, 'start' : 1, 'end' : 5}, {'column' : 1, 'start' : 4, 'end' : 11}
            , {'column' : 2, 'start' : 5, 'end' : 11}
            ];
        this.nextScene['left'] = 'Scene27';
        this.exits['left']['x'] = '0';
        this.exits['left']['y'] = '2';

        this.nextScene['right'] = 'Scene24';
        this.exits['right']['x'] = '13';
        this.exits['right']['y'] = '2';
    }

    create(){
        super.create();
        this.createSpriteGroup();
    }

    createSpriteGroup() {
        super.createSpriteGroup();

        const fireAnimation = this.add.sprite(6*Globals.TILE_WIDTH + 13, 9.5*Globals.TILE_WIDTH, 'fire1');
        fireAnimation.scaleX = 1.5;
        fireAnimation.play('fire');
        const xs = [0,1];
        for(let y = 3; y < 11; y++){
            xs.forEach(x =>
                {
                    const brick = this.add.sprite(x*Globals.TILE_WIDTH, y*Globals.TILE_WIDTH, 'brick');
                    this.spriteGroup.add(brick);
                });
        }

        const fireEdgeHiding = this.add.sprite(7*Globals.TILE_WIDTH - 20, 5.5*Globals.TILE_WIDTH, 'black-strip');
        fireEdgeHiding.scaleX = 1.4;

        const brickBridgeX = [ 6.5,7];
        brickBridgeX.forEach(x =>{
            const brick = this.add.sprite(x*Globals.TILE_WIDTH, 5*Globals.TILE_WIDTH, 'brick');
            this.spriteGroup.add(brick);
        });
    }

    movePlayer(time){
        super.movePlayer(time);

        const playerTile = this.calculateSpriteSquare(this.player);
        const playerTileY = playerTile[1];
        if (playerTileY >= 2 && this.getTextureAt(playerTile[0], playerTileY + 1) != 'brick'){
            this.player.y += 5;
            if (this.player.y > 550){
                this.player.setTexture('smoke-cloud');
                    this.player.y -= 6;
                    this.player.x -= 1;
                    this.time.delayedCall(1256, () => {
                        this.scene.start('SceneClassic');
                    });
                }
        }

    }
    //@Overrride
    checkExit(){
        const coords = this.calculateSpriteSquare(this.player);

        const directions = ['left', 'right'];

        directions.forEach( d => {
            const exitX = this.exits[d]['x'];
            const exitY = this.exits[d]['y'];

            if (coords[0] == exitX && coords[1] == exitY){
                this.scene.start(this.nextScene[d]);

                if (d === 'left'){
                    this.setGlobalInitialPos(12, 8);
                }
                else if (d === 'right'){
                    this.setGlobalInitialPos(1, 9);
                }
            }
        });
    }
}



