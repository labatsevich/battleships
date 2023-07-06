import { IRoom, IUser } from '../types';

export class Database {
  lastInsertedId = 0;
  players: IUser[];
  rooms: IRoom[];

  constructor() {
    this.players = [];
    this.rooms = [];
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
      currentRoom.roomUsers.forEach((p) => {
        messages.push(this.createGame(roomID, p.index !== undefined ? p.index : 0));
      });
    }
    console.log(messages);
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

  createGame(roomID: number, playerID: number): unknown {
    /* {
      ,
      data:
          {
              idGame: <number>,
              idPlayer: <number>,
          },
      id: 0,
  }*/
    const game = {
      type: 'create_game',
      data: JSON.stringify({
        idGame: roomID,
        idPlayer: playerID,
      }),
    };

    return game;
  }
}
