/**
 * GameMenu — ゲームプレイ中のメニューUI（一時停止・設定・やり直し・タイトル戻り）
 */
export class GameMenu {
  constructor() {
    this._visible = false;
    this._audioManager = null;
    this._onRestart = null;
    this._onBackToTitle = null;
    this._onOpen = null;
    this._onClose = null;
    this._previewTimer = null;
    this._build();
  }

  _build() {
    // Menu button (bottom-right corner)
    this.menuBtn = document.createElement('button');
    this.menuBtn.className = 'game-menu__btn matrix-btn';
    this.menuBtn.textContent = 'MENU';
    this.menuBtn.addEventListener('click', () => this._toggle());

    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'game-menu__overlay';
    this.overlay.style.display = 'none';

    // Panel
    const panel = document.createElement('div');
    panel.className = 'game-menu__panel';

    const title = document.createElement('h2');
    title.className = 'game-menu__title matrix-glow';
    title.textContent = 'PAUSED';
    panel.appendChild(title);

    // Settings section
    const settingsSection = document.createElement('div');
    settingsSection.className = 'game-menu__settings';

    const settingsLabel = document.createElement('div');
    settingsLabel.className = 'game-menu__section-label matrix-text';
    settingsLabel.textContent = '- SETTINGS -';
    settingsSection.appendChild(settingsLabel);

    // Volume control
    const volItem = document.createElement('div');
    volItem.className = 'game-menu__setting-item';

    const volLabel = document.createElement('label');
    volLabel.className = 'game-menu__label matrix-text';
    volLabel.textContent = 'SE VOLUME';
    volItem.appendChild(volLabel);

    const sliderWrap = document.createElement('div');
    sliderWrap.className = 'game-menu__slider-wrap';

    this.volumeSlider = document.createElement('input');
    this.volumeSlider.type = 'range';
    this.volumeSlider.min = '0';
    this.volumeSlider.max = '100';
    this.volumeSlider.value = '80';
    this.volumeSlider.className = 'game-menu__slider';
    sliderWrap.appendChild(this.volumeSlider);

    this.volumeValue = document.createElement('span');
    this.volumeValue.className = 'game-menu__value matrix-text';
    this.volumeValue.textContent = '80%';
    sliderWrap.appendChild(this.volumeValue);

    volItem.appendChild(sliderWrap);
    settingsSection.appendChild(volItem);

    // Mute button
    const muteItem = document.createElement('div');
    muteItem.className = 'game-menu__setting-item';

    const muteLabel = document.createElement('label');
    muteLabel.className = 'game-menu__label matrix-text';
    muteLabel.textContent = 'MUTE';
    muteItem.appendChild(muteLabel);

    this.muteBtn = document.createElement('button');
    this.muteBtn.className = 'screen__button matrix-btn game-menu__mute-btn';
    this.muteBtn.textContent = 'OFF';
    this._muted = false;
    muteItem.appendChild(this.muteBtn);

    settingsSection.appendChild(muteItem);
    panel.appendChild(settingsSection);

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'game-menu__actions';

    this.resumeBtn = document.createElement('button');
    this.resumeBtn.className = 'screen__button matrix-btn game-menu__action-btn';
    this.resumeBtn.textContent = 'RESUME';
    actions.appendChild(this.resumeBtn);

    this.restartBtn = document.createElement('button');
    this.restartBtn.className = 'screen__button matrix-btn game-menu__action-btn';
    this.restartBtn.textContent = 'RESTART';
    actions.appendChild(this.restartBtn);

    this.titleBtn = document.createElement('button');
    this.titleBtn.className = 'screen__button matrix-btn game-menu__action-btn';
    this.titleBtn.textContent = 'TITLE';
    actions.appendChild(this.titleBtn);

    panel.appendChild(actions);

    // Confirm dialog (hidden by default)
    this.confirmOverlay = document.createElement('div');
    this.confirmOverlay.className = 'game-menu__confirm';
    this.confirmOverlay.style.display = 'none';

    this.confirmText = document.createElement('p');
    this.confirmText.className = 'game-menu__confirm-text matrix-text';
    this.confirmOverlay.appendChild(this.confirmText);

    const confirmBtns = document.createElement('div');
    confirmBtns.className = 'game-menu__confirm-btns';

    this.confirmOk = document.createElement('button');
    this.confirmOk.className = 'screen__button matrix-btn game-menu__confirm-ok';
    this.confirmOk.textContent = 'OK';
    confirmBtns.appendChild(this.confirmOk);

    this.confirmCancel = document.createElement('button');
    this.confirmCancel.className = 'screen__button matrix-btn game-menu__confirm-cancel';
    this.confirmCancel.textContent = 'CANCEL';
    confirmBtns.appendChild(this.confirmCancel);

    this.confirmOverlay.appendChild(confirmBtns);
    panel.appendChild(this.confirmOverlay);

    this.overlay.appendChild(panel);

    // Event listeners
    this.resumeBtn.addEventListener('click', () => this.close());

    this.restartBtn.addEventListener('click', () => {
      this._showConfirm('やり直しますか？', () => {
        this._hideConfirm();
        this.close();
        if (this._onRestart) this._onRestart();
      });
    });

    this.titleBtn.addEventListener('click', () => {
      this._showConfirm('タイトルに戻りますか？', () => {
        this._hideConfirm();
        this.close();
        if (this._onBackToTitle) this._onBackToTitle();
      });
    });

    this.confirmCancel.addEventListener('click', () => this._hideConfirm());

    this.volumeSlider.addEventListener('input', () => {
      const val = parseInt(this.volumeSlider.value, 10);
      this.volumeValue.textContent = `${val}%`;
      if (this._audioManager) {
        this._audioManager.setVolume(val / 100);
      }
      if (this._muted) {
        this._clearPreviewTimer();
        return;
      }
      this._schedulePreview();
    });

    this.muteBtn.addEventListener('click', () => {
      this._muted = !this._muted;
      this.muteBtn.textContent = this._muted ? 'ON' : 'OFF';
      this.muteBtn.classList.toggle('game-menu__mute-btn--active', this._muted);
      if (this._audioManager) {
        this._audioManager.setMute(this._muted);
      }
      if (this._muted) {
        this._clearPreviewTimer();
      } else {
        this._playPreviewNow();
      }
    });
  }

  /** Attach the menu button and overlay to the game screen container */
  attach(container) {
    container.appendChild(this.menuBtn);
    container.appendChild(this.overlay);
  }

  setAudioManager(audioManager) {
    this._audioManager = audioManager;
  }

  onRestart(callback) {
    this._onRestart = callback;
  }

  onBackToTitle(callback) {
    this._onBackToTitle = callback;
  }

  onOpen(callback) {
    this._onOpen = callback;
  }

  onClose(callback) {
    this._onClose = callback;
  }

  isVisible() {
    return this._visible;
  }

  open() {
    if (this._visible) return;
    this._visible = true;
    this._syncAudioState();
    this.overlay.style.display = 'flex';
    this.menuBtn.style.display = 'none';
    if (this._onOpen) this._onOpen();
  }

  close() {
    if (!this._visible) return;
    this._visible = false;
    this._hideConfirm();
    this._clearPreviewTimer();
    this.overlay.style.display = 'none';
    this.menuBtn.style.display = '';
    if (this._audioManager) {
      this._audioManager.saveSettings();
    }
    if (this._onClose) this._onClose();
  }

  /** Show the menu button (when game starts) */
  showButton() {
    this.menuBtn.style.display = '';
  }

  /** Hide button + overlay (when game ends or leaves game screen) */
  hideAll() {
    this._visible = false;
    this._hideConfirm();
    this._clearPreviewTimer();
    this.overlay.style.display = 'none';
    this.menuBtn.style.display = 'none';
  }

  _toggle() {
    if (this._visible) {
      this.close();
    } else {
      this.open();
    }
  }

  _syncAudioState() {
    if (!this._audioManager) return;
    const vol = Math.round((this._audioManager.getVolume?.() ?? 0.8) * 100);
    this.volumeSlider.value = String(vol);
    this.volumeValue.textContent = `${vol}%`;

    const muted = this._audioManager.isMuted?.() ?? false;
    this._muted = muted;
    this.muteBtn.textContent = muted ? 'ON' : 'OFF';
    this.muteBtn.classList.toggle('game-menu__mute-btn--active', muted);
  }

  _showConfirm(text, onOk) {
    this.confirmText.textContent = text;
    this.confirmOverlay.style.display = 'flex';
    this.confirmOk.onclick = onOk;
  }

  _hideConfirm() {
    this.confirmOverlay.style.display = 'none';
    this.confirmOk.onclick = null;
  }

  _clearPreviewTimer() {
    if (this._previewTimer !== null) {
      clearTimeout(this._previewTimer);
      this._previewTimer = null;
    }
  }

  _schedulePreview() {
    if (!this._audioManager || this._muted) return;
    this._clearPreviewTimer();
    this._previewTimer = setTimeout(() => {
      this._previewTimer = null;
      if (!this._audioManager || this._muted) return;
      this._audioManager.playPreviewSE?.();
    }, 200);
  }

  _playPreviewNow() {
    if (!this._audioManager || this._muted) return;
    this._clearPreviewTimer();
    this._audioManager.playPreviewSE?.();
  }
}
