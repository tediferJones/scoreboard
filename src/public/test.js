let ws;

document.querySelector('#startForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('submitted')
  ws = new WebSocket('ws://localhost:3000');
  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        action: 'start',
        gameType: document.querySelector('#gameType').value,
        username: document.querySelector('#username').value,
      })
    )
  }
  ws.onmessage = (ws, e) => {
    console.log(ws.data)
  }
})
