// TO-DO
//
// Can we use ws.subscribe instead of using activeGames obj?
// We need to take care of disconnected player's score
//   - i.e. currentRound should increment if all CONNECTED players have entered their scores for the current round
//   - Table already handles cases where round score is undefined by putting an 'X' as their score
//   - It would be nice if we could allow a user to input points for missed rounds
//    - This would only really happen if the last user to enter their points gets disconnected,
//      this would trigger the round to increment even if the player scored some amount of points that round
// Only allow users to connect if the game status is 'waiting'
//  - ISSUE: but then how can people rejoin a game if they disconnect?
//  - ISSUE: what if someone else wants to join the game midway through?
// We want to create a way for users to modifier their score
//  - We have something setup in layout.ts to trigger when a user holds down click for 5 seconds
//  - Use this to trigger a dialog to edit past scores
// Do we want threeFiveEight to auto calculate score?
//  - i.e. if user is 8 and picked up 6 hands, they put enter 6, computer does '6 - 8' and assigns a score of -2
// Try to find a more elegant way to manage url params
//  - See lib/utils file
// Add game view for thousand
// Improve type for ServerMsg, we want it to be similar to AnyExtraData 
//  - Got it kind of working, the only thing wrong is the use of 'any' type startWebSocket function in utils.ts
//  - Dont forget to cleanup types file and specifically names for Fixed and FixedAny types
// Why does connecting as the same user (manually triggering badUsername check) cause initial client to display as disconnected
// Check for ws.data.gameCode in message handler (in this file), if handler is not start or join, there must be a gameCode
//  - Otherwise exit gracefully, i.e. return refresh msg and probably run ws.close()
// Prevent players from joining if adding them would exceed gameInfo.maxPlayers
// Delete extranious console.logs and comments
// [ DONE ] Fix move current bun start script to bun run dev
// [ DONE ] In gamesManager join handler, check that game exists before assigning userData

import build from '@/lib/build';
import GamesManager from '@/lib/GamesManager';
import { SocketData, AnyClientMsg } from '@/types';

await build();

const router = new Bun.FileSystemRouter({
  style: 'nextjs',
  dir: 'src/public/',
  fileExtensions: ['.html', '.js', '.css', '.png', '.json']
});
if (Bun.env.DEBUG) console.log(router)

const gm = new GamesManager();

const server = Bun.serve<SocketData>({
  fetch(req, server) {
    const match = router.match(req.url)
    const gameCode = new URL(req.url).searchParams.get('gameCode');
    if (Bun.env.DEBUG) console.log(req.url)

    if (server.upgrade(req)) {
      return
    } else if (gameCode && !gm.activeGames[gameCode]) {
      return new Response(null, { status: 302, headers: { location: '/' } })
    } else if (!match) {
      return new Response('Page not found', { status: 404 })
    } else {
      return new Response(Bun.file(match.filePath))
    }
  },

  error() {
    return new Response('Server Error', { status: 500 })
  },

  websocket: {
    message(ws, data) {
      if (Bun.env.DEBUG) console.log(data)
      const msg: AnyClientMsg = JSON.parse(data.toString());
      const handler: Function | undefined = gm.handler[msg.action]
      if (!handler) return ws.close()

      // const res = handler(ws, msg as any);
      const res = handler(ws, msg);
      if (res) {
        ws.send(JSON.stringify(res));
        ws.close();
      } else {
        gm.sendAll(ws.data.gameCode);
      }
    },
    close(ws) {
      if (Bun.env.DEBUG) console.log('closed', ws.data);
      if (!ws.data) return
      const { userId, gameCode } = ws.data;
      const currentGame = gm.activeGames[gameCode];
      if (!currentGame || !userId || !gameCode) return;

      currentGame.players[userId].data.isConnected = false;
      const allClosed = Object.keys(currentGame.players).every(userId => 
        !currentGame.players[userId].data.isConnected
      )
      if (Bun.env.DEBUG) console.log('All Closed?', allClosed)
      if (allClosed) {
        currentGame.closeTimeout = setTimeout(() => {
          delete gm.activeGames[ws.data.gameCode]
          if (Bun.env.DEBUG) console.log('deleted gameCode', ws.data.gameCode, gm.activeGames)
        }, 4 * 60 * 60 * 1000) // 4 hours
      } else {
        gm.sendAll(ws.data.gameCode)
      }
    }
  }
});

console.log(`Server running on ${server.hostname}:${server.port}`)
