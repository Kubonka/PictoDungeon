const GameState = Object.freeze({
  Initialize: Symbol("Initialize"),
  NewGame: Symbol("NewGame"),
  Loading: Symbol("Loading"),
  Animating: Symbol("Animating"),
  PlayerTurn: Symbol("PlayerTurn"),
  Level1: Symbol("Level1"),
  Level2: Symbol("Level2"),
});
export default GameState;
