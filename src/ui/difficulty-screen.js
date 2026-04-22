/**
 * DifficultyScreen — 難易度選択画面
 */
export class DifficultyScreen {
  constructor(containerEl) {
    this.container = containerEl;
    this._onSelect = null;
    this._onBack = null;
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._buildBase();
  }

  _buildBase() {
    this.container.innerHTML = '';
    this.container.className = 'screen difficulty-screen';
    this.container.tabIndex = -1;

    this.titleEl = document.createElement('h2');
    this.titleEl.className = 'screen__title matrix-glow';
    this.titleEl.textContent = 'DIFFICULTY';
    this.container.appendChild(this.titleEl);

    this.subtitleEl = document.createElement('p');
    this.subtitleEl.className = 'difficulty-screen__subtitle matrix-text';
    this.subtitleEl.textContent = '難易度を選択して開始しよう';
    this.container.appendChild(this.subtitleEl);

    this.gridEl = document.createElement('div');
    this.gridEl.className = 'difficulty-screen__grid';
    this.container.appendChild(this.gridEl);

    this.footerEl = document.createElement('p');
    this.footerEl.className = 'difficulty-screen__footer matrix-text';
    this.footerEl.textContent = '矢印キー / Enter / Escape で操作';
    this.container.appendChild(this.footerEl);

    this._activeIndex = 0;
    this._cards = [];
    this._difficulties = [];
  }

  show(difficulties, onSelect) {
    this._onSelect = onSelect;
    this._difficulties = difficulties;
    this.container.style.display = 'flex';
    this._renderCards(difficulties);
    this.container.addEventListener('keydown', this._handleKeyDown);
    this.container.focus({ preventScroll: true });
  }

  hide() {
    this.container.style.display = 'none';
    this.container.removeEventListener('keydown', this._handleKeyDown);
  }

  onBack(callback) {
    this._onBack = callback;
  }

  _renderCards(difficulties) {
    this.gridEl.innerHTML = '';
    this._cards = [];

    difficulties.forEach((difficulty, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'difficulty-card';
      card.dataset.index = String(index);
      card.setAttribute('aria-label', `${difficulty.label} を選択`);

      const id = document.createElement('div');
      id.className = 'difficulty-card__id matrix-text';
      id.textContent = difficulty.id;
      card.appendChild(id);

      const label = document.createElement('div');
      label.className = 'difficulty-card__label matrix-glow';
      label.textContent = difficulty.label;
      card.appendChild(label);

      const description = document.createElement('div');
      description.className = 'difficulty-card__description matrix-text';
      description.textContent = difficulty.description || '';
      card.appendChild(description);

      card.addEventListener('click', () => {
        this._activateCard(index);
        this._selectCurrent();
      });

      this.gridEl.appendChild(card);
      this._cards.push(card);
    });

    const preferredIndex = 0;
    this._setActiveIndex(preferredIndex);
  }

  _setActiveIndex(index) {
    if (this._cards.length === 0) {
      this._activeIndex = 0;
      return;
    }

    const nextIndex = ((index % this._cards.length) + this._cards.length) % this._cards.length;
    this._activeIndex = nextIndex;

    this._cards.forEach((card, cardIndex) => {
      const isActive = cardIndex === nextIndex;
      card.classList.toggle('focused', isActive);
      card.setAttribute('aria-pressed', String(isActive));
    });

    this._cards[nextIndex]?.focus({ preventScroll: true });
  }

  _activateCard(index) {
    this._setActiveIndex(index);
  }

  _selectCurrent() {
    const difficulty = this._difficulties[this._activeIndex];
    if (difficulty && this._onSelect) {
      this._onSelect(difficulty);
    }
  }

  _handleKeyDown(event) {
    if (this._cards.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this._setActiveIndex(this._activeIndex - 1);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this._setActiveIndex(this._activeIndex + 1);
        break;
      case 'Enter':
        event.preventDefault();
        this._selectCurrent();
        break;
      case 'Escape':
        event.preventDefault();
        if (this._onBack) {
          this._onBack();
        }
        break;
      default:
        break;
    }
  }
}
