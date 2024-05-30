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
// [ DONE ] Also might be smart to not delete the game onces all users disconnect, wait some period of time before deleting the game 
//  - [ DONE ] If a round lasts a very long time and all connections time-out all game data would be lost
// Only allow users to connect if the game status is 'waiting'
//  - ISSUE: but then how can people rejoin a game if they disconnect?
//  - ISSUE: what if someone else wants to join the game midway through?
// Try to use vite as the bundler, this will allow hot module reloading,
//  - This should save a lot of dev time cuz we wont have to restart every game after each save
// Use ws.data.gameCode instead of sending gameCode with each ClientRequest
//  - Try to do the same for things like username and userId, these are also saved in ws.data
// Home page should use flexbox instead of grid, this will easily allow rows to wrap for smaller screens
// [ DONE ] Create components folder to help break up the clutter of render functions
//  - [ DONE ] Consider also creating a Layout file while we are at it
// [ DONE ] Handle socket disconnects while game is in the waiting phase
// [ DONE ] ThreeFiveEight view needs to display the current trump suit
// Fix errors where currentgame cannot be found at ws.close (in this file)
// Handle errors where numeric input is '+1'
//  - Multiple ways to handle this:
//    - Use a plus/minus toggle button and pure numeric input
//    - Set the program to calculate the score based on hand count, hand count never needs to be negative
// Something is still wrong with how we delete old games, test the timeout and when the timeout gets cleared
//  - Maybe clear the timeout everytime a user enters their score
//  - POTENTIAL SOLUTION: setTimeout is never actually assigned to currentGame.closeTimeout so there is nothing to clear
// Reloading the page for every change (see client.ts) seems like a bad idea
//  - Mainly because it re-fetches the entire website from the server
// Move maxRound into extraData
// Move client side query param setting from ws.onmessage to ws.onopen
// Re-write handlers in GamesManager
//  - We now verify game exists before running handler, so hopefully we dont have verify game exists in every handler
// Rename new ClientMsg names

import build from '@/lib/build';
import { randStr } from '@/lib/utils';
import GamesManager from '@/lib/GamesManager';
import { SocketData, Test3, } from '@/types';

await build();

const router = new Bun.FileSystemRouter({
  style: 'nextjs',
  dir: 'src/public/',
  fileExtensions: ['.html', '.js', '.css', '.png', '.json']
});
console.log(router)

const gm = new GamesManager();

const server = Bun.serve<SocketData>({
  fetch(req, server) {
    const match = router.match(req.url)
    const gameCode = new URL(req.url).searchParams.get('gameCode');
    console.log(req.url)

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
      console.log(data)
      const msg: Test3 = JSON.parse(data.toString());
      if (msg.action === 'start') msg.gameCode = randStr(5);

      if (msg.action !== 'start' && ws.data?.gameCode && !gm.activeGames[ws.data.gameCode]) {
        console.log('SEND REFRESH AND CLOSE SOCKET')
        ws.send(JSON.stringify({ status: 'refresh' }));
        ws.close();
      } else {
        const res = gm.handler[msg.action](ws, msg as any);
        if (res) {
          ws.send(JSON.stringify(res));
          ws.close();
        } else {
          gm.sendAll(ws.data.gameCode);
        }
      }

      // const res = gm.handler[msg.action](ws, msg as any);
      // if (res) {
      //   ws.send(JSON.stringify(res));
      //   ws.close();
      // // } else if (!gm.activeGames[msg.gameCode || ws.data.gameCode]) {
      // } else if (!gm.activeGames[ws.data.gameCode]) {
      //   console.log('SEND REFRESH AND CLOSE SOCKET')
      //   ws.send(JSON.stringify({ status: 'refresh' }));
      //   ws.close();
      // } else {
      //   gm.sendAll(ws.data.gameCode);
      // }
    },
    open(ws) {
      console.log('connected to websocket')
    },
    close(ws) {
      // console.log('closed', gm.activeGames);
      console.log('closed', ws.data);
      if (!ws.data) return
      const userId = Bun.hash(ws.data.username).toString();
      const currentGame = gm.activeGames[ws.data.gameCode];
      if (!currentGame) throw Error('cant find current game')

      currentGame.players[userId].data.isConnected = false;
      const allClosed = Object.keys(currentGame.players).every(userId => 
        !currentGame.players[userId].data.isConnected
      )
      console.log('All Closed?', allClosed)
      if (allClosed) {
        // console.log('timout set at: ', new Date())
        currentGame.closeTimeout = setTimeout(() => {
          // console.log('delete gameCode', ws.data.gameCode)
          delete gm.activeGames[ws.data.gameCode]
          // console.log(gm.activeGames)
        }, /*4 * 60 **/ 60 * 1000) // 4 hours
      } else {
        gm.sendAll(ws.data.gameCode)
      }
    }
  }
});

console.log(`Server running on ${server.hostname}:${server.port}`)
