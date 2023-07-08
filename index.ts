import { httpServer } from './src/http_server';
import GameServer from './modules/gameserver/index';
const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
//const gameServer = new WebSocketServer({ server: httpServer });
const wsServer = new GameServer(httpServer);
wsServer.init();

/*const db = new Database();

const connectionHandler = async (ws: WebSocket) => {
  let userID = 0;
  ws.onmessage = (event) => {
    const payload = parseData(event.data.toString()) as ICommnd;

    if ('type' in payload) {
      if (payload.type === 'reg') {
        const user: IUser = JSON.parse(payload.data);
        user.socket = ws;

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

        gameServer.clients.forEach((c) => c.send(response));
      }

      if (payload.type === 'add_user_to_room') {
        const { indexRoom } = JSON.parse(payload.data);
        db.addPlayerToRoom(userID, indexRoom);
      }

      if (payload.type === 'add_ships') {
        const { gameId, ships, indexPlayer } = JSON.parse(payload.data);
        db.addShips(gameId, indexPlayer, ships);
      }
    }
  };
};

gameServer.on('connection', connectionHandler);*/
