class Stage {
    constructor(container, background = 0x05080b) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(background);
        this.renderer.autoClear = false;
        container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(0, 1, 0, -1, -10, 10);
        this.actors = new Set();
        this.clock = new THREE.Clock();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.renderer.setAnimationLoop(() => this.tick());
    }

    add(actor) {
        this.actors.add(actor);
        if (actor.group) this.scene.add(actor.group);
        actor.layout?.(window.innerWidth, window.innerHeight);
    }

    remove(actor) {
        this.actors.delete(actor);
        if (actor.group) this.scene.remove(actor.group);
    }

    has(actor) {
        return this.actors.has(actor);
    }

    resize() {
        const width = window.innerWidth, height = window.innerHeight;
        this.camera.right = width;
        this.camera.bottom = -height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.actors.forEach(actor => actor.layout?.(width, height));
    }

    tick() {
        const dt = Math.min(this.clock.getDelta(), 0.1);
        this.actors.forEach(actor => actor.update?.(dt));
        this.renderer.clear();
        this.actors.forEach(actor => actor.render?.(this.renderer));
        this.renderer.clearDepth();
        this.renderer.render(this.scene, this.camera);
    }
}
