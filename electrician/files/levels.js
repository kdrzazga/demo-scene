class LevelScene extends Phaser.Scene {
    constructor(levelName) {
        super({ key: levelName });
        this.playerCanJump = true;
        this.playerFalling = false;
        this.nextLevel = '';
        this.extraInfoFrameVisible = "left: 85%; visibility: hidden";
        this.currentPlayerPic = 'sprite';
        this.playerAnimKey = '';
    }

    preload() {
        Floor.WIDTH = 617;//ladderTexture.getSourceImage().width;
        Floor.HEIGHT = 110;//ladderTexture.getSourceImage().height;
        console.log('Floor height = ' + Floor.HEIGHT);

        this.load.image('sprite', 'files/electrician.png');
        this.load.image('spriteWalk', 'files/electricianWalk.png');
        this.load.image('spriteClimb', 'files/electricianClimp.png');
        this.load.image('spriteClimbR', 'files/electricianClimpR.png');

        for (let i = 1; i <= 8; i++) {
            this.load.image(`rat${i}`, 'files/rat.png');
        }
        this.load.image('bat', 'files/bat.png');

        this.load.image('spider', 'files/spider.png')
        this.load.image('web', 'files/web.png')

        this.load.image('ladder', 'files/ladder.png');

        this.loadFloorImages();

        this.load.image('power-line-left', 'files/powerlineL.png');
        this.load.image('power-line-right', 'files/powerlineR.png');

        this.load.image('empty-wire-section', 'files/wire.png');
        this.load.image('wire-section', 'files/wire.png');
        this.load.image('wire-section-up', 'files/wireUp.png');
        this.load.image('wire-section-down', 'files/wireDown.png');
    }

    loadFloorImages(){
         //abstract
    }

    create(creatorMethodRef) {
         this.physics.world.setBounds(0, 0, 800, 600);
         this.cursors = this.input.keyboard.createCursorKeys();

         this.building = creatorMethodRef(this.physics);
         this.player = this.physics.add.sprite(100, 400, 'sprite');
         this.player.setCollideWorldBounds(true);

         this.anims.create({
              key: 'climb',
              frames: [
                  { key: 'spriteClimb' },
                  { key: 'spriteClimbR' }
                  ],
                      frameRate: 6,
                      repeat: -1
            });

         this.anims.create({
              key: 'walk',
              frames: [
                  { key: 'sprite' },
                  { key: 'spriteWalk' }
                  ],
                      frameRate: 4,
                      repeat: -1
            });

         this.anims.create({
              key: 'stand',
              frames: [
                  { key: 'sprite' },
                  ],
                      frameRate: 1,
                      repeat: -1
            });
    }

    update() {
        this.handlePlayerMovement();
        this.handleEnemyMovement();
        this.checkCollisions();
        this.conditionalFallDown();
        this.checkVictory();
    }

    jump(direction) {
        if (!this.playerCanJump || this.playerFalling) return;

        this.playerCanJump = false;
        const jumpHeight = 45;
        const duration = 750;

        const jumpTween = {
            targets: this.player,
            y: this.player.y - jumpHeight, // Move up
            duration: duration / 2, // Up for half the duration
            ease: 'Linear',
            onComplete: () => {

                const comeDownTween = {
                    targets: this.player,
                    y: this.player.y + jumpHeight, // Move down
                    duration: duration / 2,
                    ease: 'Linear',
                    onComplete: () => {
                        this.playerCanJump = true;
                    }
                };
                this.tweens.add(comeDownTween);
            }
        }

        this.tweens.add(jumpTween);

        if (direction === 'left') {
            this.player.setVelocityX(-160);
        } else if (direction === 'right') {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0); // No horizontal movement if just jumping
        }
    }

    checkCollisions(){
        const collidingEnemy = this.building.enemies.find(e => e.collide(this.player) != 0);

        if (collidingEnemy != null){
            if (collidingEnemy instanceof Rat) this.player.x += 15 * collidingEnemy.collide(this.player);
            else if (collidingEnemy instanceof Bat) {
                var audioBing = new Audio('files/bing.m4a');
                audioBing.play();
                this.player.y += Math.abs(29 * collidingEnemy.collide(this.player));
            }
        }
    }

    conditionalFallDown(){
        let flrs = ""

        if (this.building.ladder.onLadder(this.player.x)){
            this.playerFalling = false;
            return; //Ladder prevents from falling;
        }

        this.playerFalling = true;
        let velocity = 160;

        this.building.floors.forEach(f => {
            flrs += " " + f.floorLevel;

            if (Building.GROUND_FLOOR_LEVEL - this.player.y <=16.5 || (f.onFloor(this.player.x, this.player.y) && !this.building.ladder.onLadder(this.player.x))){
                //console.log('Floor met on y= ' + this.player.y);
                velocity = 0; //Floor under feet prevents from falling
                this.playerFalling = false;
                return;
            }
        });

        this.player.setVelocityY(velocity);
        //console.log("Fall down y = ", this.player.y, " FloorLevels = " + flrs);
    }

    handlePlayerMovement() {
        let newAnimKey = 'stand';
        let velocityX = 0;
        let velocityY = 0;

        if (this.cursors.left.isDown) {
            velocityX = -160;
            newAnimKey = 'walk';
            this.currentPlayerPic = 'sprite';
            this.player.setFlipX(false);
            if (this.cursors.up.isDown) {
                this.jump('left');
            }
        } else if (this.cursors.right.isDown) {
            velocityX = 160;
            newAnimKey = 'walk';
            this.currentPlayerPic = 'sprite';
            this.player.setFlipX(true);
            if (this.cursors.up.isDown) {
                this.jump('right');
            }
        }


        if(this.building.ladder.onLadder(this.player.x)){
            this.currentPlayerPic = 'spriteClimb';
            if (velocityX === 0) {
                if (this.cursors.up.isDown) {
                    newAnimKey = 'climb';
                    velocityY = -160;
                } else if (this.cursors.down.isDown) {
                    newAnimKey = 'climb';
                    velocityY = 160;
                }
            }
        }

        if (newAnimKey !== this.playerAnimKey) {
            this.playerAnimKey = newAnimKey;
            this.player.play(this.playerAnimKey);
        }

        this.player.setVelocityX(velocityX);
        this.player.setVelocityY(velocityY);

        if (this.cursors.space.isDown || this.cursors.shift.isDown){
            let action = WireSlot.WIRE_STRAIGHT;
            if (this.cursors.down.isDown) {
                action = WireSlot.WIRE_DOWN;
            }
            else if (this.cursors.up.isDown) {
                action = WireSlot.WIRE_UP;
            }

            this.building.drawWire(this.player, action);
        }

        this.writeFloorInfo();
    }

    handleEnemyMovement(){
        this.building.enemies.filter(e => e.active).forEach(enemy => {
            enemy.move();
            if (enemy instanceof Rat){
                if (enemy.wireId === undefined) return;

                const wireId = enemy.wireId;
                const wire = this.building.wires[wireId];
                const currentFloor = this.building.floors[wireId];
                const wireSlotIndexPair = wire.getSlotAtCoordinateX(currentFloor, enemy.sprite.x);

                if (wireSlotIndexPair.slot === WireSlot.WIRE_DOWN){
                    if (wire.isConnected()){
                        var audioZap = new Audio('files/zap.m4a');
                        audioZap.play();

                        enemy.active = false; //Zapped Rat becomes immobile
                        return;
                    }

                    const slotIndex = wireSlotIndexPair.index;
                    this.building.wires[wireId].place(currentFloor, enemy.sprite ,WireSlot.EMPTY);
                    if (this.building.wires[wireId].actualFloorConnections.has(slotIndex)) {
                        var audioChrup = new Audio('files/chrup.m4a');
                        audioChrup.play();

                        this.building.wires[wireId].actualFloorConnections.delete(slotIndex);
                    }
                    console.log(`Rat ${enemy.id} bit thru wire ${wireId}.`);
                }
            }
        });
    }

    writeFloorInfo(){
        const floorInfo = document.getElementById('floor-number');
        const realCurrentFloor = this.building.getCurrentFloor(this.player);
        let prettyCurrentFloor = this.building.floors.length - realCurrentFloor;
        if (Math.abs(this.player.y - 600) < 30){
            prettyCurrentFloor = 0;
        }

        let prettyCurrentFloorText = realCurrentFloor < 0 ? ' ' : prettyCurrentFloor;
        floorInfo.innerText = `${prettyCurrentFloorText} (${realCurrentFloor})`;
    }

    checkVictory(){
        const allConnected = this.building.wires.every(wire => wire.isConnected());

        const sceneLevelNumberJson = {
            "lvl1" : "Level1",
            "lvl2" : "Level2",
            "lvl3" : "Level3",
            "lvl4" : "Level4",
            "lvl5" : "Level5",
            "lvl6" : "Outro"
        }

        if (allConnected){
            console.log(`All floors are connected. Advancing to the next level ${this.nextLevel}`);
            sessionStorage.setItem('level', this.nextLevel);
            const nextLevelKey = sceneLevelNumberJson[this.nextLevel];
            //this.scene.start(nextLevelKey);
            location.reload();
        }
    }

    showExtraInfoFrame(content){
        const frame = document.getElementById('extraInfoFrame');
        frame.innerHTML = content;
        frame.style = "left: 85%; visibility: show";
    }
}

class Level1Scene extends LevelScene {

    constructor() {
        super('Level1');
        this.nextLevel = 'lvl2';
    }

    loadFloorImages(){
         this.load.image('floor0', 'files/attic2.png');
         this.load.image('floor1', 'files/home1.png');
         this.load.image('floor2', 'files/basement.png');
    }

    create() {
        super.create(Creator.createLevel1);
    }
}

class Level2Scene extends LevelScene{

    constructor() {
        super('Level2');
        this.nextLevel = 'lvl3';
    }

    loadFloorImages(){
         this.load.image('floor0', 'files/office.png');
         this.load.image('floor1', 'files/gym.png');
         this.load.image('floor2', 'files/garage.png');
    }

    create() {
        super.create(Creator.createLevel2);
        const content = FrameCreator.createLevel2ExtraInfoFrameContent();
        this.showExtraInfoFrame(content);
    }
}

class Level3Scene extends LevelScene{

    constructor() {
        super('Level3');
        this.nextLevel = 'lvl4';
    }

    loadFloorImages(){
         this.load.image('floor0', 'files/attic.png');
         this.load.image('floor1', 'files/livingRoom.png');
         this.load.image('floor2', 'files/kitchen.png');
    }

    create(){
        super.create(Creator.createLevel3);
    }
}

class Level4Scene extends LevelScene{

    constructor() {
        super('Level4');
        this.nextLevel = 'lvl5';
        this.extraInfoFrameVisible = "left: 85%; visibility: show"
    }

    loadFloorImages(){
         this.load.image('floor0', 'files/music-floor.png');
         this.load.image('floor1', 'files/computer-room.png');
         this.load.image('floor2', 'files/computer-room2.png');
    }

     create() {
        super.create(Creator.createLevel4);
        const content = FrameCreator.createLevel4ExtraInfoFrameContent();
        this.showExtraInfoFrame(content);
     }
}

class Level5Scene extends LevelScene{

    constructor() {
        super('Level5');
        this.nextLevel = 'outro';
        this.extraInfoFrameVisible = "left: 85%; visibility: show"
    }

    loadFloorImages(){
         this.load.image('floor0', 'files/room-wide-web.png');
         this.load.image('floor1', 'files/room-wide-web.png');
         this.load.image('floor2', 'files/room-wide-web.png');
    }

     create() {
        super.create(Creator.createLevel5);
     }
}

class LevelOutroScene extends LevelScene{

    constructor() {
        super('Outro');
        this.nextLevel = 'lvl1';
        this.extraInfoFrameVisible = "left: 85%; visibility: show";
        this.audioBing = null;
        this.musicFile = 'files/celeb.midi.mp3';
    }

    loadFloorImages(){
         this.load.image('floor0', 'files/darkFloor.png');
         this.load.image('floor1', 'files/congratulations.png');
         this.load.image('floor2', 'files/congratulations2.png');
    }

     create() {
        super.create(Creator.createOutro);
        this.physics.world.setBounds(Ladder.WIDTH + 21, 0, 800 - 150, 600);
        this.player.x = 400;
        this.player.y = 30;
        this.audioBing = new Audio(this.musicFile);
        this.input.keyboard.on('keydown', (event) => {
            this.playAudio();
        });
     }

     playAudio() {
         if (this.audioBing.paused) {
             this.audioBing.play().catch(error => {
                 console.error("Error playing audio:", error);
             });
         }
     }
}

class LevelIntroScene extends LevelOutroScene{

    constructor() {
        super('Intro');
        this.nextLevel = 'lvl1';
        this.extraInfoFrameVisible = "left: 85%; visibility: show";
        this.audioBing = null;
        this.musicFile = 'files/kicha.mp3';
    }

    loadFloorImages(){
         this.load.image('floor0', 'files/darkFloor.png');
         this.load.image('floor1', 'files/intro.png');
         this.load.image('floor2', 'files/intro2.png');
    }

}
