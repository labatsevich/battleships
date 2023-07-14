import { UserService } from '../services/user_service';
import { IShip, IUser, Position, UserSocket } from '../../types';
import RoomService from '../services/room_service';
import { getRandom } from '../../helpers';

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
    const isExistsRoom = this.roomService.getRoomByUserID(playerID);
    if (player) {
      if (isExistsRoom) {
        console.log('Attempt to create room. User has alredy created room!');
        return;
      }
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
      const room = this.roomService.getRoomByUserID(userID);

      if (room) {
        console.log('Attempt to add user. User alredy in room!');
        return;
      }

      this.roomService.addUserToRoom(roomID, player, socket);
      this.notify(this.updateRoom());
    }
  }

  makeAttack(gameId: number, playerId: number, targetPosition: Position | null) {
    if (!targetPosition) {
      targetPosition = {
        x: getRandom(10),
        y: getRandom(10),
      };
    }

    const isGameOver = this.roomService.makeAttack(gameId, playerId, targetPosition);
    if (isGameOver) {
      const player = this.userService.getUserByID(playerId);
      if (player) this.userService.updateWinners(player.name);

      this.notify(
        JSON.stringify({
          type: 'update_winners',
          data: JSON.stringify([...this.userService.winners]),
          id: 0,
        })
      );
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

  socketClosed(socket: UserSocket) {
    const room = this.roomService.getRoomByUserID(socket.index);
    if (room) {
      console.log(room.roomId);
    }
  }
}
