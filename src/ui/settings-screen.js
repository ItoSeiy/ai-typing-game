/**
 * SettingsScreen — 設定画面（音量・ミュート）
 */
export class SettingsScreen {
  constructor(containerEl) {
    this.container = containerEl;
    this._backCallback = null;
    this._audioManager = null;
    this._build();
  }

  _build() {
    this.container.innerHTML = '';
    this.container.className = 'screen settings-screen';

    // Title
    const heading = document.createElement('h2');
    heading.className = 'screen__title matrix-glow';
    heading.textContent = 'SETTINGS';
    this.container.appendChild(heading);

    // Settings list
    const settingsList = document.createElement('div');
    settingsList.className = 'settings-screen__list';

    // Volume slider
    const volItem = document.createElement('div');
    volItem.className = 'settings-screen__item';

    const volLabel = document.createElement('label');
    volLabel.className = 'settings-screen__label matrix-text';
    volLabel.textContent = 'SE VOLUME';
    volItem.appendChild(volLabel);

    const sliderWrap = document.createElement('div');
    sliderWrap.className = 'settings-screen__slider-wrap';

    this.volumeSlider = document.createElement('input');
    this.volumeSlider.type = 'range';
    this.volumeSlider.min = '0';
    this.volumeSlider.max = '100';
    this.volumeSlider.value = '80';
    this.volumeSlider.className = 'settings-screen__slider';
    sliderWrap.appendChild(this.volumeSlider);

    this.volumeValue = document.createElement('span');
    this.volumeValue.className = 'settings-screen__value matrix-text';
    this.volumeValue.textContent = '80%';
    sliderWrap.appendChild(this.volumeValue);

    volItem.appendChild(sliderWrap);
    settingsList.appendChild(volItem);

    // Mute toggle
    const muteItem = document.createElement('div');
    muteItem.className = 'settings-screen__item';

    const muteLabel = document.createElement('label');
    muteLabel.className = 'settings-screen__label matrix-text';
    muteLabel.textContent = 'MUTE';
    muteItem.appendChild(muteLabel);

    this.muteBtn = document.createElement('button');
    this.muteBtn.className = 'screen__button matrix-btn settings-screen__mute-btn';
    this.muteBtn.textContent = 'OFF';
    this._muted = false;
    muteItem.appendChild(this.muteBtn);

    settingsList.appendChild(muteItem);
    this.container.appendChild(settingsList);

    // Back button
    const btnWrap = document.createElement('div');
    btnWrap.className = 'screen__buttons';

    this.backBtn = document.createElement('button');
    this.backBtn.className = 'screen__button matrix-btn';
    this.backBtn.textContent = 'BACK';
    btnWrap.appendChild(this.backBtn);

    this.container.appendChild(btnWrap);

    // Event listeners
    this.volumeSlider.addEventListener('input', () => {
      const val = parseInt(this.volumeSlider.value, 10);
      this.volumeValue.textContent = `${val}%`;
      if (this._audioManager) {
        this._audioManager.setVolume(val / 100);
      }
    });

    this.muteBtn.addEventListener('click', () => {
      this._muted = !this._muted;
      this.muteBtn.textContent = this._muted ? 'ON' : 'OFF';
      this.muteBtn.classList.toggle('settings-screen__mute-btn--active', this._muted);
      if (this._audioManager) {
        this._audioManager.setMute(this._muted);
      }
    });

    this.backBtn.addEventListener('click', () => {
      if (this._backCallback) this._backCallback();
    });
  }

  show() {
    this.container.style.display = 'flex';

    // Sync UI with current audio state
    if (this._audioManager) {
      const vol = Math.round((this._audioManager.getVolume?.() ?? 0.8) * 100);
      this.volumeSlider.value = String(vol);
      this.volumeValue.textContent = `${vol}%`;

      const muted = this._audioManager.isMuted?.() ?? false;
      this._muted = muted;
      this.muteBtn.textContent = muted ? 'ON' : 'OFF';
      this.muteBtn.classList.toggle('settings-screen__mute-btn--active', muted);
    }
  }

  hide() {
    this.container.style.display = 'none';
  }

  onBack(callback) {
    this._backCallback = callback;
  }

  setAudioManager(audioManager) {
    this._audioManager = audioManager;
  }
}
