import {
  ActiveGame,
  // AllGameInfo,
  ClientMsg,
  ClientSocket,
  GameInfo,
  GameTypes,
  ServerMsg
} from '@/types';

export default class GamesManager {
  activeGames: { [key: string]: ActiveGame }
  gameTypes: { [key in GameTypes]: GameInfo }
  // gameTypes: AllGameInfo
  handler: { [key in ClientMsg['action']]: (ws: ClientSocket, msg: ClientMsg) => ServerMsg }

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
            'Three Runs,'
          ]
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
        return this.getResMsg(msg.gameCode, userId)
      },
      join: (ws, msg) => {
        if (!msg.gameCode) throw Error('gameCode is required to join a game')
        const { gameCode } = msg;
        const userId = Bun.hash(msg.username).toString();
        const currentGame = this.activeGames[gameCode];

        if (currentGame) {
          if (currentGame.closeTimeout) {
            clearTimeout(this.activeGames[gameCode].closeTimeout);
          }

          if (currentGame.players[userId]) {
            if (!currentGame.players[userId].data.isConnected) {
              currentGame.players[userId].data.isConnected = true;
              ws.data = currentGame.players[userId].data;
              currentGame.players[userId] = ws;
              return this.getResMsg(msg.gameCode, userId);
            }

            return { 
              ...this.activeGames[gameCode],
              players: Object.keys(currentGame.players).map(key => currentGame.players[key].data),
              status: 'error',
              errorMsg: 'Username already exists',
              userId: 'error',
              username: 'error',
            }
          }
          this.activeGames[gameCode].players[userId] = ws;
          this.setUserData(ws, msg);
        }

        return this.getResMsg(msg.gameCode, userId);
      },
      position: (ws, msg) => {
        // if (!msg.gameCode) throw Error('gameCode is required');
        if (!msg.position) return this.getResMsg(ws.data.gameCode, msg.userId);
        console.log('changing position')
        const players = this.activeGames[ws.data.gameCode].players;
        const currentPos = players[msg.userId].data.position;
        const newPos = currentPos + msg.position;
        const shiftedUserId = Object.keys(players).find(userId => players[userId].data.position === newPos);
        console.log(currentPos, newPos, shiftedUserId)
        if (!shiftedUserId || 0 > newPos || newPos > Object.keys(players).length) {
          return  this.getResMsg(ws.data.gameCode, msg.userId);
        }
        players[msg.userId].data.position = newPos;
        players[msg.userId].data.ready = false;
        players[shiftedUserId].data.position = currentPos;
        players[shiftedUserId].data.ready = false;

        return this.getResMsg(ws.data.gameCode, msg.userId);
      },
      ready: (ws, msg) => {
        // if (!msg.gameCode) throw Error('gameCode is required')
        const currentGame = this.activeGames[ws.data.gameCode];
        // const rotationIndex = msg.position - 1
        if (currentGame?.players[msg.userId]) {
          currentGame.players[msg.userId].data.ready = !currentGame.players[msg.userId].data.ready;
        }

        const playerKeys = Object.keys(currentGame.players);
        const allReady = playerKeys.every(key => currentGame.players[key].data.ready)
        const { minPlayers, maxPlayers } = currentGame.gameInfo;
        if (allReady && minPlayers <= playerKeys.length && playerKeys.length <= maxPlayers) {
          currentGame.status = currentGame.gameType;
        }
        
        return this.getResMsg(ws.data.gameCode, msg.userId)
      },
      score: (ws, msg) => {
        const currentGame = this.activeGames[ws.data.gameCode];
        const currentPlayer = currentGame.players[msg.userId].data;
        console.log('wtf', currentGame, currentPlayer)
        if (
          currentGame && currentPlayer && currentPlayer.score.length < currentGame.currentRound
        ) {
          currentPlayer.score.push(msg.score || 0)
          console.log('pushed score')

          // If all players have entered their score for the current round, increment currentRound prop
          const roundIsOver = Object.keys(currentGame.players).every(userId => (
            currentGame.players[userId].data.score.length === currentGame.currentRound
          ));
          if (roundIsOver) currentGame.currentRound += 1;
        }
        return this.getResMsg(ws.data.gameCode, msg.userId)
      },
      trump: (ws, msg) => {
        if (msg.suit) {
          const gameData = this.activeGames[ws.data.gameCode].gameInfo.extraData
          if (!gameData) throw Error('cant finds extraData')
          ws.data.chosenTrumps.push(msg.suit);
          gameData.currentTrump = msg.suit;
        }
        return this.getResMsg(ws.data.gameCode, msg.userId);
      }
    }
  }

  setUserData(ws: ClientSocket, msg: ClientMsg) {
    if (!msg.gameCode) throw Error('gameCode is required for websocket user data')
    console.log(this.activeGames[msg.gameCode])
    ws.data = {
      username: msg.username,
      score: [],
      ready: false,
      gameCode: msg.gameCode,
      isConnected: true,
      position: Object.keys(this.activeGames[msg.gameCode].players).length,
      chosenTrumps: [],
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

  sendAll(gameCode: string) {
    const currentGame = this.activeGames[gameCode]
    const players = Object.keys(currentGame.players).map(userId => currentGame.players[userId].data)
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
