import * as PIXI from "pixi.js";
import gemNames from "./gemNames.js";
import * as TWEEN from "@tweenjs/tween.js";
class PixiApp {
  constructor() {
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0xaaaaaa,
      antialias: true,
    });
    this.assets = {};
    this.boardContainer = new PIXI.Container();
    this.boardContainer.position.set(64, 64);
    this.app.stage.addChild(this.boardContainer);
    const container = document.getElementById("pixiContainer");
    container.appendChild(this.app.view);
    this.app.ticker.add((dt) => this.#update(dt));
  }
  addChild(child) {
    this.app.stage.addChild(child);
  }
  removeChild(child) {
    if (Array.isArray(child)) {
      child.forEach((c) => this.app.stage.removeChild(c));
    } else {
      this.app.stage.removeChild(child);
    }
  }
  async loadAssets() {
    gemNames.forEach((gemPath) => {
      PIXI.Assets.add(gemPath, `./static/gems/spriteSheets/${gemPath}/spritesheet.json`);
    });
    const loadedTextures = await Promise.all(gemNames.map(async (gemPath) => await PIXI.Assets.load(gemPath)));
    gemNames.forEach((gemPath, i) => {
      this.assets[gemPath] = loadedTextures[i];
    });
    PIXI.Assets.add("backGround", "./static/gems/spriteSheets/backGround/backGround.png");
    this.assets.backGround = await PIXI.Assets.load("backGround");
    PIXI.Assets.add("cellMark", "./static/gems/spriteSheets/cellMark/cellMark.png");
    this.assets.cellMark = await PIXI.Assets.load("cellMark");
    PIXI.Assets.add("acumulatorBg", "./static/gems/spriteSheets/acumulator/bg.png");
    this.assets.acumulatorBg = await PIXI.Assets.load("acumulatorBg");
    PIXI.Assets.add("acumulatorFill", "./static/gems/spriteSheets/acumulator/fill.png");
    this.assets.acumulatorFill = await PIXI.Assets.load("acumulatorFill");
  }
  #update(delta) {
    TWEEN.update();
  }
}

export default PixiApp;
