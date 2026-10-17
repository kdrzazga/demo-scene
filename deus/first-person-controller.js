class FirstPersonController {
    constructor(camera, {
        position = [0, 0, 0],
        lookAt = [0, 0, -1],
        eyeHeight = 1.7,
        speed = 4,
        runMultiplier = 1.8,
        sensitivity = 0.0025,
        maxPitch = 1.3,
        bobAmount = 0.05,
        bobFrequency = 9,
        walkableAreas = [],
        keys = { forward: 'KeyW', backward: 'KeyS', left: 'KeyA', right: 'KeyD', run: 'ShiftLeft' },
    } = {}) {
        this.camera = camera;
        this.startPosition = new THREE.Vector3(position[0], 0, position[2]);
        const direction = new THREE.Vector3(...lookAt).sub(new THREE.Vector3(position[0], eyeHeight, position[2]));
        this.startYaw = Math.atan2(-direction.x, -direction.z);
        this.startPitch = Math.atan2(direction.y, Math.hypot(direction.x, direction.z));
        this.eyeHeight = eyeHeight;
        this.speed = speed;
        this.runMultiplier = runMultiplier;
        this.sensitivity = sensitivity;
        this.maxPitch = maxPitch;
        this.bobAmount = bobAmount;
        this.bobFrequency = bobFrequency;
        this.walkableAreas = walkableAreas;
        this.keys = keys;
        this.pressed = new Set();
        this.position = new THREE.Vector3();
        this.enabled = false;

        this.onKeyDown = event => this.pressed.add(event.code);
        this.onKeyUp = event => this.pressed.delete(event.code);
        this.onBlur = () => this.pressed.clear();
        this.onMouseMove = event => this.look(event);
        this.onClick = () => this.enabled && this.element?.requestPointerLock();
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('blur', this.onBlur);
        document.addEventListener('mousemove', this.onMouseMove);
        this.reset();
    }

    reset() {
        this.position.copy(this.startPosition);
        this.yaw = this.startYaw;
        this.pitch = this.startPitch;
        this.bobPhase = 0;
        this.pressed.clear();
        this.applyCamera();
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
        this.pressed.clear();
        if (this.locked) document.exitPointerLock();
    }

    attach(element) {
        if (this.element === element) return;
        this.element?.removeEventListener('click', this.onClick);
        this.element = element;
        element.addEventListener('click', this.onClick);
    }

    get locked() {
        return !!this.element && document.pointerLockElement === this.element;
    }

    look(event) {
        if (!this.locked) return;
        this.yaw -= event.movementX * this.sensitivity;
        this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch - event.movementY * this.sensitivity));
    }

    axis(positive, negative) {
        return (this.pressed.has(positive) ? 1 : 0) - (this.pressed.has(negative) ? 1 : 0);
    }

    update(dt) {
        const forward = this.axis(this.keys.forward, this.keys.backward);
        const strafe = this.axis(this.keys.right, this.keys.left);
        const moving = forward !== 0 || strafe !== 0;
        if (moving) {
            const length = Math.hypot(forward, strafe);
            const step = this.speed * (this.pressed.has(this.keys.run) ? this.runMultiplier : 1) * dt / length;
            const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
            this.move((-sin * forward + cos * strafe) * step, (-cos * forward - sin * strafe) * step);
            this.bobPhase += dt * this.bobFrequency;
        }
        this.applyCamera();
    }

    move(dx, dz) {
        const { x, z } = this.position;
        if (this.isWalkable(x + dx, z + dz)) this.position.set(x + dx, 0, z + dz);
        else if (this.isWalkable(x + dx, z)) this.position.x = x + dx;
        else if (this.isWalkable(x, z + dz)) this.position.z = z + dz;
    }

    isWalkable(x, z) {
        return this.walkableAreas.some(area => x >= area.minX && x <= area.maxX && z >= area.minZ && z <= area.maxZ);
    }

    applyCamera() {
        this.camera.position.set(this.position.x, this.eyeHeight + Math.sin(this.bobPhase) * this.bobAmount, this.position.z);
        this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    }

    dispose() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('blur', this.onBlur);
        document.removeEventListener('mousemove', this.onMouseMove);
        this.element?.removeEventListener('click', this.onClick);
    }
}
