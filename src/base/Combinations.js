class Combinations {
  constructor() {
    this.combinations = {};
    this.combinations["0"] = [[0, 0, 0, 0, 0, 0, 0, 0]];
    for (let index = 1; index < 8; index++) {
      this.combinations[index] = this.#generateCombination(index);
    }
    this.combinations["8"] = [[1, 1, 1, 1, 1, 1, 1, 1]];
  }
  #generateCombination(val) {
    let result = [];
    const base = new Array(8).fill(0);
    for (let i = 0; i < val; i++) {
      base[i] = 1;
    }
    for (let i = 0; i < base.length; i++) {
      result.push([...base]);
      //?GENERAR VARIANTES
      const variants = this.#createVariants([...base]);
      result = [...result, ...variants];
      //?SHIFT BASE
      this.#shift(base);
    }
    //?ELIMINAR DUPLICADOS
    this.#removeDuplicates(result);
    return result;
  }
  #createVariants(arr) {
    const result = [];
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] !== arr[j]) {
          const aux = arr[i];
          arr[i] = arr[j];
          arr[j] = aux;
          result.push([...arr]);
        }
      }
    }
    return result;
  }
  #shift(arr) {
    const aux = arr[arr.length - 1];
    for (let i = arr.length - 1; i > 0; i--) {
      arr[i] = arr[i - 1];
    }
    arr[0] = aux;
  }
  #removeDuplicates(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (this.#sameValues(arr[i], arr[j])) {
          arr.splice(j, 1);
          j--;
        }
      }
    }
  }
  #sameValues(a, b) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}
export default Combinations;
