class TelecommWindow {
    constructor({
        photo,
        message,
        name = '',
        text = '',
        x = 24,
        y = 24,
        width = 560,
        height = 168,
        listener = null,
        font = 'Arial, Helvetica, sans-serif',
        durations = {},
        incomingLabel = 'INCOMING TRANSMISSION',
        endLabel = 'END TRANSMISSION',
    } = {}) {
        this.photo = photo;
        this.message = message;
        this.name = name.toUpperCase();
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.listener = listener;
        this.font = font;
        this.durations = { opening: 0.3, incoming: 2.6, ending: 2.2, closing: 0.3, ...durations };
        this.incomingLabel = incomingLabel;
        this.endLabel = endLabel;

        this.padding = 12;
        this.portraitSize = height - this.padding * 2;
        this.textLeft = this.padding * 2 + this.portraitSize;
        this.textWidth = width - this.textLeft - this.padding;
        this.headerHeight = 26;
        this.meterHeight = 8;
        this.lineHeight = 19;
        this.pixelRatio = 2;

        this.phase = 'idle';
        this.phaseTime = 0;
        this.level = 0;
        this.glitch = 0;
        this.audioFailed = false;
        this.fallbackDuration = Math.max(4, text.length / 16);

        this.group = new THREE.Group();
        this.group.position.set(x + width / 2, -(y + height / 2), 0);
        this.group.visible = false;

        this.createFrame();
        this.createPortrait();
        this.subtitleLines = this.wrap(text, this.textWidth - 12);
    }

    createFrame() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        this.context = this.canvas.getContext('2d');
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.generateMipmaps = false;
        this.frame = new THREE.Mesh(
            new THREE.PlaneGeometry(this.width, this.height),
            new THREE.MeshBasicMaterial({ map: this.texture, transparent: true })
        );
        this.group.add(this.frame);
    }

    createPortrait() {
        const size = this.portraitSize - 4;
        this.portraitUniforms = {
            map: { value: null },
            hasMap: { value: 0 },
            time: { value: 0 },
            noise: { value: 1 },
            rows: { value: size },
            crop: { value: new THREE.Vector4(0, 0, 1, 1) },
        };
        this.portrait = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size),
            new THREE.ShaderMaterial({
                uniforms: this.portraitUniforms,
                vertexShader: TelecommWindow.vertexShader,
                fragmentShader: TelecommWindow.fragmentShader,
            })
        );
        this.portrait.position.set(
            this.padding + this.portraitSize / 2 - this.width / 2,
            -(this.padding + this.portraitSize / 2 - this.height / 2),
            1
        );
        this.group.add(this.portrait);
        if (this.photo) new THREE.TextureLoader().load(this.photo, texture => this.applyPhoto(texture));
    }

    applyPhoto(texture) {
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        const aspect = texture.image.width / texture.image.height;
        const crop = aspect > 1
            ? new THREE.Vector4((1 - 1 / aspect) / 2, 0, 1 / aspect, 1)
            : new THREE.Vector4(0, (1 - aspect) / 2, 1, aspect);
        this.portraitUniforms.map.value = texture;
        this.portraitUniforms.hasMap.value = 1;
        this.portraitUniforms.crop.value = crop;
    }

    createAudio() {
        this.audio = new Audio(this.message);
        this.audio.preload = 'auto';
        this.audio.addEventListener('ended', () => this.phase === 'speaking' && this.enter('ending'));
        this.audio.addEventListener('error', () => this.audioFailed = true);
        if (!this.listener || !location.protocol.startsWith('http')) return;
        try {
            this.source = this.listener.createMediaElementSource(this.audio);
            this.analyser = this.listener.createAnalyser();
            this.analyser.fftSize = 512;
            this.samples = new Uint8Array(this.analyser.fftSize);
            this.source.connect(this.analyser);
            this.analyser.connect(this.listener.destination);
        } catch {
            this.analyser = null;
        }
    }

    play() {
        this.createAudio();
        this.group.visible = true;
        this.enter('opening');
        return new Promise(resolve => this.resolveClosed = resolve);
    }

    enter(phase) {
        this.phase = phase;
        this.phaseTime = 0;
        if (phase === 'speaking' && !this.audioFailed) this.audio.play().catch(() => this.audioFailed = true);
        if (phase === 'closed') {
            this.group.visible = false;
            this.resolveClosed?.();
        }
    }

    update(dt) {
        if (this.phase === 'idle' || this.phase === 'closed') return;
        this.phaseTime += dt;
        this.portraitUniforms.time.value += dt;
        this.updatePhase();
        this.updateLevel(dt);
        this.updateNoise(dt);
        this.updateScale();
        this.drawFrame();
    }

    updatePhase() {
        const duration = this.durations[this.phase];
        if (this.phase === 'opening' && this.phaseTime >= duration) this.enter('incoming');
        else if (this.phase === 'incoming' && this.phaseTime >= duration) this.enter('speaking');
        else if (this.phase === 'speaking' && this.audioFailed && this.progress() >= 1) this.enter('ending');
        else if (this.phase === 'ending' && this.phaseTime >= duration) this.enter('closing');
        else if (this.phase === 'closing' && this.phaseTime >= duration) this.enter('closed');
    }

    updateLevel(dt) {
        const target = this.phase === 'speaking' ? this.measureLevel() : 0;
        this.level += (target - this.level) * Math.min(1, dt * 18);
    }

    measureLevel() {
        if (this.analyser) {
            this.analyser.getByteTimeDomainData(this.samples);
            const sum = this.samples.reduce((total, sample) => total + ((sample - 128) / 128) ** 2, 0);
            return Math.min(1, Math.sqrt(sum / this.samples.length) * 4);
        }
        if (this.audioFailed || this.audio.paused) return this.audioFailed ? 0.25 : 0;
        const t = this.audio.currentTime;
        return 0.25 + 0.6 * Math.abs(Math.sin(t * 13) * Math.sin(t * 7.3));
    }

    updateNoise(dt) {
        const t = Math.min(1, this.phaseTime / this.durations[this.phase] || 0);
        const smooth = t * t * (3 - 2 * t);
        if (Math.random() < dt * 0.4) this.glitch = 0.3 + Math.random() * 0.4;
        this.glitch = Math.max(0, this.glitch - dt * 2.5);
        const noise = {
            opening: 1,
            incoming: 1 - Math.max(0, smooth * 2 - 1) * 0.88,
            speaking: 0.08 + this.glitch,
            ending: 0.12 + smooth * 0.88,
            closing: 1,
        }[this.phase];
        this.portraitUniforms.noise.value = noise;
    }

    updateScale() {
        const t = Math.min(1, this.phaseTime / this.durations[this.phase]);
        const scale = { opening: t, closing: 1 - t }[this.phase] ?? 1;
        this.group.scale.y = Math.max(0.001, scale * scale * (3 - 2 * scale));
    }

    progress() {
        if (this.phase === 'ending' || this.phase === 'closing') return 1;
        if (this.phase !== 'speaking') return 0;
        if (this.audioFailed) return Math.min(1, this.phaseTime / this.fallbackDuration);
        const duration = this.audio.duration;
        return Number.isFinite(duration) && duration > 0 ? this.audio.currentTime / duration : 0;
    }

    drawFrame() {
        const c = this.context;
        c.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
        c.clearRect(0, 0, this.width, this.height);
        this.drawPanel(c);
        this.drawPortraitInset(c);
        this.drawHeader(c);
        this.drawSubtitles(c);
        this.drawMeter(c);
        this.texture.needsUpdate = true;
    }

    chamfer(c, x, y, w, h, cut) {
        c.beginPath();
        c.moveTo(x + cut, y);
        c.lineTo(x + w, y);
        c.lineTo(x + w, y + h - cut);
        c.lineTo(x + w - cut, y + h);
        c.lineTo(x, y + h);
        c.lineTo(x, y + cut);
        c.closePath();
    }

    drawPanel(c) {
        const gradient = c.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, 'rgba(34, 46, 56, 0.9)');
        gradient.addColorStop(1, 'rgba(10, 16, 22, 0.9)');
        this.chamfer(c, 1, 1, this.width - 2, this.height - 2, 12);
        c.fillStyle = gradient;
        c.fill();
        c.lineWidth = 2;
        c.strokeStyle = '#8fa1ad';
        c.stroke();
        this.chamfer(c, 5, 5, this.width - 10, this.height - 10, 9);
        c.lineWidth = 1;
        c.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        c.stroke();
    }

    drawPortraitInset(c) {
        const x = this.padding, y = this.padding, size = this.portraitSize;
        c.fillStyle = '#000';
        c.fillRect(x, y, size, size);
        c.lineWidth = 2;
        c.strokeStyle = '#05080b';
        c.beginPath();
        c.moveTo(x, y + size);
        c.lineTo(x, y);
        c.lineTo(x + size, y);
        c.stroke();
        c.strokeStyle = '#a9b8c2';
        c.beginPath();
        c.moveTo(x + size, y);
        c.lineTo(x + size, y + size);
        c.lineTo(x, y + size);
        c.stroke();
    }

    drawHeader(c) {
        const x = this.textLeft, y = this.padding, w = this.textWidth, h = this.headerHeight;
        c.fillStyle = 'rgba(0, 0, 0, 0.4)';
        c.fillRect(x, y, w, h);
        c.lineWidth = 1;
        c.strokeStyle = 'rgba(143, 161, 173, 0.6)';
        c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        c.textBaseline = 'middle';
        c.font = `bold 15px ${this.font}`;
        c.letterSpacing = '2px';
        const blinkOn = Math.floor(this.phaseTime * 4) % 2 === 0;
        const label = {
            opening: this.incomingLabel,
            incoming: blinkOn ? this.incomingLabel : '',
            speaking: this.name,
            ending: blinkOn ? this.endLabel : '',
            closing: this.endLabel,
        }[this.phase];
        c.fillStyle = this.phase === 'speaking' ? '#e6eef3' : '#ffffff';
        c.textAlign = 'left';
        c.fillText(label, x + 10, y + h / 2 + 1);
        if (this.phase === 'speaking' && !this.audioFailed) {
            c.font = `12px ${this.font}`;
            c.fillStyle = '#8fa1ad';
            c.textAlign = 'right';
            c.fillText(this.formatTime(this.audio.currentTime), x + w - 10, y + h / 2 + 1);
        }
        c.letterSpacing = '0px';
    }

    drawSubtitles(c) {
        if (this.phase !== 'speaking' && this.phase !== 'ending') return;
        const top = this.padding + this.headerHeight + 10;
        const bottom = this.height - this.padding - this.meterHeight - 8;
        const maxLines = Math.max(1, Math.floor((bottom - top) / this.lineHeight));
        const totalCharacters = this.subtitleLines.reduce((total, line) => total + line.length + 1, 0);
        let remaining = Math.floor(this.progress() * totalCharacters * 1.15);
        const visible = [];
        for (const line of this.subtitleLines) {
            if (remaining <= 0) break;
            visible.push(line.slice(0, remaining));
            remaining -= line.length + 1;
        }
        c.font = `15px ${this.font}`;
        c.textAlign = 'left';
        c.textBaseline = 'top';
        c.fillStyle = this.phase === 'ending' ? 'rgba(214, 226, 234, 0.55)' : '#d6e2ea';
        visible.slice(-maxLines).forEach((line, index) => c.fillText(line, this.textLeft + 6, top + index * this.lineHeight));
    }

    drawMeter(c) {
        const segments = 32, gap = 2;
        const y = this.height - this.padding - this.meterHeight;
        const segmentWidth = (this.textWidth - gap * (segments - 1)) / segments;
        const lit = Math.round(this.level * segments);
        for (let index = 0; index < segments; index++) {
            c.fillStyle = index < lit ? (index > segments * 0.8 ? '#f0f6fa' : '#9fc3d6') : 'rgba(255, 255, 255, 0.07)';
            c.fillRect(this.textLeft + index * (segmentWidth + gap), y, segmentWidth, this.meterHeight);
        }
    }

    wrap(text, maxWidth) {
        const c = this.context;
        c.font = `15px ${this.font}`;
        const lines = [];
        let line = '';
        for (const word of text.split(/\s+/).filter(Boolean)) {
            const candidate = line ? `${line} ${word}` : word;
            if (line && c.measureText(candidate).width > maxWidth) {
                lines.push(line);
                line = word;
            } else {
                line = candidate;
            }
        }
        if (line) lines.push(line);
        return lines;
    }

    formatTime(seconds) {
        const whole = Math.floor(seconds || 0);
        return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
    }

    dispose() {
        this.audio?.pause();
        this.source?.disconnect();
        this.analyser?.disconnect();
        this.frame.geometry.dispose();
        this.frame.material.dispose();
        this.texture.dispose();
        this.portrait.geometry.dispose();
        this.portrait.material.dispose();
        this.portraitUniforms.map.value?.dispose();
    }

    static vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    static fragmentShader = `
        uniform sampler2D map;
        uniform float hasMap;
        uniform float time;
        uniform float noise;
        uniform float rows;
        uniform vec4 crop;
        varying vec2 vUv;
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        void main() {
            float row = floor(vUv.y * rows);
            float frame = floor(time * 24.0);
            float shift = (hash(vec2(row, frame)) - 0.5) * 0.08 * noise;
            vec2 uv = clamp(vec2(vUv.x + shift, vUv.y), 0.0, 1.0);
            vec3 color = hasMap > 0.5 ? texture2D(map, crop.xy + uv * crop.zw).rgb : vec3(0.0);
            float luma = dot(color, vec3(0.299, 0.587, 0.114));
            color = mix(color, vec3(luma) * vec3(0.86, 0.98, 1.06), 0.4);
            float snow = hash(floor(vUv * rows) + vec2(frame * 1.37, frame * 0.71));
            color = mix(color, vec3(snow), noise);
            color *= 0.82 + 0.18 * sin(vUv.y * rows * 3.14159);
            color += 0.05 * smoothstep(0.92, 1.0, fract(vUv.y - time * 0.25));
            color *= mix(0.6, 1.0, smoothstep(0.85, 0.35, distance(vUv, vec2(0.5))));
            gl_FragColor = vec4(color, 1.0);
        }
    `;
}
