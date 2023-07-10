import { UserService } from '../services/user_service';
import { IShip, IUser, Position, UserSocket } from '../../types';
import RoomService from '../services/room_service';

export default class Handler {
  notify: (message: string) => void;
  userService: UserService;
  roomService: RoomService;

  constructor(notify: (message: string) => void) {
    this.notify = notify;
    this.userService = new UserService();
    this.roomService = new RoomService();
  }

  register(user: IUser, ws: UserSocket) {
    const userID = this.userService.addPlayer(user);
    ws.index = userID;
    ws.name = user.name;

    const response = {
      type: 'reg',
      data: JSON.stringify({
        name: user.name,
        index: userID,
        error: false,
        errorText: '',
      }),
    };

    ws.send(JSON.stringify(response));
    this.notify(this.updateRoom());
  }

  createRoom(playerID: number, socket: UserSocket) {
    const player = this.userService.getUserByID(playerID);

    if (player) {
      const room = this.roomService.createRoom(player, socket);
      if (room) {
        const response = this.updateRoom();
        this.notify(response);
      } else {
        console.log('something went wrong!');
        return;
      }
    }
  }

  addUserToRoom(userID: number, roomID: number, socket: UserSocket) {
    const player = this.userService.getUserByID(userID);

    if (player) {
      this.roomService.addUserToRoom(roomID, player, socket);
      this.notify(this.updateRoom());
    }
  }

  makeAttack(gameId: number, playerId: number, targetPosition: Position) {
    const room = this.roomService.getRoomByID(gameId);
    if (room) {
      room.makeAttack(playerId, targetPosition);
      console.log(playerId);
    }
  }

  updateRoom() {
    const resp = {
      type: 'update_room',
      data: JSON.stringify(this.roomService.list()),
    };

    return JSON.stringify(resp);
  }

  addShips(gameId: number, playerID: number, ships: IShip[]) {
    this.roomService.addShips(gameId, playerID, ships);
  }
}
