// What do we want?
// Server should be able to act as web server and websocket server
// Can we use ws.subscribe instead of using activeGames obj?
//
// clientMsg should look like {
//   action: 'start' | 'connect',
//   gameCode?: string, (required for connect action)
// }
//
// serverMsg should reflect the current games state, maybe just return the whole active game obj

// import Waiting from '@/components/waiting';
import { ActiveGame, ClientSocket, GameInfo, ServerMsg } from './types';
// import ReactDom from 'react-dom/server';

// await Bun.build({
//   entrypoints: ['src/client.ts'],
//   outdir: 'src/public',
// })

const router = new Bun.FileSystemRouter({
  style: 'nextjs',
  dir: 'src/public/',
  fileExtensions: ['.html', '.js', '.css']
})
console.log(router)

const activeGames: { [key: string]: ActiveGame } = {};
const games: { [key: string]: GameInfo } = {
  '3-5-8': {
    minPlayers: 3,
    maxPlayers: 3,
  }
}

const handler: { [key: string]: (ws: ClientSocket, msg: string, gameCode: string) => ServerMsg } = {
  start: (ws, msg, gameCode) => {
    const data = JSON.parse(msg);
    ws.data = {
      username: data.username,
      score: 0,
    }

    activeGames[gameCode] = {
      status: 'waiting',
      players: [ws],
      gameType: data.gameType,
      gameInfo: games[data.gameType],
    }

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
    message(ws: ClientSocket, msg) {
      console.log(msg)
      const data = JSON.parse(msg.toString())
      const gameCode: string = data.gameCode || getGameCode()
      const res = handler[data.action](ws, msg.toString(), gameCode)
      activeGames[gameCode].players
        .forEach(socket => socket.send(JSON.stringify(res)))
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
