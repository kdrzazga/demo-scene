class GgUnpacker {
    constructor(packed, escape = 0xfe) {
        this.packed = packed;
        this.escape = escape;
    }

    unpack() {
        const output = new Uint8Array(KoalaImage.PAYLOAD_SIZE);
        let source = 0;
        let target = 0;
        while (source < this.packed.length && target < output.length) {
            const byte = this.packed[source++];
            if (byte !== this.escape) {
                output[target++] = byte;
                continue;
            }
            const value = this.packed[source++];
            const count = this.packed[source++] || 256;
            output.fill(value, target, Math.min(target + count, output.length));
            target += count;
        }
        if (target < KoalaImage.PAYLOAD_SIZE) throw new Error(`Packed Koala unpacked to only ${target} bytes`);
        return output;
    }
}
