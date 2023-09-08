import Tile from "./Tile";
import Indicator from "./Indicator";
class MapGenerator {
  //!settings (floors y monsters count)
  // fMin = 1.5; //?floors van entre 2.75 a 4.25 ( 22 a 34) 64 -> 22  34
  // fMax = 4.25;
  // mMin = 0.5; //?monsters van entre 0.75 y 1.25 ( 6 a 10 )
  // mMax = 1.25;
  //$0.35  0.55  -> 0.2 - 0.55
  static #fMin = 0.2;
  static #fMax = 0.55;
  //$0.08  0.17 -> 0.09 - 0.17
  static #mMin = 0.09;
  static #mMax = 0.17;
  constructor() {
    throw new Error("FAIL");
  }

  static generate(world, matrixSize, onClickTileHandler) {
    //tecnicamente es una escala
    const tileSize = matrixSize > 10 ? 0.7 : 1;
    const [board, startingTile] = this.#initializeBoard(world, matrixSize, tileSize, onClickTileHandler);
    const floors = Math.floor(matrixSize * matrixSize * (this.#fMax - Math.random() * this.#fMin));
    const monsters = Math.floor(matrixSize * matrixSize * (this.#mMax - Math.random() * this.#mMin));
    const path = [];
    path.push(startingTile);
    const availableTiles = [...path];
    this.#generateFloors(startingTile, path, floors, availableTiles);
    path.forEach((tile) => {
      tile.gen.deadEnd = false;
      tile.gen.available = true;
    });
    const deadEndCount = this.#setInitialDeadEnds(path);
    board.forEach((tile) => {
      tile.gen.available = true;
    });
    const auxPath = [...path.filter((tile) => !tile.gen.deadEnd)];
    console.log(monsters, deadEndCount);
    this.#generateMonsters(auxPath, monsters - deadEndCount);
    board.forEach((tile) => {
      tile.animatedSprites.floor.visible = false;
      tile.animatedSprites.monster.visible = false;
      tile.animatedSprites.cross.visible = false;
      tile.animatedSprites.wall.visible = false;
    });
    board.forEach((tile) => {
      if (tile.gen.deadEnd) {
        tile.gen.name = "floor";
        tile.target = "monster";
        tile.current = "monster";
        tile.animatedSprites.floor.visible = true;
        tile.animatedSprites.monster.visible = true;
      } else if (tile.gen.name === "floor") {
        tile.target = tile.gen.name;
        tile.current = "floor";
        tile.animatedSprites.floor.visible = true;
      } else if (tile.gen.name === "wall") {
        tile.target = tile.gen.name;
        tile.animatedSprites.wall.visible = true;
      }
      console.log(tile);
    });
    //this.#colorize(board);
    const indicators = this.#generateIndicators(world, matrixSize, tileSize, board);
    return [board, indicators];
  }
  /**
   *
   * @param {Tile} currentTile
   * @param {Tile[]} path
   * @param {Tile[]} availableTiles
   * @param {number} floorCount
   */
  static #generateFloors(currentTile, path, floorCount, availableTiles) {
    //desde la current tile fijarse si hay visitables
    //  si hay visitables -> 1) buscar un vecino random
    //  si no hay visitables -> break -> buscar un tile random dentro del path -> RECURSION () setear available
    //1)si el vecino existe y !visitado -> fijarse si califica para ser floor
    //  si califica -> convertir en floor y agregar a path y lockearlo y visitado y se transforma en currentTile
    //  no califica ->
    if (floorCount === 0) return;
    const neighborWalls = this.#getWalls(currentTile.neighbors);
    if (neighborWalls.length) {
      const rndNeighborIndex = Math.floor(Math.random() * neighborWalls.length);
      const targetTile = neighborWalls[rndNeighborIndex];
      if (this.#canBeFloor(targetTile)) {
        targetTile.gen.name = "floor";
        path.push(targetTile);
        availableTiles.push(targetTile);
        this.#generateFloors(targetTile, path, floorCount - 1, availableTiles);
      } else {
        targetTile.gen.available = false;
        this.#generateFloors(currentTile, path, floorCount, availableTiles);
      }
    } else {
      this.#removeAvailableTile(availableTiles, currentTile);
      const rndTileIndex = Math.floor(Math.random() * availableTiles.length);
      this.#generateFloors(path[rndTileIndex], path, floorCount, availableTiles);
    }
  }
  static #generateMonsters(auxPath, monsterCount) {
    if (monsterCount <= 0 || auxPath.length === 0) return;
    const rndTileIndex = Math.floor(Math.random() * auxPath.length);
    const neighborWalls = this.#getWalls(auxPath[rndTileIndex].neighbors);
    let deadEndFound = false;
    while (neighborWalls.length > 0) {
      const rndWallIndex = Math.floor(Math.random() * neighborWalls.length);
      const adjWallsCount = neighborWalls[rndWallIndex].neighbors.reduce((total, tile) => {
        if (!tile || (tile && !tile.gen.deadEnd && tile.gen.name === "wall")) {
          return total + 1;
        }
        return total;
      }, 0);
      if (adjWallsCount === 3) {
        neighborWalls[rndWallIndex].gen.deadEnd = true;
        neighborWalls[rndWallIndex].gen.available = false;
        deadEndFound = true;
        break;
      } else {
        neighborWalls.splice(rndWallIndex, 1);
      }
    }
    if (deadEndFound) {
      this.#generateMonsters(auxPath, monsterCount - 1);
    } else {
      auxPath.splice(rndTileIndex, 1);
      this.#generateMonsters(auxPath, monsterCount);
    }
  }
  /**
   * @param {Tile[]} path
   */
  static #setInitialDeadEnds(path) {
    let count = 0;
    for (let i = 1; i < path.length; i++) {
      const tile = path[i];
      console.log(tile);
      const floors = tile.neighbors.filter((t) => t && t.gen.name === "floor");
      if (floors.length < 2) {
        tile.gen.deadEnd = true;
        count++;
      }
    }
    return count;
  }

  static #canBeFloor(tile) {
    // n0 c1 n1  |  n1 c2 n2  |  n2 c3 n3  |  n3 c0 n0
    let i = 0;
    let j = 1;
    for (let corner = 0; corner < 4; corner++) {
      if (j === 4) j = 0;
      if (this.#isEmptyCorner(tile, i, j)) return false;
      i++;
      j++;
    }
    return true;
  }
  static #isEmptyCorner(tile, i, j) {
    // console.log("tileE", tile);
    // console.log("n", i, "c", j, "n", j);
    if (tile.neighbors[i] === null || (tile.neighbors[i] && tile.neighbors[i].gen.name === "wall")) return false;
    if (tile.corners[j] === null || (tile.corners[j] && tile.corners[j].gen.name === "wall")) return false;
    if (tile.neighbors[j] === null || (tile.neighbors[j] && tile.neighbors[j].gen.name === "wall")) return false;
    return true;
  }
  /**
   *
   * @param {Tile[]} tiles
   */
  static #getWalls(tiles) {
    const newTiles = tiles.filter((tile) => tile && tile.gen.available && tile.gen.name === "wall");
    return newTiles;
  }
  static #initializeBoard(world, matrixSize, tileSize, onClickTileHandler) {
    /**
     * @type {Tile[][]} matrix
     */
    const matrix = [];
    const board = [];
    for (let i = 0; i < matrixSize; i++) {
      matrix[i] = [];
    }
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        matrix[i][j] = new Tile(world, i, j, tileSize, onClickTileHandler);
      }
    }
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        const tile = matrix[i][j];
        board.push(tile);
        //? setear vecinos y corners (sentido horario) arrancando arriba a la izquierda (NW)
        //NW -1-1
        if (i > 0 && j > 0) {
          tile.corners.push(matrix[i - 1][j - 1]);
        } else {
          tile.corners.push(null);
        }
        //N -10
        if (i > 0) {
          tile.neighbors.push(matrix[i - 1][j]);
        } else {
          tile.neighbors.push(null);
        }
        //NE -1 +1
        if (i > 0 && j < matrixSize - 1) {
          tile.corners.push(matrix[i - 1][j + 1]);
        } else {
          tile.corners.push(null);
        }
        //E 0 +1
        if (j < matrixSize - 1) {
          tile.neighbors.push(matrix[i][j + 1]);
        } else {
          tile.neighbors.push(null);
        }
        //SE +1 +1
        if (i < matrixSize - 1 && j < matrixSize - 1) {
          tile.corners.push(matrix[i + 1][j + 1]);
        } else {
          tile.corners.push(null);
        }
        //S +1 0
        if (i < matrixSize - 1) {
          tile.neighbors.push(matrix[i + 1][j]);
        } else {
          tile.neighbors.push(null);
        }
        //SW +1-1
        if (i < matrixSize - 1 && j > 0) {
          tile.corners.push(matrix[i + 1][j - 1]);
        } else {
          tile.corners.push(null);
        }
        //W 0 -1
        if (j > 0) {
          tile.neighbors.push(matrix[i][j - 1]);
        } else {
          tile.neighbors.push(null);
        }
      }
    }
    const rowOrCol = Math.random() > 0.5 ? 0 : 1;
    const startOrEnd = Math.random() > 0.5 ? 0 : matrixSize - 1;
    const rndIndex = Math.floor(Math.random() * matrixSize);
    let startingTile;
    if (rowOrCol) startingTile = matrix[startOrEnd][rndIndex];
    else startingTile = matrix[rndIndex][startOrEnd];
    startingTile.startingTile = true;
    startingTile.gen.name = "floor";
    return [board, startingTile];
  }
  static #generateIndicators(world, matrixSize, tileSize, board) {
    const indicators = [];
    for (let index = 0; index < matrixSize; index++) {
      const tiles = board.filter((tile) => tile.col === index);
      indicators.push(new Indicator(world, index, -1, tiles, tileSize));
    }
    for (let index = 0; index < matrixSize; index++) {
      const tiles = board.filter((tile) => tile.row === index);
      indicators.push(new Indicator(world, -1, index, tiles, tileSize));
    }
    return indicators;
  }
  //?temporal
  static #colorize(board) {
    board.forEach((tile) => {
      if (tile.gen.name === "wall") tile.sprite.tint = 0x3b2b01;
      if (tile.gen.name === "floor") tile.sprite.tint = 0x204d05;
      if (tile.startingTile) tile.sprite.tint = 0x1010ff;
      if (tile.gen.deadEnd) tile.sprite.tint = 0xb8001c;
    });
  }

  static #removeAvailableTile(availableTiles, currentTile) {
    const foundIndex = availableTiles.findIndex((tile) => tile === currentTile);
    availableTiles.splice(foundIndex, 1);
  }
}
export default MapGenerator;
