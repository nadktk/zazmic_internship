const fsp = require('fs').promises;
const idGenerator = require('./id-gen');

class DB {
  constructor(pathToJson) {
    this.path = pathToJson;
  }

  async findAll() {
    const data = await fsp.readFile(this.path);
    return JSON.parse(data);
  }

  async find(id) {
    const items = await this.findAll();
    return items.find((item) => item.id === id);
  }

  async create(data) {
    const items = await this.findAll();
    const newItem = {
      id: idGenerator(),
      ...data,
    };
    items.unshift(newItem);
    await fsp.writeFile(this.path, JSON.stringify(items, null, 2));
    return items;
  }

  async update(id, data) {
    const items = await this.findAll();
    const newItems = items.map((item) => (item.id === id ? { ...item, ...data } : item));
    await fsp.writeFile(this.path, JSON.stringify(newItems, null, 2));
    return newItems;
  }

  async delete(id) {
    const items = await this.findAll();
    const newItems = items.filter((item) => item.id !== id);
    await fsp.writeFile(this.path, JSON.stringify(newItems, null, 2));
    return items.find((item) => item.id === id);
  }
}

module.exports = DB;
