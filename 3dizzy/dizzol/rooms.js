class Room{

    constructor(number, canvas, picPath, leftExit, rightExit, floorLevels, checkpoints, batsCount){
        this.number = number;
        this.picPath = picPath;
        this.leftExit = leftExit;
        this.rightExit = rightExit;
		this.floorLevels = floorLevels;
		this.checkpoints = checkpoints;

        this.context = canvas.getContext('2d');
        this.loader = new PictureLoader(this.context);
        this.enemyLoader = new PictureLoader(this.context);
        this.garlicLoader = new PictureLoader(this.context);
        this.bats = [];
        this.items = [];
        this.info = '';

        this.initializeBats(batsCount, canvas);
    }

    initializeBats(batsCount, canvas){
        for (let i = 0; i < batsCount; i++) {
            const bat = new Bat(canvas, 291 + 39 * i, 2 + i);
            this.bats.push(bat);
        }
        if (this.bats.length > 0) {
            this.bats[0].x = 326;
        }
        console.log('Created bats in Room ' + this.number);
    }

    load(){
        this.read();
        this.draw();
    }

    read() {
        this.loadPicture(this.loader, this.picPath).catch(error => {
            console.error('Failed to load picture:', error);
        });

        if (this.bats.length > 0) {
            this.loadPicture(this.enemyLoader, this.bats[0].picPath).catch(error => {
                console.error('Failed to load bat picture:', error);
            });
        }

        this.loadPicture(this.garlicLoader, Garlic.PATH).catch(error => {
            console.error('Failed to load garlic picture:', error);
        });
    }

    loadPicture(loader, path) {
        if (path) {
            loader.fileName = path;
            return loader.read().then(texture => {
                loader.texture = texture;
            });
        }
        return Promise.resolve();  // No picture to load
    }

    draw(){
        this.loader.draw(0, 9 * C64Blackbox.rowHeight);
        //this.writeRoomInfo();
    }

    writeRoomInfo(){
        this.writeUpperInfo(this.info);
    }

    writeUpperInfo(text){
        const rowHeight = C64Blackbox.rowHeight;
        const cursor = this.c64Blackbox.cursor;
        const y = (2 + 3 * 2) * rowHeight;
        const x = 2*rowHeight;
        this.context.fillStyle = cursor.backgroundColor;
        this.context.fillRect(x - 2, y - rowHeight + 2, 39*cursor.size + 4, cursor.size + 8);
        this.context.fillStyle = cursor.color;
        this.context.fillText(text, x, y);
    }

    drawEnemies(){
       this.bats.filter(enemy => enemy.hp>0).forEach(bat => this.enemyLoader.draw(bat.x, bat.y));
    }

    drawItems(){
        let garlics = this.items.filter(i => 'garlic' === i.name);
        garlics.forEach(item => this.garlicLoader.draw(item.x, item.y));
    }

    animate(){
        if (this.bats.length > 0){

            this.bats.forEach(b => b.move());
            this.draw();
            this.drawItems();
            this.drawEnemies();
        }
    }

	getFloorLevel(x) {
	    if (this.floorLevels == null)
	        return null;
        for (let { range, level } of this.floorLevels) {
            if (x >= range[0] && x <= range[1]) {
                return level;
            }
        }
        return null;
    }

    addItemOnFloor(item){
        let x = item.x;
        item.y = this.getFloorLevel(x) + 27;
        this.items.push(item);
    }

    setInfo(info){
        this.info = info;
    }

    setC64Blackbox(c64Blackbox){
        this.c64Blackbox = c64Blackbox;
    }
}

class Room1 extends Room{

    constructor(canvas){
        super(DizzolGame.ROOM1, canvas, "dizzol/1.png", new RoomExit(-5, 20.5 * C64Blackbox.rowHeight)
            , null, null, null, 0);

        const garlic11 = new Garlic(canvas, 500, 300);
        const garlic12 = new Garlic(canvas, 400, 300);

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

class RoomRegistry{

    constructor(){
        this.allRooms = [];

    }

    start(roomNumber){

    }

    createRoomSet(canvas, c64Blackbox){

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
        const totemSfx1 = new SfxEvent("dizzol/totem.mp3");
        const totemSfx2 = new SfxEvent("dizzol/totem.mp3");
        const singleTotemCheckpoints = [new Checkpoint(315, 411, totemSfx1)];
        const twoTotemCheckpoints = [new Checkpoint(140, 435, totemSfx1), new Checkpoint(305, 435, totemSfx2)];
        const desertDeathEvent = new DelayedDeathEvent(null, 22000);
        const desertDeathEvent2 = new DelayedDeathEvent(null, 22000);
        const desertDeathCheckpoints = [new Checkpoint(500, 411, desertDeathEvent)];
        const desertDeathCheckpoints2 = [new Checkpoint(500, 411, desertDeathEvent2)];

        const room1 = new Room1(canvas);
        const room2 = new Room2(canvas);
        const room3 = new Room3(canvas);

        const room4 = new Room4(canvas); //(DizzolGame.ROOM4, canvas, "dizzol/4.png", new RoomExit(-5, 20.5 * C64Blackbox.rowHeight), new RoomExit(530, 350), room4floorLevels, [], 0);
        const room5 = new Room(DizzolGame.ROOM5, canvas, "dizzol/5.png", new RoomExit(-5, 20.5 * C64Blackbox.rowHeight), new RoomExit(510, 20.5 * C64Blackbox.rowHeight), room1.floorLevels, [], 3);
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
