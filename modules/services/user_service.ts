import { IUser } from 'types';

class UserService {
  players: IUser[];

  constructor() {
    this.players = [];
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

  getLastPlayerID(): number {
    return this.players.length;
  }
}

export { UserService };
