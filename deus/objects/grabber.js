class Grabber {
    constructor(camera, {
        objects = [],
        reach = 2.6,
        holdDistance = 1.5,
        holdFollowSpeed = 15,
        groundHeight = () => 0,
        isEnabled = () => true,
        liftButton = 2,
        dropButton = 0,
        onUse = () => {},
    } = {}) {
        this.camera = camera;
        this.objects = objects;
        this.reach = reach;
        this.holdDistance = holdDistance;
        this.holdFollowSpeed = holdFollowSpeed;
        this.groundHeight = groundHeight;
        this.isEnabled = isEnabled;
        this.liftButton = liftButton;
        this.dropButton = dropButton;
        this.onUse = onUse;
        this.held = null;
        this.raycaster = new THREE.Raycaster();
        this.screenCenter = new THREE.Vector2(0, 0);
        this.onMouseDown = event => this.press(event);
        this.onContextMenu = event => event.preventDefault();
    }

    attach(element) {
        if (this.element === element) return;
        this.element?.removeEventListener('mousedown', this.onMouseDown);
        this.element?.removeEventListener('contextmenu', this.onContextMenu);
        this.element = element;
        element.addEventListener('mousedown', this.onMouseDown);
        element.addEventListener('contextmenu', this.onContextMenu);
    }

    press(event) {
        if (!this.isEnabled()) return;
        if (event.button === this.liftButton) this.lift();
        else if (event.button === this.dropButton) this.held ? this.drop() : this.onUse();
    }

    lift() {
        if (this.held) return;
        const target = this.aimedObject();
        if (!target) return;
        target.pickUp();
        this.held = target;
    }

    drop() {
        if (!this.held) return;
        this.held.drop();
        this.held = null;
    }

    aimedObject() {
        this.raycaster.setFromCamera(this.screenCenter, this.camera);
        this.raycaster.far = this.reach;
        const candidates = this.objects.filter(object => object.liftable && !object.held);
        const [hit] = this.raycaster.intersectObjects(candidates.map(object => object.group), true);
        return hit ? candidates.find(object => this.belongsTo(hit.object, object.group)) : null;
    }

    belongsTo(node, group) {
        for (let current = node; current; current = current.parent) if (current === group) return true;
        return false;
    }

    update(dt) {
        if (this.held) this.carry(dt);
        this.objects.forEach(object => object.settle(dt, this.supportHeight(object)));
    }

    carry(dt) {
        const direction = this.camera.getWorldDirection(new THREE.Vector3());
        const target = this.camera.position.clone().addScaledVector(direction, this.holdDistance);
        target.y = Math.max(target.y, this.groundHeight(target.x, target.z) + this.held.halfHeight);
        this.held.group.position.lerp(target, Math.min(1, dt * this.holdFollowSpeed));
        this.held.group.rotation.y = this.camera.rotation.y;
    }

    supportHeight(object) {
        let height = this.groundHeight(object.position.x, object.position.z);
        this.objects.forEach(other => {
            if (other === object || other.held || !object.overlaps(other)) return;
            if (other.top <= object.position.y - object.halfHeight + 0.05) height = Math.max(height, other.top);
        });
        return height;
    }

    reset() {
        this.held = null;
        this.objects.forEach(object => object.reset());
    }

    dispose() {
        this.element?.removeEventListener('mousedown', this.onMouseDown);
        this.element?.removeEventListener('contextmenu', this.onContextMenu);
    }
}
