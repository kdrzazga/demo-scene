class TerminalWindow {
    constructor({
        title = 'Security Computer Terminal',
        deniedMessage = 'ACCESS DENIED',
        onClose = () => {},
        container = document.body,
    } = {}) {
        this.deniedMessage = deniedMessage;
        this.onClose = onClose;
        this.element = document.createElement('div');
        this.element.className = 'terminal-window';
        this.element.hidden = true;
        this.titleBar = this.child('div', 'terminal-title', title);
        this.login = this.field('Login', 'text');
        this.password = this.field('Password', 'password');
        this.status = this.child('div', 'terminal-status', '');
        this.buttons = this.child('div', 'terminal-buttons', '');
        this.loginButton = this.button('Login', () => this.submit());
        this.exitButton = this.button('Exit', () => this.close());
        this.element.addEventListener('keydown', event => this.onKey(event));
        container.appendChild(this.element);
    }

    child(tag, className, text) {
        const node = document.createElement(tag);
        node.className = className;
        node.textContent = text;
        this.element.appendChild(node);
        return node;
    }

    button(text, onClick) {
        const node = document.createElement('button');
        node.type = 'button';
        node.className = 'terminal-button';
        node.textContent = text;
        node.addEventListener('click', onClick);
        this.buttons.appendChild(node);
        return node;
    }

    field(label, type) {
        const row = this.child('label', 'terminal-field', '');
        const caption = document.createElement('span');
        caption.textContent = label;
        const input = document.createElement('input');
        input.type = type;
        input.autocomplete = 'off';
        input.spellcheck = false;
        row.append(caption, input);
        return input;
    }

    get isOpen() {
        return !this.element.hidden;
    }

    open(title) {
        if (title) this.titleBar.textContent = title;
        this.login.value = '';
        this.password.value = '';
        this.status.textContent = '';
        this.element.hidden = false;
        this.login.focus();
    }

    close(notify = true) {
        if (!this.isOpen) return;
        this.element.hidden = true;
        document.activeElement?.blur();
        if (notify) this.onClose();
    }

    onKey(event) {
        event.stopPropagation();
        if (event.key === 'Escape') this.close();
        else if (event.key === 'Enter') this.submit();
    }

    submit() {
        this.status.textContent = this.deniedMessage;
        this.password.value = '';
        this.password.focus();
    }

    dispose() {
        this.element.remove();
    }
}
