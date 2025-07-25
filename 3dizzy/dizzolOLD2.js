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

class DizzolGame{

    static ROOM1 = 1;
    static ROOM2 = 2;
    static ROOM3 = 3;
    static ROOM4 = 4;
    static ROOM5 = 5;
    static ROOM6 = 6;
    static ROOM7 = 7;
    static ROOM8 = 8;
    static ROOM9 = 9;
    static ROOM10 = 10;
    static ROOM11 = 11;
    static NO_ROOM = 999999999;

    static roomTransitionsLeft = {
                [DizzolGame.ROOM1]: {nextRoom: DizzolGame.ROOM2, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM2]: {nextRoom: DizzolGame.ROOM3, resetCheckpoint: true, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM3]: {nextRoom: DizzolGame.ROOM4, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM4]: {nextRoom: DizzolGame.ROOM5, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM5]: {nextRoom: DizzolGame.ROOM6, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM6]: {nextRoom: DizzolGame.ROOM7, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM7]: {nextRoom: DizzolGame.ROOM8, resetCheckpoint: true, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM8]: {nextRoom: DizzolGame.ROOM9, resetCheckpoint: true, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM9]: {nextRoom: DizzolGame.ROOM10, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM10]: {nextRoom: DizzolGame.ROOM11, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM11]: {nextRoom: DizzolGame.ROOM1, resetCheckpoint: false, nextRoomPlayerPos: 500}
            };

    static roomTransitionsRight = {
                [DizzolGame.ROOM1]: {nextRoom: DizzolGame.NO_ROOM, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM2]: {nextRoom: DizzolGame.ROOM1, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM3]: {nextRoom: DizzolGame.ROOM2, nextRoomPlayerPos: 100},
                [DizzolGame.ROOM4]: {nextRoom: DizzolGame.ROOM3, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM5]: {nextRoom: DizzolGame.ROOM4, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM6]: {nextRoom: DizzolGame.ROOM5, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM7]: {nextRoom: DizzolGame.ROOM6, resetCheckpoint: true, nextRoomPlayerPos: 70},
                [DizzolGame.ROOM8]: {nextRoom: DizzolGame.ROOM7, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM9]: {nextRoom: DizzolGame.ROOM8, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM10]: {nextRoom: DizzolGame.ROOM9, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM11]: {nextRoom: DizzolGame.ROOM10, resetCheckpoint: true, nextRoomPlayerPos: 5}
            };

    constructor(canvas, c64Blackbox){
        this.canvas = canvas;
        let roomReg = new RoomRegistry();
        this.rooms = roomReg.createRoomSet(canvas, c64Blackbox);
        this.player = new Dizzy(canvas);
        const desertRooms = [this.rooms[DizzolGame.ROOM10 - 1], this.rooms[DizzolGame.ROOM11 - 1]];
        desertRooms.forEach(room => room.checkpoints[0].event.setPlayer(this.player));

        let context = canvas.getContext('2d');
        this.dizzyPicLoader = new PictureLoader(context);
        this.reset();
        this.startAnimationLoop();
        this.startRoomInfoDisplayLoop();
    }

    reset(){
        this.active = false;
        this.currentRoomId = DizzolGame.ROOM1;
    }

	activate(){
		this.reset();
		this.active = true;
		console.log("Dizzol Game started.");

        let currentRoom = this.getCurrentRoom();
        currentRoom.load();
        this.dizzyPicLoader.load(this.player.picPath, this.player.x, this.player.y);
	}

	startRoomInfoDisplayLoop(){
	    this.roomInfoLoop = setInterval(() => {
             if (!this.active)
                 return;
             const currentRoom = this.getCurrentRoom();
             currentRoom.writeRoomInfo();
        }, 1500);
	}

    startAnimationLoop() {
        setInterval(() => {
            if (!this.active)
                return;
            const currentRoom = this.getCurrentRoom();
            this.player.draw();
            currentRoom.animate();
            this.checkCollisions();
        }, 16);
    }

    checkCollisions(){
        const currentRoom = this.getCurrentRoom();
        currentRoom.bats.filter(bat => bat.hp > 0).forEach(bat =>{
            if (bat.collide(this.player)){
                console.log("BAT ATTACK !");
                if (this.player.fightBatWithGarlic(bat)){
                    //const currentRoom = this.getCurrentRoom();
                    currentRoom.writeUpperInfo("GARLIC SCARED THE BAT OFF !");
                }
                else{
                    console.warn('GAME OVER');
                    this.player.hp = 0;
                    this.player.checkIfDead(); //sure he is
                }
            }
        });
    }

    draw(){
        const currentRoom = this.getCurrentRoom();
        currentRoom.draw();
        currentRoom.drawEnemies();
        this.player.draw();
        currentRoom.drawItems();
    }

    moveFighterLeft(fighter){//fighter only for backward compatibility
        this.player.moveLeft();
        const currentRoom = this.getCurrentRoom();
        this.player.y = currentRoom.getFloorLevel(this.player.x);
        this.draw();
        this.checkExit(Direction.LEFT);
    }

    moveFighterRight(fighter){//fighter only for backward compatibility
        this.player.moveRight();
        const currentRoom = this.getCurrentRoom();
        this.player.y = currentRoom.getFloorLevel(this.player.x);
        this.draw();
        this.checkExit(Direction.RIGHT);
    }

    handleFirePressed() {
        console.log('FIRE !');

        const currentRoom = this.getCurrentRoom();

        currentRoom.writeUpperInfo("You picked " + this.pickGarlic());

        new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        }).then(() => {
            let inventoryInfo = "Inventory: ";
            this.player.inventory.forEach(item => {
                inventoryInfo += (item.name + " ");
            });
            console.log(inventoryInfo);
            currentRoom.writeUpperInfo(inventoryInfo);

            return new Promise((resolve2) => {
                setTimeout(() => {
                    resolve2();
                }, 1000);
            });
        }).then(() => {
            currentRoom.writeRoomInfo();
        });
    }

    pickGarlic(){
        let result = "nothing";
        const room = this.getCurrentRoom();
        const itemsShallowCopy = [...room.items];

        itemsShallowCopy.forEach(item =>{
            console.log("item at " + item.x + " player at " + this.player.x);
            if (item.collide(this.player)){
                console.log("Grabbing " + item.name);
                room.items = room.items.filter(i => i !== item);
                this.player.inventory.push(item);
                result = 'garlic';
            }
        })
        return result;
    }

    checkExit(direction) {
        const room = this.getCurrentRoom();
        const exit = direction === Direction.LEFT ? room.leftExit : room.rightExit;
        const roomTransitions = direction === Direction.LEFT ? DizzolGame.roomTransitionsLeft : DizzolGame.roomTransitionsRight;

        if (DizzolGame.NO_ROOM == exit) {
            console.log("No exit on " + direction);
            return;
        }

        if (exit !=null && exit.contains(this.player)) {
            console.log("Player is exiting " + direction);

            const transition = roomTransitions[this.currentRoomId];
            if (transition) {
                if (transition.resetCheckpoint) {
                    room.checkpoints.forEach(chkpt => chkpt.reset());
                }

                this.player.x = transition.nextRoomPlayerPos;
                this.currentRoomId = transition.nextRoom;
                console.log('Moved to room ' + this.currentRoomId);
            }
        }
         else room.checkpoints.filter(checkpoint=> checkpoint.contains(this.player)).forEach(checkpoint => {
             checkpoint.action();
        });
    }

    getCurrentRoom(){
        return this.rooms.find(room => room.number === this.currentRoomId);
    }
}
