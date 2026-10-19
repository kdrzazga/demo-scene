class Level {
    constructor({
        fogColor = 0x05060a,
        fogDensity = 0.006,
        cameraFar = 2000,
        fadeInDuration = 2,
        controls = {},
        weapon = {},
        useReach = 2.5,
        weaponDamage = 1,
        weaponRange = 200,
        npcRadius = 0.5,
        doorRadius = 1,
        arrivalDistance = 1.4,
        onCollect = () => {},
    } = {}) {
        this.fadeInDuration = fadeInDuration;
        this.controls = controls;
        this.weaponOptions = weapon;
        this.useReach = useReach;
        this.weaponDamage = weaponDamage;
        this.weaponRange = weaponRange;
        this.npcRadius = npcRadius;
        this.onCollect = onCollect;
        this.doorRadius = doorRadius;
        this.arrivalDistance = arrivalDistance;
        this.started = false;
        this.disposables = [];
        this.npcs = [];
        this.objects = [];
        this.terminals = [];
        this.checkpoints = [];
        this.time = 0;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(fogColor, fogDensity);
        this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, cameraFar);
        this.terminalWindow = new TerminalWindow({ onClose: () => this.leaveTerminal() });
        this.createFade();
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    setUp({ cameraPosition, lookAt, walkableAreas, obstacles = [], npcs = [], objects = [], terminals = [] }) {
        this.npcs = npcs;
        this.objects = objects;
        this.terminals = terminals;
        [...npcs, ...objects, ...terminals].forEach(thing => this.scene.add(thing.group));
        const npcRadius = this.npcRadius;
        this.player = new FirstPersonController(this.camera, {
            position: cameraPosition,
            lookAt,
            eyeHeight: cameraPosition[1],
            walkableAreas,
            floorHeight: (x, z) => this.floorHeight(x, z),
            obstacles: [
                ...npcs.map(npc => ({ position: npc.group.position, radius: npcRadius, get solid() { return npc.solid; } })),
                ...obstacles,
                ...objects,
            ],
            ...this.controls,
        });
        this.grabber = new Grabber(this.camera, {
            objects,
            groundHeight: (x, z) => this.groundHeight(x, z),
            isEnabled: () => this.player.enabled,
            onUse: () => this.player.locked && this.use(),
            onCollect: object => this.collect(object),
        });
        this.weapon = new WeaponView(this.weaponOptions);
        this.hitScan = new HitScan(this.camera, { range: this.weaponRange });
    }

    floorHeight() {
        return 0;
    }

    get doorPosition() {
        return [0, 0];
    }

    get doorInward() {
        return [0, -1];
    }

    get arrival() {
        const [x, z] = this.doorPosition, [dx, dz] = this.doorInward;
        const distance = this.doorRadius + this.arrivalDistance;
        return { x: x + dx * distance, z: z + dz * distance, yaw: Math.atan2(-dx, -dz) };
    }

    exitCheckpoint(onReach) {
        return new Checkpoint({ position: this.doorPosition, radius: this.doorRadius, repeat: true, onReach });
    }

    groundHeight(x, z) {
        return this.floorHeight(x, z);
    }

    get blockers() {
        return [...this.objects.map(object => object.group), ...this.terminals.map(terminal => terminal.group)];
    }

    use() {
        const hit = this.hitScan.trace(this.blockers);
        const terminal = this.hitScan.owner(hit, this.terminals);
        if (terminal && hit.distance <= this.useReach) this.enterTerminal(terminal);
        else if (this.weapon.fire()) this.shoot();
    }

    enterTerminal(terminal) {
        this.player.disable();
        this.terminalWindow.open(terminal.name);
    }

    leaveTerminal() {
        this.player.enable();
        this.player.lock();
    }

    shoot() {
        const targets = this.npcs.filter(npc => npc.alive);
        const hit = this.hitScan.trace([...this.blockers, ...targets.map(npc => npc.group)]);
        this.hitScan.owner(hit, targets)?.hit(this.weaponDamage);
    }

    collect(object) {
        object.collect();
        this.onCollect(object);
    }

    npc(name) {
        return this.npcs.find(npc => npc.name === name) ?? null;
    }

    meets({ talkedTo = [], alive = [] } = {}) {
        return talkedTo.every(name => this.npc(name)?.welcomed) && alive.every(name => this.npc(name)?.alive);
    }

    addCheckpoints(checkpoints) {
        this.checkpoints.push(...checkpoints);
    }

    createFade() {
        this.fadeScene = new THREE.Scene();
        this.fadeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.fadeMaterial = this.track(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, depthTest: false, depthWrite: false }));
        this.fadeScene.add(new THREE.Mesh(this.track(new THREE.PlaneGeometry(2, 2)), this.fadeMaterial));
    }

    restart() {
        this.started = true;
        this.time = 0;
        this.player.reset();
        this.player.enable();
        this.grabber.reset();
        this.npcs.forEach(npc => npc.reset());
        this.checkpoints.forEach(checkpoint => checkpoint.reset());
    }

    stop() {
        this.started = false;
        this.terminalWindow.close(false);
        this.player.disable();
    }

    resume({ x, z, yaw }) {
        this.time = 0;
        this.player.enable();
        this.player.teleport(x, z, yaw);
    }

    suspend() {
        this.terminalWindow.close(false);
        this.player.suspend();
    }

    layout(viewportWidth, viewportHeight) {
        this.camera.aspect = viewportWidth / viewportHeight;
        this.camera.updateProjectionMatrix();
        this.weapon.layout(viewportWidth, viewportHeight);
    }

    update(dt) {
        this.time += dt;
        this.player.update(dt);
        this.grabber.update(dt);
        this.weapon.update(dt, {
            yaw: this.player.yaw,
            pitch: this.player.pitch,
            bobPhase: this.player.bobPhase,
            lowered: !!this.grabber.held,
        });
        this.checkpoints.forEach(checkpoint => checkpoint.check(this.camera.position));
        this.updateWorld(dt);
        this.npcs.forEach(npc => {
            npc.lookAt(this.camera.position);
            npc.avoidPositions([this.camera.position, ...this.npcs.filter(other => other !== npc && other.alive).map(other => other.group.position)]);
            npc.update(dt);
        });
        this.fadeMaterial.opacity = 1 - Math.min(1, this.time / this.fadeInDuration);
    }

    updateWorld() {
    }

    render(renderer) {
        this.player.attach(renderer.domElement);
        this.grabber.attach(renderer.domElement);
        renderer.render(this.scene, this.camera);
        this.weapon.render(renderer);
        if (this.fadeMaterial.opacity > 0) renderer.render(this.fadeScene, this.fadeCamera);
    }

    disposeWorld() {
    }

    dispose() {
        this.disposeWorld();
        this.player.dispose();
        this.grabber.dispose();
        this.weapon.dispose();
        this.terminalWindow.dispose();
        [...this.objects, ...this.terminals, ...this.npcs].forEach(thing => thing.dispose());
        this.disposables.forEach(resource => resource.dispose());
    }
}
