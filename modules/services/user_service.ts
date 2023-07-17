import { IUser, Winner } from 'types';

class UserService {
  players: IUser[];
  winners: Winner[];

  constructor() {
    this.players = [];
    this.winners = [];
  }

  addPlayer(user: IUser): number {
    user.index = this.getLastPlayerID();
    this.players.push(user);
    this.winners.push({ name: user.name, wins: 0 });
    return user.index;
  }

  getLastPlayerID(): number {
    return this.players.length;
  }

  getUserByID(id: number): IUser | undefined {
    return this.players.find((p) => p.index === id);
  }

  getUserByName(name: string) {
    return this.players.find((p) => p.name === name);
  }

  updateWinners(userName: string): void {
    this.winners = this.winners.map((entry) =>
      entry.name === userName
        ? { name: entry.name, wins: entry.wins + 1 }
        : { name: entry.name, wins: entry.wins }
    );
  }
}

export { UserService };
