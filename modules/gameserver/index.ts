import { parseData } from '../../helpers';
import { ICommand, IUser, UserSocket } from 'types';
import { WebSocketServer } from 'ws';
import Handler from '../controllers';
import { Server } from 'http';

export default class GameServer {
  private server: WebSocketServer;
  private controller: Handler;

  constructor(httServer: Server) {
    this.server = new WebSocketServer({ server: httServer });
    this.controller = new Handler(this.notify.bind(this));
  }

  init() {
    this.server.on('listening', () => `this server listening on port ${this.server.options.port}`);
    this.server.on('connection', (ws: WebSocket) => {
      ws.onmessage = (event) => {
        const payload = parseData(event.data.toString()) as ICommand;
        const { type } = payload;

        switch (type) {
          case 'reg': {
            const user: IUser = JSON.parse(payload.data);
            this.controller.register(user, ws as UserSocket);
            (ws as UserSocket).index = user.index;
            break;
          }
          case 'create_room': {
            const userID = (ws as UserSocket).index;
            this.controller.createRoom(userID);
            break;
          }

          case 'add_user_to_room': {
            const { indexRoom } = JSON.parse(payload.data);
            const userID = (ws as UserSocket).index;
            this.controller.addUserToRoom(userID, indexRoom);
            break;
          }

          case 'add_ships': {
            const { gameId, ships, indexPlayer } = JSON.parse(payload.data);
            this.controller.addShips(gameId, indexPlayer, ships);
            break;
          }
          default:
            break;
        }
      };
    });
  }

  notify(message: string): void {
    this.server.clients.forEach((client) => client.send(message));
  }
}
