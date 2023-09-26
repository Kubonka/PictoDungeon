import GameState from "../helperClasses/GameState";
import cloneDeep from "lodash/cloneDeep";
import PixiApp from "./PixiApp";
import * as PIXI from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import MapGenerator from "./MapGenerator";
import Combinations from "./Combinations";
import Button from "./Button";
import Solver from "./Solver";

class GameManager {
  #tickerId;
  //!   V V V  SETEAR BOARD SIZE ACA  V V V
  #matrixSize = 8;
  static #instance = null;
  constructor() {
    if (GameManager.#instance) {
      return GameManager.#instance;
    }
    GameManager.#instance = this;
    this.world = new PixiApp();
    this.state = null;
    this.indicators = [];
    this.board = [];
    this.boardCopy = null;
    this.#start();
  }
  async #start() {
    await this.world.loadAssets();
    //const result = MapGenerator.generate(this.world, this.#matrixSize, () => this.#onClickTile());
    const pictoMap = {
      rows: [0, 7, 2, 4, 2, 2, 7, 0],
      cols: [2, 4, 4, 3, 2, 3, 4, 2],
      monstersPos: [
        { i: 0, j: 0 },
        { i: 0, j: 7 },
        { i: 2, j: 1 },
        { i: 2, j: 7 },
        { i: 5, j: 6 },
        { i: 7, j: 0 },
        { i: 7, j: 7 },
      ],
      wallsPos: [
        { i: 1, j: 0 },
        { i: 1, j: 6 },
        { i: 3, j: 3 },
        { i: 3, j: 4 },
        { i: 5, j: 3 },
        { i: 5, j: 5 },
        { i: 6, j: 2 },
      ],
      floorsPos: [
        { i: 5, j: 0 },
        { i: 6, j: 4 },
      ],
    };
    // [6, 2, 4, 3, 4, 4, 2, 6],
    //   [6, 2, 5, 3, 2, 5, 2, 6],
    //   [(0, 2), (0, 4), (2, 7), (3, 0), (4, 7), (5, 0), (7, 3), (7, 5)];
    // const pictoMap = {
    //   rows: [2, 3, 6, 2, 5, 1, 3, 2],
    //   cols: [3, 2, 3, 1, 6, 1, 4, 4],
    //   monstersPos: [
    //     { i: 5, j: 0 },
    //     { i: 1, j: 2 },
    //     { i: 2, j: 3 },
    //     { i: 1, j: 7 },
    //   ],
    //   wallsPos: [
    //     { i: 0, j: 7 },
    //     { i: 0, j: 6 },
    //     { i: 2, j: 6 },
    //     { i: 2, j: 7 },
    //     { i: 3, j: 6 },
    //     { i: 3, j: 7 },
    //     { i: 4, j: 6 },
    //     { i: 4, j: 7 },
    //   ],
    //   floorsPos: [
    //     { i: 1, j: 6 },
    //     { i: 7, j: 5 },
    //     { i: 7, j: 6 },
    //     { i: 7, j: 7 },
    //     { i: 6, j: 5 },
    //     { i: 6, j: 6 },
    //     { i: 6, j: 7 },
    //     { i: 5, j: 5 },
    //     { i: 5, j: 6 },
    //     { i: 5, j: 7 },
    //   ],
    // };
    const instance = new Combinations();
    console.log(instance.combinations);
    setTimeout(() => {
      this.solver = new Solver(this.world, pictoMap, instance.combinations);
    }, 2000);
    // this.board = result[0];
    // this.indicators = result[1];
    // this.boardCopy = cloneDeep(this.world.boardContainer);
    // this.world.addChild(this.boardCopy);
    // this.boardCopy.position.set(1000, 200);
    // this.boardCopy.scale.set(0.3, 0.3);
    // setTimeout(() => {
    //   this.boardCopy.visible = false;
    // }, 10);

    // // //?
    // const style = new PIXI.TextStyle({ fontSize: 48, fontFamily: "Arial", fill: "#007000", fontWeight: 600 });
    // this.msgText = new PIXI.Text("", style);
    // this.msgText.position.set(700, 700);
    // this.world.boardContainer.addChild(this.msgText);
    // //?
    // this.hideBtn = new Button(this.world, "cellMark", new PIXI.Point(1300, 64));
    // this.hideBtn.setOnClickHandler(() => (this.boardCopy.visible = !this.boardCopy.visible));
    // this.#setUpBoard();
    // this.#tickerId = this.world.app.ticker.add((delta) => this.#update(delta));
    // this.state = GameState.Initialize;
  }

  #update() {
    switch (this.state) {
      case GameState.Initialize: {
        this.state = GameState.NewGame;
        break;
      }
      case GameState.NewGame:
        break;
      case GameState.PlayerTurn: {
        break;
      }
      case GameState.Level1: {
        this.msgText.text = "SOLVED !";
        const monsters = this.board.filter((tile) => tile.target === "monster");
        monsters.forEach((tile) => tile.play("monster"));
        setTimeout(() => (this.msgText.text = ""), 4000);
        this.state = GameState.Loading;
        break;
      }
      case GameState.Loading:
        break;
      case GameState.Animating:
        break;

      default:
        break;
    }
  }
  #setUpBoard() {
    this.board.forEach((tile) => {
      if (tile.target === "wall") {
        tile.current = "wall";
        tile.toggle(false);
        tile.current = "floor";
      }
    });
  }
  #onClickTile() {
    this.indicators.forEach((indicator) => indicator.update());
    const notSolved = this.board.some((tile) => {
      if (tile.current !== tile.target) {
        if (tile.current === "cross" && tile.target === "floor") {
          return false;
        }
        return true;
      }
      return false;
    });
    if (!notSolved) {
      this.state = GameState.Level1;
    }
  }
}
export default GameManager;
