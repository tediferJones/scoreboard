// import { ServerMsg } from '@/types';
// let ws: WebSocket;

document.querySelector('#startForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const ws = new WebSocket('ws://localhost:3000')
  ws.onopen = () => {
    console.log('opened')
    ws.send(
      JSON.stringify({
        action: 'start',
        gameType: (document.querySelector('#gameType') as HTMLSelectElement).value,
        username: (document.querySelector('#username') as HTMLInputElement).value,
      })
    )
  }

  ws.onmessage = (ws) => {
    const container = document.querySelector('#container');
    if (!container) throw Error('Cant find container')
    console.log(ws.data)
    container.innerHTML = ws.data;
  }
})

// const msg: ServerMsg = JSON.parse(ws.data);
// console.log(msg)
// render(msg)
// function getTag(type: string, attrs: { [key: string]: any }) {
//   const tag = document.createElement(type) as { [key: string]: any };
//   Object.keys(attrs).forEach(key => tag[key] = attrs[key]);
//   return tag as Node;
// }
// 
// function render(msg: ServerMsg): void {
//   console.log('in render func:', msg.status)
//   const opts = {
//     waiting: () => {
//       const container = document.querySelector('#container');
//       if (!container) throw Error('no container div')
//       container.innerHTML = msg.render;
//       // container.appendChild(getTag('h1', { innerText: 'Waiting for players', className: 'text-xl' }))
//       // msg.players.map(player => player.username).forEach(user => {
//       //   container.appendChild(getTag('div', { innerText: user }));
//       // })
//     },
//     running: () => {
// 
//     }
//   }[msg.status]()
// }
