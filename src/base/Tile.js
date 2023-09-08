import PixiApp from "./PixiApp";
import * as PIXI from "pixi.js";
class Tile {
  //todo usar el size para setear la posicion del sprite
  #spritePosition;
  #separation = 1;
  #baseWidth = 64;
  #scale;
  #onClickHandler;
  constructor(world, row, col, tileSize, onCLick) {
    /**
     * @type {PixiApp} world
     */
    this.world = world;
    this.#onClickHandler = onCLick;
    this.row = row;
    this.col = col;
    this.#scale = tileSize;
    this.neighbors = [];
    this.corners = [];
    this.startingTile = false;
    this.animatedSprites = this.#loadAnimatedSprites();
    this.gen = { available: true, name: "wall", deadEnd: false };
    this.target = null;
    this.secondary = null;
    this.current = null;
  }
  // setSprite(name) {
  //   this.animatedSprites[name];
  // }
  removeSprite() {}
  #loadAnimatedSprites() {
    const names = ["floor", "monster", "wall", "cross"];
    const result = {};
    const width = this.#scale * this.#baseWidth;
    for (const name of names) {
      console.log(name);
      result[name] = new PIXI.AnimatedSprite(this.#getTexturesFromAsset(name));
      const sprite = result[name];
      this.#spritePosition = new PIXI.Point(
        width / 2 + this.col * (width + this.#separation),
        width / 2 + this.row * (width + this.#separation)
      );
      sprite.eventMode = "dynamic";
      sprite.position.copyFrom(this.#spritePosition);
      sprite.animationSpeed = 0.4;
      sprite.loop = false;
      sprite.anchor.set(0.5, 0.5);
      sprite.scale.set(this.#scale, this.#scale);
      sprite.on("click", (event) => {
        if (event.shiftKey) {
          this.toggle(true);
        } else {
          this.toggle(false);
        }
      });
      this.world.boardContainer.addChild(sprite);
    }
    return result;
  }
  #getTexturesFromAsset(name) {
    const frames = [];
    console.log(this.world.assets);
    for (const path in this.world.assets[name].textures) {
      console.log(path);
      frames.push(this.world.assets[name].textures[path]);
    }
    return frames;
  }
  toggle(alt) {
    if (alt) {
      switch (this.current) {
        case "floor": {
          this.animatedSprites.cross.visible = true;
          this.current = "cross";
          this.play("cross");
          //play
          break;
        }
        case "wall":
          this.animatedSprites.floor.visible = true;
          this.animatedSprites.wall.visible = false;
          this.animatedSprites.cross.visible = true;
          this.play("cross");
          this.current = "cross";
          break;
        case "cross":
          //set floor
          this.animatedSprites.floor.visible = true;
          this.animatedSprites.cross.visible = false;
          this.animatedSprites.cross.gotoAndStop(0);
          this.current = "floor";
          break;
        default:
          break;
      }
    } else {
      switch (this.current) {
        case "floor": {
          this.animatedSprites.wall.visible = true;
          this.animatedSprites.cross.visible = false;
          this.animatedSprites.cross.gotoAndStop(0);
          this.current = "wall";
          //play
          break;
        }
        case "wall":
          this.animatedSprites.floor.visible = true;
          this.animatedSprites.wall.visible = false;
          this.animatedSprites.cross.visible = false;
          this.animatedSprites.cross.gotoAndStop(0);
          this.current = "floor";
          break;
        case "cross":
          //set floor
          this.animatedSprites.wall.visible = true;
          this.animatedSprites.floor.visible = false;
          this.animatedSprites.cross.visible = false;
          this.animatedSprites.cross.gotoAndStop(0);
          this.current = "wall";
          break;
        default:
          break;
      }
    }
    this.#onClickHandler();
  }
  play(spriteName) {
    this.animatedSprites[spriteName].play();
  }

  //!test function
  // updateSprite() {
  //   if (this.gen.name === "wall") this.sprite.tint = 0x3b2b01;
  //   if (this.gen.name === "floor") this.sprite.tint = 0x204d05;
  //   if (this.startingTile) this.sprite.tint = 0x1010ff;
  //   if (this.gen.deadEnd) this.sprite.tint = 0xb8001c;
  // }
}
export default Tile;
