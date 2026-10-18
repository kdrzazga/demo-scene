class WeaponView {
    constructor({
        restPosition = [0.17, -0.16, -0.36],
        restRotation = [0.02, 0.06, 0],
        fieldOfView = 55,
        swayAmount = 0.06,
        swayLimit = 0.05,
        swayReturn = 8,
        bobAmount = [0.008, 0.006],
        lowerDepth = 0.3,
        lowerSpeed = 6,
        recoilKick = 0.22,
        recoilPush = 0.05,
        recoilRecovery = 9,
        flashDuration = 0.05,
        flashColor = 0xffc070,
        fireCooldown = 0.25,
        pistol = {},
        hand = {},
    } = {}) {
        this.restPosition = new THREE.Vector3(...restPosition);
        this.restRotation = new THREE.Euler(...restRotation);
        this.swayAmount = swayAmount;
        this.swayLimit = swayLimit;
        this.swayReturn = swayReturn;
        this.bobAmount = bobAmount;
        this.lowerDepth = lowerDepth;
        this.lowerSpeed = lowerSpeed;
        this.recoilKick = recoilKick;
        this.recoilPush = recoilPush;
        this.recoilRecovery = recoilRecovery;
        this.flashDuration = flashDuration;
        this.fireCooldown = fireCooldown;
        this.disposables = [];

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fieldOfView, 1, 0.01, 10);
        this.rig = new THREE.Group();
        this.scene.add(this.rig);
        this.pistol = new Pistol(pistol);
        this.hand = new Hand(hand);
        this.rig.add(this.pistol.group, this.hand.group);
        this.createLights();
        this.createFlash(flashColor);
        this.sway = new THREE.Vector2();
        this.lastLook = null;
        this.recoil = 0;
        this.flashTimer = 0;
        this.cooldown = 0;
        this.lowered = 0;
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    createLights() {
        this.scene.add(new THREE.AmbientLight(0x8090a8, 0.45));
        const key = new THREE.DirectionalLight(0xfff0dd, 0.9);
        key.position.set(-1, 2, 1);
        this.scene.add(key);
        const rim = new THREE.DirectionalLight(0x6f9fff, 0.5);
        rim.position.set(2, -0.5, -1);
        this.scene.add(rim);
    }

    createFlash(color) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const c = canvas.getContext('2d');
        const gradient = c.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 230, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 190, 90, 0.9)');
        gradient.addColorStop(1, 'rgba(255, 120, 20, 0)');
        c.fillStyle = gradient;
        c.fillRect(0, 0, 64, 64);
        this.flash = new THREE.Sprite(this.track(new THREE.SpriteMaterial({
            map: this.track(new THREE.CanvasTexture(canvas)),
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
        })));
        this.flash.visible = false;
        this.pistol.muzzle.add(this.flash);
        this.flashLight = new THREE.PointLight(color, 0, 1.5);
        this.pistol.muzzle.add(this.flashLight);
    }

    layout(viewportWidth, viewportHeight) {
        this.camera.aspect = viewportWidth / viewportHeight;
        this.camera.updateProjectionMatrix();
    }

    fire() {
        if (this.cooldown > 0 || this.lowered > 0.1) return false;
        this.cooldown = this.fireCooldown;
        this.recoil = 1;
        this.flashTimer = this.flashDuration;
        this.flash.material.rotation = Math.random() * Math.PI * 2;
        this.flash.scale.setScalar(0.08 + Math.random() * 0.05);
        return true;
    }

    update(dt, { yaw, pitch, bobPhase, lowered }) {
        this.cooldown = Math.max(0, this.cooldown - dt);
        this.updateSway(dt, yaw, pitch);
        this.lowered += ((lowered ? 1 : 0) - this.lowered) * Math.min(1, dt * this.lowerSpeed);
        this.recoil = Math.max(0, this.recoil - dt * this.recoilRecovery * this.recoil - dt);
        this.flashTimer = Math.max(0, this.flashTimer - dt);
        this.flash.visible = this.flashTimer > 0;
        this.flashLight.intensity = this.flash.visible ? 2 : 0;
        this.pistol.recoil(this.recoil);
        const bobX = Math.sin(bobPhase * 0.5) * this.bobAmount[0];
        const bobY = -Math.abs(Math.sin(bobPhase * 0.5)) * this.bobAmount[1];
        this.rig.position.set(
            this.restPosition.x + this.sway.x + bobX,
            this.restPosition.y + this.sway.y + bobY - this.lowered * this.lowerDepth,
            this.restPosition.z + this.recoil * this.recoilPush,
        );
        this.rig.rotation.set(
            this.restRotation.x + this.recoil * this.recoilKick - this.lowered * 0.6,
            this.restRotation.y + this.sway.x * 2,
            this.restRotation.z - this.sway.x * 1.5,
        );
    }

    updateSway(dt, yaw, pitch) {
        if (this.lastLook) {
            const turnX = Math.atan2(Math.sin(yaw - this.lastLook.yaw), Math.cos(yaw - this.lastLook.yaw));
            const turnY = pitch - this.lastLook.pitch;
            this.sway.x = THREE.MathUtils.clamp(this.sway.x + turnX * this.swayAmount, -this.swayLimit, this.swayLimit);
            this.sway.y = THREE.MathUtils.clamp(this.sway.y - turnY * this.swayAmount, -this.swayLimit, this.swayLimit);
        }
        this.lastLook = { yaw, pitch };
        this.sway.multiplyScalar(Math.max(0, 1 - dt * this.swayReturn));
    }

    render(renderer) {
        renderer.clearDepth();
        renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.pistol.dispose();
        this.hand.dispose();
        this.disposables.forEach(resource => resource.dispose());
    }
}
