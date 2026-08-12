class WorldScene extends Phaser.Scene {
    constructor() {
        super('world');
        this.worldScale = 2;
        this.gravityY = 1500;
        this.bruceHeight = 56;
        this.platformBody = 24;
        this.oneWayTolerance = 24;
        this.spawn = { x: 200, y: 130 };
        this.walkFrames = [[8, 53], [72, 53], [136, 56], [200, 52], [264, 41], [312, 39], [360, 39], [408, 39], [456, 39], [504, 44]];
        this.walkBand = { y: 13, h: 99 };
        this.jumpFrame = { x: 8, y: 1215, w: 81, h: 105 };
        this.somersaultFrames = [[136, 53], [200, 33], [240, 44], [296, 46], [352, 33], [392, 42], [448, 47]];
        this.somersaultBand = { y: 127, h: 105 };
        this.punchFrames = [[8, 57], [72, 60], [144, 80]];
        this.punchBand = { y: 241, h: 103 };
        this.kickFrames = [[8, 42], [64, 52], [128, 74]];
        this.kickBand = { y: 476, h: 100 };
        this.throwFrames = [[312, 59], [384, 46], [440, 45]];
        this.throwBand = { y: 773, h: 115 };
        this.fireballFrames = [[8, 12], [32, 27], [72, 43], [128, 40]];
        this.explodeFrames = [[176, 23], [208, 37], [256, 39], [304, 41], [352, 44]];
        this.fireballBand = { y: 1692, h: 60 };
    }

    preload() {
        this.load.image('map', 'files/map.png');
        this.load.image('liukang', 'files/liukang.png');
        this.load.json('mapdata', 'files/registry.json');
    }

    create() {
        const data = this.cache.json.get('mapdata');
        const width = data.world.w;
        const height = data.world.h;

        this.add.image(0, 0, 'map').setOrigin(0, 0).setScale(this.worldScale);

        this.physics.world.setBounds(0, 0, width, height);
        this.physics.world.gravity.y = this.gravityY;
        this.cameras.main.setBounds(0, 0, width, height);

        this.projectile = null;
        this.platformBodies = this.buildPlatforms(data.platforms);
        this.wallBodies = this.buildWalls(data.walls);
        this.registerLiuKang();

        this.player = new Player(this, this.spawn.x, this.spawn.y, 'liukang')
            .fitHeight(this.bruceHeight)
            .setEscalators(data.escalators);

        this.physics.add.collider(this.player, this.platformBodies, null, this.landOnTop, this);
        this.physics.add.collider(this.player, this.wallBodies);

        this.controls = new Controls(this);
        this.director = new CameraDirector(this, this.player);
        this.debug = this.buildDebug(data);
        this.input.keyboard.on('keydown-B', () => this.debug.setVisible(!this.debug.visible));
    }

    registerLiuKang() {
        const texture = this.textures.get('liukang');
        this.addStrip(texture, 'walk', this.walkFrames, this.walkBand);
        this.addStrip(texture, 'somersault', this.somersaultFrames, this.somersaultBand);
        this.addStrip(texture, 'punch', this.punchFrames, this.punchBand);
        this.addStrip(texture, 'kick', this.kickFrames, this.kickBand);
        this.addStrip(texture, 'throw', this.throwFrames, this.throwBand);
        this.addStrip(texture, 'fire', this.fireballFrames, this.fireballBand);
        this.addStrip(texture, 'boom', this.explodeFrames, this.fireballBand);
        texture.add('jump', 0, this.jumpFrame.x, this.jumpFrame.y, this.jumpFrame.w, this.jumpFrame.h);

        this.addAnim('walk', 'walk', this.walkFrames.length, 14, -1);
        this.addAnim('somersault', 'somersault', this.somersaultFrames.length, 16, -1);
        this.addAnim('punch', 'punch', this.punchFrames.length, 14, 0);
        this.addAnim('kick', 'kick', this.kickFrames.length, 14, 0);
        this.addAnim('throw', 'throw', this.throwFrames.length, 12, 0);
        this.addAnim('fireball', 'fire', this.fireballFrames.length, 14, -1);
        this.addAnim('explosion', 'boom', this.explodeFrames.length, 16, 0);
    }

    addStrip(texture, prefix, frames, band) {
        frames.forEach((frame, i) => texture.add(prefix + i, 0, frame[0], band.y, frame[1], band.h));
    }

    addAnim(key, prefix, count, frameRate, repeat) {
        const frames = [];
        for (let i = 0; i < count; i++) frames.push({ key: 'liukang', frame: prefix + i });
        this.anims.create({ key, frames, frameRate, repeat });
    }

    launchFireball(x, y, direction) {
        if (this.projectile) return;
        const fireball = new Projectile(this, x, y, direction);
        this.projectile = fireball;
        this.physics.add.collider(fireball, this.wallBodies, () => fireball.explode());
        fireball.once('destroy', () => {
            if (this.projectile === fireball) this.projectile = null;
        });
    }

    buildPlatforms(platforms) {
        const bodies = [];
        for (const p of platforms) {
            const bodyHeight = Math.max(p.h, this.platformBody);
            const rect = this.add.rectangle(p.x + p.w / 2, p.y + bodyHeight / 2, p.w, bodyHeight);
            rect.setVisible(false);
            this.physics.add.existing(rect, true);
            bodies.push(rect);
        }
        return bodies;
    }

    buildWalls(walls) {
        const bodies = [];
        for (const w of walls) {
            const rect = this.add.rectangle(w.x + w.w / 2, w.y + w.h / 2, w.w, w.h);
            rect.setVisible(false);
            this.physics.add.existing(rect, true);
            bodies.push(rect);
        }
        return bodies;
    }

    landOnTop(player, platform) {
        if (player.climbing) return false;
        return player.body.velocity.y >= 0 &&
            player.body.bottom <= platform.body.top + this.oneWayTolerance;
    }

    buildDebug(data) {
        const g = this.add.graphics().setDepth(999).setVisible(false);
        g.lineStyle(2, 0x00ff66, 1);
        for (const p of data.platforms) g.strokeRect(p.x, p.y, p.w, Math.max(p.h, 2));
        g.lineStyle(2, 0xff8800, 1);
        for (const w of data.walls) g.strokeRect(w.x, w.y, w.w, w.h);
        g.lineStyle(2, 0xff33ff, 1);
        for (const e of data.escalators) g.strokeRect(e.x, e.y, e.w, e.h);
        g.fillStyle(0xffe066, 1);
        for (const l of data.lanterns) g.fillCircle(l.x, l.y, 4);
        return g;
    }

    update(time) {
        this.player.update(this.controls);
        if (this.projectile) this.projectile.update();
        this.director.update(time);
    }
}
