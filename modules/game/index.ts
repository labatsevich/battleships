import { IShip, IUser, Position } from '../../types';

export default class Game {
  gameId: number;
  currentPlayerIndex: number;
  players: IUser[];
  ships = new Map<number, IShip[]>();
  sockets: WebSocket[];

  constructor(id: number) {
    this.players = [];
    this.sockets = [];
    this.gameId = id;
    this.currentPlayerIndex = 0;
  }

  setCurrentPlayerIndex(currentPlayerIndex: number): void {
    this.currentPlayerIndex = currentPlayerIndex;
  }

  attackEnemy(enemyID: number, targetPosition: Position) {
    console.log(enemyID, targetPosition, 'not implemented');
  }
}
