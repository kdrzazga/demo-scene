class Room{

    static FLOOR_LEVELS_1 = [
                       { range: [0, 120], level: 419 },
                       { range: [121, 152], level: 415 },
                       { range: [152, 200], level: 411 },
                       { range: [201, 250], level: 405 },
                       { range: [251, 310], level: 410 },
                       { range: [311, 440], level: 402 },
                       { range: [441, Infinity], level: 409 }
                   ];
   static FLOOR_LEVELS_67 = [
                        { range: [-Infinity, 120], level: 431 },
                        { range: [121, 150], level: 439 },
                        { range: [151, 270], level: 446 },
                        { range: [238, Infinity], level: 425 }
                    ];
    constructor(number, canvas, picPath, leftExit, rightExit, floorLevels, checkpoints, batsCount){
        this.player = null;
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
        if(this.player)
            this.player.draw();
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

    animate(player){
        this.player = player;
        this.player.draw();
        if (this.bats.length > 0){

            this.bats.forEach(b => b.move());
            this.draw();
            this.drawItems();
            this.drawEnemies();
        }
    }

    movePlayerLeft(player){
        player.moveLeft();
        player.y = this.getFloorLevel(player.x);
    }

    movePlayerRight(player){
        player.moveRight();
        player.y = this.getFloorLevel(player.x);
    }

    handleFirePressed(player) {

        this.writeUpperInfo("You picked " + this.pickGarlic(player));
        new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1500);
        }).then(() => {
            let inventoryInfo = "Inventory: ";
            player.inventory.forEach(item => {
                inventoryInfo += (item.name + " ");
            });
            console.log(inventoryInfo);
            this.writeUpperInfo(inventoryInfo);

            return new Promise((resolve2) => {
                setTimeout(() => {
                    resolve2();
                }, 1500);
            });
        }).then(() => {
            this.writeRoomInfo();
        });

    }

    pickGarlic(player){
        let result = "nothing";
        const itemsShallowCopy = [...this.items];

        itemsShallowCopy.forEach(item =>{
            console.log("item at " + item.x + " player at " + player.x);
            if (item.collide(player)){
                console.log("Grabbing " + item.name);
                this.items = this.items.filter(i => i !== item);
                player.inventory.push(item);
                result = 'garlic';
                ping();
            }
        })
        return result;
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
