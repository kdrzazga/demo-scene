class IntroLogo {
    constructor({
        backdropImage = 'bkg.jpg',
        captionImage = 'caption.png',
        captionWidth = 4.6,
        rotationSpeed = Math.PI * 2 / 8.4,
        startAngle = -2.75,
        slideDistance = 8,
        firstArch = { left: -1.2, right: 0.7, height: 2.74, width: 0.3, sideLength: 1.4, depth: 0.18, z: 0 },
        secondArch = { tipX: -0.9, height: 2.9, width: 1.62, thickness: 0.22, baseThickness: 0.11, baseReach: 0.5, depth: 0.14, z: -0.4, mirrored: true },
        ballPosition = [-0.05, 0.8, 0],
        ballRadius = 0.13,
        boltCount = 3,
        fadeDuration = 0.8,
        timeline = {},
    } = {}) {
        this.backdropImage = backdropImage;
        this.captionImage = captionImage;
        this.captionWidth = captionWidth;
        this.rotationSpeed = rotationSpeed;
        this.startAngle = startAngle;
        this.slideDistance = slideDistance;
        this.firstArch = firstArch;
        this.secondArch = secondArch;
        this.ballPosition = ballPosition;
        this.ballRadius = ballRadius;
        this.fadeDuration = fadeDuration;
        this.timeline = { backdropHold: 3, backdropFade: 2, slideStart: 3, slideDuration: 2.4, lightningStart: 3.6, ...timeline };

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        this.camera.position.set(0, 0, 8);
        this.logo = new THREE.Group();
        this.logo.position.y = 0.2;
        this.scene.add(this.logo);
        this.emblem = new THREE.Group();
        this.emblem.position.y = -1.35;
        this.logo.add(this.emblem);
        this.model = new THREE.Group();
        this.model.position.z = 0.2;
        this.emblem.add(this.model);

        this.createBackdrop();
        this.createLights();
        this.createEmblem();
        this.createBall();
        this.createCaption();
        this.bolts = Array.from({ length: boltCount }, () => new LightningBolt({
            segments: 28, coreWidth: 0.012, glowWidth: 0.06, jitter: 0.06, dropout: 0.75, minInterval: 0.05, maxInterval: 0.25,
        }));
        this.bolts.forEach(bolt => this.scene.add(bolt.group));
        this.restart();
    }

    createBackdrop() {
        this.backdropScene = new THREE.Scene();
        this.backdropCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.backdrop = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, depthWrite: false })
        );
        this.backdrop.visible = false;
        this.backdropScene.add(this.backdrop);
        new THREE.TextureLoader().load(this.backdropImage, texture => this.applyBackdrop(texture));
    }

    applyBackdrop(texture) {
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        this.backdropTexture = texture;
        this.backdropAspect = texture.image.width / texture.image.height;
        this.backdrop.material.map = texture;
        this.backdrop.material.needsUpdate = true;
        this.backdrop.visible = true;
        this.fitBackdrop();
    }

    fitBackdrop() {
        if (!this.backdropAspect || !this.viewportAspect) return;
        this.backdrop.scale.set(Math.max(1, this.backdropAspect / this.viewportAspect), Math.max(1, this.viewportAspect / this.backdropAspect), 1);
    }

    createLights() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.2));
        const key = new THREE.DirectionalLight(0xffffff, 0.7);
        key.position.set(-2, 4, 5);
        this.scene.add(key);
        this.ballLight = new THREE.PointLight(0x4f8dff, 2, 2.5);
        this.ballLight.position.set(...this.ballPosition);
        this.model.add(this.ballLight);
    }

    createEmblem() {
        this.faceMaterial = new THREE.MeshStandardMaterial({ color: 0xe8eef5, metalness: 1, roughness: 0.18, transparent: true });
        this.edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x86a8ff, metalness: 1, roughness: 0.25, transparent: true });
        const bevel = { bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 3, curveSegments: 48 };
        const materials = [this.faceMaterial, this.edgeMaterial];
        this.emblemParts = [
            [this.firstArchShape(), this.firstArch],
            [this.secondArchShape(), this.secondArch],
        ].map(([shape, { depth, z, mirrored = false }]) => {
            const geometry = new THREE.ExtrudeGeometry(shape, { ...bevel, depth });
            geometry.translate(0, 0, -depth / 2);
            if (mirrored) geometry.rotateY(Math.PI);
            geometry.translate(0, 0, z);
            return new THREE.Mesh(geometry, materials);
        });
        this.emblemParts.forEach(mesh => this.model.add(mesh));
    }

    firstArchShape() {
        const { left, right, height, width, sideLength } = this.firstArch;
        const shape = new THREE.Shape();
        shape.moveTo(left, 0);
        shape.lineTo(right, 0);
        shape.absellipse(left, 0, right - left, height, 0, Math.PI / 2, false);
        shape.lineTo(left, height - sideLength);
        shape.lineTo(left + width, height - sideLength);
        shape.lineTo(left + width, height - width);
        shape.absellipse(left + width, width, right - left - width * 2, height - width * 2, Math.PI / 2, 0, true);
        shape.lineTo(left, width);
        shape.closePath();
        return shape;
    }

    secondArchShape() {
        const { tipX, height, width, thickness, baseThickness, baseReach } = this.secondArch;
        const baseEnd = tipX - baseReach;
        const shape = new THREE.Shape();
        shape.moveTo(tipX, height);
        shape.absellipse(tipX, 0, width, height, Math.PI / 2, 0, true);
        shape.lineTo(baseEnd, 0);
        shape.lineTo(baseEnd + 0.15, baseThickness);
        shape.lineTo(tipX + width - thickness, baseThickness);
        shape.absellipse(tipX, baseThickness, width - thickness, height - baseThickness, 0, Math.PI / 2, false);
        shape.closePath();
        return shape;
    }

    createBall() {
        this.ballTexture = new THREE.CanvasTexture(this.paintBallSurface());
        this.ball = new THREE.Mesh(
            new THREE.SphereGeometry(this.ballRadius, 32, 24),
            new THREE.MeshStandardMaterial({ map: this.ballTexture, emissive: 0x2a5cc8, emissiveIntensity: 0.6, metalness: 0.2, roughness: 0.3, transparent: true })
        );
        this.ball.position.set(...this.ballPosition);
        this.model.add(this.ball);
        this.glowTexture = new THREE.CanvasTexture(this.paintGlow());
        this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTexture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        this.glow.scale.setScalar(1.3);
        this.glow.position.set(...this.ballPosition);
        this.model.add(this.glow);
    }

    paintBallSurface() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const c = canvas.getContext('2d');
        c.fillStyle = '#2d5fbf';
        c.fillRect(0, 0, 256, 128);
        for (let index = 0; index < 60; index++) {
            c.fillStyle = `rgba(235, 245, 255, ${0.3 + Math.random() * 0.5})`;
            c.beginPath();
            c.ellipse(Math.random() * 256, 20 + Math.random() * 88, 4 + Math.random() * 18, 2 + Math.random() * 8, Math.random() * Math.PI, 0, Math.PI * 2);
            c.fill();
        }
        return canvas;
    }

    paintGlow() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 128;
        const c = canvas.getContext('2d');
        const gradient = c.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(170, 210, 255, 0.9)');
        gradient.addColorStop(0.3, 'rgba(60, 120, 255, 0.45)');
        gradient.addColorStop(1, 'rgba(20, 50, 160, 0)');
        c.fillStyle = gradient;
        c.fillRect(0, 0, 128, 128);
        return canvas;
    }

    createCaption() {
        this.captionMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(this.captionWidth, this.captionWidth * 66 / 680),
            new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        this.captionMesh.position.y = -2.25;
        this.captionMesh.visible = false;
        this.logo.add(this.captionMesh);
        new THREE.TextureLoader().load(this.captionImage, texture => this.applyCaption(texture));
    }

    applyCaption(texture) {
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        this.captionTexture = texture;
        this.captionMesh.geometry.dispose();
        this.captionMesh.geometry = new THREE.PlaneGeometry(this.captionWidth, this.captionWidth * texture.image.height / texture.image.width);
        this.captionMesh.material.map = texture;
        this.captionMesh.material.needsUpdate = true;
        this.captionMesh.visible = true;
    }

    createEnvironment(renderer) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const c = canvas.getContext('2d');
        const sky = c.createLinearGradient(0, 0, 0, 256);
        sky.addColorStop(0, '#0b1424');
        sky.addColorStop(0.46, '#9fb4d0');
        sky.addColorStop(0.5, '#ffffff');
        sky.addColorStop(0.54, '#3a4a60');
        sky.addColorStop(1, '#03050a');
        c.fillStyle = sky;
        c.fillRect(0, 0, 512, 256);
        c.fillStyle = 'rgba(230, 240, 255, 0.95)';
        c.fillRect(60, 40, 120, 50);
        c.fillRect(330, 60, 90, 40);
        c.fillStyle = 'rgba(60, 120, 255, 0.7)';
        c.fillRect(0, 170, 512, 24);
        const texture = new THREE.CanvasTexture(canvas);
        const generator = new THREE.PMREMGenerator(renderer);
        this.environmentTarget = generator.fromEquirectangular(texture);
        texture.dispose();
        generator.dispose();
        return this.environmentTarget.texture;
    }

    restart() {
        this.time = 0;
        this.fade = 1;
        this.leaving = false;
        this.visible = true;
    }

    leave() {
        this.leaving = true;
        return new Promise(resolve => this.resolveLeft = resolve);
    }

    layout(viewportWidth, viewportHeight) {
        const aspect = viewportWidth / viewportHeight;
        this.viewportAspect = aspect;
        this.fitBackdrop();
        this.camera.aspect = aspect;
        this.camera.position.z = 8 * Math.max(1, 0.85 / aspect);
        this.camera.updateProjectionMatrix();
    }

    progress(start, duration) {
        return Math.min(1, Math.max(0, (this.time - start) / duration));
    }

    update(dt) {
        if (!this.visible) return;
        this.time += dt;
        if (this.leaving) this.updateLeaving(dt);
        this.backdrop.material.opacity = (1 - this.progress(this.timeline.backdropHold, this.timeline.backdropFade)) * this.fade;
        const slide = 1 - (1 - this.progress(this.timeline.slideStart, this.timeline.slideDuration)) ** 3;
        this.logo.position.x = this.slideDistance * (1 - slide);
        this.emblem.rotation.y = this.startAngle + this.rotationSpeed * this.time;
        this.ball.rotation.y = this.time * 0.6;
        this.scene.updateMatrixWorld();
        const lightning = this.time > this.timeline.lightningStart ? this.fade : 0;
        this.bolts.forEach(bolt => bolt.update(dt, lightning, () => this.pickBoltEnds()));
        const flicker = this.bolts.reduce((total, bolt) => total + bolt.flicker, 0) / this.bolts.length;
        this.glow.material.opacity = (0.75 + flicker * 0.25) * this.fade;
        this.ballLight.intensity = (2 + flicker * 2) * this.fade;
        [this.faceMaterial, this.edgeMaterial, this.ball.material, this.captionMesh.material].forEach(material => material.opacity = this.fade);
    }

    updateLeaving(dt) {
        this.fade = Math.max(0, this.fade - dt / this.fadeDuration);
        if (this.fade > 0) return;
        this.visible = false;
        this.resolveLeft?.();
    }

    pickBoltEnds() {
        const from = this.ball.getWorldPosition(new THREE.Vector3());
        const angle = -Math.PI * 0.95 + Math.random() * Math.PI * 1.15;
        const reach = 2.5 + Math.random() * 2;
        const to = from.clone().add(new THREE.Vector3(Math.cos(angle) * reach, Math.sin(angle) * reach, (Math.random() - 0.5) * 1.5));
        return [from, to];
    }

    render(renderer) {
        if (!this.visible) return;
        this.scene.environment ??= this.createEnvironment(renderer);
        if (this.backdrop.material.opacity > 0) renderer.render(this.backdropScene, this.backdropCamera);
        renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.bolts.forEach(bolt => bolt.dispose());
        this.emblemParts.forEach(mesh => mesh.geometry.dispose());
        [this.faceMaterial, this.edgeMaterial, this.ball.material, this.glow.material, this.captionMesh.material, this.backdrop.material].forEach(material => material.dispose());
        this.ball.geometry.dispose();
        this.captionMesh.geometry.dispose();
        this.backdrop.geometry.dispose();
        [this.ballTexture, this.glowTexture, this.captionTexture, this.backdropTexture].forEach(texture => texture?.dispose());
        this.environmentTarget?.dispose();
    }
}
