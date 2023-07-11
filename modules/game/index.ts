import {
  IShip,
  IUser,
  Position,
  Section,
  ShipCondition,
  ShipOnBoard,
  AttackResult,
} from '../../types';

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

  setCurrentPlayerIndex(PlayerIndex: number): void {
    this.currentPlayerIndex = PlayerIndex;
  }

  locatePlayersShipsOnBoard() {
    this.ships.forEach((ships, playerID) => {
      const shipInfo: ShipOnBoard[] = [];
      ships.forEach((ship: IShip) => {
        const entry: ShipOnBoard = {
          status: ShipCondition.OK,
          sections: [],
          direction: ship.direction,
        };
        const { position, direction, length } = ship;

        for (let i = 0; i < length; i++) {
          const section = {
            x: direction ? position.x : position.x + i,
            y: direction ? position.y + i : position.y,
            damaged: false,
          } as Section;
          entry.sections.push(section);
        }
        shipInfo.push(entry);
      });
      this.playersShips.set(playerID, shipInfo);
    });
  }

  attackEnemy(enemyID: number, targetPosition: Position): string {
    const enemyShips = this.playersShips.get(enemyID);
    let status = AttackResult.MISS;
    enemyShips?.forEach((ship) => {
      ship.sections.forEach((section) => {
        if (section.x === targetPosition.x && section.y === targetPosition.y && !section.damaged) {
          section.damaged = true;
          ship.status = ShipCondition.DAMAGED;
          status = AttackResult.SHOT;
        }
        if (section.x === targetPosition.x && section.y === targetPosition.y && section.damaged) {
          console.log('section alredy destroyed');
          status = AttackResult.SHOT;
        }
      });

      if (ship.sections.length) {
        const damagedSectionsQty = ship.sections.filter((section) => section.damaged).length;
        if (ship.sections.length === damagedSectionsQty) {
          this.markCellsAroundShip(enemyID, ship);
          ship.status = ShipCondition.DESTROYED;
          ship.sections = [];
          status = AttackResult.KILLED;
        }
      }
    });

    return status;
  }

  markCellsAroundShip(enemyID: number, ship: ShipOnBoard) {
    const destroyedShip = this.playersShips.get(enemyID)?.find((entry) => entry === ship);
    const cellsMap = new Map<string, string>();
    if (destroyedShip) {
      let startRow = destroyedShip.sections[0].y;
      let endRow = destroyedShip.sections[destroyedShip.sections.length - 1].y;
      let startCol = destroyedShip.sections[0].x;
      let endCol = destroyedShip.sections[destroyedShip.sections.length - 1].x;

      startRow = startRow ? startRow - 1 : startRow;
      endRow = endRow === 9 ? endRow : endRow + 1;
      startCol = startCol ? startCol - 1 : startCol;
      endCol = endCol === 9 ? endCol : endCol + 1;

      for (let y = startRow; y <= endRow; y++) {
        for (let x = startCol; x <= endCol; x++) {
          const flag = destroyedShip.sections.every(
            (section) => section.x !== x || section.y !== y
          );
          if (flag) cellsMap.set(`${x}${y}`, `${x}-${y}`);
        }
      }
    }

    cellsMap.forEach((value, key) => {
      console.log(key);
      const [x, y] = value.split('-');
      this.sockets.forEach((socket) => {
        socket.send(
          JSON.stringify({
            type: 'attack',
            data: JSON.stringify({
              position: {
                x,
                y,
              },
              currentPlayer: this.currentPlayerIndex,
              status: AttackResult.MISS,
            }),
            id: 0,
          })
        );
      });
    });
  }
}
