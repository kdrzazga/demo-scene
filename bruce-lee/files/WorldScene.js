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

        this.platformBodies = this.buildPlatforms(data.platforms);
        this.registerLiuKang();

        this.player = new Player(this, this.spawn.x, this.spawn.y, 'liukang')
            .fitHeight(this.bruceHeight)
            .setEscalators(data.escalators);

        this.physics.add.collider(this.player, this.platformBodies, null, this.landOnTop, this);

        this.controls = new Controls(this);
        this.director = new CameraDirector(this, this.player);
        this.debug = this.buildDebug(data);
        this.input.keyboard.on('keydown-D', () => this.debug.setVisible(!this.debug.visible));
    }

    registerLiuKang() {
        const texture = this.textures.get('liukang');
        this.walkFrames.forEach((frame, i) =>
            texture.add('walk' + i, 0, frame[0], this.walkBand.y, frame[1], this.walkBand.h));
        texture.add('jump', 0, this.jumpFrame.x, this.jumpFrame.y, this.jumpFrame.w, this.jumpFrame.h);
        this.anims.create({
            key: 'walk',
            frames: this.walkFrames.map((frame, i) => ({ key: 'liukang', frame: 'walk' + i })),
            frameRate: 14,
            repeat: -1
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

    landOnTop(player, platform) {
        if (player.climbing) return false;
        return player.body.velocity.y >= 0 &&
            player.body.bottom <= platform.body.top + this.oneWayTolerance;
    }

    buildDebug(data) {
        const g = this.add.graphics().setDepth(999).setVisible(false);
        g.lineStyle(2, 0x00ff66, 1);
        for (const p of data.platforms) g.strokeRect(p.x, p.y, p.w, Math.max(p.h, 2));
        g.lineStyle(2, 0xff33ff, 1);
        for (const e of data.escalators) g.strokeRect(e.x, e.y, e.w, e.h);
        g.fillStyle(0xffe066, 1);
        for (const l of data.lanterns) g.fillCircle(l.x, l.y, 4);
        return g;
    }

    update(time) {
        this.player.update(this.controls);
        this.director.update(time);
    }
}
