import {
  ActiveGame,
  ClientMsg,
  ClientSocket,
  GameInfo,
  GameTypes,
  ServerMsg
} from '@/types';

export default class GamesManager {
  activeGames: { [key: string]: ActiveGame }
  gameTypes: { [key in GameTypes]: GameInfo }
  handler: { [key in ClientMsg['action']]: (ws: ClientSocket, msg: ClientMsg) => ServerMsg }

  constructor() {
    this.activeGames = {};
    this.gameTypes = {
      '3-5-8': {
        minPlayers: 3,
        maxPlayers: 3,
      },
      'shanghai': {
        minPlayers: 2,
        maxPlayers: 8,
      }
    };
    this.handler = {
      start: (ws, msg) => {
        if (!msg.gameType || !msg.gameCode) throw Error('gameType is required to create a new game')
        const { gameCode } = msg;

        this.setUserData(ws, msg)
        this.activeGames[gameCode] = {
          status: 'waiting',
          players: [ws],
          gameType: msg.gameType,
          gameInfo: this.gameTypes[msg.gameType],
          gameCode: gameCode,
        }
        return this.getResMsg(msg.gameCode)
      },
      join: (ws, msg) => {
        if (!msg.gameCode) throw Error('no game code found')
        if (!msg.gameCode) throw Error('gameCode is required to join a game')
        const { gameCode } = msg;

        if (this.activeGames[gameCode].players.some(player => player.data.username === msg.username)) {
          return { 
            ...this.activeGames[gameCode],
            players: this.activeGames[gameCode].players.map(ws => ws.data),
            status: 'error',
            errorMsg: 'Username already exists'
          }
        }

        this.setUserData(ws, msg)
        this.activeGames[gameCode].players.push(ws)
        return this.getResMsg(msg.gameCode);
      }
    }
  }

  setUserData(ws: ClientSocket, msg: ClientMsg) {
    ws.data = {
      username: msg.username,
      score: 0,
      ready: false,
    }
  }

  getResMsg(gameCode: string) {
    return {
      ...this.activeGames[gameCode],
      players: this.activeGames[gameCode].players.map(ws => ws.data)
    }
  }
}
