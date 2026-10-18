class HitScan {
    constructor(camera, { range = 200 } = {}) {
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = range;
        this.screenCenter = new THREE.Vector2(0, 0);
    }

    trace(targets) {
        this.raycaster.setFromCamera(this.screenCenter, this.camera);
        return this.raycaster.intersectObjects(targets, true).find(hit => this.visible(hit.object)) ?? null;
    }

    visible(node) {
        for (let current = node; current; current = current.parent) if (!current.visible) return false;
        return true;
    }

    owner(hit, candidates) {
        if (!hit) return null;
        return candidates.find(candidate => {
            for (let current = hit.object; current; current = current.parent) if (current === candidate.group) return true;
            return false;
        }) ?? null;
    }
}
