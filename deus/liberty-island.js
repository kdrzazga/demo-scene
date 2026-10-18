class LibertyIsland {
    constructor({
        skylineImage = 'NY_lights.png',
        skylineRadius = 600,
        skylineRepeat = 4,
        skylineHeight = 260,
        skylineHorizon = 390 / 620,
        skyRadius = 900,
        waterLevel = -2,
        fogColor = 0x05060a,
        fogDensity = 0.006,
        cameraPosition = [2, 1.7, 8],
        lookAt = [-6, 3, -40],
        railingMargin = 0.5,
        controls = {},
        fadeInDuration = 2,
        pier = {},
        statue = {},
        ramp = {},
        plateauEdge = [-72, -110],
        leftAreaDepth = 20,
        blockPassageWidth = 6,
        westTerrace = { minX: -152, minZ: -110, maxZ: -80 },
        passage = {},
        passageGuardGroups = [3, 1, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1],
        crateGroupSize = 4,
        npcs = [
            new PaulDenton({ position: [-30, 0, -46], rotation: Math.PI / 2, route: [[-22, -46], [-40, -46]] }),
            new UnatcoTroop({ position: [3.5, 0, -34], rotation: 0, route: [[3.5, -12], [3.5, -34]] }),
            new UnatcoTroop({ position: [-231, 0, -43.8], rotation: Math.PI / 2 }),
            new UnatcoTroop({ position: [-231, 0, -48.2], rotation: Math.PI / 2 }),
            new AnnaNavarre({ position: [-110.5, 3, -24], rotation: 2.3 }),
            new MaggieChow({ position: [-144, 3, -92], rotation: 1.2 }),
            new Terrorist({ position: [-85, 3, -60], rotation: Math.PI, route: [[-85, -95], [-85, -60]] }),
            new Terrorist({
                position: [-95, 3, -38.5], rotation: Math.PI / 2, walkSpeed: 1.5, waypointPause: 0.3,
                route: [[-109.8, -38.5], [-109.8, -53.5], [-95, -53.5], [-95, -38.5]],
            }),
            new Terrorist({ position: [-52, 3, -133], rotation: Math.PI + 0.3 }),
            new Terrorist({ position: [-45, 3, -137], rotation: Math.PI }),
            new Terrorist({ position: [-38, 3, -133], rotation: Math.PI - 0.3 }),
            new Terrorist({ position: [-28.5, 7, -110], waypointPause: 0, route: NPC.circleRoute([-45, -110], 16.5, 16, 0) }),
            new Terrorist({ position: [-61.5, 7, -110], waypointPause: 0, route: NPC.circleRoute([-45, -110], 16.5, 16, Math.PI) }),
        ],
        npcRadius = 0.5,
        objects = [
            new Crate({ position: [-4, 0.5, -8], rotation: 0.3 }),
            new Crate({ position: [-4.4, 0.5, -9.5], rotation: -0.2 }),
            new Crate({ position: [-30, 3.5, -131], rotation: 0.1 }),
            new Crate({ position: [-31.3, 3.5, -130.6], rotation: -0.25 }),
            new Crate({ position: [-30.6, 4.5, -130.8], rotation: 0.6 }),
        ],
        floatDepth = 0.3,
        weapon = {},
        streetLamps = [
            new StreetLamp({ position: [-32, 3, -87.5], facing: StreetLamp.facingTowards([-32, -87.5], [-45, -110]) }),
            new StreetLamp({ position: [-58, 3, -87.5], facing: StreetLamp.facingTowards([-58, -87.5], [-45, -110]) }),
            new StreetLamp({ position: [-150.8, 3, -81.2], facing: StreetLamp.facingTowards([-150.8, -81.2], [-132, -95]) }),
        ],
        tunnelTerminal = { side: -1, along: 5, height: 1.45 },
        tunnelGraffiti = { image: 'easter-egg.png', side: 1, along: 0, height: 1.6, width: 10 },
        useReach = 2.5,
        weaponDamage = 1,
        weaponRange = 200,
    } = {}) {
        this.skylineImage = skylineImage;
        this.skylineRadius = skylineRadius;
        this.skylineRepeat = skylineRepeat;
        this.skylineHeight = skylineHeight;
        this.skylineHorizon = skylineHorizon;
        this.skyRadius = skyRadius;
        this.waterLevel = waterLevel;
        this.floatDepth = floatDepth;
        this.weaponDamage = weaponDamage;
        this.useReach = useReach;
        this.fadeInDuration = fadeInDuration;
        this.disposables = [];

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(fogColor, fogDensity);
        this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);

        this.createSky();
        this.createSkyline();
        this.createWater();
        this.createLights();
        this.pier = new Pier(pier);
        this.statue = new StatueOfLiberty(statue);
        this.ramp = new Ramp({
            start: [-this.pier.sideLength, -this.pier.forwardLength - this.pier.halfWidth],
            connectWidth: this.pier.width,
            ...ramp,
        });
        this.plateau = this.createPlateau(plateauEdge, leftAreaDepth, blockPassageWidth, westTerrace);
        this.passage = new Passage({
            start: [this.ramp.farX - this.ramp.endBlockSize - blockPassageWidth, this.ramp.centerZ],
            width: this.ramp.endBlockSize,
            height: this.ramp.rise,
            waterLevel,
            wallMaterial: this.ramp.wallMaterial,
            floorMaterial: this.ramp.floorMaterial,
            ...passage,
        });
        this.scene.add(this.pier.group, this.ramp.group, this.plateau.group, this.passage.group, this.statue.group);
        this.npcs = [...npcs, ...this.createPassageGuards(passageGuardGroups)];
        this.npcs.forEach(npc => this.scene.add(npc.group));
        this.objects = [...objects, ...this.createPassageCrates(passageGuardGroups, crateGroupSize)];
        this.objects.forEach(object => this.scene.add(object.group));
        this.streetLamps = streetLamps;
        this.streetLamps.forEach(lamp => this.scene.add(lamp.group));
        this.terminals = [this.createTunnelTerminal(tunnelTerminal)];
        this.terminals.forEach(terminal => this.scene.add(terminal.group));
        this.graffiti = this.createTunnelGraffiti(tunnelGraffiti);
        this.scene.add(this.graffiti.group);
        this.terminalWindow = new TerminalWindow({ onClose: () => this.leaveTerminal() });
        this.createFade();
        this.player = new FirstPersonController(this.camera, {
            position: cameraPosition,
            lookAt,
            eyeHeight: cameraPosition[1],
            walkableAreas: [
                ...this.pier.walkableAreas(railingMargin),
                this.ramp.walkableArea(railingMargin),
                this.ramp.openingArea(railingMargin, 'right'),
                this.ramp.openingArea(railingMargin, 'left'),
                ...this.plateau.walkableAreas(railingMargin),
                this.blockPassageArea(railingMargin, blockPassageWidth),
                ...this.passage.walkableAreas(railingMargin),
            ],
            floorHeight: (x, z) => this.floorHeight(x, z),
            obstacles: [
                ...this.npcs.map(npc => ({ position: npc.group.position, radius: npcRadius, get solid() { return npc.solid; } })),
                this.statue.obstacle(railingMargin),
                ...this.objects,
                ...this.streetLamps,
                ...this.passage.lamps,
            ],
            ...controls,
        });
        this.landAreas = [
            ...this.pier.walkableAreas(0),
            this.ramp.walkableArea(0),
            this.ramp.openingArea(0, 'right'),
            this.ramp.openingArea(0, 'left'),
            ...this.plateau.walkableAreas(0),
            this.blockPassageArea(0, blockPassageWidth),
            ...this.passage.walkableAreas(0),
        ];
        this.grabber = new Grabber(this.camera, {
            objects: this.objects,
            groundHeight: (x, z) => this.groundHeight(x, z),
            isEnabled: () => this.player.enabled,
            onUse: () => this.player.locked && this.use(),
        });
        this.weapon = new WeaponView(weapon);
        this.hitScan = new HitScan(this.camera, { range: weaponRange });
        this.time = 0;
        this.checkpoints = [];
    }

    passageGroupCenters(groups) {
        const passage = this.passage, inset = 5;
        const spacing = (passage.length - inset * 2) / Math.max(1, groups.length - 1);
        return groups.map((size, index) => ({
            size,
            index,
            x: passage.startX - inset - index * spacing,
            z: passage.centerZ + (index % 2 === 0 ? -1 : 1) * (size === 1 ? 2 : 1.4),
        }));
    }

    createPassageCrates(groups, crateGroupSize) {
        return this.passageGroupCenters(groups)
            .filter(({ size }) => size === crateGroupSize)
            .map(({ x, z, index }) => new Crate({ position: [x, this.passage.height + 0.5, z], rotation: index * 0.7 }));
    }

    createPassageGuards(groups) {
        const passage = this.passage, wallClearance = 1;
        return this.passageGroupCenters(groups).flatMap(({ size, index, x: centerX, z: centerZ }) => {
            const radius = size === 1 ? 0 : 0.8 + size * 0.1;
            return Array.from({ length: size }, (_, member) => {
                const angle = index + member / size * Math.PI * 2;
                const x = centerX + Math.cos(angle) * radius, z = centerZ + Math.sin(angle) * radius;
                if (size === 1) {
                    const route = [[x, passage.leftZ - wallClearance], [x, passage.rightZ + wallClearance]];
                    return new Terrorist({ position: [x, passage.height, z], rotation: 0, route });
                }
                return new Terrorist({ position: [x, passage.height, z], rotation: Math.atan2(centerX - x, centerZ - z) });
            });
        });
    }

    createTunnelGraffiti({ image, side, along, height, width }) {
        const statue = this.statue;
        const spot = statue.group.localToWorld(new THREE.Vector3(side * (statue.tunnelWidth / 2 - 0.01), 3 + height, along));
        return new Graffiti({ image, width, position: spot.toArray(), facing: statue.group.rotation.y - side * Math.PI / 2 });
    }

    createTunnelTerminal({ side, along, height }) {
        const statue = this.statue;
        const mount = statue.group.localToWorld(new THREE.Vector3(side * statue.tunnelWidth / 2, 3 + height, along));
        return new SecurityTerminal({ position: mount.toArray(), rotation: statue.group.rotation.y - side * Math.PI / 2 });
    }

    get blockers() {
        return [
            this.pier.group, this.ramp.group, this.plateau.group, this.passage.group, this.statue.group,
            ...this.objects.map(object => object.group),
            ...this.streetLamps.map(lamp => lamp.group),
            ...this.terminals.map(terminal => terminal.group),
        ];
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

    floorHeight(x, z) {
        if (this.plateau.contains(x, z)) return this.plateau.height;
        if (this.passage.contains(x, z)) return this.passage.floorHeight(x);
        return this.ramp.floorHeight(x, z);
    }

    groundHeight(x, z) {
        const onLand = this.landAreas.some(area => this.player.insideArea(area, x, z));
        return onLand ? this.floorHeight(x, z) : this.waterLevel - this.floatDepth;
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

    blockPassageArea(margin, width) {
        const ramp = this.ramp, blockWestX = ramp.farX - ramp.endBlockSize, reach = margin + 1;
        return {
            minX: blockWestX - width + this.plateau.parapetThickness + margin, maxX: blockWestX - margin,
            minZ: ramp.rightZ - ramp.wallThickness - reach, maxZ: ramp.leftZ + ramp.wallThickness + reach,
        };
    }

    createPlateau([eastX, southZ], leftAreaDepth, blockPassageWidth, westTerrace) {
        const ramp = this.ramp, statue = this.statue.group.position;
        const northEdge = ramp.leftZ + ramp.wallThickness, southEdge = ramp.rightZ - ramp.wallThickness;
        const blockWestX = ramp.farX - ramp.endBlockSize, westX = blockWestX - blockPassageWidth;
        return new Plateau({
            height: ramp.rise,
            waterLevel: this.waterLevel,
            material: ramp.floorMaterial,
            parapetMaterial: ramp.wallMaterial,
            rects: [
                { minX: westX, maxX: eastX, minZ: westTerrace.maxZ, maxZ: southEdge, parapets: ['west'], joins: ['south'] },
                { minX: westX, maxX: eastX, minZ: southZ, maxZ: westTerrace.maxZ, joins: ['north', 'west'] },
                { minX: westTerrace.minX, maxX: westX, minZ: westTerrace.minZ, maxZ: westTerrace.maxZ, parapets: ['west', 'north', 'south'], joins: ['east'] },
                { minX: westX, maxX: blockWestX, minZ: southEdge, maxZ: northEdge, walkable: false },
                { minX: ramp.farX, maxX: ramp.endX, minZ: ramp.rightZ - ramp.wallThickness, maxZ: ramp.rightZ, walkable: false },
                {
                    minX: westX, maxX: ramp.endX, minZ: northEdge, maxZ: northEdge + leftAreaDepth,
                    parapets: ['north', 'west', 'east'], parapetHeight: ramp.wallHeight,
                },
                { minX: ramp.farX, maxX: ramp.endX, minZ: ramp.leftZ, maxZ: northEdge, walkable: false },
            ],
            circles: [{ centerX: statue.x, centerZ: statue.z, radius: this.statue.islandRadius }],
        });
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    createSky() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const c = canvas.getContext('2d');
        c.fillStyle = '#040508';
        c.fillRect(0, 0, 1024, 512);
        for (let index = 0; index < 500; index++) {
            const x = Math.random() * 1024, y = 60 + Math.random() * 200, radius = 20 + Math.random() * 70;
            const cloud = c.createRadialGradient(x, y, 0, x, y, radius);
            const light = 40 + Math.random() * 30;
            cloud.addColorStop(0, `rgba(${light}, ${light}, ${light + 6}, 0.12)`);
            cloud.addColorStop(1, 'rgba(0, 0, 0, 0)');
            c.fillStyle = cloud;
            c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
        const sky = new THREE.Mesh(
            this.track(new THREE.SphereGeometry(this.skyRadius, 32, 16)),
            this.track(new THREE.MeshBasicMaterial({ map: this.track(new THREE.CanvasTexture(canvas)), side: THREE.BackSide, fog: false }))
        );
        this.scene.add(sky);
    }

    createSkyline() {
        const material = this.track(new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, transparent: true, depthWrite: false }));
        const height = this.skylineHeight;
        const skyline = new THREE.Mesh(
            this.track(new THREE.CylinderGeometry(this.skylineRadius, this.skylineRadius, height, 64, 1, true, Math.PI / 2, Math.PI)),
            material
        );
        skyline.position.y = this.waterLevel + height / 2 - height * (1 - this.skylineHorizon);
        skyline.visible = false;
        this.scene.add(skyline);
        new THREE.TextureLoader().load(this.skylineImage, texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.repeat.x = -this.skylineRepeat;
            material.map = this.track(texture);
            material.needsUpdate = true;
            skyline.visible = true;
        });
    }

    createWater() {
        const water = new THREE.Mesh(
            this.track(new THREE.PlaneGeometry(this.skylineRadius * 2.2, this.skylineRadius * 2.2)),
            this.track(new THREE.MeshStandardMaterial({ color: 0x06090d, roughness: 0.35, metalness: 0.6 }))
        );
        water.rotation.x = -Math.PI / 2;
        water.position.y = this.waterLevel;
        this.scene.add(water);
    }

    createLights() {
        this.scene.add(new THREE.HemisphereLight(0x2a3346, 0x0a0806, 0.6));
        const moon = new THREE.DirectionalLight(0x8090b0, 0.35);
        moon.position.set(-30, 60, 20);
        this.scene.add(moon);
    }

    createFade() {
        this.fadeScene = new THREE.Scene();
        this.fadeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.fadeMaterial = this.track(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, depthTest: false, depthWrite: false }));
        this.fadeScene.add(new THREE.Mesh(this.track(new THREE.PlaneGeometry(2, 2)), this.fadeMaterial));
    }

    restart() {
        this.time = 0;
        this.player.reset();
        this.player.enable();
        this.grabber.reset();
        this.npcs.forEach(npc => npc.reset());
        this.checkpoints.forEach(checkpoint => checkpoint.reset());
    }

    stop() {
        this.terminalWindow.close(false);
        this.player.disable();
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
        this.statue.update(dt);
        this.npcs.forEach(npc => {
            npc.lookAt(this.camera.position);
            npc.avoidPositions([this.camera.position, ...this.npcs.filter(other => other !== npc && other.alive).map(other => other.group.position)]);
            npc.update(dt);
        });
        this.fadeMaterial.opacity = 1 - Math.min(1, this.time / this.fadeInDuration);
    }

    render(renderer) {
        this.player.attach(renderer.domElement);
        this.grabber.attach(renderer.domElement);
        renderer.render(this.scene, this.camera);
        this.weapon.render(renderer);
        if (this.fadeMaterial.opacity > 0) renderer.render(this.fadeScene, this.fadeCamera);
    }

    dispose() {
        this.player.dispose();
        this.grabber.dispose();
        this.weapon.dispose();
        this.objects.forEach(object => object.dispose());
        this.streetLamps.forEach(lamp => lamp.dispose());
        this.terminals.forEach(terminal => terminal.dispose());
        this.terminalWindow.dispose();
        this.graffiti.dispose();
        this.pier.dispose();
        this.ramp.dispose();
        this.plateau.dispose();
        this.passage.dispose();
        this.statue.dispose();
        this.npcs.forEach(npc => npc.dispose());
        this.disposables.forEach(resource => resource.dispose());
    }
}
