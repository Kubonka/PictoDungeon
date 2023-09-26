import * as PIXI from "pixi.js";
class Cell {
  #baseWidth = 16;
  #value;
  constructor(world, i, j, value, container) {
    this.world = world;
    this.sprite = new PIXI.Sprite(this.world.assets.cell);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.position.set(j * this.#baseWidth + this.#baseWidth / 2, i * this.#baseWidth + this.#baseWidth / 2);
    container.addChild(this.sprite);
    this.#value = value;
    this.#updateCell();
  }
  set value(value) {
    this.#value = value;
    this.#updateCell();
  }
  get value() {
    return this.#value;
  }
  #updateCell() {
    switch (this.#value) {
      case 0: {
        this.sprite.tint = 0x50ff50;
        break;
      }
      case 1: {
        this.sprite.tint = 0x104080;
        break;
      }
      case 2: {
        this.sprite.tint = 0xffffff;
        break;
      }
      default:
        break;
    }
  }
}
export default Cell;
