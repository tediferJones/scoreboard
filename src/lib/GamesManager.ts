import {
  ActiveGame,
  ClientMsg,
  ClientSocket,
  GameInfo,
  GameTypes,
  ServerMsg
} from '@/types';
import { randStr } from './utils';

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
        // const userId = randStr(32);
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

        // if (this.activeGames[gameCode].players.some(player => player.data.username === msg.username)) {
        //   return { 
        //     ...this.activeGames[gameCode],
        //     players: this.activeGames[gameCode].players.map(ws => ws.data),
        //     status: 'error',
        //     errorMsg: 'Username already exists'
        //   }
        // }

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
          // currentGame.players.some(player => {
          //   if (player === ws) {
          //     player.data.ready = !player.data.ready
          //   }
          // })
        return this.getResMsg(msg.gameCode, msg.userId)
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

  getResMsg(gameCode: string, userId: string) {
    console.log(gameCode, '\nAll Games:', this.activeGames)
    const currentGame = this.activeGames[gameCode]
    return {
      ...this.activeGames[gameCode],
      // players: this.activeGames[gameCode].players.map(ws => ws.data)
      players: Object.keys(this.activeGames[gameCode].players).map(key => currentGame.players[key]?.data),
      userId,
      username: currentGame.players[userId].data.username
    }
  }

  sendRes(res: ServerMsg) {
    // const msg = JSON.stringify(res);
    const players = this.activeGames[res.gameCode].players;
    Object.keys(players).forEach(key => {
      players[key].send(JSON.stringify({
        ...res,
        username: players[key].data.username,
        userId: key,
      }))
    })
  }
}
