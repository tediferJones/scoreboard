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
      'threeFiveEight': {
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
        // const userId = randStr(32);
        const userId = Bun.hash(msg.username).toString();

        this.setUserData(ws, msg)
        this.activeGames[gameCode] = {
          status: 'waiting',
          players: { [userId]: ws },
          gameType: msg.gameType,
          gameInfo: this.gameTypes[msg.gameType],
          gameCode: gameCode,
        }
        return this.getResMsg(msg.gameCode, userId)
      },
      join: (ws, msg) => {
        if (!msg.gameCode) throw Error('gameCode is required to join a game')
        const { gameCode } = msg;
        const userId = Bun.hash(msg.username).toString();
        const currentGame = this.activeGames[gameCode];
        if (currentGame.players[userId]) {
          return { 
            ...this.activeGames[gameCode],
            players: Object.keys(currentGame.players).map(key => currentGame.players[key].data),
            status: 'error',
            errorMsg: 'Username already exists',
            userId: 'error',
            username: 'error',
          }
        }

        this.setUserData(ws, msg);
        this.activeGames[gameCode].players[userId] = ws;
        return this.getResMsg(msg.gameCode, userId);
      },
      ready: (ws, msg) => {
        if (!msg.gameCode) throw Error('gameCode is required')
        const currentGame = this.activeGames[msg.gameCode];
        if (currentGame?.players[msg.userId]) {
          currentGame.players[msg.userId].data.ready = !currentGame.players[msg.userId].data.ready
        }

        const playerKeys = Object.keys(currentGame.players);
        const allReady = playerKeys.every(key => currentGame.players[key].data.ready)
        const { minPlayers, maxPlayers } = currentGame.gameInfo;
        if (allReady && minPlayers <= playerKeys.length && playerKeys.length <= maxPlayers) {
          currentGame.status = currentGame.gameType;
        }
        
        return this.getResMsg(msg.gameCode, msg.userId)
      },
      score: (ws, msg) => {
        if (!msg.gameCode) throw Error('gameCode is required')
        console.log('score message:', msg)
        if (msg.score) this.activeGames[msg.gameCode].players[msg.userId].data.score.push(Number(msg.score) || 0)
        return this.getResMsg(msg.gameCode, msg.userId)
      }
    }
  }

  setUserData(ws: ClientSocket, msg: ClientMsg) {
    ws.data = {
      username: msg.username,
      score: [],
      ready: false,
    }
  }

  getResMsg(gameCode: string, userId: string) {
    const currentGame = this.activeGames[gameCode]
    return {
      ...this.activeGames[gameCode],
      players: Object.keys(this.activeGames[gameCode].players).map(key => currentGame.players[key]?.data),
      userId,
      username: currentGame.players[userId].data.username
    }
  }
}
