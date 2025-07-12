class Constants{
    static SCREEN_WIDTH = 800;
    static SCREEN_HEIGHT = 600;
}

const WireSlot = Object.freeze({
    EMPTY: {imageId: 'empty-wire-section'},
    WIRE_STRAIGHT: {imageId: 'wire-section'},
    WIRE_UP: {imageId: 'wire-section-up'},
    WIRE_DOWN: {imageId: 'wire-section-down'},
});

class Floor {
    static COUNT = 0;
    static BUILDING_HEIGHT = Constants.SCREEN_HEIGHT - 100;
    static WIDTH;
    static HEIGHT;

    constructor() {
        this.name = '';
        this.id = Floor.COUNT;
        Floor.COUNT++;
        this.floorLevel = 0;
        this.ceilingConnectors = [];//connector unit is Slot number, not position on screen
        this.bottomConnectors = [];
    }

    init(physics){
        this.sprite = physics.add.sprite(Constants.SCREEN_WIDTH/2 + Ladder.WIDTH/2 - 20, Constants.SCREEN_HEIGHT/this.id, 'floor' + this.id)
    }

    calculateFloorLevel(){
        //should be called only after all floors are created
        this.floorLevel = Math.ceil((this.id + 1) * Floor.BUILDING_HEIGHT / Floor.COUNT);
        this.sprite.y = this.floorLevel;
        console.log(`Floor ${this.id} is on level = ${this.floorLevel}`);
    }

    onFloor(x, y) {
        y += Floor.HEIGHT - 30;
        if (typeof y !== 'number')
            console.warn('Wrong argument'); //defensive programming makes sense in this particular place

        const tolerance = this.floorLevel * 0.05;
        const lowerBoundY = this.floorLevel;
        const upperBoundY = this.floorLevel + tolerance;

        const lowerBoundX = this.getLeftPosition();
        const upperBoundX = lowerBoundX + Floor.WIDTH;
        return x > lowerBoundX && x < upperBoundX  && y >= lowerBoundY && y <= upperBoundY;
    }

    getLeftPosition(){
        return this.sprite.x - Floor.WIDTH/2;
    }

}

class Ladder {
    static WIDTH = 60;

    constructor() {
        this.enabled = true;
    }

    init(physics){
        if (this.enabled)
            this.sprite = physics.add.sprite(Ladder.WIDTH/2, Constants.SCREEN_HEIGHT/2, 'ladder');
    }

    onLadder(x1){
        const edge1 = this.sprite.x - Ladder.WIDTH /2;
        const edge2 = this.sprite.x + Ladder.WIDTH /2;
        return x1 > edge1 && x1 < edge2;
    }
}

class Building {

    static GROUND_FLOOR_LEVEL = 589;

    constructor(label){
        this.label = label;
        this.ladder = new Ladder();
        this.floors = [];
        this.wires = [];
        this.enemies = [];
        this.leftPowerLine = new PowerLine();
        this.rightPowerLine = new PowerLine();
    }

    init(physics){
       this.ladder.init(physics);
       this.leftPowerLine.init(physics, 'left');
       this.rightPowerLine.init(physics, 'right');
    }

    includeWiresInInfoFrame() {
        const infoFrame = document.getElementById('connection-status');
        this.wires.forEach((_, i) => {
            const wireDiv = document.createElement('div');
            wireDiv.name = 'wire-info';
            wireDiv.id = 'wire' + i;
            wireDiv.style.fontSize = '1em';
            wireDiv.style.color = 'yellow';
            wireDiv.innerText = 'no power';
            infoFrame.appendChild(wireDiv);
        });
    }

    getCurrentFloor(player) {
        if (!player) return -1;

        const tolerance = 50;
        return this.floors.findIndex(floor =>
            Math.abs(Math.abs(floor.floorLevel - player.y) - 28) < tolerance
        );
    }

    drawWire(player, wireType){
        const currentFloorNumber = this.getCurrentFloor(player);
        if (currentFloorNumber < 0) return;

        const currentFloor = this.floors[currentFloorNumber];

        if (currentFloor.onFloor(player.x, player.y)){
            console.log(`Draw wire over floor ${currentFloorNumber}`);

            if(wireType === WireSlot.WIRE_UP){
                if (currentFloorNumber == 0) return;

                const upperFloor = this.floors[currentFloorNumber-1];
                const index = Math.floor((player.x - currentFloor.getLeftPosition()) / Wire.SLOT_SIZE);
                const match = upperFloor.bottomConnectors.filter(cnctr => cnctr == index);
                if (match.length > 0){
                    this.wires[currentFloorNumber].place(currentFloor, player, WireSlot.WIRE_UP);
                    this.wires[currentFloorNumber].actualFloorConnections.add(index);
                }
            }
            else if(wireType === WireSlot.WIRE_DOWN) {
                if (currentFloorNumber > this.floors.length - 1) return;

                const lowerFloor = currentFloor;
                const index = Math.floor((player.x - currentFloor.getLeftPosition()) / Wire.SLOT_SIZE);
                const match = lowerFloor.ceilingConnectors.filter(cnctr => cnctr == index);
                if (match.length > 0){
                    this.wires[currentFloorNumber].place(currentFloor, player, WireSlot.WIRE_DOWN);
                    this.wires[currentFloorNumber].actualFloorConnections.add(index);
                }
            }
            else {
                this.wires[currentFloorNumber].place(currentFloor, player, WireSlot.WIRE_STRAIGHT);
                const index = Math.floor((player.x - currentFloor.getLeftPosition()) / Wire.SLOT_SIZE);
                if (this.wires[currentFloorNumber].actualFloorConnections.has(index)) {
                        this.wires[currentFloorNumber].actualFloorConnections.delete(index);
                }
            }
        }
    }
}

class PowerLine {
    init(physics, type){
        const objectName = 'power-line-' + type;
        const x = type === 'left' ? Ladder.WIDTH + 30 : Ladder.WIDTH + Floor.WIDTH + 50;
        this.sprite = physics.add.sprite(x, Constants.SCREEN_HEIGHT/2, objectName);
    }
}

class Wire {
    static SLOT_SIZE = 20;

    constructor(id, physics, floor1, floor2, expectedFloorConnectionsCnt) {
        this.id = id;
        this.physics = physics;
        this.x = floor1 ? floor1.sprite.x : 0;
        this.y = this.calculateY(floor1, floor2);
        this.slots = Array(Math.ceil(Floor.WIDTH / Wire.SLOT_SIZE)).fill(WireSlot.EMPTY);
        this.sprites = [];
        this.expectedFloorConnectionsCnt = expectedFloorConnectionsCnt;
        this.actualFloorConnections = new Set();

        console.log(`Created ${this.slots.length} wire slots in wire.`);
    }

    calculateY(floor1, floor2) {
        const y1 = floor1?.sprite.y || 0;
        const y2 = floor2?.sprite.y || 0;
        return (y1 + y2) / 2;
    }

    place(floor, sprite, wireType) {
        const extraInfoDiv = document.getElementById('extra-info');
        extraInfoDiv.innerText = `${floor.id} ${floor.floorLevel}`;

        const index = Math.floor((sprite.x - floor.getLeftPosition()) / Wire.SLOT_SIZE);
        const x = floor.getLeftPosition() + index * Wire.SLOT_SIZE;

        if (this.slots[index] !== WireSlot.EMPTY) {
            this.removeOldWireSprite(index);
        }

        this.slots[index] = wireType;
        const newSprite = this.physics.add.sprite(x, this.y, wireType.imageId);
        newSprite.setDepth(-2);
        this.sprites[index] = newSprite;
        console.log(`Placing wire: [${x}, ${this.y}]. Index = ${index}`);
        this.updateWiringInfo();
    }

    removeOldWireSprite(index) {
        const oldSprite = this.sprites[index];
        if (oldSprite) {
            oldSprite.destroy();
            this.sprites[index] = null;
        }
    }

    updateWiringInfo() {
        const percentage = this.calculateConnectedPercentage();
        const wireDiv = document.getElementById(`wire${this.id}`);
        wireDiv.innerText = this.isConnected() ? 'CONNECTED' : `${percentage} %`;
    }

    isConnected(){
        const percentage = this.calculateConnectedPercentage();
        return percentage === 100 && this.expectedFloorConnectionsCnt == this.actualFloorConnections.size;
    }

    calculateConnectedPercentage(){
        const filledSlots = this.slots.filter(slot => slot !== WireSlot.EMPTY).length;
        return Math.ceil((filledSlots / this.slots.length) * 100);
    }
    
    getSlotAtCoordinateX(floor, x) {
        const index = Math.floor((x - floor.getLeftPosition()) / Wire.SLOT_SIZE);
        return {'index' :index, 'slot': this.slots[index]};
    }
}

class Enemy {
    constructor(id){
        this.sprite = null;
        this.id = id;
        this.active = false;
        this.speed = 1;
        this.minX = 150;
        this.maxX = Floor.WIDTH;
    }

    collide(player) {
        const distanceX = player.x - this.sprite.x;
        const distanceY = player.y - this.sprite.y;

        const collisionVertical = -40 < distanceY && distanceY < 0;

        if (!collisionVertical) return 0;

        const threshold = 20;
        if (Math.abs(distanceX) < threshold) {
            if (distanceX < 0) {
                return -1;
            } else {
                return 1;
            }
        }

        return 0;
    }
}

class Bat extends Enemy {
    static MOVE_RADIUS = 280;

    constructor(id){
        super(id);
        this.upperVerticalLimit = Floor.HEIGHT -16;
    }

    init(physics, y){
        this.sprite = physics.add.sprite(180 + (this.id + 1)*44, y, 'bat');
        //this.sprite.velocity = { y: this.speed };
        this.currentAngle = 0;
        this.angularSpeed = 0.01
    }

    move(){
        const centerY = Floor.BUILDING_HEIGHT / 2;
        const lowerVerticalLimit = 2 * Floor.BUILDING_HEIGHT/ 3 + Floor.HEIGHT - 10 - 9 * this.id;

        this.currentAngle = this.currentAngle + this.angularSpeed;
        if (this.currentAngle > 2* Math.PI){
            this.currentAngle -= 2* Math.PI;
        }

        this.sprite.x = this.centerX + Bat.MOVE_RADIUS * Math.cos(this.currentAngle);
        this.sprite.y = centerY + Bat.MOVE_RADIUS * Math.sin(this.currentAngle);

        if (this.sprite.y < this.upperVerticalLimit) this.sprite.y = this.upperVerticalLimit;
        if (this.sprite.y > lowerVerticalLimit) this.sprite.y = lowerVerticalLimit;
    }
}

class Rat extends Enemy{

    constructor(id){
        super(id);
        this.wireId = undefined;
    }

    init(physics, y){
        this.sprite = physics.add.sprite(180 + (this.id + 1)*44, y, 'rat' + this.id);
        this.sprite.velocity = { x: this.speed };
    }

    move(){
        this.sprite.x += this.sprite.velocity.x;
        if (this.sprite.x >= this.maxX || this.sprite.x <= this.minX){
            this.sprite.velocity.x *= -1;
            this.sprite.setFlipX(!this.sprite.flipX);
        }
    }

    getWireId(){
        return this.wireId;
    }
}

class Spider extends Enemy{
    static WEB_HEIGHT = 15;

    init(physics, y){
        this.physics = physics;
        this.sprite = physics.add.sprite(180 + (this.id + 1)*44, y, 'spider');
        this.webSections = this.physics.add.group();
        this.lastWebPosition = 0;

        this.speed = 0.5;
        this.sprite.velocity = { y: this.speed };
        this.sprite.setDepth(10); //on top of all other sprites
    }

    move(){
        this.sprite.y += this.speed;
        this.addOrRemoveWebSection();
        if( this.sprite.y< 20 || this.sprite.y > Floor.BUILDING_HEIGHT + 62) this.speed *= -1;

    }

    addOrRemoveWebSection() {
        const currentWebPosition = Math.floor(this.sprite.y / Spider.WEB_HEIGHT) * Spider.WEB_HEIGHT;

        if (currentWebPosition > this.lastWebPosition) {
            const webSection = this.webSections.create(this.sprite.x, currentWebPosition, 'web');
            webSection.setOrigin(0.5, 0); // Set the origin to the top center
            this.lastWebPosition = currentWebPosition; // Update the last position
        }
        else if (currentWebPosition < this.lastWebPosition) {
            const lastWebSection = this.webSections.getChildren().find(web => web.y === this.lastWebPosition);
            if (lastWebSection) {
                lastWebSection.destroy();
                this.lastWebPosition = currentWebPosition;
            }
        }
    }

    collide(player){
        const distanceX = player.x - this.sprite.x;
        const distanceY = player.y - this.sprite.y;

        const collisionVertical = -20 < distanceY && distanceY < 20;
        const threshold = 20;
        const collisionHorizontal = (Math.abs(distanceX) < threshold);

        if (collisionVertical && collisionHorizontal) location.reload();
        else return 0;
    }

}

class FloorBuilder {

    constructor(){
        this.floor = new Floor();
    }

    build(){
        return this.floor;
    }

    withName(name) {
        this.floor.name = name;
        return this;
    }

    withCeilingConnectors(connectorSlotsArray){
        this.floor.ceilingConnectors.push(...connectorSlotsArray);
        return this;
    }

    withBottomConnectors(connectorSlotsArray) {
        this.floor.bottomConnectors.push(...connectorSlotsArray);
        return this;
    }

    withLampInCenter() {
        const lampConnectorX = Math.floor(Floor.WIDTH/Wire.SLOT_SIZE /2);
        this.withCeilingConnectors([lampConnectorX]);
        return this;
    }

    withTVInCenterLeft(){
        const tvConnectorX = 12;
        this.withBottomConnectors([tvConnectorX]);
        return this;
    }

    withFridgeOnLeft(){
        const fridgeConnectorSlot = 2;
        this.withCeilingConnectors([fridgeConnectorSlot]);
        return this;
    }

    withKitchenSegmentOnRight(){
        const fridge2ConnectorSlot = 29;
        const fanConnectorSlot = 26;
        this.withCeilingConnectors([fridge2ConnectorSlot]);
        this.withCeilingConnectors([fanConnectorSlot]);
        return this;
    }
}

//module.exports = { Constants, Floor, Ladder, Building, PowerLine, Wire, WireSlot};
