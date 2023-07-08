import { parseData } from '../../helpers';
import { ICommnd, IUser } from 'types';
import { WebSocketServer } from 'ws';
import Handler from '../controllers';
import { Server } from 'http';

export default class GameServer {
  private server: WebSocketServer;
  private controller: Handler;
  userID = 0;

  constructor(httServer: Server) {
    this.server = new WebSocketServer({ server: httServer });
    this.controller = new Handler(this.notify.bind(this));
  }

  init() {
    this.server.on('listening', () => `this server listening on port ${this.server.options.port}`);
    this.server.on('connection', (ws: WebSocket) => {
      ws.onmessage = (event) => {
        const payload = parseData(event.data.toString()) as ICommnd;
        const { type } = payload;

        switch (type) {
          case 'reg': {
            const user: IUser = JSON.parse(payload.data);
            user.socket = ws;
            this.controller.register(user);
            this.userID = user.index;
            break;
          }
          case 'create_room':
            this.controller.createRoom();
            console.log(this.userID);
            break;

          case 'add_user_to_room':
            console.log();
            break;
          case 'add_ships':
            console.log();
            break;

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
