import * as PIXI from "pixi.js";
import DisplayBoard from "./DisplayBoard";
import cloneDeep from "lodash/cloneDeep";

class Solver {
  #progress = 0;
  #ticker;
  #allCombinationsDone = false;
  #tracking = false;
  #displayIndex = 0;
  /**
   * @param {{rows:[number],cols:[number],monstersPos:[{i:number,j:number}],wallsPos:[{i:number,j:number}],floorsPos:[{i:number,j:number}]}} pictoMap
   */
  constructor(world, pictoMap, combinations) {
    console.log("1");
    this.world = world;
    this.map = pictoMap;
    this.combinations = combinations;
    this.solutionFound = [];
    this.displayBoard = null;
    this.keysPressed = false;
    this.#ticker = new PIXI.Ticker();
    this.#ticker.add((delta) => this.#update(delta));
    document.addEventListener("keydown", (event) => {
      this.keysPressed = true;
    });
    // document.addEventListener("keyup", (event) => {
    //   this.keys[event.key] = false;
    // });
    /**
     * @type {Array<{index: number, combinations: []}>}
     */
    this.allSolutions = [];
    this.#createAllSolutions();
    this.finalSolutions = this.#createFilteredSolutions();
    this.#ticker.start();
    //$DISPLAY

    // this.solutionFound = [];
  }
  #update(delta) {
    if (this.keysPressed) {
      this.keysPressed = false;
      if (this.displayBoard) {
        this.world.removeChild(this.displayBoard.container);
      }
      const adn = { genes: [] };
      const indexer = this.finalSolutions[this.#displayIndex];
      for (let i = 0; i < indexer.length; i++) {
        const row = this.allSolutions[i][indexer[i]];
        adn.genes.push(row);
      }
      this.displayBoard = new DisplayBoard(this.world, adn, 2, 2, false);
      this.#displayIndex++;
    }
  }
  #createAllSolutions() {
    //?init
    this.map.rows.forEach((rowValue) => {
      this.allSolutions.push(cloneDeep(this.combinations[rowValue]));
    });
    //?inject Monsters and filter
    this.map.monstersPos.forEach((pos) => {
      const combinations = this.allSolutions[pos.i];
      for (let i = 0; i < combinations.length; i++) {
        const combination = combinations[i];
        if (combination[pos.j] === 0) {
          combination[pos.j] = 2;
        } else {
          combinations.splice(i, 1);
          i--;
        }
      }
    });
    //?clear invalid monsters
    this.map.monstersPos.forEach((pos) => {
      const combinations = this.allSolutions[pos.i];
      for (let i = 0; i < combinations.length; i++) {
        const combination = combinations[i];
        if (pos.j - 1 >= 0 && pos.j + 1 < combination.length) {
          if (combination[pos.j - 1] === 0 && combination[pos.j + 1] === 0) {
            combinations.splice(i, 1);
            i--;
          }
        }
      }
    });
    //?inject walls and filter
    this.map.wallsPos.forEach((pos) => {
      const combinations = this.allSolutions[pos.i];
      for (let i = 0; i < combinations.length; i++) {
        const combination = combinations[i];
        if (combination[pos.j] !== 1) {
          combinations.splice(i, 1);
          i--;
        }
      }
    });
    //?inject floors and filter
    this.map.floorsPos.forEach((pos) => {
      const combinations = this.allSolutions[pos.i];
      for (let i = 0; i < combinations.length; i++) {
        const combination = combinations[i];
        if (combination[pos.j] !== 0) {
          combinations.splice(i, 1);
          i--;
        }
      }
    });
    //?remap combinations
    // this.allSolutions.forEach((solution) => {
    //   solution.combinations = solution.combinations.map((c, index) => {
    //     return { realIndex: index, data: c };
    //   });
    // });
  }
  #createFilteredSolutions() {
    let filteredSolutions = [];
    //?initial row
    for (let i = 0; i < this.allSolutions[0].length; i++) {
      filteredSolutions.push([i]);
    }
    //? next 7 rows
    for (let rowIndex = 1; rowIndex < this.allSolutions.length; rowIndex++) {
      console.log("row ", rowIndex);
      const newFilteredSolutions = [];
      for (let i = 0; i < filteredSolutions.length; i++) {
        const filteredSolution = filteredSolutions[i];
        for (let j = 0; j < this.allSolutions[rowIndex].length; j++) {
          const indexer = [...filteredSolution, j];
          //!this.#tracking = false;
          //!if (this.#findIndexer([indexer], [6, 4, 4, 16, 24, 21, 6, 6])) this.#tracking = true;
          //?check "sumZero overflow" and "2x2 floors" and "Isolated floors" and "invalid Monsters"
          if (
            !this.#sumZeroOverflow(indexer) &&
            !this.#squareFloors(indexer) &&
            !this.#isolatedFloor(indexer) &&
            !this.#invalidMonster(indexer)
          ) {
            newFilteredSolutions.push(indexer);
          }
        }
      }
      filteredSolutions = newFilteredSolutions;
    }
    // for (let i = 0; i < filteredSolutions.length; i++) {
    //   const indexer = filteredSolutions[i];
    //   const zeroSolution = this.#countSolution(indexer);
    //   if (zeroSolution) refiltered.push(indexer);
    // }
    // filteredSolutions = refiltered;
    // console.log(filteredSolutions);
    //!
    filteredSolutions = this.#removeInvalidHalls(filteredSolutions);
    for (let i = 0; i < filteredSolutions.length; i++) {
      const matrix = [];
      filteredSolutions[i].forEach((value, i) => {
        matrix.push(this.allSolutions[i][value].map((cell) => ({ visited: false, value: cell })));
      });
      if (!this.#validFloors(matrix)) {
        filteredSolutions.splice(i, 1);
        i--;
      }
    }
    console.log("filteredSolutions", filteredSolutions);
    console.log("this.allSolutions", this.allSolutions);

    return filteredSolutions;
  }
  #findIndexer(indexers, target) {
    const found = indexers.filter((indexer) => {
      for (let i = 0; i < indexer.length; i++) {
        if (indexer[i] !== target[i]) return false;
      }
      return true;
    });
    if (found.length === 0) return null;
    return found;
  }
  #squareFloors(indexer) {
    for (let i = 0; i < indexer.length - 1; i++) {
      for (let j = 0; j < 7; j++) {
        const c1 = this.allSolutions[i][indexer[i]][j];
        const c2 = this.allSolutions[i][indexer[i]][j + 1];
        const c3 = this.allSolutions[i + 1][indexer[i + 1]][j];
        const c4 = this.allSolutions[i + 1][indexer[i + 1]][j + 1];
        if (c1 === 0 && c2 === 0 && c3 === 0 && c4 === 0) return true;
      }
    }
    if (this.#tracking) console.log("SQUARE FLOORS GOOD");
    return false;
  }
  #isolatedFloor(indexer) {
    for (let i = 0; i < indexer.length; i++) {
      for (let j = 0; j < this.allSolutions[0][0].length; j++) {
        if (this.allSolutions[i][indexer[i]][j] === 0) {
          let a1;
          if (i - 1 < 0) {
            a1 = 1;
          } else if (this.allSolutions[i - 1][indexer[i - 1]][j] === 1) {
            a1 = 1;
          }
          let a2;
          if (i + 1 >= this.allSolutions.length) {
            a2 = 1;
          } else if (i + 1 < indexer.length) {
            if (this.allSolutions[i + 1][indexer[i + 1]][j] === 1) {
              a2 = 1;
            }
          }
          let a3;
          if (j - 1 < 0) {
            a3 = 1;
          } else if (this.allSolutions[i][indexer[i]][j - 1] === 1) {
            a3 = 1;
          }
          let a4;
          if (j + 1 >= indexer.length) {
            a4 = 1;
          } else if (this.allSolutions[i][indexer[i]][j + 1] === 1) {
            a4 = 1;
          }
          if (a1 === 1 && a2 === 1 && a3 === 1 && a4 === 1) {
            // if (this.#tracking) {
            //   console.log(a1, a2, a3, a4, " - ", i, j);
            //   if (i === 6) {
            //     console.log("row5", this.allSolutions[i - 1][indexer[i - 1]]);
            //     console.log("row6", this.allSolutions[i][indexer[i]]);
            //     console.log("row7", this.allSolutions[i + 1][indexer[i + 1]]);
            //   }
            // }
            return true;
          }
        }
      }
    }
    //!if (this.#tracking) console.log("ISOLATED FLOORS GOOD");
    return false;
  }
  #invalidMonster(indexer) {
    for (let i = 0; i < indexer.length; i++) {
      for (let j = 0; j < this.allSolutions[0][0].length; j++) {
        if (this.allSolutions[i][indexer[i]][j] === 2) {
          let floorCount = 0;
          if (i - 1 >= 0 && this.allSolutions[i - 1][indexer[i - 1]][j] === 0) floorCount++;
          if (i + 1 < indexer.length && this.allSolutions[i + 1][indexer[i + 1]][j] === 0) floorCount++;
          if (j - 1 >= 0 && this.allSolutions[i][indexer[i]][j - 1] === 0) floorCount++;
          if (j + 1 < indexer.length && this.allSolutions[i][indexer[i]][j + 1] === 0) floorCount++;
          if (floorCount > 1) return true;
        }
      }
    }
    if (this.#tracking) console.log("INVALID MONSTERS FLOORS GOOD");
    return false;
  }
  #sumZeroOverflow(indexer) {
    for (let j = 0; j < this.allSolutions[0][0].length; j++) {
      let wallCount = 0;
      for (let i = 0; i < indexer.length; i++) {
        if (this.allSolutions[i][indexer[i]][j] === 1) wallCount++;
      }
      if (wallCount > this.map.cols[j]) return true;
    }
    return false;
  }
  #removeInvalidHalls(filteredSolutions) {
    const refiltered = [];
    for (let k = 0; k < filteredSolutions.length; k++) {
      let indexI = 0;
      let indexJ = 0;
      let found = false;
      const indexer = filteredSolutions[k];
      for (let row = 0; row < this.allSolutions.length; row++) {
        for (let col = 0; col < this.allSolutions[row].length; col++) {
          if (this.allSolutions[row][indexer[row]][col] === 0 && !found) {
            indexI = row;
            indexJ = col;
            found = true;
          }
        }
      }
      const matrix = [];
      indexer.forEach((value, i) => {
        matrix.push(this.allSolutions[i][value].map((cell) => ({ visited: false, value: cell })));
      });
      const floorCount = this.#countSolution(matrix, indexI, indexJ);
      const wallCount = this.map.rows.reduce((total, row) => total + row, 0);
      const monsterCount = this.map.monstersPos.length;
      if (matrix.length * matrix.length - floorCount - wallCount - monsterCount === 0) {
        refiltered.push(indexer);
      }
    }
    return refiltered;
  }
  #countSolution(solution, i, j) {
    if (
      i < 0 ||
      i >= solution.length ||
      j < 0 ||
      j >= solution[i].length ||
      solution[i][j].visited ||
      solution[i][j].value !== 0
    ) {
      return 0;
    }
    let count = 1;
    solution[i][j].visited = true;
    count += this.#countSolution(solution, i - 1, j);
    count += this.#countSolution(solution, i, j + 1);
    count += this.#countSolution(solution, i + 1, j);
    count += this.#countSolution(solution, i, j - 1);
    return count;
  }
  #validFloors(solution) {
    for (let i = 0; i < solution.length; i++) {
      for (let j = 0; j < solution.length; j++) {
        const cell = solution[i][j];
        if (cell.value === 0) {
          let count = 0;
          //left
          if (j - 1 < 0) {
            count++;
          } else {
            if (solution[i][j - 1].value === 1) count++;
          }
          //right
          if (j + 1 >= solution.length) {
            count++;
          } else {
            if (solution[i][j + 1].value === 1) count++;
          }
          //up
          if (i - 1 < 0) {
            count++;
          } else {
            if (solution[i - 1][j].value === 1) count++;
          }
          //down
          if (i + 1 >= solution.length) {
            count++;
          } else {
            if (solution[i + 1][j].value === 1) count++;
          }
          if (count === 3) return false;
        }
      }
    }
    return true;
  }
  // #countSolution(indexer) {
  //   for (let j = 0; j < this.map.cols.length; j++) {
  //     let wallCount = 0;
  //     for (let i = 0; i < indexer.length; i++) {
  //       if (this.allSolutions[i][indexer[i]][j] === 1) wallCount++;
  //     }
  //     console.log(wallCount, " - ", j);
  //     if (wallCount !== this.map.cols[j]) return false;
  //   }
  //   return true;
  // }
}
export default Solver;
// #solve() {
//   //?crear combinaciones adaptadas al problema
//   this.#createTargetSolutions();
//   //?buscar el index de la col mas baja en combinaciones
//   const lowestIndex = this.#findLowestIndex();
//   console.log(lowestIndex);
//   //?generar
//   const zeroSum = this.#generateZeroSumIndexer(lowestIndex);
//   console.log(zeroSum.length);
//   //console.log(zeroSum);
//   //?ir desde 0 al midPoint y desde el midPoint al length-1
//   for (let i = 0; i < lowestIndex; i++) {
//     const currentCount = this.map.cols[i];
//     this.#removeNonZeroSumCombinations(zeroSum, currentCount, i);
//   }
//   for (let i = lowestIndex + 1; i < this.map.cols.length; i++) {
//     const currentCount = this.map.cols[i];
//     this.#removeNonZeroSumCombinations(zeroSum, currentCount, i);
//   }
//   //?buscar only solution
//   for (let i = 0; i < zeroSum.length; i++) {
//     const indexer = zeroSum[i];
//     //console.log("indexer", indexer);
//     const solution = indexer.map((realIndex, row) =>
//       this.targetSolutions[row].combinations[realIndex].data.map((value) => ({ visited: false, value }))
//     );
//     let indexI = 0;
//     let indexJ = 0;
//     let found = false;
//     for (let row = 0; row < solution.length; row++) {
//       for (let col = 0; col < solution.length; col++) {
//         if (solution[row][col].value === 0 && !found) {
//           indexI = row;
//           indexJ = col;
//           found = true;
//         }
//       }
//     }
//     const floorCount = this.#countSolution(solution, indexI, indexJ);
//     const wallCount = this.map.rows.reduce((total, row) => total + row, 0);
//     const monsterCount = this.map.monstersPos.length;
//     if (solution.length * solution.length - floorCount - wallCount - monsterCount === 0) {
//       if (this.#validFloors(solution)) {
//         console.log("SOLUTION FOUND", solution, "index :", i);
//         const solutionFound = [];
//         for (let k = 0; k < 8; k++) {
//           const row = solution[k].map((obj) => obj.value);
//           solutionFound.push(row);
//         }
//         this.#displaySolution(solutionFound);
//       }
//     }
//   }
// }
// #findLowestIndex() {
//   let lowestIndex = 0;
//   for (let i = 1; i < this.map.cols.length; i++) {
//     const col = this.map.cols[i];
//     if (Math.abs(4 - col) > Math.abs(4 - this.map.cols[lowestIndex])) {
//       lowestIndex = i;
//     }
//   }
//   return lowestIndex;
// }
// #generateZeroSumIndexer(lowestIndex) {
//   const zeroSumIndexer = [];
//   this.combinations[this.map.cols[lowestIndex]].forEach((c, testIndex) => {
//     //[1,0,0,1,1,0,1,1]
//     //?creo una copia de targetSolutions para cada combinacion del array
//     const semiSolutions = cloneDeep(this.targetSolutions);
//     //?le saco los que no sean parte de la combinacion
//     //?recorro de 0 a 7 y le saco

//     // console.log("semiSolutions", semiSolutions);
//     // console.log("combinations", c);
//     console.log(lowestIndex);
//     console.log("allSolutions", this.targetSolutions);
//     for (let i = 0; i < semiSolutions.length; i++) {
//       const combinations = semiSolutions[i].combinations;
//       for (let j = 0; j < combinations.length; j++) {
//         if (combinations[j].data[lowestIndex] === 1 && c[i] === 0) {
//           //splice
//           combinations.splice(j, 1);
//           j--;
//         } else if (
//           (combinations[j].data[lowestIndex] === 0 || combinations[j].data[lowestIndex] === 2) &&
//           c[i] === 1
//         ) {
//           //splice
//           combinations.splice(j, 1);
//           j--;
//         }
//       }
//     }
//     //console.log("semiSolutions", semiSolutions);
//     // //?volcar todas las combinaciones posibles a zeroSumIndexer con un metodo similar al del solve
//     this.#addToZeroSumIndexer(semiSolutions, zeroSumIndexer);
//   });
//   return zeroSumIndexer;
// }
// #addToZeroSumIndexer(semiSolutions, zeroSumIndexer) {
//   //todo fijarse si todas las rows de semisolution tienen al menos 1 elemento en combinations sino return false
//   for (let i = 0; i < semiSolutions.length; i++) {
//     if (semiSolutions[i].combinations.length === 0) return;
//   }
//   //?si allCombinationsDone -> return false
//   while (this.#allCombinationsDone === false) {
//     const realIndexes = [];
//     semiSolutions.forEach((sol) => {
//       realIndexes.push(sol.combinations[sol.index].realIndex);
//     });
//     zeroSumIndexer.push(realIndexes);
//     this.#incrementIndex(semiSolutions, true);
//   }
//   this.#allCombinationsDone = false;
// }
// #removeNonZeroSumCombinations(zeroSum, currentCount, j) {
//   for (let z = 0; z < zeroSum.length; z++) {
//     console.log(zeroSum.length);
//     const indexer = zeroSum[z];
//     let count = 0;
//     for (let i = 0; i < 8; i++) {
//       const value = this.targetSolutions[i].combinations[indexer[i]].data[j];
//       if (value === 1) count++;
//     }
//     if (count !== currentCount) {
//       zeroSum.splice(z, 1);
//       z--;
//     }
//   }
// }
// #countSolution(solution, i, j) {
//   if (
//     i < 0 ||
//     i >= solution.length ||
//     j < 0 ||
//     j >= solution[i].length ||
//     solution[i][j].visited ||
//     solution[i][j].value !== 0
//   ) {
//     return 0;
//   }
//   // if (i < 0 || i >= solution.length || j < 0 || j >= solution.length) return 0;
//   // if (solution[i][j].visited || solution[i][j].value !== 0) return 0;
//   let count = 1;
//   solution[i][j].visited = true;
//   count += this.#countSolution(solution, i - 1, j);
//   count += this.#countSolution(solution, i, j + 1);
//   count += this.#countSolution(solution, i + 1, j);
//   count += this.#countSolution(solution, i, j - 1);
//   return count;
// }
// #displaySolution(solutionFound) {
//   const adn = { genes: [] };
//   for (let i = 0; i < solutionFound.length; i++) {
//     const row = solutionFound[i];
//     const newRow = row.map((item) => {
//       return { value: item };
//     });
//     adn.genes.push(newRow);
//   }
//   // displayJ++;
//   // if (i % 5 === 0) {
//   //   displayJ = 0;
//   //   displayI++;
//   // }
//   new DisplayBoard(this.world, adn, 2, 2, false);
// }
// #validFloors(solution) {
//   console.log("solution", solution);
//   for (let i = 0; i < solution.length; i++) {
//     for (let j = 0; j < solution.length; j++) {
//       const cell = solution[i][j];
//       if (cell.value === 0) {
//         let count = 0;
//         //left
//         if (j - 1 < 0) {
//           count++;
//         } else {
//           if (solution[i][j - 1].value === 1) count++;
//         }
//         //right
//         if (j + 1 >= solution.length) {
//           count++;
//         } else {
//           if (solution[i][j + 1].value === 1) count++;
//         }
//         //up
//         if (i - 1 < 0) {
//           count++;
//         } else {
//           if (solution[i - 1][j].value === 1) count++;
//         }
//         //down
//         if (i + 1 >= solution.length) {
//           count++;
//         } else {
//           if (solution[i + 1][j].value === 1) count++;
//         }
//         if (count === 3) return false;
//       }
//     }
//   }
//   return true;
// }
// #incrementIndex(solutions, check) {
//   for (let i = solutions.length - 1; i >= 0; i--) {
//     if (solutions[i].index < solutions[i].combinations.length - 1) {
//       solutions[i].index++;
//       if (check) this.#checkComplete(solutions);
//       break;
//     } else {
//       solutions[i].index = 0;
//     }
//   }
// }
// #checkComplete(solutions) {
//   for (let i = 0; i < solutions.length; i++) {
//     if (solutions[i].index !== solutions[i].combinations.length - 1) {
//       return;
//     }
//   }
//   return (this.#allCombinationsDone = true);
// }

// // const solution = [
// //   [{visited:false,value:2},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:2}],
// //   [{visited:false,value:1},{visited:false,value:1},{visited:false,value:1},{visited:false,value:0},{visited:false,value:1},{visited:false,value:1},{visited:false,value:1},{visited:false,value:1}],
// //   [{visited:false,value:0},{visited:false,value:2},{visited:false,value:1},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:1},{visited:false,value:2}],
// //   [{visited:false,value:0},{visited:false,value:1},{visited:false,value:1},{visited:false,value:1},{visited:false,value:1},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0}],
// //   [{visited:false,value:0},{visited:false,value:1},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:1},{visited:false,value:0}],
// //   [{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:1},{visited:false,value:0},{visited:false,value:1},{visited:false,value:2},{visited:false,value:0}],
// //   [{visited:false,value:1},{visited:false,value:1},{visited:false,value:1},{visited:false,value:1},{visited:false,value:0},{visited:false,value:1},{visited:false,value:1},{visited:false,value:1}],
// //   [{visited:false,value:2},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:0},{visited:false,value:2}],
// // ]
// // #solve() {
// //   this.#progress++;
// //   console.log(
// //     "PROGRESS: ",
// //     this.#progress,
// //     " - ",
// //     this.targetSolutions[0].index,
// //     this.targetSolutions[1].index,
// //     this.targetSolutions[2].index,
// //     this.targetSolutions[3].index,
// //     this.targetSolutions[4].index,
// //     this.targetSolutions[5].index,
// //     this.targetSolutions[6].index,
// //     this.targetSolutions[7].index
// //   );
// //   //?si allCombinationsDone -> return false
// //   if (this.#allCombinationsDone) {
// //     return false;
// //   }
// //   for (let j = 0; j < 8; j++) {
// //     let count = 0;
// //     //?evaluear la current combination el index de la row va de 0 a 7,
// //     for (let i = 0; i < 8; i++) {
// //       //?el index de la col es targetSolutions[index] -> si es wall -> count++
// //       const index = this.targetSolutions[i].index;
// //       const value = this.targetSolutions[i].combinations[index][j];
// //       if (value === 1) count++;
// //     }
// //     //?comparar count con this.map.col[] -> si es !== 0 -> RECURSION
// //     if (count - this.map.cols[j] !== 0) {
// //       //?increment index en targetSolutions
// //       this.#incrementIndex(this.targetSolutions, true);
// //       break;
// //     } else {
// //       if (j === 7) {
// //         for (let k = 0; k < 8; k++) {
// //           this.solutionFound.push(this.targetSolutions[k].combinations[this.targetSolutions[k].index]);
// //         }
// //         console.log(this.solutionFound);
// //         const adn = { genes: [] };
// //         for (let i = 0; i < this.solutionFound.length; i++) {
// //           const row = this.solutionFound[i];
// //           const newRow = row.map((item) => {
// //             return { value: item };
// //           });
// //           adn.genes.push(newRow);
// //         }
// //         this.displayBoard = new DisplayBoard(this.world, adn, 2, 2, false);
// //         return true;
// //       }
// //     }
// //   }
// //   //?RECURSION
// //   setTimeout(() => this.#solve(), 0);
// // }
