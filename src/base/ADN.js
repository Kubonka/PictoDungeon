class ADN {
  #mutationRate = 0.01;
  genes;

  constructor(genes) {
    this.genes = genes;
    this.fitness = 1000;
  }
  calculateFitness(mapCols, mapRows) {
    for (let i = 0; i < this.genes.length; i++) {
      for (let j = 0; j < this.genes.length; j++) {
        this.genes[i][j].visited = false;
      }
    }
    let maxFitness = 0;
    let currentFitness = 0;
    for (let j = 0; j < this.genes.length; j++) {
      const targetValue = mapCols[j];
      maxFitness += targetValue;
      const arr = this.#getArr(null, j);
      const sum = this.#countWalls(arr);
      const offset = Math.abs(sum - targetValue);
      //currentFitness += offset;
      if (offset === 0) currentFitness++;
    }
    for (let i = 0; i < this.genes.length; i++) {
      const targetValue = mapRows[i];
      maxFitness += targetValue;
      const arr = this.#getArr(i, null);
      const sum = this.#countWalls(arr);
      const offset = Math.abs(sum - targetValue);
      //currentFitness += offset;
      if (offset === 0) currentFitness++;
    }
    //this.fitness = Math.abs(maxFitness - currentFitness);
    this.fitness = currentFitness;
    // const hasHallPenalty = this.#applyHallRulePenalty();
    // if (hasHallPenalty) this.fitness - 5;
    //console.log("maxFitness", maxFitness);
    //console.log(this.fitness);
  }
  // calculateFitness(mapCols, mapRows) {
  //   for (let i = 0; i < this.genes.length; i++) {
  //     for (let j = 0; j < this.genes.length; j++) {
  //       this.genes[i][j].visited = false;
  //     }
  //   }
  //   let maxFitness = 0;
  //   let currentFitness = 0;
  //   for (let j = 0; j < this.genes.length; j++) {
  //     const targetValue = mapCols[j];
  //     maxFitness += targetValue;
  //     const arr = this.#getArr(null, j);
  //     const sum = this.#countWalls(arr);
  //     const offset = Math.abs(sum - targetValue);
  //     currentFitness += offset;
  //   }
  //   for (let i = 0; i < this.genes.length; i++) {
  //     const targetValue = mapRows[i];
  //     maxFitness += targetValue;
  //     const arr = this.#getArr(i, null);
  //     const sum = this.#countWalls(arr);
  //     const offset = Math.abs(sum - targetValue);
  //     currentFitness += offset;
  //   }
  //   this.fitness = Math.abs(maxFitness - currentFitness);
  //   const hasHallPenalty = this.#applyHallRulePenalty();
  //   if (hasHallPenalty) this.fitness - 5;
  //   //console.log("maxFitness", maxFitness);
  //   //console.log(this.fitness);
  // }
  #applyHallRulePenalty() {
    let indexI = null;
    let indexJ = null;
    let floorCount = 0;
    for (let i = 0; i < this.genes.length; i++) {
      for (let j = 0; j < this.genes.length; j++) {
        if (this.genes[i][j].value === 0) {
          if (!indexI) {
            indexI = i;
            indexJ = j;
          }
          floorCount++;
        }
      }
    }
    if (indexI !== null) {
      const contigousFloors = this.#traverseHall(indexI, indexJ);
      if (contigousFloors === floorCount) {
        console.log(contigousFloors, floorCount);
        return false;
      }
    }
    return true;
  }
  #traverseHall(i, j) {
    if (i < 0 || i >= this.genes.length || j < 0 || j >= this.genes.length) return 0;
    if (this.genes[i][j].visited || this.genes[i][j].value !== 0) return 0;
    this.genes[i][j].visited = true;
    let count = 1;
    count += this.#traverseHall(i - 1, j);
    count += this.#traverseHall(i, j + 1);
    count += this.#traverseHall(i + 1, j);
    count += this.#traverseHall(i, j - 1);
    return count;
  }
  #getArr(i, j) {
    const result = [];
    if (i === null) {
      for (let index = 0; index < this.genes.length; index++) {
        result.push({ value: this.genes[index][j].value, visited: false });
      }
    } else {
      for (let index = 0; index < this.genes.length; index++) {
        result.push({ value: this.genes[i][index].value, visited: false });
      }
    }
    return result;
  }
  #countWalls(array) {
    return array.reduce((total, current) => {
      if (current.value === 1) return total + 1;
      return total;
    }, 0);
  }
  crossOver(targetADN) {
    //const midPoint = Math.floor(this.genes.length / 2);
    const newGenes = [];
    for (let i = 0; i < this.genes.length; i++) {
      newGenes[i] = [];
    }
    const halfPoint = Math.floor(Math.random() * this.genes.length);

    for (let i = 0; i < this.genes.length; i++) {
      for (let j = 0; j < this.genes.length; j++) {
        if (j < halfPoint) {
          newGenes[i][j] = { value: this.genes[i][j].value, visited: false };
        } else {
          newGenes[i][j] = { value: targetADN.genes[i][j].value, visited: false };
        }
      }
    }

    // for (let i = 0; i < midPoint; i++) {
    //   for (let j = 0; j < this.genes.length; j++) {
    //     newGenes[i][j] = this.genes[i][j];
    //   }
    // }
    // for (let i = midPoint; i < targetADN.genes.length; i++) {
    //   for (let j = midPoint; j < targetADN.genes.length; j++) {
    //     newGenes[i][j] = targetADN.genes[i][j];
    //   }
    // }
    this.#mutate(newGenes);
    return new ADN(newGenes);
  }
  autoCross() {
    const newGenes = [];
    for (let i = 0; i < this.genes.length; i++) {
      newGenes[i] = [];
    }
    for (let i = 0; i < this.genes.length; i++) {
      for (let j = 0; j < this.genes.length; j++) {
        newGenes[i][j] = { value: this.genes[i][j].value, visited: false };
      }
    }
    for (let i = 0; i < this.genes.length; i++) {
      for (let j = 0; j < this.genes.length; j++) {
        const mutate = Math.random() < this.#mutationRate ? true : false;
        if (mutate) {
          if (this.genes[i][j].value === 0) {
            newGenes[i][j].value = 1;
          } else {
            newGenes[i][j].value = 0;
          }
        }
      }
    }
    return new ADN(newGenes);
  }
  #mutate(newGenes) {
    const mutate = Math.random() < this.#mutationRate ? true : false;
    // if (mutate) {
    //   const rndI = Math.floor(Math.random() * newGenes.length);
    //   const rndj = Math.floor(Math.random() * newGenes.length);
    //   if (newGenes[rndI][rndj] !== 2) {
    //     if (newGenes[rndI][rndj] === 1) {
    //       newGenes[rndI][rndj] = 0;
    //     } else {
    //       newGenes[rndI][rndj] = 1;
    //     }
    //   }
    // }
    for (let i = 0; i < newGenes.length; i++) {
      for (let j = 0; j < newGenes.length; j++) {
        if (newGenes[i][j].value !== 2) {
          const mutate = Math.random() < this.#mutationRate ? true : false;
          if (mutate) {
            if (this.genes[i][j].value === 0) {
              this.genes[i][j].value = 1;
            } else {
              this.genes[i][j].value = 0;
            }
          }
          // const floorCount = newGenes[i].reduce((total, current) => {
          //   if (current.value === 0) return total + 1;
          //   return total;
          // }, 0);
          // if (floorCount > 0) {
          //   const mutate = Math.random() < this.#mutationRate ? true : false;
          //   let done = false;
          //   if (mutate) {
          //     let tarIndex;
          //     tarIndex = Math.floor(Math.random() * newGenes[i].length);
          //     if (newGenes[i][tarIndex].value !== 2){
          //       newGenes[i]
          //     }
          //     // do {
          //     //   // if (newGenes[i][tarIndex].value !== 2 && newGenes[i][tarIndex].value !== newGenes[i][j].value) {
          //     //   //   done = true;
          //     //   //   const aux = newGenes[i][j].value;
          //     //   //   newGenes[i][j].value = newGenes[i][tarIndex].value;
          //     //   //   newGenes[i][tarIndex].value = aux;
          //     //   //   console.log("b");
          //     //   // }
          //     // } while (!done);
          //   }
          // }
        }
      }
    }
  }
  upgrade() {
    const newGenes = [];
    for (let i = 0; i < this.genes.length; i++) {
      newGenes[i] = [];
    }
    for (let i = 0; i < this.genes.length; i++) {
      for (let j = 0; j < this.genes.length; j++) {
        newGenes[i][j] = { value: this.genes[i][j].value, visited: false };
      }
    }
    const rndI = Math.floor(Math.random() * this.genes.length);
    const rndj = Math.floor(Math.random() * this.genes.length);
    if (newGenes[rndI][rndj].value !== 2) {
      if (newGenes[rndI][rndj].value === 1) {
        newGenes[rndI][rndj].value = 0;
      } else {
        newGenes[rndI][rndj].value = 1;
      }
    }

    return new ADN(newGenes);
  }
}
export default ADN;
