import { httpServer } from './src/http_server';
import GameServer from './modules/gameserver/index';
const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
const wsServer = new GameServer(httpServer);
wsServer.init();
