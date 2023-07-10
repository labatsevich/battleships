import { IShip, IUser, Position, Section, ShipCondition, ShipOnBoard } from '../../types';

export default class Game {
  gameId: number;
  currentPlayerIndex: number;
  players: IUser[];
  ships = new Map<number, IShip[]>();
  playersShips = new Map<number, ShipOnBoard[]>();
  sockets: WebSocket[];

  constructor(id: number) {
    this.players = [];
    this.sockets = [];
    this.gameId = id;
    this.currentPlayerIndex = 0;
  }

  setCurrentPlayerIndex(currentPlayerIndex: number): void {
    this.currentPlayerIndex = currentPlayerIndex;
  }

  locatePlayersShipsOnBoard() {
    this.ships.forEach((ships, playerID) => {
      const shipInfo: ShipOnBoard[] = [];
      ships.forEach((ship: IShip) => {
        const entry: ShipOnBoard = {
          status: ShipCondition.OK,
          sections: [],
        };
        const { position, direction, length } = ship;

        for (let i = 0; i < length; i++) {
          const section: Section = {
            x: direction ? position.x : position.x + i,
            y: direction ? position.y + i : position.y,
            damaged: false,
          };
          entry.sections.push(section);
        }
        shipInfo.push(entry);
      });
      this.playersShips.set(playerID, shipInfo);
    });
  }

  attackEnemy(enemyID: number, targetPosition: Position): string {
    const enemyShips = this.playersShips.get(enemyID);
    let status = 'miss';
    enemyShips?.forEach((ship) => {
      ship.sections.forEach((section) => {
        if (section.x === targetPosition.x && section.y === targetPosition.y) {
          section.damaged = true;
          ship.status = ShipCondition.DAMAGED;
          status = 'shot';
        }
      });
    });

    return status;
  }
}
