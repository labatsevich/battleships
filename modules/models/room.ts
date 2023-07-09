import Game from '../game';
import { IRoom, IShip, IUser } from 'types';

export default class Room implements IRoom {
  roomId: number;
  roomUsers: IUser[];
  game: Game | undefined;

  constructor(id: number) {
    this.roomId = id;
    this.roomUsers = [];
    return this;
  }

  createGame() {
    this.game = new Game(this.roomId);
    this.game.players = this.roomUsers;
    this.roomUsers.forEach((player) => {
      player.socket?.send(
        JSON.stringify({
          type: 'create_game',
          data: JSON.stringify({
            idGame: this.game?.gameId,
            idPlayer: player.index,
          }),
          id: 0,
        })
      );
    });
  }

  addShipsToGame(playerID: number, ships: IShip[]): void {
    this.game?.ships.set(playerID, ships);
    this.game?.setCurrentPlayerIndex(playerID);

    if (this.game?.ships?.size === 2) {
      const players = this.game.players.map((pl) => pl);
      players.forEach((entry) => {
        const response = {
          type: 'start_game',
          data: JSON.stringify({
            ships: this.game?.ships?.get(entry.index),
            currentPlayerIndex: this.game?.currentPlayerIndex,
          }),
          id: 0,
        };

        (entry.socket as WebSocket).send(JSON.stringify(response));
      });
    }
  }
}
