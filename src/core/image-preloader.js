function normalizeImagePath(question) {
  const imagePath = question?.imagePath ?? question?.image_path ?? '';

  return String(imagePath).trim();
}

export class ImagePreloader {
  constructor({ ImageClass = globalThis.Image, logger = console } = {}) {
    this.ImageClass = ImageClass;
    this.logger = logger;
    this.cache = new Map();
    this.inflight = new Map();
  }

  get(imagePath) {
    const normalizedPath = String(imagePath ?? '').trim();

    if (!normalizedPath) {
      return null;
    }

    return this.cache.get(normalizedPath) ?? null;
  }

  async loadAll(questions = []) {
    const uniquePaths = new Set();

    for (const question of questions) {
      const imagePath = normalizeImagePath(question);

      if (imagePath) {
        uniquePaths.add(imagePath);
      }
    }

    await Promise.all(
      [...uniquePaths].map((imagePath) =>
        this.load(imagePath).catch(() => null)
      )
    );
  }

  async load(imagePath) {
    const normalizedPath = String(imagePath ?? '').trim();

    if (!normalizedPath) {
      return null;
    }

    if (this.cache.has(normalizedPath)) {
      return this.cache.get(normalizedPath);
    }

    if (this.inflight.has(normalizedPath)) {
      return this.inflight.get(normalizedPath);
    }

    if (typeof this.ImageClass !== 'function') {
      this.logger?.warn?.(
        `Image preload skipped for ${normalizedPath}: Image constructor unavailable`
      );
      return null;
    }

    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    this.inflight.set(normalizedPath, promise);

    let image;

    try {
      image = new this.ImageClass();
    } catch (error) {
      this.logger?.warn?.(`Image preload failed for ${normalizedPath}`, error);
      this.inflight.delete(normalizedPath);
      resolvePromise(null);
      return promise;
    }

    const settle = (result) => {
      this.inflight.delete(normalizedPath);
      resolvePromise(result);
    };

    image.onload = () => {
      this.cache.set(normalizedPath, image);
      settle(image);
    };

    image.onerror = (error) => {
      this.logger?.warn?.(`Image preload failed for ${normalizedPath}`, error);
      settle(null);
    };

    try {
      image.src = normalizedPath;
    } catch (error) {
      this.logger?.warn?.(`Image preload failed for ${normalizedPath}`, error);
      settle(null);
    }

    return promise;
  }
}
