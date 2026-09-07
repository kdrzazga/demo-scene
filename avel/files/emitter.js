class Emitter {
  constructor() {
    this.listeners = {};
  }

  on(eventName, handler) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(handler);
    return this;
  }

  emit(eventName, payload) {
    const handlers = this.listeners[eventName];
    if (!handlers) {
      return;
    }
    for (const handler of handlers) {
      handler(payload);
    }
  }
}
