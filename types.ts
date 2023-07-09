export interface IUser {
  index: number;
  name: string;
  password: string;
  socket?: UserSocket;
}

export interface IRoom {
  roomId: number;
  roomUsers: Partial<IUser>[];
}

export interface ICommand {
  type: string;
  data: string;
  id: number;
}

type Position = {
  x: number;
  y: number;
};

export interface IShip {
  position: Position;
  direction: boolean;
  type: string;
  length: number;
}
export interface IGame {
  gameId: number;
  players: IUser[];
  ships?: Map<number, IShip[]>;
}

type UserWS = Pick<IUser, 'index'>;

export type User = Pick<IUser, 'name' | 'password'>;

export interface UserSocket extends WebSocket, UserWS {}
