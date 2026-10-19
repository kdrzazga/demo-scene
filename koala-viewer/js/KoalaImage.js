class KoalaImage {
    constructor(bitmap, screenRam, colorRam, background) {
        this.bitmap = bitmap;
        this.screenRam = screenRam;
        this.colorRam = colorRam;
        this.background = background & 0x0f;
    }

    static fromBytes(bytes) {
        const data = KoalaImage.isPacked(bytes) ? new GgUnpacker(bytes.subarray(2)).unpack() : bytes;
        const offset = KoalaImage.headerLength(data.length);
        const bitmapEnd = offset + KoalaImage.BITMAP_SIZE;
        const screenEnd = bitmapEnd + KoalaImage.CELLS;
        const colorEnd = screenEnd + KoalaImage.CELLS;
        return new KoalaImage(
            data.slice(offset, bitmapEnd),
            data.slice(bitmapEnd, screenEnd),
            data.slice(screenEnd, colorEnd),
            data[colorEnd]
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

    colorAt(x, y) {
        const cell = (y >> 3) * KoalaImage.COLUMNS + (x >> 2);
        const byte = this.bitmap[cell * 8 + (y & 7)];
        const bits = (byte >> (6 - 2 * (x & 3))) & 0b11;
        switch (bits) {
            case 0: return this.background;
            case 1: return this.screenRam[cell] >> 4;
            case 2: return this.screenRam[cell] & 0x0f;
            default: return this.colorRam[cell] & 0x0f;
        }
    }
}

KoalaImage.COLUMNS = 40;
KoalaImage.ROWS = 25;
KoalaImage.CELLS = KoalaImage.COLUMNS * KoalaImage.ROWS;
KoalaImage.BITMAP_SIZE = KoalaImage.CELLS * 8;
KoalaImage.PAYLOAD_SIZE = KoalaImage.BITMAP_SIZE + 2 * KoalaImage.CELLS + 1;
KoalaImage.WIDTH = 160;
KoalaImage.HEIGHT = 200;
