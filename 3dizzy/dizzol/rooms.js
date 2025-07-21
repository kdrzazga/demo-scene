class Room1 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM1, canvas, "dizzol/1.png", new RoomExit(-5, 20.5 * C64Blackbox.rowHeight)
            , null, null, null, 0);

        const garlic11 = new Garlic(canvas, 500, 300);
        const garlic12 = new Garlic(canvas, 400, 300);
        this.addItemOnFloor(garlic11);
        this.addItemOnFloor(garlic12);

        this.setInfo("1. SCULPTURE");

        this.floorLevels = [
            { range: [0, 120], level: 419 },
            { range: [121, 152], level: 415 },
            { range: [152, 200], level: 411 },
            { range: [201, 250], level: 405 },
            { range: [251, 310], level: 410 },
            { range: [311, 440], level: 402 },
            { range: [441, Infinity], level: 409 }
        ];

        const room1Sfx = new SfxEvent("dizzol/huu.mp3");
        this.checkpoints = [new Checkpoint(310, 411, room1Sfx)];
    }

}

class RoomRegistry{

    constructor(){
        this.allRooms = [];

    }

    start(roomNumber){

    }

    createRoomSet(canvas, c64Blackbox){
		const room1floorLevels = [
            { range: [0, 120], level: 419 },
            { range: [121, 152], level: 415 },
            { range: [152, 200], level: 411 },
            { range: [201, 250], level: 405 },
            { range: [251, 310], level: 410 },
            { range: [311, 440], level: 402 },
            { range: [441, Infinity], level: 409 }
        ];

		const room2floorLevels = [
            { range: [0, 128], level: 425 },
            { range: [129, 200], level: 428 },
            { range: [201, 260], level: 418 },
            { range: [261, 314], level: 410 },
            { range: [311, 379], level: 412 },
            { range: [308, Infinity], level: 415 }
        ];

		const room3floorLevels = [
            { range: [0, 145], level: 362 },
            { range: [146, 175], level: 368 },
            { range: [176, 190], level: 375 },
            { range: [191, 260], level: 380 },
            { range: [261, 290], level: 390 },
            { range: [291, 379], level: 400 },
            { range: [308, Infinity], level: 420 }
        ];

        const room4floorLevels = [
            { range: [-Infinity, 120], level: 420 },
            { range: [121, 200], level: 410 },
            { range: [200, 270], level: 400 },
            { range: [271, 300], level: 390 },
            { range: [301, 369], level: 380 },
            { range: [370, 400], level: 370 },
            { range: [401, 490], level: 365 },
            { range: [491, Infinity], level: 355 }
        ];

        const room67floorLevels = [
            { range: [-Infinity, 120], level: 431 },
            { range: [121, 150], level: 439 },
            { range: [151, 270], level: 446 },
            { range: [238, Infinity], level: 425 }
        ];
        const exit67Left = new RoomExit(-5, 431);
        const exit6Left = new RoomExit(70, 431);
        const exit67Right = new RoomExit(530, 425);

        const room1Sfx = new SfxEvent("dizzol/huu.mp3");
        const room1Checkpoints = [new Checkpoint(310, 411, room1Sfx)];
        const totemSfx1 = new SfxEvent("dizzol/totem.mp3");
        const totemSfx2 = new SfxEvent("dizzol/totem.mp3");
        const singleTotemCheckpoints = [new Checkpoint(315, 411, totemSfx1)];
        const twoTotemCheckpoints = [new Checkpoint(140, 435, totemSfx1), new Checkpoint(305, 435, totemSfx2)];
        const desertDeathEvent = new DelayedDeathEvent(null, 22000);
        const desertDeathEvent2 = new DelayedDeathEvent(null, 22000);
        const desertDeathCheckpoints = [new Checkpoint(500, 411, desertDeathEvent)];
        const desertDeathCheckpoints2 = [new Checkpoint(500, 411, desertDeathEvent2)];

        const room1 = new Room1(canvas);//(DizzolGame.ROOM1, canvas, "dizzol/1.png", new RoomExit(-5, 20.5 * C64Blackbox.rowHeight), null, room1floorLevels, room1Checkpoints, 0);

        const garlic11 = new Garlic(canvas, 500, 300);
        const garlic12 = new Garlic(canvas, 400, 300);
        //room1.addItemOnFloor(garlic11);
        //room1.addItemOnFloor(garlic12);

        const room2 = new Room(DizzolGame.ROOM2, canvas, "dizzol/2.png", new RoomExit(100, 428), new RoomExit(510, 20.5 * C64Blackbox.rowHeight), room2floorLevels, singleTotemCheckpoints, 0);

        const garlic21 = new Garlic(canvas, 500, 300);
        room2.addItemOnFloor(garlic21);

        const room3 = new Room(DizzolGame.ROOM3, canvas, "dizzol/3.png", new RoomExit(-5, 350), new RoomExit(530, 20.5 * C64Blackbox.rowHeight), room3floorLevels, [], 1);
        const room4 = new Room(DizzolGame.ROOM4, canvas, "dizzol/4.png", new RoomExit(-5, 20.5 * C64Blackbox.rowHeight), new RoomExit(530, 350), room4floorLevels, [], 0);
        const room5 = new Room(DizzolGame.ROOM5, canvas, "dizzol/5.png", new RoomExit(-5, 20.5 * C64Blackbox.rowHeight), new RoomExit(510, 20.5 * C64Blackbox.rowHeight), room1floorLevels, [], 3);
        const room6 = new Room(DizzolGame.ROOM6, canvas, "dizzol/6.png", exit6Left, exit67Right, room67floorLevels, [], 1);
        const room7 = new Room(DizzolGame.ROOM7, canvas, "dizzol/7.png", exit67Left, exit67Right, room67floorLevels, twoTotemCheckpoints, 0);
        const room8 = new Room(DizzolGame.ROOM8, canvas, "dizzol/8.png", exit67Left, exit67Right, room67floorLevels, [], 0);
        const room9 = new Room(DizzolGame.ROOM9, canvas, "dizzol/9.png", exit67Left, exit67Right, room67floorLevels, [], 0);
        const room10 = new Room(DizzolGame.ROOM10, canvas, "dizzol/10.png", exit67Left, exit67Right, room67floorLevels, desertDeathCheckpoints, 0);
        const room11 = new Room(DizzolGame.ROOM11, canvas, "dizzol/11.png", exit67Left, exit67Right, room67floorLevels, desertDeathCheckpoints2, 0);


        room6.bats[0].y += 80;

        const labels = [
            "1. SCULPTURE", "2. TOTEM", "3. BAT CAVE ENTRANCE", "4. ANCIENT DRAWINGS",
            "5. MAIN BAT LAIR", "6. BAT CAVE EXIT", "7. TWO TOTEMS", "8. STAIRS",
            "9. TROLL DEMANDS TOLL", "10. DESERT", "11. DESERT"
        ];

        this.allRooms = [room1, room2, room3, room4, room5, room6, room7, room8, room9, room10, room11];
        let labelIndex = 0;

        this.allRooms.forEach(room => {
            if (labelIndex < labels.length) {
                room.setInfo(labels[labelIndex]);
            } else {
                console.warn(`No label found for room at index ${labelIndex}`);
                room.setInfo('');
            }
            labelIndex++;
            room.read(); // read = load background without displaying it
            room.setC64Blackbox(c64Blackbox);
        });

        return this.allRooms;
    }
}

class RoomExit{
    static size = 15;

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
