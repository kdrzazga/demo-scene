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
    static ROOM12 = 12;
    static NO_ROOM = 999999999;

    static roomTransitionsLeft = {
                [DizzolGame.ROOM1]: {nextRoom: DizzolGame.ROOM2, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM2]: {nextRoom: DizzolGame.ROOM3, resetCheckpoint: true, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM3]: {nextRoom: DizzolGame.ROOM12, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM4]: {nextRoom: DizzolGame.ROOM5, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM5]: {nextRoom: DizzolGame.ROOM6, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM6]: {nextRoom: DizzolGame.ROOM7, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM7]: {nextRoom: DizzolGame.ROOM8, resetCheckpoint: true, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM8]: {nextRoom: DizzolGame.ROOM9, resetCheckpoint: true, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM9]: {nextRoom: DizzolGame.ROOM10, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM10]: {nextRoom: DizzolGame.ROOM11, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM11]: {nextRoom: DizzolGame.ROOM1, resetCheckpoint: false, nextRoomPlayerPos: 500},
                [DizzolGame.ROOM12]: {nextRoom: DizzolGame.ROOM4, nextRoomPlayerPos: 500}
            };

    static roomTransitionsRight = {
                [DizzolGame.ROOM1]: {nextRoom: DizzolGame.NO_ROOM, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM2]: {nextRoom: DizzolGame.ROOM1, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM3]: {nextRoom: DizzolGame.ROOM2, nextRoomPlayerPos: 100},
                [DizzolGame.ROOM4]: {nextRoom: DizzolGame.ROOM12, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM5]: {nextRoom: DizzolGame.ROOM4, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM6]: {nextRoom: DizzolGame.ROOM5, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM7]: {nextRoom: DizzolGame.ROOM6, resetCheckpoint: true, nextRoomPlayerPos: 70},
                [DizzolGame.ROOM8]: {nextRoom: DizzolGame.ROOM7, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM9]: {nextRoom: DizzolGame.ROOM8, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM10]: {nextRoom: DizzolGame.ROOM9, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM11]: {nextRoom: DizzolGame.ROOM10, resetCheckpoint: true, nextRoomPlayerPos: 5},
                [DizzolGame.ROOM12]: {nextRoom: DizzolGame.ROOM3, nextRoomPlayerPos: 5}
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
            //this.player.draw();
            currentRoom.animate(this.player);
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
        currentRoom.drawItems();
    }

    moveFighterLeft(fighter){//fighter only for backward compatibility
        const currentRoom = this.getCurrentRoom();
        currentRoom.movePlayerLeft(this.player);
        this.draw();
        this.checkExit(Direction.LEFT);
    }

    moveFighterRight(fighter){//fighter only for backward compatibility
        const currentRoom = this.getCurrentRoom();
        currentRoom.movePlayerRight(this.player);
        this.draw();
        this.checkExit(Direction.RIGHT);
    }

    handleFirePressed() {
        console.log('FIRE !');

        const currentRoom = this.getCurrentRoom();
        currentRoom.handleFirePressed(this.player);
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
