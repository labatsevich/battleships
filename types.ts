export interface IUser {
    id: number,
    name: string,
    password: string,
}

export interface IRoom{
    roomId:number,
    roomUsers: Pick<IUser, 'id' | 'name'>[]
}