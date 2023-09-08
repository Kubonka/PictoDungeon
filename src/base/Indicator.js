import * as PIXI from "pixi.js";
class Indicator {
  #separation = 1;
  #baseWidth = 64;
  #textPos;
  #textStyle;
  #text;
  #tileSize;
  #tiles;
  #target;
  constructor(world, x, y, tiles, tileSize) {
    this.world = world;
    this.#tiles = tiles;

    this.#textStyle = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fontWeight: 600,
      fill: "#ffffff",
    });
    this.#text = new PIXI.Text("", this.#textStyle);
    this.#text.anchor.set(0.5, 0.5);
    this.#text.scale.set(tileSize, tileSize);
    this.#tileSize = tileSize * this.#baseWidth;
    this.world.boardContainer.addChild(this.#text);
    this.#start(x, y);
  }
  #start(x, y) {
    let offset;
    if (this.#tileSize < 64) offset = -35;
    else offset = -35;
    if (x < 0) this.#textPos = new PIXI.Point(offset, this.#tileSize / 2 + y * (this.#tileSize + this.#separation));
    else this.#textPos = new PIXI.Point(this.#tileSize / 2 + x * (this.#tileSize + this.#separation), offset);
    const targetValue = this.#tiles.reduce((total, tile) => {
      if (tile.target === "wall") return total + 1;
      return total;
    }, 0);
    this.#text.text = targetValue;
    this.#target = targetValue;
    this.#text.position.copyFrom(this.#textPos);
  }
  update() {
    const currentValue = this.#tiles.reduce((total, tile) => {
      if (tile.current === "wall") return total + 1;
      return total;
    }, 0);
    if (currentValue > this.#target) {
      //red
      this.#text.tint = 0xcc2f1b;
    } else if (currentValue < this.#target) {
      //black
      this.#text.tint = 0x140e0f;
    } else {
      //gray
      this.#text.tint = 0x858181;
    }
  }
}
export default Indicator;
