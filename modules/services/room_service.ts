import Room from '../models/room';
import { IShip, IUser, Position, UserSocket } from '../../types';

export default class RoomService {
  rooms: Room[];

  constructor() {
    this.rooms = [];
  }

  createRoom(player: IUser, socket: UserSocket) {
    const room = new Room(this.rooms.length);
    room.sockets.push(socket);
    room.roomUsers.push(player);
    this.rooms.push(room);
    return room;
  }

  getRoomByID(id: number): Room | undefined {
    return this.rooms.find((room) => room.roomId === id);
  }

  getRoomByUserID(id: number): Room | undefined {
    return this.rooms.find((room) => room.roomUsers.find((user) => user.index === id));
  }

  addUserToRoom(roomID: number, user: IUser, socket: UserSocket) {
    const room = this.getRoomByID(roomID);

    if (room) {
      room.sockets.push(socket);
      room.roomUsers.push(user);
      room.createGame();
    }
  }

  addShips(gameId: number, playerId: number, ships: IShip[]) {
    const room = this.getRoomByID(gameId);
    if (room) {
      room.addShipsToGame(playerId, ships);
    }
  }

  makeAttack(gameID: number, playerID: number, targetPosition: Position): boolean {
    const room = this.getRoomByID(gameID);
    let isGameOver = false;
    if (room) {
      isGameOver = room.makeAttack(playerID, targetPosition);

      if (isGameOver) this.deleteRoom(room.roomId);
    }
    return isGameOver;
  }

  deleteRoom(roomID: number): void {
    this.rooms = this.rooms.filter((room) => room.roomId !== roomID);
  }

  list() {
    return this.rooms
      .filter((room) => room.roomUsers.length < 2)
      .map((room) => ({
        roomId: room.roomId,
        roomUsers: room.roomUsers,
      }));
  }
}
