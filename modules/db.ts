import { IRoom, IUser, IGame, IShip } from '../types';

export class Database {
  lastInsertedId = 0;
  players: IUser[];
  rooms: IRoom[];
  games: IGame[];

  constructor() {
    this.players = [];
    this.rooms = [];
    this.games = [];
  }

  addPlayer(user: IUser): number {
    const player = this.players.find((p) => p.name === user.name);
    if (player) return player.index;
    else {
      user.index = this.getLastPlayerID();
      this.players.push(user);
      return user.index;
    }
  }

  getUserByID(id: number): IUser | undefined {
    return this.players.find((item) => item.index === id);
  }

  getLastPlayerID(): number {
    return this.players.length === 0 ? this.players.length : this.players.length;
  }

  updateRoom() {
    const resp = {
      type: 'update_room',
      data: JSON.stringify(this.rooms),
    };

    return resp;
  }

  addPlayerToRoom(playerID: number, roomID: number) {
    const currentRoom = this.rooms.find((room) => room.roomId === roomID);
    const player = this.getUserByID(playerID);

    const messages = [];

    if (currentRoom && player) {
      if (currentRoom.roomUsers.length < 2) {
        currentRoom.roomUsers.push({
          index: player.index,
          name: player.name,
        });
      }
    }
    messages.push(this.updateRoom());
    if (currentRoom && currentRoom.roomUsers.length === 2) {
      currentRoom.roomUsers.forEach((roomUser) => {
        const player = this.getUserByID(roomUser.index as number);
        if (player)
          (player.socket as WebSocket).send(
            JSON.stringify(this.createGame(roomID, roomUser.index as number))
          );

        // messages.push(this.createGame(roomID, p.index !== undefined ? p.index : 0));
      });
    }
    // console.log(messages);
    return messages;
  }

  createRoom(playerID: number) {
    const player = this.players.find((item: IUser) => item.index === playerID);

    const roomPlayer = {
      index: player?.index,
      name: player?.name,
    };

    const room = {
      roomId: this.rooms.length,
      roomUsers: [roomPlayer],
    };

    this.rooms.push(room);

    return this.updateRoom();
  }

  createGame(gameId: number, idPlayer: number): unknown {
    const player = this.getUserByID(idPlayer) as IUser;
    const game = this.games.find((game) => game.gameId === gameId);

    if (!game) {
      const newGame: IGame = {
        gameId: gameId,
        players: [],
        ships: new Map(),
      };
      newGame.players.push(player);

      this.games.push(newGame);
    } else {
      game.players.push(player);
    }

    const response = {
      type: 'create_game',
      data: JSON.stringify({
        idGame: gameId,
        idPlayer,
      }),
    };

    return response;
  }

  addShips(gameId: number, playerId: number, ships: IShip[]) {
    const game = this.games.find((game) => game.gameId === gameId);
    game?.ships?.set(playerId, ships);
    console.log(game?.ships);

    if (game?.ships?.size === 2) {
      const players = game.players.map((pl) => pl);

      players.forEach((entry) => {
        const response = {
          type: 'start_game',
          data: JSON.stringify({
            ships: game.ships?.get(entry.index),
            currentPlayerIndex: entry.index,
          }),
          id: 0,
        };

        (entry.socket as WebSocket).send(JSON.stringify(response));
      });
    }
  }
}
