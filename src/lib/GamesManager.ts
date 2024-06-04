import {
  ActiveGame,
  ClientActions,
  ClientSocket,
  GameTypes,
  ServerMsg,
  ClientMsg,
  AnyActiveGame,
  ErrorMsg
} from '@/types';
import { randStr } from '@/lib/utils';

export default class GamesManager {
  activeGames: { [key: string]: AnyActiveGame | undefined }
  gameTypes: { [key in GameTypes]: ActiveGame<key>['gameInfo'] }
  handler: { [key in ClientActions]: (ws: ClientSocket, msg: ClientMsg<key>) => void | ErrorMsg }

  constructor() {
    this.activeGames = {};
    this.gameTypes = {
      'threeFiveEight': {
        minPlayers: 3,
        maxPlayers: 3,
        rules: 'https://gamerules.com/rules/sergeant-major/',
        extraData: {
          trumpOpts: ['♦', '♣', '♥', '♠', '⇑', '⇓'],
          maxRound: 18,
          currentTrump: '',
        }
      },
      'shanghai': {
        minPlayers: 2,
        maxPlayers: 8,
        rules: 'https://gamerules.com/rules/shanghai-card-game',
        extraData: {
          maxRound: 7,
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
        extraData: {
          maxScore: 1000,
          maxRound: 999,
        }
      }
    };
    this.handler = {
      start: (ws, msg) => {
        this.handler.join(ws, {
          action: 'join',
          gameCode: this.createGame(msg.gameType),
          username: msg.username,
        })
      },
      join: (ws, msg) => {
        this.setUserData(ws, msg);
        const { gameCode, userId } = ws.data;
        const currentGame = this.activeGames[gameCode];
        if (!currentGame) return { status: 'refresh', errorMsg: 'Cant find game' }

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
      },
      position: (ws, msg) => {
        const userData = ws.data;
        const currentGame = this.activeGames[userData.gameCode];
        if (!currentGame) return { status: 'refresh', errorMsg: 'Cant find game' }

        const swapUserId = Object.keys(currentGame.players).find(userId => 
          currentGame.players[userId].data.position === userData.position + msg.position
        );
        if (!swapUserId) return
        const swapPlayer = currentGame.players[swapUserId].data;

        userData.ready = swapPlayer.ready = false;
        [ userData.position, swapPlayer.position ] = [ swapPlayer.position, userData.position ];
      },
      ready: (ws, msg) => {
        const { gameCode, userId } = ws.data;
        const currentGame = this.activeGames[gameCode];
        if (!currentGame) return { status: 'refresh', errorMsg: 'Cant find game' }
        if (currentGame.players[userId]) {
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
        const { gameCode, score } = ws.data;
        const currentGame = this.activeGames[gameCode];
        if (!currentGame) return { status: 'refresh', errorMsg: 'Cant find game' }
        if (score.length < currentGame.currentRound) {
          score.push(msg.score || 0)
          // If all players have entered their score for the current round, increment currentRound prop
          const roundIsOver = Object.keys(currentGame.players).every(userId => (
            currentGame.players[userId].data.score.length === currentGame.currentRound
          ));
          const thousandGameOver = (
            currentGame.gameType === 'thousand' &&
              score.reduce((tot, num) => tot + num, 0) >= currentGame.gameInfo.extraData.maxScore
          )
          if (thousandGameOver) {
            currentGame.gameInfo.extraData.maxRound = currentGame.currentRound
          } 
          if (roundIsOver) {
            currentGame.currentRound += 1;
          }
          // if (roundIsOver) currentGame.currentRound += 1;
        }

        // if (currentGame.gameType === 'thousand' && score.reduce((tot, num) => tot + num, 0) >= 1000) {
        //   currentGame.gameInfo.extraData.maxRound = currentGame.currentRound + 1
        // }
      },
      trump: (ws, msg) => {
        const currentGame = this.activeGames[ws.data.gameCode];
        if (!currentGame) return { status: 'refresh', errorMsg: 'Cant find game' }
        if (msg.suit && currentGame.gameType === 'threeFiveEight') {
          const gameData = currentGame.gameInfo.extraData
          ws.data.chosenTrumps.push(msg.suit);
          gameData.currentTrump = msg.suit;
        }
      }
    }
  }

  createGame(gameType: GameTypes): string {
    const gameCode = randStr(5);
    if (this.activeGames[gameCode]) return this.createGame(gameType)
    this.activeGames[gameCode] = {
      status: 'waiting',
      players: {},
      gameType: gameType,
      gameInfo: JSON.parse(JSON.stringify(this.gameTypes[gameType])),
      gameCode: gameCode,
      currentRound: 1,
    }
    return gameCode;
  }

  setUserData<T extends 'join'>(ws: ClientSocket, msg: ClientMsg<T>) {
    const currentGame = this.activeGames[msg.gameCode];
    if (!currentGame) throw Error('cant find current game')
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
    // This should always be the same once game starts,
    // Maybe add an orderedPlayers prop to ActiveGame and assing this when status is a GameType
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
