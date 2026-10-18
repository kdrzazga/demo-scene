class MaggieChow extends NPC {
    constructor(options = {}) {
        super({
            name: 'Maggie Chow',
            hitPoints: 2,
            height: 1.72,
            welcomeMp3: 'npc/MaggieChow.mp3',
            ...options,
            appearance: {
                skin: 0xe8c8b0,
                hair: 0x0a0a0c,
                eyes: 0x1e1612,
                shirt: 0x8e1414,
                sleeve: 0x8e1414,
                pants: 0x4a4240,
                shoes: 0xc0c4c8,
                belt: 0x8e1414,
                buckle: 0x8e1414,
                silk: 0x8e1414,
                gold: 0xd8a032,
                buttons: 0x0c0c0e,
                lips: 0x6e1420,
                ...options.appearance,
            },
        });
    }

    decorate() {
        this.body.scale.set(0.88, 1, 0.9);
        this.gold = this.material(this.appearance.gold, { roughness: 0.35, metalness: 0.8 });
        this.silkMaterial = this.track(new THREE.MeshStandardMaterial({ map: this.paintSilk(), roughness: 0.35, metalness: 0.15 }));
        this.torso.children[0].material = this.silkMaterial;
        this.legs.forEach(leg => leg.children[0].material = this.track(new THREE.MeshStandardMaterial({ color: this.appearance.pants, roughness: 0.3, metalness: 0.3 })));
        this.createSkirt();
        this.createCollar();
        this.createButtons();
        this.createCuffs();
        this.createHeels();
        this.createHairStyle();
        this.add(this.head, new THREE.BoxGeometry(0.038, 0.012, 0.012), this.material(this.appearance.lips, { roughness: 0.3 }), 0, 0.035, 0.11);
    }

    cssColor(color) {
        return `#${new THREE.Color(color).getHexString()}`;
    }

    paintSilk() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const c = canvas.getContext('2d');
        c.fillStyle = this.cssColor(this.appearance.silk);
        c.fillRect(0, 0, 256, 256);
        for (let index = 0; index < 40; index++) {
            c.strokeStyle = `rgba(60, 0, 0, ${0.15 + Math.random() * 0.2})`;
            c.lineWidth = 1;
            c.beginPath();
            c.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 8, 0, Math.PI * 1.5);
            c.stroke();
        }
        this.paintDragon(c, 128);
        const texture = this.track(new THREE.CanvasTexture(canvas));
        texture.wrapS = THREE.RepeatWrapping;
        texture.offset.x = 0.5;
        return texture;
    }

    paintDragon(c, centerX) {
        const gold = this.cssColor(this.appearance.gold);
        c.strokeStyle = gold;
        c.lineCap = 'round';
        c.lineWidth = 10;
        c.beginPath();
        c.moveTo(centerX + 6, 20);
        c.bezierCurveTo(centerX - 30, 60, centerX + 30, 90, centerX - 4, 130);
        c.bezierCurveTo(centerX - 34, 170, centerX + 28, 200, centerX - 8, 240);
        c.stroke();
        c.lineWidth = 2;
        c.strokeStyle = '#ffe08a';
        for (let t = 0; t < 1; t += 0.05) {
            const y = 20 + t * 220;
            const x = centerX + Math.sin(t * Math.PI * 4) * 16;
            c.beginPath();
            c.arc(x, y, 3, 0, Math.PI);
            c.stroke();
        }
        c.fillStyle = gold;
        c.beginPath();
        c.ellipse(centerX + 8, 22, 14, 10, -0.4, 0, Math.PI * 2);
        c.fill();
        [[-22, 70], [24, 100], [-26, 170], [22, 205]].forEach(([dx, y]) => {
            c.beginPath();
            c.moveTo(centerX, y);
            c.lineTo(centerX + dx, y - 8);
            c.lineTo(centerX + dx * 0.8, y + 6);
            c.closePath();
            c.fill();
        });
    }

    createSkirt() {
        const profile = [[0.21, 0.62], [0.2, 0.75], [0.185, 0.9], [0.17, 1.02], [0.165, 1.08]]
            .map(([radius, height]) => new THREE.Vector2(radius, height));
        const skirt = this.add(this.body, new THREE.LatheGeometry(profile, 28), this.silkMaterial);
        skirt.scale.z = 0.72;
        const hem = this.add(this.body, new THREE.TorusGeometry(0.205, 0.012, 6, 28), this.gold, 0, 0.625, 0);
        hem.rotation.x = Math.PI / 2;
        hem.scale.y = 0.72;
    }

    createCollar() {
        this.add(this.torso, new THREE.CylinderGeometry(0.064, 0.072, 0.075, 16), this.silkMaterial, 0, 0.6, 0);
        const rim = this.add(this.torso, new THREE.TorusGeometry(0.064, 0.006, 6, 20), this.gold, 0, 0.637, 0);
        rim.rotation.x = Math.PI / 2;
    }

    createButtons() {
        const buttons = this.material(this.appearance.buttons, { roughness: 0.5 });
        [[-0.035, 0.56, 0.072], [-0.06, 0.5, 0.135], [-0.09, 0.44, 0.122]].forEach(([x, y, z]) => {
            const knot = this.add(this.torso, new THREE.BoxGeometry(0.03, 0.01, 0.012), buttons, x, y, z);
            knot.rotation.z = 0.5;
        });
    }

    createCuffs() {
        this.arms.forEach((arm, index) => {
            const side = index === 0 ? -1 : 1;
            this.limb(arm, [side * 0.038, -0.52, 0.035], [side * 0.04, -0.56, 0.04], 0.056, 0.056, this.gold);
        });
    }

    createHeels() {
        const silver = this.material(this.appearance.shoes, { roughness: 0.2, metalness: 0.9 });
        this.legs.forEach(leg => {
            const shoe = leg.children[1];
            shoe.scale.set(0.7, 0.7, 0.85);
            this.add(leg, new THREE.ConeGeometry(0.04, 0.08, 8), silver, 0, -0.93, 0.18).rotation.x = Math.PI / 2;
            this.add(leg, new THREE.BoxGeometry(0.02, 0.07, 0.02), silver, 0, -0.95, -0.06);
        });
    }

    createHairStyle() {
        const hair = this.material(this.appearance.hair, { roughness: 0.4 });
        const bob = this.add(this.head, new THREE.SphereGeometry(0.128, 24, 14, 0, Math.PI * 2, 0, 1.95), hair, 0, 0.1, -0.02);
        bob.scale.set(0.92, 1.05, 1.0);
        bob.rotation.x = -0.65;
        const fringe = this.add(this.head, new THREE.BoxGeometry(0.11, 0.03, 0.02), hair, 0.01, 0.175, 0.1);
        fringe.rotation.set(-0.5, 0, -0.2);
    }
}
