import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import PixiApp from "./PixiApp";
class Button {
  #onClick;
  constructor(world, buttonName, initialPos) {
    /**
     * @type {PixiApp} world
     */
    this.world = world;
    //this.sprite = new PIXI.AnimatedSprite(this.#getTexturesFromAsset(buttonName));
    this.sprite = new PIXI.Sprite(this.world.assets.cellMark);
    this.sprite.scale.set(0.5, 0.5);
    this.sprite.position = initialPos;
    this.sprite.eventMode = "dynamic";
    this.sprite.on("click", () => this.#onClick());
    this.world.boardContainer.addChild(this.sprite);
  }
  setOnClickHandler(handler) {
    this.#onClick = handler;
  }
  #getTexturesFromAsset(buttonName) {
    // const frames = [];
    // for (const key in this.world.assets[buttonName].textures) {
    //   frames.push(this.world.assets[buttonName].textures[key]);
    // }
    // return frames;
  }
}
export default Button;
