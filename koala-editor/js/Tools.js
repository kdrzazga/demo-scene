class Tool {
    constructor(app, name, key) {
        this.app = app;
        this.name = name;
        this.key = key;
    }

    down(point, color) {}

    move(point, color) {}

    up(point, color) {}

    static linePoints(from, to) {
        const points = [];
        let x = from.x;
        let y = from.y;
        const dx = Math.abs(to.x - x);
        const dy = -Math.abs(to.y - y);
        const stepX = x < to.x ? 1 : -1;
        const stepY = y < to.y ? 1 : -1;
        let error = dx + dy;
        while (true) {
            points.push({ x, y });
            if (x === to.x && y === to.y) return points;
            const doubled = 2 * error;
            if (doubled >= dy) {
                error += dy;
                x += stepX;
            }
            if (doubled <= dx) {
                error += dx;
                y += stepY;
            }
        }
    }
}

class PenTool extends Tool {
    constructor(app) {
        super(app, 'Pen', 'b');
    }

    down(point, color) {
        this.last = point;
        this.app.paint(point.x, point.y, color);
    }

    move(point, color) {
        Tool.linePoints(this.last, point).forEach(p => this.app.paint(p.x, p.y, color));
        this.last = point;
    }
}

class LineTool extends Tool {
    constructor(app) {
        super(app, 'Line', 'l');
    }

    down(point, color) {
        this.start = point;
        this.snapshot = this.app.koala.toBytes();
        this.app.paint(point.x, point.y, color);
    }

    move(point, color) {
        this.app.koala = KoalaImage.fromBytes(this.snapshot);
        Tool.linePoints(this.start, point).forEach(p => this.app.paint(p.x, p.y, color));
    }
}

class FillTool extends Tool {
    constructor(app) {
        super(app, 'Fill', 'f');
    }

    down(point, color) {
        const koala = this.app.koala;
        if (!KoalaImage.contains(point.x, point.y)) return;
        const target = koala.colorAt(point.x, point.y);
        if (target === color) return;
        this.region(koala, point, target).forEach(p => this.app.paint(p.x, p.y, color));
    }

    region(koala, start, target) {
        const visited = new Uint8Array(KoalaImage.WIDTH * KoalaImage.HEIGHT);
        const stack = [start];
        const points = [];
        while (stack.length > 0) {
            const { x, y } = stack.pop();
            if (!KoalaImage.contains(x, y)) continue;
            const index = y * KoalaImage.WIDTH + x;
            if (visited[index] || koala.colorAt(x, y) !== target) continue;
            visited[index] = 1;
            points.push({ x, y });
            stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
        }
        return points;
    }
}

class PickerTool extends Tool {
    constructor(app) {
        super(app, 'Picker', 'i');
    }

    down(point, color, button) {
        if (!KoalaImage.contains(point.x, point.y)) return;
        this.app.colors.select(button, this.app.koala.colorAt(point.x, point.y));
    }

    move(point, color, button) {
        this.down(point, color, button);
    }
}
