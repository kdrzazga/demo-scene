class NPC {
    constructor({
        name = 'NPC',
        position = [0, 0, 0],
        rotation = 0,
        height = 1.85,
        maxHeadTurn = 1.0,
        headTurnSpeed = 3,
        breathingRate = 1.6,
        labelDistance = 4,
        labelHeight = 2.08,
        labelWidth = 0.55,
        labelFadeSpeed = 5,
        labelFont = 'bold 26px Arial, Helvetica, sans-serif',
        lookDistance = 8,
        route = [],
        walkSpeed = 1.3,
        stepLength = 0.7,
        strideAngle = 0.45,
        waypointPause = 2,
        turnSpeed = 5,
        personalSpace = 0.9,
        welcomeMp3 = '',
        hitPoints = 3,
        flinchRecovery = 6,
        appearance = {},
    } = {}) {
        this.name = name;
        this.height = height;
        this.maxHeadTurn = maxHeadTurn;
        this.headTurnSpeed = headTurnSpeed;
        this.breathingRate = breathingRate;
        this.labelDistance = labelDistance;
        this.labelHeight = labelHeight;
        this.labelWidth = labelWidth;
        this.labelFadeSpeed = labelFadeSpeed;
        this.labelFont = labelFont;
        this.lookDistance = lookDistance;
        this.route = route;
        this.walkSpeed = walkSpeed;
        this.stepLength = stepLength;
        this.strideAngle = strideAngle;
        this.waypointPause = waypointPause;
        this.turnSpeed = turnSpeed;
        this.personalSpace = personalSpace;
        this.welcomeMp3 = welcomeMp3;
        this.welcomed = false;
        this.maxHitPoints = hitPoints;
        this.hitPoints = hitPoints;
        this.flinchRecovery = flinchRecovery;
        this.flinch = 0;
        this.appearance = {
            skin: 0xb98a6a,
            hair: 0x141210,
            eyes: 0x3a2a20,
            shirt: 0x4a4a50,
            sleeve: null,
            pants: 0x2a2a30,
            shoes: 0x0c0c0e,
            belt: 0x121214,
            buckle: 0x9aa0a8,
            ...appearance,
        };
        this.disposables = [];
        this.materials = new Map();
        this.time = Math.random() * 10;
        this.headYaw = 0;
        this.lookTarget = null;
        this.avoid = [];
        this.routeIndex = 0;
        this.pauseTimer = 0;
        this.walkPhase = 0;
        this.walkBlend = 0;

        this.group = new THREE.Group();
        this.group.position.set(...position);
        this.group.rotation.y = rotation;
        this.group.scale.setScalar(height / 1.85);
        this.body = new THREE.Group();
        this.group.add(this.body);
        this.build();
        this.createLabel();
    }

    static circleRoute([centerX, centerZ], radius, count = 12, startAngle = 0) {
        return Array.from({ length: count }, (_, index) => {
            const angle = startAngle + index / count * Math.PI * 2;
            return [centerX + Math.cos(angle) * radius, centerZ + Math.sin(angle) * radius];
        });
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    material(color, options = {}) {
        const key = `${color}:${JSON.stringify(options)}`;
        if (!this.materials.has(key)) this.materials.set(key, this.track(new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...options })));
        return this.materials.get(key);
    }

    add(parent, geometry, material, x = 0, y = 0, z = 0) {
        const mesh = new THREE.Mesh(this.track(geometry), material);
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
    }

    limb(parent, from, to, radiusTop, radiusBottom, material) {
        const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
        const mesh = this.add(parent, new THREE.CylinderGeometry(radiusTop, radiusBottom, start.distanceTo(end), 12), material);
        mesh.position.copy(start).add(end).multiplyScalar(0.5);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
        return mesh;
    }

    build() {
        this.createLegs();
        this.createPelvis();
        this.createTorso();
        this.createArms();
        this.createHead();
        this.decorate();
    }

    decorate() {
    }

    createLegs() {
        const pants = this.material(this.appearance.pants);
        const shoes = this.material(this.appearance.shoes, { roughness: 0.35 });
        this.legs = [-1, 1].map(side => {
            const leg = new THREE.Group();
            leg.position.set(side * 0.11, 0.97, 0);
            this.body.add(leg);
            this.limb(leg, [0, 0, 0], [0, -0.87, 0.01], 0.09, 0.07, pants);
            this.add(leg, new THREE.BoxGeometry(0.12, 0.1, 0.28), shoes, 0, -0.92, 0.05);
            return leg;
        });
    }

    createPelvis() {
        this.add(this.body, new THREE.BoxGeometry(0.36, 0.18, 0.22), this.material(this.appearance.pants), 0, 0.98, 0);
        this.add(this.body, new THREE.BoxGeometry(0.37, 0.05, 0.23), this.material(this.appearance.belt), 0, 1.04, 0);
        this.add(this.body, new THREE.BoxGeometry(0.05, 0.04, 0.01), this.material(this.appearance.buckle, { metalness: 0.8, roughness: 0.3 }), 0, 1.04, 0.118);
    }

    createTorso() {
        this.torso = new THREE.Group();
        this.torso.position.y = 1.07;
        this.body.add(this.torso);
        const chest = this.add(this.torso, new THREE.CylinderGeometry(0.2, 0.17, 0.52, 16), this.material(this.appearance.shirt), 0, 0.26, 0);
        chest.scale.z = 0.68;
        this.add(this.torso, new THREE.CylinderGeometry(0.055, 0.06, 0.12, 10), this.material(this.appearance.skin), 0, 0.57, 0);
    }

    createArms() {
        const sleeve = this.material(this.appearance.sleeve ?? this.appearance.shirt);
        const skin = this.material(this.appearance.skin);
        this.arms = [-1, 1].map(side => {
            const arm = new THREE.Group();
            arm.position.set(side * 0.24, 1.5, 0);
            this.body.add(arm);
            this.add(arm, new THREE.SphereGeometry(0.08, 12, 10), sleeve);
            this.limb(arm, [0, 0, 0], [side * 0.03, -0.3, 0.01], 0.065, 0.058, sleeve);
            this.limb(arm, [side * 0.03, -0.3, 0.01], [side * 0.04, -0.56, 0.04], 0.057, 0.048, sleeve);
            this.add(arm, new THREE.BoxGeometry(0.05, 0.16, 0.08), skin, side * 0.045, -0.65, 0.045);
            return arm;
        });
    }

    createHead() {
        this.head = new THREE.Group();
        this.head.position.set(0, 1.68, 0.01);
        this.body.add(this.head);
        const skin = this.material(this.appearance.skin);
        this.add(this.head, new THREE.SphereGeometry(0.115, 24, 18), skin, 0, 0.09, 0).scale.set(0.88, 1.12, 1.0);
        this.add(this.head, new THREE.BoxGeometry(0.03, 0.05, 0.04), skin, 0, 0.08, 0.115);
        [-1, 1].forEach(side => {
            this.add(this.head, new THREE.SphereGeometry(0.025, 8, 8), skin, side * 0.1, 0.09, 0).scale.set(0.5, 1, 0.8);
            this.add(this.head, new THREE.SphereGeometry(0.013, 10, 8), this.eyeMaterial(), side * 0.038, 0.11, 0.106);
            this.add(this.head, new THREE.BoxGeometry(0.04, 0.008, 0.01), this.material(this.appearance.hair), side * 0.04, 0.135, 0.11).rotation.z = side * -0.12;
        });
        this.createHair();
    }

    eyeMaterial() {
        return this.material(this.appearance.eyes);
    }

    createHair() {
        const hair = this.add(this.head, new THREE.SphereGeometry(0.122, 24, 12, 0, Math.PI * 2, 0, 1.35), this.material(this.appearance.hair, { roughness: 0.4 }), 0, 0.1, -0.012);
        hair.scale.set(0.9, 1.12, 1.04);
        hair.rotation.x = -0.35;
    }

    createLabel() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 40;
        const c = canvas.getContext('2d');
        c.font = this.labelFont;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.lineWidth = 4;
        c.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        c.strokeText(this.name, 128, 21);
        c.fillStyle = '#e6eef3';
        c.fillText(this.name, 128, 21);
        this.label = new THREE.Sprite(this.track(new THREE.SpriteMaterial({
            map: this.track(new THREE.CanvasTexture(canvas)),
            transparent: true,
            depthWrite: false,
            opacity: 0,
        })));
        this.label.scale.set(this.labelWidth, this.labelWidth * canvas.height / canvas.width, 1);
        this.label.position.y = this.labelHeight;
        this.label.renderOrder = 10;
        this.label.visible = false;
        this.group.add(this.label);
    }

    lookAt(target) {
        this.lookTarget = target;
    }

    avoidPositions(positions) {
        this.avoid = positions;
    }

    get walking() {
        return this.walkBlend > 0.5;
    }

    get alive() {
        return this.hitPoints > 0;
    }

    get solid() {
        return this.alive;
    }

    hit(damage = 1) {
        if (!this.alive) return;
        this.hitPoints = Math.max(0, this.hitPoints - damage);
        console.log(`${this.name}, HP: ${this.hitPoints}/${this.maxHitPoints}`);
        this.flinch = 1;
        if (!this.alive) this.die();
    }

    die() {
        this.group.visible = false;
        this.welcomeAudio?.pause();
    }

    reset() {
        this.revive();
        this.welcomed = false;
    }

    revive() {
        this.hitPoints = this.maxHitPoints;
        this.flinch = 0;
        this.group.visible = true;
    }

    update(dt) {
        if (!this.alive) return;
        this.time += dt;
        this.flinch = Math.max(0, this.flinch - dt * this.flinchRecovery);
        const breath = Math.sin(this.time * this.breathingRate * Math.PI);
        this.torso.scale.set(1 + breath * 0.008, 1 + breath * 0.006, 1 + breath * 0.012);
        this.updateRoute(dt);
        this.updateStride();
        this.head.rotation.x = Math.sin(this.time * 0.5) * 0.02;
        this.updateHeadTurn(dt);
        this.updateLabel(dt);
    }

    updateRoute(dt) {
        let moving = false;
        if (this.route.length > 0) {
            if (this.pauseTimer > 0) this.pauseTimer -= dt;
            else moving = this.walkTowards(this.route[this.routeIndex], dt);
        }
        this.walkBlend = Math.max(0, Math.min(1, this.walkBlend + (moving ? 1 : -1) * dt * 4));
        if (moving) this.walkPhase += dt * this.walkSpeed * Math.PI / this.stepLength;
    }

    walkTowards([targetX, targetZ], dt) {
        const position = this.group.position;
        const dx = targetX - position.x, dz = targetZ - position.z;
        const distance = Math.hypot(dx, dz);
        if (distance < 0.05) {
            this.routeIndex = (this.routeIndex + 1) % this.route.length;
            this.pauseTimer = this.route.length > 1 ? this.waypointPause : Infinity;
            return false;
        }
        this.turnTowards(Math.atan2(dx, dz), dt);
        const step = Math.min(distance, this.walkSpeed * dt);
        const nextX = position.x + dx / distance * step, nextZ = position.z + dz / distance * step;
        if (this.avoid.some(other => Math.hypot(other.x - nextX, other.z - nextZ) < this.personalSpace)) return false;
        position.x = nextX;
        position.z = nextZ;
        return true;
    }

    turnTowards(yaw, dt) {
        const difference = Math.atan2(Math.sin(yaw - this.group.rotation.y), Math.cos(yaw - this.group.rotation.y));
        this.group.rotation.y += difference * Math.min(1, dt * this.turnSpeed);
    }

    updateStride() {
        const swing = Math.sin(this.walkPhase) * this.strideAngle * this.walkBlend;
        this.legs[0].rotation.x = swing;
        this.legs[1].rotation.x = -swing;
        this.arms.forEach((arm, index) => arm.rotation.x = (index === 0 ? -swing : swing) * 0.7 + Math.sin(this.time * 0.7 + index) * 0.02);
        this.body.position.y = -Math.abs(Math.sin(this.walkPhase)) * 0.025 * this.walkBlend;
        this.body.rotation.x = -this.flinch * 0.18;
    }

    updateLabel(dt) {
        const near = !!this.lookTarget && this.distanceTo(this.lookTarget) <= this.labelDistance;
        if (near && !this.welcomed) this.welcome();
        const material = this.label.material;
        material.opacity = Math.max(0, Math.min(1, material.opacity + (near ? 1 : -1) * dt * this.labelFadeSpeed));
        this.label.visible = material.opacity > 0;
    }

    welcome() {
        this.welcomed = true;
        if (!this.welcomeMp3) return;
        this.welcomeAudio = new Audio(this.welcomeMp3);
        this.welcomeAudio.play().catch(() => {});
    }

    distanceTo(point) {
        return Math.hypot(point.x - this.group.position.x, point.z - this.group.position.z);
    }

    updateHeadTurn(dt) {
        let targetYaw = 0;
        if (this.lookTarget && this.distanceTo(this.lookTarget) <= this.lookDistance) {
            const local = this.group.worldToLocal(this.lookTarget.clone());
            targetYaw = Math.max(-this.maxHeadTurn, Math.min(this.maxHeadTurn, Math.atan2(local.x, local.z)));
        }
        this.headYaw += (targetYaw - this.headYaw) * Math.min(1, dt * this.headTurnSpeed);
        this.head.rotation.y = this.headYaw;
    }

    dispose() {
        this.welcomeAudio?.pause();
        this.disposables.forEach(resource => resource.dispose());
    }
}
