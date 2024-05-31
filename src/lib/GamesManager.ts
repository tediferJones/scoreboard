import {
  ActiveGame,
  ClientActions,
  // AllGameInfo,
  ClientMsg,
  ClientSocket,
  Errors,
  GameInfo,
  GameTypes,
  ServerMsg,
  Test2
} from '@/types';

export default class GamesManager {
  activeGames: { [key: string]: ActiveGame | undefined }
  gameTypes: { [key in GameTypes]: GameInfo }
  // handler: { [key in ClientMsg['action']]: (ws: ClientSocket, msg: ClientMsg) => void | { status: 'error', errorMsg: string } }
  handler: { [key in ClientActions]: (ws: ClientSocket, msg: Test2<key>) => void | { status: Errors, errorMsg: string, gameCode?: string } }

  constructor() {
    this.activeGames = {};
    this.gameTypes = {
      'threeFiveEight': {
        minPlayers: 3,
        maxPlayers: 3,
        rules: 'https://gamerules.com/rules/sergeant-major/',
        maxRound: 18,
        extraData: {
          trumpOpts: ['♦', '♣', '♥', '♠', '⇑', '⇓'],
        }
      },
      'shanghai': {
        minPlayers: 2,
        maxPlayers: 8,
        rules: 'https://gamerules.com/rules/shanghai-card-game',
        maxRound: 7,
        extraData: {
          roundGoal: [
            'Two Groups',
            'One Group and One Run',
            'Two Runs',
            'Three Groups',
            'Two Groups and One Run',
            'One Group and Two Runs',
            'Three Runs',
          ]
        }
      },
      'thousand': {
        minPlayers: 2,
        maxPlayers: 4,
        rules: 'https://gamerules.com/rules/1000-card-game/',
        maxRound: Infinity,
        extraData: {
          maxScore: 1000,
        }
      }
    };
    this.handler = {
      start: (ws, msg) => {
        if (!msg.gameType || !msg.gameCode) throw Error('gameType is required to create a new game')
        const { gameCode } = msg;
        const userId = Bun.hash(msg.username).toString();

        this.activeGames[gameCode] = {
          status: 'waiting',
          players: { [userId]: ws },
          gameType: msg.gameType,
          gameInfo: JSON.parse(JSON.stringify(this.gameTypes[msg.gameType])),
          gameCode: gameCode,
          currentRound: 1,
        }
        this.setUserData(ws, msg)
      },
      join: (ws, msg) => {
        if (!msg.gameCode) throw Error('gameCode is required to join a game')
        const { gameCode } = msg;
        const userId = Bun.hash(msg.username).toString();
        const currentGame = this.activeGames[gameCode];

        if (currentGame) {
          if (currentGame.closeTimeout) {
            clearTimeout(currentGame.closeTimeout);
            console.log('timeout cleared for', gameCode)
          }

          if (currentGame.players[userId]) {
            if (!currentGame.players[userId].data.isConnected) {
              currentGame.players[userId].data.isConnected = true;
              ws.data = currentGame.players[userId].data;
              currentGame.players[userId] = ws;
              return
            }

            return {
              status: 'badUsername',
              errorMsg: 'Username already exists',
              gameCode,
            }
          }
          currentGame.players[userId] = ws;
          this.setUserData(ws, msg);
        }
      },
      position: (ws, msg) => {
        const userData = ws.data;
        const currentGame = this.activeGames[userData.gameCode];
        if (!currentGame) return

        const swapUserId = Object.keys(currentGame.players).find(userId => 
          currentGame.players[userId].data.position === userData.position + msg.position
        );
        if (!swapUserId) return
        const swapPlayer = currentGame.players[swapUserId].data;

        userData.ready = swapPlayer.ready = false;
        [ userData.position, swapPlayer.position ] = [ swapPlayer.position, userData.position ];

        // if (!msg.position) return
        // const currentGame = this.activeGames[ws.data.gameCode];
        // if (!currentGame) throw Error('cant find current game')
        // console.log('changing position')
        // const players = currentGame.players;
        // const currentPos = players[msg.userId].data.position;
        // const newPos = currentPos + msg.position;
        // const shiftedUserId = Object.keys(players).find(userId => players[userId].data.position === newPos);
        // console.log(currentPos, newPos, shiftedUserId)
        // if (!shiftedUserId || 0 > newPos || newPos > Object.keys(players).length) {
        //   return
        // }
        // players[msg.userId].data.position = newPos;
        // players[msg.userId].data.ready = false;
        // players[shiftedUserId].data.position = currentPos;
        // players[shiftedUserId].data.ready = false;
      },
      ready: (ws, msg) => {
        const { gameCode, userId } = ws.data;
        const currentGame = this.activeGames[gameCode];
        if (!currentGame) throw Error('cant find current game')
        if (currentGame?.players[userId]) {
          currentGame.players[userId].data.ready = !currentGame.players[userId].data.ready;
        }

        const playerKeys = Object.keys(currentGame.players);
        const allReady = playerKeys.every(key => currentGame.players[key].data.ready)
        const { minPlayers, maxPlayers } = currentGame.gameInfo;
        if (allReady && minPlayers <= playerKeys.length && playerKeys.length <= maxPlayers) {
          currentGame.status = currentGame.gameType;
        }
      },
      score: (ws, msg) => {
        const { gameCode, userId, score } = ws.data;
        const currentGame = this.activeGames[gameCode];
        if (!currentGame) throw Error('cant find current game')
        if (score.length < currentGame.currentRound) {
          score.push(msg.score || 0)
          // If all players have entered their score for the current round, increment currentRound prop
          const roundIsOver = Object.keys(currentGame.players).every(userId => (
            currentGame.players[userId].data.score.length === currentGame.currentRound
          ));
          if (roundIsOver) currentGame.currentRound += 1;
        }
      },
      trump: (ws, msg) => {
        const currentGame = this.activeGames[ws.data.gameCode];
        if (!currentGame) throw Error('cant find current game')
        if (msg.suit) {
          const gameData = currentGame.gameInfo.extraData
          if (!gameData) throw Error('cant finds extraData')
          ws.data.chosenTrumps.push(msg.suit);
          gameData.currentTrump = msg.suit;
        }
      }
    }
  }

  // setUserData(ws: ClientSocket, msg: ClientMsg) {
  setUserData<T extends 'start' | 'join'>(ws: ClientSocket, msg: Test2<T>) {
    if (!msg.gameCode) throw Error('gameCode is required for websocket user data')
    const currentGame = this.activeGames[msg.gameCode];
    if (!currentGame) throw Error('cant find current game')
    // console.log(this.activeGames[msg.gameCode])
    ws.data = {
      username: msg.username,
      score: [],
      ready: false,
      gameCode: msg.gameCode,
      isConnected: true,
      position: Object.keys(currentGame.players).length,
      chosenTrumps: [],
      userId: Bun.hash(msg.username).toString()
    }
  }

  sendAll(gameCode: string) {
    const currentGame = this.activeGames[gameCode]
    if (!currentGame) throw Error('cant find current game')
    const players = Object.keys(currentGame.players).map(currentUserId => {
      const { userId, ...rest } = currentGame.players[currentUserId].data;
      return rest;
    }).sort((a, b) => a.position - b.position);
    Object.keys(currentGame.players).forEach(userId => {
      const currentPlayer = currentGame.players[userId]
      if (currentPlayer.data.isConnected) {
        const res: ServerMsg = {
          ...currentGame,
          username: currentPlayer.data.username,
          userId,
          players,
        }
        currentPlayer.send(JSON.stringify(res))
      }
    })
  }
}
