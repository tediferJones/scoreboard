# scoreboard

A web app to keep track of the score during card games
- Supported games: 3-5-8, Shanghai, 1000
- Uses websockets to provide instant feedback when the game state is updated
- Uses a custom and minimal UI system to providing the smallest bundle size (less than 100kb)
- WebSocket server and web server are run from the same environment 
    - Providing a very simple way of generating connection links
- Comprehensive types make it easy to add new game modes
- Client connection state is held entirely in the URL
- Designed with mobile devices in mind
- Resilient websocket connections allows the app the enter the background while seamlessly reconnecting when the app is brought back into the foreground
