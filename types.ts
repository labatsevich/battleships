export interface IUser {
  index: number;
  name: string;
  password: string;
}

export interface IRoom {
  roomId: number;
  roomUsers: Partial<IUser>[];
}
