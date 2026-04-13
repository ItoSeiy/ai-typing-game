import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ImagePreloader } from '../src/core/image-preloader.js';

class FakeImage {
  static reset() {
    FakeImage.instances = [];
    FakeImage.successPaths = new Set();
    FakeImage.failurePaths = new Set();
  }

  constructor() {
    this.onload = null;
    this.onerror = null;
    this.complete = false;
    this.naturalWidth = 0;
    this._src = '';
    FakeImage.instances.push(this);
  }

  set src(value) {
    this._src = value;

    queueMicrotask(() => {
      if (FakeImage.failurePaths.has(value)) {
        this.onerror?.(new Error(`Failed to load ${value}`));
        return;
      }

      this.complete = true;
      this.naturalWidth = 1;
      this.onload?.();
    });
  }

  get src() {
    return this._src;
  }
}

FakeImage.reset();

describe('ImagePreloader（画像プリローダー）', () => {
  beforeEach(() => {
    FakeImage.reset();
  });

  it('有効画像を先読みしてImageをキャッシュする', async () => {
    FakeImage.successPaths.add('assets/images/sakura.png');
    const preloader = new ImagePreloader({
      ImageClass: FakeImage,
      logger: { warn() {} }
    });

    await preloader.loadAll([
      { imagePath: 'assets/images/sakura.png' }
    ]);

    assert.equal(FakeImage.instances.length, 1);
    const cached = preloader.get('assets/images/sakura.png');
    assert.ok(cached);
    assert.equal(cached?.src, 'assets/images/sakura.png');
  });

  it('画像パス未指定の問題をスキップする', async () => {
    const preloader = new ImagePreloader({
      ImageClass: FakeImage,
      logger: { warn() {} }
    });

    await preloader.loadAll([
      { imagePath: '' },
      { image_path: '   ' },
      { imagePath: null }
    ]);

    assert.equal(FakeImage.instances.length, 0);
    assert.equal(preloader.get(''), null);
  });

  it('画像読み込み失敗時でも例外を投げない', async () => {
    FakeImage.failurePaths.add('assets/images/missing.png');
    const preloader = new ImagePreloader({
      ImageClass: FakeImage,
      logger: { warn() {} }
    });

    await assert.doesNotReject(
      () => preloader.loadAll([
        { imagePath: 'assets/images/missing.png' }
      ])
    );

    assert.equal(preloader.get('assets/images/missing.png'), null);
  });

  it('不明パスならnull、既知パスならキャッシュを返す', async () => {
    FakeImage.successPaths.add('assets/images/neko.png');
    const preloader = new ImagePreloader({
      ImageClass: FakeImage,
      logger: { warn() {} }
    });

    await preloader.loadAll([
      { imagePath: 'assets/images/neko.png' }
    ]);

    assert.equal(preloader.get('assets/images/unknown.png'), null);
    assert.equal(preloader.get('assets/images/neko.png')?.src, 'assets/images/neko.png');
  });
});
