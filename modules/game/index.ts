import { IUser } from '../../types';

export default class Game {
  static gameId: number;
  players: IUser[];
  sockets: WebSocket[];

  constructor(id: number) {
    this.players = [];
    this.sockets = [];
    Game.gameId = id;
  }
}
