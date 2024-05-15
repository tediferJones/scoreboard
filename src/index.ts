// TO-DO
//
// Can we use ws.subscribe instead of using activeGames obj?
// Extract getServerMsg to its own function
// Can we create game join links? i.e. domain.com?gameCode=12345

import {
  ActiveGame,
  ClientMsg,
  ClientSocket,
  GameInfo,
  GameTypes,
  ServerMsg
} from '@/types';
import build from './lib/build';

await build();

const router = new Bun.FileSystemRouter({
  style: 'nextjs',
  dir: 'src/public/',
  fileExtensions: ['.html', '.js', '.css']
})
console.log(router)

const activeGames: { [key: string]: ActiveGame } = {};
const games: { [key in GameTypes]: GameInfo } = {
  '3-5-8': {
    minPlayers: 3,
    maxPlayers: 3,
  },
  'shanghai': {
    minPlayers: 2,
    maxPlayers: 8,
  }
}

const handler: { [key in ClientMsg['action']]: (ws: ClientSocket, msg: ClientMsg) => ServerMsg } = {
  start: (ws, msg) => {
    if (!msg.gameType || !msg.gameCode) throw Error('gameType is required to create a new game')
    ws.data = {
      username: msg.username,
      score: 0,
    }
    const { gameCode } = msg;

    activeGames[gameCode] = {
      status: 'waiting',
      players: [ws],
      gameType: msg.gameType,
      gameInfo: games[msg.gameType],
      gameCode: gameCode,
    }

    return {
      ...activeGames[gameCode],
      players: activeGames[gameCode].players.map(ws => ws.data)
    }
  },
  join: (ws, msg) => {
    if (!msg.gameCode) throw Error('gameCode is required to join a game')
    const { gameCode } = msg;

    if (activeGames[gameCode].players.some(player => player.data.username === msg.username)) {
      return { 
        ...activeGames[gameCode],
        players: activeGames[gameCode].players.map(ws => ws.data),
        status: 'error',
        errorMsg: 'Username already exists'
      }
    }

    ws.data = {
      username: msg.username,
      score: 0,
    }

    activeGames[gameCode].players.push(ws)

    return {
      ...activeGames[gameCode],
      players: activeGames[gameCode].players.map(ws => ws.data)
    }
  }
}

function getGameCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return [...Array(5).keys()].map(i => {
    return chars[Math.floor(Math.random() * chars.length)]
  }).join('')
}

const server = Bun.serve({
  fetch(req, server) {
    const match = router.match(req.url)
    console.log(req.url)

    if (server.upgrade(req)) return

    return new Response(
      match ? Bun.file(match.filePath) : 'Page not found'
    );
  },

  error() {
    return new Response('Server Error', { status: 500 })
  },

  websocket: {
    message(ws: ClientSocket, data) {
      console.log(data)
      const msg: ClientMsg = JSON.parse(data.toString())
      if (!msg.gameCode) msg.gameCode = getGameCode();
      const res = handler[msg.action](ws, msg)

      res.status === 'error' ? ws.send(JSON.stringify(res)) :
        activeGames[msg.gameCode].players.forEach(socket => socket.send(JSON.stringify(res)))

      console.log(activeGames)
    },
    open(ws: ClientSocket) {
      console.log('connected to websocket')
    },
    close() {
      console.log('closed')
    }
  }
})

console.log(`Server running on ${server.hostname}:${server.port}`)
