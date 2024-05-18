// TO-DO
//
// Can we use ws.subscribe instead of using activeGames obj?
// Extract getServerMsg to its own function
// Can we create game join links? i.e. domain.com?gameCode=12345

import build from '@/lib/build';
import { randStr } from '@/lib/utils';
import GamesManager from '@/lib/GamesManager';
import { ClientMsg, ClientSocket, } from '@/types';

await build();

const router = new Bun.FileSystemRouter({
  style: 'nextjs',
  dir: 'src/public/',
  fileExtensions: ['.html', '.js', '.css']
})
console.log(router)

const gm = new GamesManager()

const server = Bun.serve({
  fetch(req, server) {
    const match = router.match(req.url)
    console.log(req.url)

    if (server.upgrade(req)) return
    
    // If gamecode not found, redirect to home page
    const gameCode = new URL(req.url).searchParams.get('gameCode');
    if (gameCode && !gm.activeGames[gameCode]) {
      return new Response(null, { status: 302, headers: { location: '/' } })
    }

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
      if (!msg.gameCode) msg.gameCode = randStr(5);
      const res = gm.handler[msg.action](ws, msg)
      console.log(gm.activeGames)

      if (res.status === 'error') {
        ws.send(JSON.stringify(res));
        ws.close();
      } else {
        const players = gm.activeGames[res.gameCode].players;
        Object.keys(players).forEach(key => {
          players[key].send(JSON.stringify({
            ...res,
            username: players[key].data.username,
            userId: key,
          }))
        })
      }

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
