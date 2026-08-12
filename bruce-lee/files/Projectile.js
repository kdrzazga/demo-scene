class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, direction) {
        super(scene, x, y, 'liukang', 'fire0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 520;
        this.range = 800;
        this.startX = x;
        this.direction = direction;
        this.exploding = false;

        this.setOrigin(0.5, 0.5);
        this.setDepth(12);
        this.setScale(0.75);
        this.setFlipX(direction < 0);
        this.body.setAllowGravity(false);
        this.body.setSize(28, 22, true);
        this.body.setVelocityX(this.speed * direction);
        this.anims.play('fireball', true);
    }

    explode() {
        if (this.exploding) return;
        this.exploding = true;
        if (this.scene.projectile === this) this.scene.projectile = null;
        this.body.setVelocity(0, 0);
        this.body.enable = false;
        this.play('explosion');
        this.once('animationcomplete', () => this.destroy());
    }

    update() {
        if (this.exploding) return;
        if (Math.abs(this.x - this.startX) >= this.range) { this.explode(); return; }
        const bounds = this.scene.physics.world.bounds;
        if (this.x < bounds.x || this.x > bounds.x + bounds.width) this.explode();
    }
}
