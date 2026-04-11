/**
 * TitleScreen — Matrix風タイトル画面
 */
export class TitleScreen {
  constructor(containerEl) {
    this.container = containerEl;
    this._onSettingsCallback = null;
    this._build();
  }

  _build() {
    this.container.innerHTML = '';
    this.container.className = 'screen title-screen';

    // Title
    const title = document.createElement('h1');
    title.className = 'screen__title matrix-glow';
    title.textContent = 'MATRIX TYPER';
    this.container.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.className = 'screen__subtitle matrix-text';
    subtitle.textContent = '- ローマ字タイピングゲーム -';
    this.container.appendChild(subtitle);

    // Button container
    const btnWrap = document.createElement('div');
    btnWrap.className = 'screen__buttons';

    // Start button
    this.startBtn = document.createElement('button');
    this.startBtn.className = 'screen__button matrix-btn';
    this.startBtn.textContent = 'START';
    btnWrap.appendChild(this.startBtn);

    // Settings button
    this.settingsBtn = document.createElement('button');
    this.settingsBtn.className = 'screen__button matrix-btn';
    this.settingsBtn.textContent = 'SETTINGS';
    btnWrap.appendChild(this.settingsBtn);

    this.container.appendChild(btnWrap);

    // Footer
    const footer = document.createElement('p');
    footer.className = 'screen__footer matrix-text';
    footer.textContent = '画面に表示される日本語をローマ字で入力しよう！';
    this.container.appendChild(footer);
  }

  show(onStart) {
    this.container.style.display = 'flex';

    // Remove old listeners by cloning
    const newStartBtn = this.startBtn.cloneNode(true);
    this.startBtn.parentNode.replaceChild(newStartBtn, this.startBtn);
    this.startBtn = newStartBtn;

    const newSettingsBtn = this.settingsBtn.cloneNode(true);
    this.settingsBtn.parentNode.replaceChild(newSettingsBtn, this.settingsBtn);
    this.settingsBtn = newSettingsBtn;

    this.startBtn.addEventListener('click', () => {
      if (onStart) onStart();
    });

    this.settingsBtn.addEventListener('click', () => {
      if (this._onSettingsCallback) this._onSettingsCallback();
    });
  }

  hide() {
    this.container.style.display = 'none';
  }

  onSettings(callback) {
    this._onSettingsCallback = callback;
  }
}
