import { IUser, Winner } from 'types';

class UserService {
  players: IUser[];
  winners: Winner[];

  constructor() {
    this.players = [];
    this.winners = [];
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

  getUserByID(id: number): IUser | undefined {
    return this.players.find((p) => p.index === id);
  }
}

export { UserService };
