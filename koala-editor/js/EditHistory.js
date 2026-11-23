class EditHistory {
    constructor(limit = 200) {
        this.limit = limit;
        this.undoStack = [];
        this.redoStack = [];
    }

    record(koala) {
        this.undoStack.push(koala.toBytes());
        if (this.undoStack.length > this.limit) this.undoStack.shift();
        this.redoStack = [];
    }

    discardLast() {
        this.undoStack.pop();
    }

    undo(koala) {
        return this.step(this.undoStack, this.redoStack, koala);
    }

    redo(koala) {
        return this.step(this.redoStack, this.undoStack, koala);
    }

    step(from, to, koala) {
        if (from.length === 0) return null;
        to.push(koala.toBytes());
        return KoalaImage.fromBytes(from.pop());
    }
}
