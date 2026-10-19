class DropZone {
    constructor(target, clickTarget, fileInput, onFiles) {
        this.target = target;
        this.clickTarget = clickTarget;
        this.fileInput = fileInput;
        this.onFiles = onFiles;
        this.bindEvents();
    }

    bindEvents() {
        ['dragenter', 'dragover'].forEach(type => this.target.addEventListener(type, event => this.highlight(event, true)));
        ['dragleave', 'drop'].forEach(type => this.target.addEventListener(type, event => this.highlight(event, false)));
        this.target.addEventListener('drop', event => this.accept(event.dataTransfer.files));
        this.clickTarget.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', () => this.accept(this.fileInput.files));
    }

    highlight(event, active) {
        event.preventDefault();
        this.target.classList.toggle('active', active);
    }

    accept(files) {
        if (files.length > 0) this.onFiles([...files]);
    }
}
