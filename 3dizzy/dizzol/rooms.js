class Room1 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM1, canvas, "dizzol/1.png", new RoomExit(-5, 20.5 * C64Blackbox.rowHeight)
            , null, DizzyGlobals.FLOOR_LEVELS_1, null, 0);

        const garlic11 = new Garlic(canvas, 500, 300);
        const garlic12 = new Garlic(canvas, 400, 300);

        this.setInfo("1. SCULPTURE");

        const room1Sfx = new SfxEvent("dizzol/huu.mp3");
        this.checkpoints = [new Checkpoint(310, 411, room1Sfx)];
        this.addItemOnFloor(garlic11);
        this.addItemOnFloor(garlic12);
    }
}

class Room2 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM2, canvas, "dizzol/2.png", new RoomExit(100, 428), new RoomExit(510, 20.5 * C64Blackbox.rowHeight)
            , null, null, 0);

        this.setInfo("2. TOTEM");

        this.floorLevels = [
            { range: [0, 128], level: 425 },
            { range: [129, 200], level: 428 },
            { range: [201, 260], level: 418 },
            { range: [261, 314], level: 410 },
            { range: [311, 379], level: 412 },
            { range: [308, Infinity], level: 415 }
        ];

        const totemSfx1 = new SfxEvent("dizzol/totem.mp3");
        this.checkpoints = [new Checkpoint(315, 411, totemSfx1)];
        const garlic21 = new Garlic(canvas, 500, 300);
        this.addItemOnFloor(garlic21);
    }
}

class Room3 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM3, canvas, "dizzol/3.png", new RoomExit(-5, 350), new RoomExit(530, 20.5 * C64Blackbox.rowHeight)
            , null, [], 1);

        this.setInfo("3. BAT CAVE ENTRANCE");

        this.floorLevels = [
            { range: [0, 145], level: 362 },
            { range: [146, 175], level: 368 },
            { range: [176, 190], level: 375 },
            { range: [191, 260], level: 380 },
            { range: [261, 290], level: 390 },
            { range: [291, 379], level: 400 },
            { range: [308, Infinity], level: 420 }
        ];
    }
}

class Room12 extends Room{
    constructor(canvas){
        super(DizzolGame.ROOM12, canvas, "dizzol/12.png", new RoomExit(-5, 360), new RoomExit(530, 360)
                , null, [], 0);

        this.setInfo("12. VALDGIR'S SWORDS");

        this.floorLevels = [{ range: [-Infinity, 140], level: 360 }
            , { range: [141, 330], level: 380 }
            , { range: [331, Infinity], level: 360 }
        ];


        this.aldir = new Aldir();
    }

    draw(){
        super.draw();
        this.enemyLoader.load('../../common/pics/aldir.png', 115, 340);
    }

    movePlayerLeft(player){
        super.movePlayerLeft(player);
        if (player.x > 90 && player.x < 140){
            console.log("Aldgir: Have you seen my swords?");
            this.enemyLoader.load('dizzol/valdgirQuote.png', 99, 270);
        }
    }

    movePlayerRight(player){
        super.movePlayerRight(player);
        if (player.x > 90 && player.x < 140){
            console.log("Aldgir: Have you seen my swords?");
            this.enemyLoader.load('dizzol/valdgirQuote.png', 99, 270);
        }
    }

    handleFirePressed(player){
        super.handleFirePressed(player);
        if (player.x > 150 && player.x < 320){
            console.log("Aldgir: Don't touch Valdgir's trasure !!!");
            this.enemyLoader.load('dizzol/valdgirTreasureQuote.png', 99, 270);
        }

    }

}

class Room4 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM4, canvas, "dizzol/4.png", new RoomExit(-5, 20.5 * C64Blackbox.rowHeight), new RoomExit(530, 360)
            , null, [], 0);

        this.setInfo("4. ANCIENT DRAWINGS");

        this.floorLevels = [
            { range: [-Infinity, 120], level: 420 },
            { range: [121, 200], level: 410 },
            { range: [200, 270], level: 400 },
            { range: [271, 300], level: 390 },
            { range: [301, 369], level: 380 },
            { range: [370, 400], level: 370 },
            { range: [401, 490], level: 365 },
            { range: [491, Infinity], level: 355 }
        ];
    }
}

class Room5 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM5, canvas, "dizzol/5.png", new RoomExit(-5, 20.5 * C64Blackbox.rowHeight)
            , new RoomExit(510, 20.5 * C64Blackbox.rowHeight), DizzyGlobals.FLOOR_LEVELS_1, [], 3);

        this.setInfo("5. MAIN BAT LAIR");
    }
}

class Room6 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM6, canvas, "dizzol/6.png", new RoomExit(70, 431), new RoomExit(530, 425)
            , DizzyGlobals.FLOOR_LEVELS_67, [], 1);

        this.setInfo("6. BAT CAVE EXIT");
        this.bats[0].y += 80;
    }
}

class Room7 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM7, canvas, "dizzol/7.png", new RoomExit(-5, 431), new RoomExit(530, 425), DizzyGlobals.FLOOR_LEVELS_67
        , [new Checkpoint(140, 435, new SfxEvent("dizzol/totem.mp3")), new Checkpoint(305, 435, new SfxEvent("dizzol/totem.mp3"))], 0);

        this.setInfo("7. TWO TOTEMS");
    }
}

class Room8 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM8, canvas, "dizzol/8.png", new RoomExit(-5, 302), new RoomExit(530, 395), [], [], 0);

        this.setInfo("8. STAIRS");

        this.floorLevels = [
            { range: [0, 145], level: 302 },
            { range: [146, 260], level: 335 },
            { range: [261, 379], level: 368 },
            { range: [308, Infinity], level: 395 }
        ];
    }
}

class Room9 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM9, canvas, "dizzol/9.png", new RoomExit(-5, 302), new RoomExit(530, 302), [{ range: [-Infinity, Infinity], level: 302 }], [], 0);

        this.setInfo("9. TROLL DEMANDS TOLL");
    }


    draw(){
        super.draw();
        this.enemyLoader.load('dizzol/trollR.png', 220, 241);
    }
}

class Room10 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM10, canvas, "dizzol/10.png", new RoomExit(-5, 431), new RoomExit(530, 425), Room.FLOOR_LEVELS_67
            , [new Checkpoint(500, 411, new DelayedDeathEvent(null, 22000))], 0);

        this.setInfo("10. DESERT");
    }
}

class Room11 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM11, canvas, "dizzol/11.png", new RoomExit(-5, 431), new RoomExit(530, 425), Room.FLOOR_LEVELS_67,
            [new Checkpoint(500, 411, new DelayedDeathEvent(null, 22000))], 0);

        this.setInfo("11. DESERT");
    }
}

class RoomRegistry{
    constructor(){
        this.allRooms = [];
    }

    start(roomNumber){
    }

    createRoomSet(canvas, c64Blackbox){

        const room1 = new Room1(canvas);
        const room2 = new Room2(canvas);
        const room3 = new Room3(canvas);
        const room4 = new Room4(canvas);
        const room5 = new Room5(canvas);
        const room6 = new Room6(canvas);
        const room7 = new Room7(canvas);
        const room8 = new Room8(canvas);
        const room9 = new Room9(canvas);
        const room10 = new Room10(canvas);
        const room11 = new Room11(canvas);
        const room12 = new Room12(canvas);

        this.allRooms = [room1, room2, room3, room4, room5, room6, room7, room8, room9, room10, room11, room12];

        this.allRooms.forEach(room => {
            room.read(); // read = load background without displaying it
            room.setC64Blackbox(c64Blackbox);
        });

        return this.allRooms;
    }
}

class RoomExit{
    static size = DizzyGlobals.PLAYER_SPEED * 5;

    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    contains(sprite){
        const distance = Math.sqrt( (this.x - sprite.x) ** 2 + (this.y - sprite.y) ** 2);
        return distance < RoomExit.size;
    }
}

class Checkpoint extends RoomExit{

    constructor(x, y, event){
        super(x,y);
        this.event = event;
    }

    action(){
         if (this.event != null)
            this.event.executeOnce();
    }

    reset(){
        if (this.event != null)
            this.event.reset();
    }
}

class SfxEvent{

    constructor(soundPath){
        this.soundPath = soundPath;
        this.active = true;
        this.audio = new Audio(soundPath);
    }

    reset(){
        this.active = true;
    }

    executeOnce(){
        if (!this.active){
            return;
        }

        this.audio.play();
        this.active = false;
    }
}

class DelayedDeathEvent {
    constructor(player, delay) {
        this.player = player;
        this.delay = delay;
        this.activate();
    }

    reset() {
        this.active = false;
        console.log('Delayed Death Event DEACTIVATED.');
    }

    activate(){
        this.active = true;
        console.log('Delayed Death Event DEACTIVATED.');

    }

    executeOnce() {
        if (!this.active) {
            return;
        }

        console.log('Desert countdown started...');

        setTimeout(() => {
            if (!this.active) {
                return;
            }

            this.player.hp = 0;
            console.log('You died in a desert');

            this.player.checkIfDead();//he is
        }, this.delay);
    }

    setPlayer(player){
        this.player = player;
    }
}
