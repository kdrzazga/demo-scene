class LibertyIsland extends Level {
    constructor({
        skylineImage = 'NY_lights.png',
        skylineRadius = 600,
        skylineRepeat = 8,
        skylineCenter = [-110, -60],
        skylineHeight = 260,
        skylineHorizon = 390 / 620,
        skyRadius = 900,
        waterLevel = -2,
        cameraPosition = [2, 1.7, 8],
        lookAt = [-6, 3, -40],
        railingMargin = 0.5,
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
        objects = [
            new Crate({ position: [-4, 0.5, -8], rotation: 0.3 }),
            new Crate({ position: [-4.4, 0.5, -9.5], rotation: -0.2 }),
            new Crate({ position: [-30, 3.5, -131], rotation: 0.1 }),
            new Crate({ position: [-31.3, 3.5, -130.6], rotation: -0.25 }),
            new Crate({ position: [-30.6, 4.5, -130.8], rotation: 0.6 }),
        ],
        floatDepth = 0.3,
        streetLamps = [
            new StreetLamp({ position: [-32, 3, -87.5], facing: StreetLamp.facingTowards([-32, -87.5], [-45, -110]) }),
            new StreetLamp({ position: [-58, 3, -87.5], facing: StreetLamp.facingTowards([-58, -87.5], [-45, -110]) }),
            new StreetLamp({ position: [-150.8, 3, -81.2], facing: StreetLamp.facingTowards([-150.8, -81.2], [-132, -95]) }),
        ],
        tunnelTerminal = { side: -1, along: 5, height: 1.45 },
        tunnelGraffiti = { image: 'easter-egg.png', side: 1, along: 0, height: 1.6, width: 10 },
        doorApproach = 0.9,
        ...levelOptions
    } = {}) {
        super(levelOptions);
        this.skylineImage = skylineImage;
        this.skylineRadius = skylineRadius;
        this.skylineRepeat = skylineRepeat;
        this.skylineCenter = skylineCenter;
        this.skylineHeight = skylineHeight;
        this.skylineHorizon = skylineHorizon;
        this.skyRadius = skyRadius;
        this.waterLevel = waterLevel;
        this.floatDepth = floatDepth;
        this.doorApproach = doorApproach;

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
        this.streetLamps = streetLamps;
        this.streetLamps.forEach(lamp => this.scene.add(lamp.group));
        this.graffiti = this.createTunnelGraffiti(tunnelGraffiti);
        this.scene.add(this.graffiti.group);
        this.landAreas = this.walkableAreas(0, blockPassageWidth);
        this.setUp({
            cameraPosition,
            lookAt,
            walkableAreas: this.walkableAreas(railingMargin, blockPassageWidth),
            obstacles: [this.statue.obstacle(railingMargin), ...this.streetLamps, ...this.passage.lamps],
            npcs: [...npcs, ...this.createPassageGuards(passageGuardGroups)],
            objects: [...objects, ...this.createPassageCrates(passageGuardGroups, crateGroupSize)],
            terminals: [this.createTunnelTerminal(tunnelTerminal)],
        });
    }

    get doorPosition() {
        return [this.passage.farX + this.doorApproach, this.passage.centerZ];
    }

    get doorInward() {
        return [1, 0];
    }

    walkableAreas(margin, blockPassageWidth) {
        return [
            ...this.pier.walkableAreas(margin),
            this.ramp.walkableArea(margin),
            this.ramp.openingArea(margin, 'right'),
            this.ramp.openingArea(margin, 'left'),
            ...this.plateau.walkableAreas(margin),
            this.blockPassageArea(margin, blockPassageWidth),
            ...this.passage.walkableAreas(margin),
        ];
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
            ...this.streetLamps.map(lamp => lamp.group),
            ...super.blockers,
        ];
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
        sky.position.set(this.skylineCenter[0], 0, this.skylineCenter[1]);
        this.scene.add(sky);
    }

    createSkyline() {
        const material = this.track(new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, transparent: true, depthWrite: false }));
        const height = this.skylineHeight;
        const skyline = new THREE.Mesh(
            this.track(new THREE.CylinderGeometry(this.skylineRadius, this.skylineRadius, height, 128, 1, true)),
            material
        );
        skyline.position.set(this.skylineCenter[0], this.waterLevel + height / 2 - height * (1 - this.skylineHorizon), this.skylineCenter[1]);
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
        water.position.set(this.skylineCenter[0], this.waterLevel, this.skylineCenter[1]);
        this.scene.add(water);
    }

    createLights() {
        this.scene.add(new THREE.HemisphereLight(0x2a3346, 0x0a0806, 0.6));
        const moon = new THREE.DirectionalLight(0x8090b0, 0.35);
        moon.position.set(-30, 60, 20);
        this.scene.add(moon);
    }

    updateWorld(dt) {
        this.statue.update(dt);
    }

    disposeWorld() {
        this.streetLamps.forEach(lamp => lamp.dispose());
        this.graffiti.dispose();
        this.pier.dispose();
        this.ramp.dispose();
        this.plateau.dispose();
        this.passage.dispose();
        this.statue.dispose();
    }
}
