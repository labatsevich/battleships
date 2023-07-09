import { UserService } from '../services/user_service';
import { IShip, IUser, UserSocket } from '../../types';
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
    user.socket = ws;
    const userID = this.userService.addPlayer(user);
    ws.index = userID;

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
  }

  createRoom(playerID: number) {
    const player = this.userService.getUserByID(playerID);

    if (player) {
      const room = this.roomService.createRoom(player);
      if (room) {
        const response = this.updateRoom();
        this.notify(response);
      } else {
        console.log('something went wrong!');
        return;
      }
    }
  }

  addUserToRoom(userID: number, roomID: number) {
    const player = this.userService.getUserByID(userID);

    if (player) {
      this.roomService.addUserToRoom(roomID, player);
      this.notify(this.updateRoom());
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
