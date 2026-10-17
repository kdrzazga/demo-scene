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
        npcs = [
            new PaulDenton({ position: [-30, 0, -46], rotation: Math.PI / 2, route: [[-22, -46], [-40, -46]] }),
            new UnatcoTroop({ position: [3.5, 0, -34], rotation: 0, route: [[3.5, -12], [3.5, -34]] }),
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
    } = {}) {
        this.skylineImage = skylineImage;
        this.skylineRadius = skylineRadius;
        this.skylineRepeat = skylineRepeat;
        this.skylineHeight = skylineHeight;
        this.skylineHorizon = skylineHorizon;
        this.skyRadius = skyRadius;
        this.waterLevel = waterLevel;
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
        this.scene.add(this.pier.group, this.ramp.group, this.plateau.group, this.statue.group);
        this.npcs = npcs;
        this.npcs.forEach(npc => this.scene.add(npc.group));
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
            ],
            floorHeight: (x, z) => this.plateau.contains(x, z) ? this.plateau.height : this.ramp.floorHeight(x, z),
            obstacles: [
                ...this.npcs.map(npc => ({ position: npc.group.position, radius: npcRadius })),
                { position: this.statue.group.position, radius: this.statue.fortRadius + railingMargin },
            ],
            ...controls,
        });
        this.time = 0;
        this.checkpoints = [];
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
                { minX: westX, maxX: blockWestX, minZ: southEdge, maxZ: northEdge, parapets: ['west'], parapetHeight: ramp.wallHeight, walkable: false },
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
        this.checkpoints.forEach(checkpoint => checkpoint.reset());
    }

    stop() {
        this.player.disable();
    }

    layout(viewportWidth, viewportHeight) {
        this.camera.aspect = viewportWidth / viewportHeight;
        this.camera.updateProjectionMatrix();
    }

    update(dt) {
        this.time += dt;
        this.player.update(dt);
        this.checkpoints.forEach(checkpoint => checkpoint.check(this.camera.position));
        this.statue.update(dt);
        this.npcs.forEach(npc => {
            npc.lookAt(this.camera.position);
            npc.avoidPositions([this.camera.position, ...this.npcs.filter(other => other !== npc).map(other => other.group.position)]);
            npc.update(dt);
        });
        this.fadeMaterial.opacity = 1 - Math.min(1, this.time / this.fadeInDuration);
    }

    render(renderer) {
        this.player.attach(renderer.domElement);
        renderer.render(this.scene, this.camera);
        if (this.fadeMaterial.opacity > 0) renderer.render(this.fadeScene, this.fadeCamera);
    }

    dispose() {
        this.player.dispose();
        this.pier.dispose();
        this.ramp.dispose();
        this.plateau.dispose();
        this.statue.dispose();
        this.npcs.forEach(npc => npc.dispose());
        this.disposables.forEach(resource => resource.dispose());
    }
}
