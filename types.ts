export interface IUser {
  index: number;
  name: string;
  password: string;
  socket?: unknown;
}

export type User = Pick<IUser, 'name' | 'password'>;
export interface IRoom {
  roomId: number;
  roomUsers: Partial<IUser>[];
}

export interface ICommnd {
  type: string;
  data: string;
  id: number;
}

export interface IShip {
  position: {
    x: number;
    y: number;
  };
}
export interface IGame {
  gameId: number;
  players: IUser[];
  ships?: Map<number, IShip[]>;
}
