import { IUser } from 'types';
import { parseData } from './helpers';
import { httpServer } from './src/http_server';
import WebSocket, { WebSocketServer } from 'ws';
import { Database } from './modules/db';
const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);

const wss = new WebSocketServer({ server: httpServer });

const db = new Database();

wss.on('connection', (ws: WebSocket) => {
  let userID = 0;
  ws.onmessage = (event) => {
    const payload = parseData(event.data.toString());

    if ('type' in payload) {
      if (payload.type === 'reg') {
        const user: IUser = JSON.parse(payload.data);

        userID = db.addPlayer(user);

        const response = {
          type: payload.type,
          data: JSON.stringify({
            name: user.name,
            index: userID,
            error: false,
            errorText: '',
          }),
        };

        ws.send(JSON.stringify(response));
        if (db.rooms.length) {
          ws.send(JSON.stringify(db.updateRoom()));
        }
      }

      if (payload.type === 'create_room') {
        const response = JSON.stringify(db.createRoom(userID));

        wss.clients.forEach((c) => c.send(response));
      }

      if (payload.type === 'add_user_to_room') {
        const { indexRoom } = JSON.parse(payload.data);
        const messages = db.addPlayerToRoom(userID, indexRoom);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            messages.forEach((m) => client.send(JSON.stringify(m)));
          }
        });
      }
    }
  };
});

httpServer.listen(HTTP_PORT);
