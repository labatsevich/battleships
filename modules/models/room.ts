import Game from '../game';
import { IRoom, IShip, IUser, Position, UserSocket } from 'types';

export default class Room implements IRoom {
  roomId: number;
  roomUsers: IUser[];
  game: Game | undefined;
  sockets: UserSocket[];

  constructor(id: number) {
    this.roomId = id;
    this.roomUsers = [];
    this.sockets = [];
    return this;
  }

  createGame() {
    this.game = new Game(this.roomId);
    this.game.players = this.roomUsers;
    this.sockets.forEach((socket) => {
      socket?.send(
        JSON.stringify({
          type: 'create_game',
          data: JSON.stringify({
            idGame: this.game?.gameId,
            idPlayer: socket.index,
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
      /*const players = this.game.players.map((pl) => pl);*/
      this.sockets.forEach((entry) => {
        const response = {
          type: 'start_game',
          data: JSON.stringify({
            ships: this.game?.ships?.get(entry.index),
            currentPlayerIndex: this.game?.currentPlayerIndex,
          }),
          id: 0,
        };

        (entry as WebSocket).send(JSON.stringify(response));
      });
    }
  }

  makeAttack(playerId: number, targetPosition: Position) {
    const enemyID = this.roomUsers.find((user) => user.index !== playerId)?.index;
    this.sockets.forEach((entry) => {
      entry.send(
        JSON.stringify({
          type: 'attack',
          data: JSON.stringify({
            position: {
              ...targetPosition,
            },
            currentPlayer: enemyID,
            status: 'shot',
          }),
          id: 0,
        })
      );
      console.log(playerId, targetPosition);
    });
  }
}
