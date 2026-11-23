class WaveDirector {
    constructor(battle, waves) {
        this.battle = battle;
        this.waves = waves;
        this.firstWaveDelay = 30;
        this.betweenWaveDelay = 18;
        this.waveIndex = -1;
        this.countdown = this.firstWaveDelay;
        this.waveClock = 0;
        this.pendingSpawns = [];
    }

    get waveNumber() {
        return this.waveIndex + 1;
    }

    get waveCount() {
        return this.waves.length;
    }

    get hasMoreWaves() {
        return this.waveIndex < this.waves.length - 1;
    }

    get isSpawning() {
        return this.pendingSpawns.length > 0;
    }

    get isCountingDown() {
        return this.hasMoreWaves && !this.isSpawning;
    }

    get isFinished() {
        return !this.hasMoreWaves && !this.isSpawning;
    }

    update(dt) {
        if (this.isSpawning) {
            this.releaseDueSpawns(dt);
            return;
        }
        if (!this.hasMoreWaves) return;
        this.countdown -= dt;
        if (this.countdown <= 0) this.launchNextWave();
    }

    releaseDueSpawns(dt) {
        this.waveClock += dt;
        while (this.pendingSpawns.length > 0 && this.pendingSpawns[0].time <= this.waveClock) {
            const spawn = this.pendingSpawns.shift();
            this.battle.spawnEnemy(spawn.enemy, spawn.spawn);
        }
    }

    callEarly() {
        if (!this.isCountingDown) return 0;
        const manaBonus = this.waveIndex >= 0 ? Math.floor(this.countdown) : 0;
        this.launchNextWave();
        return manaBonus;
    }

    launchNextWave() {
        this.waveIndex += 1;
        this.waveClock = 0;
        this.countdown = this.betweenWaveDelay;
        this.pendingSpawns = this.waves[this.waveIndex]
            .flatMap(group => Array.from({ length: group.count }, (unused, order) => ({
                enemy: group.enemy,
                spawn: group.spawn,
                time: group.delay + order * group.interval
            })))
            .sort((first, second) => first.time - second.time);
    }
}
