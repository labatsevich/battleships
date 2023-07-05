import { IUser } from "types";
import { parseData } from "./helpers";
import { httpServer } from "./src/http_server";
import { WebSocketServer } from "ws";
import { Database } from "./modules/db";
const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);

const ws = new WebSocketServer({ server: httpServer });

const db = new Database;


ws.on('connection', (client) => {

    client.onmessage = (event) => {

        const payload = parseData(event.data.toString());

        if ('type' in payload) {

            if (payload.type === 'reg') {
                const userID = db.getLastPlayerID();
                const user: IUser = JSON.parse(payload.data);

                db.addPlayer({
                    ...user,
                    id: userID
                }
                );

                const response = {
                    type: payload.type,
                    data: JSON.stringify({
                        name: user.name,
                        index: '',
                        error: false,
                        errorText: '',
                    }),

                }

                client.send(JSON.stringify(response))
                client.send(JSON.stringify(db.updateRoom()))
            }
           
            if(payload.type === 'create_room'){

                client.send(JSON.stringify(db.createRoom()))
            }


        }

    }


});

httpServer.listen(HTTP_PORT);