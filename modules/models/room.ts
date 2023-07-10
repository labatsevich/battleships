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
      const enemy = this.roomUsers.find(({ index: userID }) => userID !== playerID);
      if (enemy) this.game.setCurrentPlayerIndex(enemy.index);
      this.game.locatePlayersShipsOnBoard();
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

      this.sockets.forEach((socket) => {
        socket.send(
          JSON.stringify({
            type: 'turn',
            data: JSON.stringify({
              currentPlayer: this.game?.currentPlayerIndex,
            }),
            id: 0,
          })
        );
      });
    }
  }

  makeAttack(playerId: number, targetPosition: Position) {
    const enemyID = this.roomUsers.find((user) => user.index !== playerId)?.index;
    if (enemyID) {
      const status = this.game?.attackEnemy(enemyID, targetPosition);

      const response = JSON.stringify({
        type: 'attack',
        data: JSON.stringify({
          position: { ...targetPosition },
          currentPlayer: playerId,
          status,
        }),
        id: 0,
      });

      this.sockets.forEach((socket) => socket.send(response));
    }
  }
}
