import { promises as fs } from 'fs';

export class JsonStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.cache = null;
    this.writeQueue = Promise.resolve();
  }

  async read() {
    if (this.cache === null) {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      this.cache = JSON.parse(raw);
    }
    return this.cache;
  }

  async write(data) {
    this.cache = data;
    this.writeQueue = this.writeQueue.then(() =>
      fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
    );
    return this.writeQueue;
  }

  invalidateCache() {
    this.cache = null;
  }
}
