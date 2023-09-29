import * as PIXI from "pixi.js";
import PixiApp from "./PixiApp";
import ADN from "./ADN";
import Cell from "./Cell";
class DisplayBoard {
  #width = 19 * 8;
  #separation = 10;
  /**
   * @param {PixiApp} world
   * @param {ADN} adn
   */

  constructor(world, adn, i, j, best) {
    this.world = world;
    this.container = new PIXI.Container();
    this.world.solverContainers.push(this.container);
    this.container.position.set(j * this.#width, i * this.#width);
    this.container.scale.set(3, 3);
    const style = new PIXI.TextStyle({ fontSize: 16, fontFamily: "Arial", fill: "#000000", fontWeight: 400 });
    this.text = new PIXI.Text("", style);
    this.text.position.set(j * this.#width, i * this.#width - 20);
    this.world.addChild(this.text);
    this.world.addChild(this.container);
    this.board = [];
    this.#initializeBoard(adn);
    this.update(adn);
  }
  #initializeBoard(adn) {
    for (let i = 0; i < adn.genes.length; i++) {
      for (let j = 0; j < adn.genes.length; j++) {
        this.board.push(new Cell(this.world, i, j, adn.genes[i][j], this.container));
      }
    }
    this.text.text = this.fitness;
  }
  update(adn) {
    let k = 0;
    for (let i = 0; i < adn.genes.length; i++) {
      for (let j = 0; j < adn.genes.length; j++) {
        this.board[k].value = adn.genes[i][j].value;
        k++;
      }
    }
    this.fitness = adn.fitness;
    this.text.text = this.fitness;
  }
}
export default DisplayBoard;
