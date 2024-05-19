// TO-DO
//
// Can we use ws.subscribe instead of using activeGames obj?
// [ DONE ] Extract getServerMsg to its own function
// [ DONE ] Can we create game join links? i.e. domain.com?gameCode=12345
// Add the game '1000', https://gamerules.com/rules/1000-card-game/
// We need to take care of disconnected player's score
//   - i.e. currentRound should increment if all CONNECTED players have entered their scores for the current round
//   - Table already handles cases where round score is undefined by putting an 'X' as their score
//   - It would be nice if we could allow a user to input points for missed rounds
//    - This would only really happen if the last user to enter their points gets disconnected,
//      this would trigger the round to increment even if the player scored some amount of points that round
// Also might be smart to not delete the game onces all users disconnect, wait some period of time before deleting the game 
//  - If a round lasts a very long time and all connections time-out all game data would be lost
// Only allow users to connect if the game status is 'waiting'
// Try to use vite as the bundler, this will allow hot module reloading,
//  - This should save a lot of dev time cuz we wont have to restart every game after each save

import build from '@/lib/build';
import { randStr } from '@/lib/utils';
import GamesManager from '@/lib/GamesManager';
import { ClientMsg, SocketData, } from '@/types';

await build();

const router = new Bun.FileSystemRouter({
  style: 'nextjs',
  dir: 'src/public/',
  fileExtensions: ['.html', '.js', '.css']
})
console.log(router)

const gm = new GamesManager()

const server = Bun.serve<SocketData>({
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
    message(ws, data) {
      console.log(data)
      const msg: ClientMsg = JSON.parse(data.toString())
      if (!msg.gameCode) msg.gameCode = randStr(5);
      const res = gm.handler[msg.action](ws, msg)
      console.log(gm.activeGames)

      if (res.status === 'error') {
        ws.send(JSON.stringify(res));
        ws.close();
      } else {
        gm.sendAll(res.gameCode)
      }

    },
    open(ws) {
      console.log('connected to websocket')
    },
    close(ws) {
      console.log('closed', gm.activeGames);
      const userId = Bun.hash(ws.data.username).toString();
      const currentGame = gm.activeGames[ws.data.gameCode];

      currentGame.players[userId].data.isConnected = false;
      const allClosed = Object.keys(currentGame.players).every(userId => (
        !currentGame.players[userId].data.isConnected
      ))
      if (allClosed) {
        delete gm.activeGames[ws.data.gameCode]
      } else {
        gm.sendAll(ws.data.gameCode)
      }
    }
  }
})

console.log(`Server running on ${server.hostname}:${server.port}`)
