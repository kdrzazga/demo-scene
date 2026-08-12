class CameraDirector {
    constructor(scene, target) {
        this.camera = scene.cameras.main;
        this.baseZoom = 1;
        this.swayAngle = 0.010;
        this.swayPeriod = 5200;
        this.zoomPulse = 0.025;

        this.camera.setZoom(this.baseZoom);
        this.camera.startFollow(target, true, 0.12, 0.12);
        this.camera.setDeadzone(140, 90);
    }

    update(time) {
        const phase = (time % this.swayPeriod) / this.swayPeriod * Math.PI * 2;
        this.camera.setRotation(Math.sin(phase) * this.swayAngle);
        this.camera.setZoom(this.baseZoom * (1 + Math.sin(phase * 0.5) * this.zoomPulse));
    }
}
