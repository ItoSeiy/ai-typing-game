export class InputHandler {
  constructor() {
    this.callback = null;
    this.enabled = false;
    this._boundHandler = this._handleKeyDown.bind(this);
  }

  _handleKeyDown(event) {
    if (!this.enabled || !this.callback) return;
    event.preventDefault();
    this.callback(event.key);
  }

  onKeyDown(callback) {
    this.callback = callback;
    document.addEventListener('keydown', this._boundHandler);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  destroy() {
    this.disable();
    document.removeEventListener('keydown', this._boundHandler);
    this.callback = null;
  }
}
