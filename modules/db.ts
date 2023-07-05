import { IRoom, IUser } from "../types";

export class Database{

    lastInsertedId = 0;
    players:IUser[];
    rooms:IRoom[];

    constructor(){
        this.players = [];
        this.rooms = [];
    }


    addPlayer(user:IUser){
        this.players.push(user);
        this.lastInsertedId++;
    }

    getUserByID(id:number):IUser | undefined {
        return this.players.find(item => item.id === id);
    }

    getLastPlayerID():number{
        return this.lastInsertedId;
    }

    updateRoom(){
        const resp = {
            type:'update_room',
            data:JSON.stringify(this.rooms)
        }

        return resp
    }

    createRoom(){

        const room = {
            roomId: this.rooms.length,
            roomUsers: []
        };

        this.rooms.push(room);

        return this.updateRoom();

    }

    

}