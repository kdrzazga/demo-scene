class Garlic extends Sprite{
    static PATH = "dizzol/garlic.png";

    constructor(canvas,x, y){
        super(canvas, x, y);
        this.name = 'garlic';
        this.picPath = Garlic.PATH;
        this.picLeftPath = Garlic.PATH;
        this.picRightPath = Garlic.PATH;
    }
}

class Coin extends Sprite{
    static PATH = "dizzol/jajoL.png";

    constructor(canvas,x, y){
        super(canvas, x, y);
        this.name = 'coin';
        this.picPath = Coin.PATH;
        this.picLeftPath = Coin.PATH;
        this.picRightPath = Coin.PATH;
    }
}

class Dizzy extends Player{

    constructor(canvas){
        super(canvas, 450, 409);
    	this.picPath = "dizzol/jajoL.png";
    	this.picLeftPath = "dizzol/jajoL.png";
    	this.picRightPath = "dizzol/jajoR.png";
    	this.inventory = [new Coin()];
    	this.hp = 1;
    }

    fightBatWithGarlic(bat){
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] instanceof Garlic) {

                this.inventory.splice(i, 1);
                bat.hp = 0;
                console.log("Removed one Garlic instance from inventory to kill/scare off a BAT.");
                bat.revive(5000);
                return true;
            }
        }
        console.log("You have no Garlic to fight Bats. Your fate is miserable.")
        return false;
    }
}

class Bat extends Sprite{

    constructor(canvas, y, speed){
        super(canvas, 100, y);
    	this.picPath = "dizzol/bat.png";
    	this.picLeftPath = "dizzol/bat.png";
    	this.picRightPath = "dizzol/bat.png";
    	this.speed = speed;
    	this.hp = 1;
    }

    move() {
        if (this.hp <= 0)
            return;

        this.x += this.speed;
        const minX = 70;
        const maxX = 330;
        const halfWay = (minX + maxX) /2;
        this.y += this.x > halfWay ? 1.3 : -1.3;
        if (this.y <= 9 * C64Blackbox.rowHeight+ this.speed){
            this.y = 9 * C64Blackbox.rowHeight + 2 * this.speed;
        }
        if (this.x > maxX || this.x < minX) {
            this.speed = -this.speed;
        }
    }
}

class Troll extends Sprite{

    constructor(canvas, x){
        super(canvas, x, 400);
    	this.picPath = "dizzol/trollR.png";
    	this.picLeftPath = "dizzol/trollR.png";
    	this.picRightPath = "dizzol/trollR.png";
    	this.hp = 1;
    }

    move() {
        //TODO
    }
}

class Knight extends Sprite{

    constructor(canvas, y){
        super(canvas, x, 400);
    	this.picPath = "dizzol/knight.png";
    	this.picLeftPath = "dizzol/knight.png";
    	this.picRightPath = "dizzol/knight.png";
    	this.hp = 1;
    }

    move() {
        //TODO
    }

}
