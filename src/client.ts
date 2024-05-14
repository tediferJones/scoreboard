import { ServerMsg } from '@/types';

interface StrIdxNode extends HTMLElement {
  [key: string]: any
}

interface Props extends Partial<{ [key in keyof HTMLElement]: any }> {
  [key: string]: any
};

function t(type: string, props?: Props, children?: HTMLElement[]) {
  const node: StrIdxNode = document.createElement(type);
  if (props) Object.keys(props).forEach(propKey => node[propKey] = props[propKey]);
  if (children?.length) node.append(...children);
  return node;
}

const renderOpts: { [key: string]: (msg: ServerMsg) => Node } = {
  waiting: (msg: ServerMsg) => {
    console.log(msg)
    const newState =  t('div', { className: 'flex flex-col gap-4' }, [
      t('h1', { textContent: 'Waiting...', className: 'text-xl text-center' }),
      t('h1', { textContent: `${msg.gameType} requires ${msg.gameInfo.minPlayers} - ${msg.gameInfo.maxPlayers} players` }),
      t('h1', { textContent: `Game Code: ${msg.gameCode}` }),
      ...msg.players.map(player => t('p', { textContent: player.username })),
      // t('h1', {
      //   textContent: 'hello world 3',
      //   onclick: () => console.log('hello world from 3 UPDATED')
      // }),
    ])
    return newState
  }
}

function getValById(id: string) {
  return (document.querySelector(`#${id}`) as HTMLInputElement).value
}

function startWebSocket(initMsg: { [key: string]: string }) {
  const ws = new WebSocket('ws://localhost:3000');
  ws.onopen = () => {
    console.log('opened NEW TEST')
    ws.send(JSON.stringify(initMsg))
  }

  ws.onmessage = (ws) => {
    const container = document.querySelector('#container');
    if (!container) throw Error('Cant find container')
    console.log(ws.data)
    const msg: ServerMsg = JSON.parse(ws.data)
    container.innerHTML = '';
    container.appendChild(renderOpts[msg.status](msg))
  }
}

document.querySelector('#joinGame')?.addEventListener('click', (e) => {
  e.preventDefault();
  startWebSocket({
    action: 'join',
    gameCode: getValById('joinCode'),
    username: getValById('username'),
  });
})


document.querySelector('#startGame')?.addEventListener('click', (e) => {
  e.preventDefault();
  startWebSocket({
    action: 'start',
    gameType: getValById('gameType'),
    username: getValById('username'),
  });
})
