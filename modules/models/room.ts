import Game from '../game';
import { IRoom, IShip, IUser, Position, ShipCondition, UserSocket } from '../../types';

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
    if (this.game?.ships.size !== 2) this.game?.setCurrentPlayerIndex(playerID);

    if (this.game?.ships?.size === 2) {
      this.game.locatePlayersShipsOnBoard();
      this.game.sockets.push(...this.sockets);
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

  getEnemy(playerID: number): IUser | undefined {
    return this.roomUsers.find((user) => user.index !== playerID);
  }

  makeAttack(playerId: number, targetPosition: Position) {
    const enemy = this.getEnemy(playerId);

    if (playerId !== this.game?.currentPlayerIndex) {
      console.log("Player can't shot");
      return;
    }

    if (enemy) {
      const enemyID = enemy.index;
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

      this.sockets.forEach((socket) => {
        socket.send(response);

        if (status === 'miss') {
          this.game?.setCurrentPlayerIndex(enemyID);
          socket.send(
            JSON.stringify({
              type: 'turn',
              data: JSON.stringify({
                currentPlayer: this.game?.currentPlayerIndex,
              }),
              id: 0,
            })
          );
        }
      });
    }
  }

  checkEndOfGame(playerID: number): boolean {
    const enemy = this.getEnemy(playerID);
    if (enemy) {
      const enemyShips = this.game?.playersShips.get(enemy.index);
      if (enemyShips) {
        return enemyShips.every((ship) => ship.status === ShipCondition.DESTROYED);
      } else return false;
    }
    return false;
  }
}
