import { UserService } from '../services/user_service';
import { IUser } from '../../types';

export default class Handler {
  broadcast: (message: string) => void;
  userService: UserService;

  constructor(broadcast: (message: string) => void) {
    this.broadcast = broadcast;
    this.userService = new UserService();
  }

  register(user: IUser) {
    const userID = this.userService.addPlayer(user);

    user.index = userID;

    const response = {
      type: 'reg',
      data: JSON.stringify({
        name: user.name,
        index: userID,
        error: false,
        errorText: '',
      }),
    };

    (user.socket as WebSocket).send(JSON.stringify(response));
  }

  createRoom() {
    console.log('not implemented');
  }
}
