class KoalaImage {
    constructor(bitmap, screenRam, colorRam, background, loadAddress = 0x6000) {
        this.bitmap = bitmap;
        this.screenRam = screenRam;
        this.colorRam = colorRam;
        this.background = background & 0x0f;
        this.loadAddress = loadAddress;
    }

    static blank(background = 0) {
        return new KoalaImage(
            new Uint8Array(KoalaImage.BITMAP_SIZE),
            new Uint8Array(KoalaImage.CELLS),
            new Uint8Array(KoalaImage.CELLS),
            background
        );
    }

    static fromBytes(bytes) {
        const data = KoalaImage.isPacked(bytes) ? new GgUnpacker(bytes.subarray(2)).unpack() : bytes;
        const offset = KoalaImage.headerLength(data.length);
        const bitmapEnd = offset + KoalaImage.BITMAP_SIZE;
        const screenEnd = bitmapEnd + KoalaImage.CELLS;
        const colorEnd = screenEnd + KoalaImage.CELLS;
        const loadAddress = offset === 2 && !KoalaImage.isPacked(bytes) ? data[0] | (data[1] << 8) : 0x6000;
        return new KoalaImage(
            data.slice(offset, bitmapEnd),
            data.slice(bitmapEnd, screenEnd),
            data.slice(screenEnd, colorEnd),
            data[colorEnd],
            loadAddress
        );
    }

    static isPacked(bytes) {
        return bytes.length < KoalaImage.PAYLOAD_SIZE;
    }

    static headerLength(size) {
        if (size >= KoalaImage.PAYLOAD_SIZE + 2) return 2;
        if (size >= KoalaImage.PAYLOAD_SIZE) return 0;
        throw new Error(`Not a Koala file: ${size} bytes, expected ${KoalaImage.PAYLOAD_SIZE + 2}`);
    }

    toBytes() {
        const bytes = new Uint8Array(KoalaImage.PAYLOAD_SIZE + 2);
        bytes[0] = this.loadAddress & 0xff;
        bytes[1] = this.loadAddress >> 8;
        bytes.set(this.bitmap, 2);
        bytes.set(this.screenRam, 2 + KoalaImage.BITMAP_SIZE);
        bytes.set(this.colorRam, 2 + KoalaImage.BITMAP_SIZE + KoalaImage.CELLS);
        bytes[KoalaImage.PAYLOAD_SIZE + 1] = this.background;
        return bytes;
    }

    static contains(x, y) {
        return x >= 0 && y >= 0 && x < KoalaImage.WIDTH && y < KoalaImage.HEIGHT;
    }

    static cellAt(x, y) {
        return (y >> 3) * KoalaImage.COLUMNS + (x >> 2);
    }

    bitsAt(x, y) {
        const byte = this.bitmap[KoalaImage.cellAt(x, y) * 8 + (y & 7)];
        return (byte >> (6 - 2 * (x & 3))) & 0b11;
    }

    setBits(x, y, bits) {
        const index = KoalaImage.cellAt(x, y) * 8 + (y & 7);
        const shift = 6 - 2 * (x & 3);
        this.bitmap[index] = (this.bitmap[index] & ~(0b11 << shift)) | (bits << shift);
    }

    slotColor(cell, slot) {
        switch (slot) {
            case 0: return this.background;
            case 1: return this.screenRam[cell] >> 4;
            case 2: return this.screenRam[cell] & 0x0f;
            default: return this.colorRam[cell] & 0x0f;
        }
    }

    setSlotColor(cell, slot, color) {
        if (slot === 1) this.screenRam[cell] = (color << 4) | (this.screenRam[cell] & 0x0f);
        if (slot === 2) this.screenRam[cell] = (this.screenRam[cell] & 0xf0) | color;
        if (slot === 3) this.colorRam[cell] = color;
    }

    colorAt(x, y) {
        return this.slotColor(KoalaImage.cellAt(x, y), this.bitsAt(x, y));
    }

    cellOrigin(cell) {
        return { x: (cell % KoalaImage.COLUMNS) * 4, y: Math.floor(cell / KoalaImage.COLUMNS) * 8 };
    }

    slotUsage(cell, skip = null) {
        const usage = [0, 0, 0, 0];
        const origin = this.cellOrigin(cell);
        for (let y = origin.y; y < origin.y + 8; y++) {
            for (let x = origin.x; x < origin.x + 4; x++) {
                if (skip && skip.x === x && skip.y === y) continue;
                usage[this.bitsAt(x, y)]++;
            }
        }
        return usage;
    }

    cellSlots(cell) {
        const usage = this.slotUsage(cell);
        return [0, 1, 2, 3].map(slot => ({ slot, color: this.slotColor(cell, slot), pixels: usage[slot] }));
    }

    paint(x, y, color, replaceOnClash = false) {
        if (!KoalaImage.contains(x, y)) return KoalaImage.PAINT_OUTSIDE;
        if (this.colorAt(x, y) === color) return KoalaImage.PAINT_UNCHANGED;
        if (color === this.background) {
            this.setBits(x, y, 0);
            return KoalaImage.PAINT_DONE;
        }
        const cell = KoalaImage.cellAt(x, y);
        const usage = this.slotUsage(cell, { x, y });
        const slots = [1, 2, 3];
        const matching = slots.find(slot => this.slotColor(cell, slot) === color && usage[slot] > 0)
            ?? slots.find(slot => usage[slot] === 0);
        if (matching !== undefined) {
            this.setSlotColor(cell, matching, color);
            this.setBits(x, y, matching);
            return KoalaImage.PAINT_DONE;
        }
        if (!replaceOnClash) return KoalaImage.PAINT_CLASH;
        const leastUsed = slots.reduce((best, slot) => usage[slot] < usage[best] ? slot : best);
        this.setSlotColor(cell, leastUsed, color);
        this.setBits(x, y, leastUsed);
        return KoalaImage.PAINT_REPLACED;
    }
}

KoalaImage.COLUMNS = 40;
KoalaImage.ROWS = 25;
KoalaImage.CELLS = KoalaImage.COLUMNS * KoalaImage.ROWS;
KoalaImage.BITMAP_SIZE = KoalaImage.CELLS * 8;
KoalaImage.PAYLOAD_SIZE = KoalaImage.BITMAP_SIZE + 2 * KoalaImage.CELLS + 1;
KoalaImage.WIDTH = 160;
KoalaImage.HEIGHT = 200;
KoalaImage.PAINT_DONE = 'done';
KoalaImage.PAINT_UNCHANGED = 'unchanged';
KoalaImage.PAINT_REPLACED = 'replaced';
KoalaImage.PAINT_CLASH = 'clash';
KoalaImage.PAINT_OUTSIDE = 'outside';
