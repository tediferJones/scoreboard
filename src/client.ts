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
    return t('div', { className: 'showOutline' }, [
      t('h1', { textContent: 'hello world 1' }),
      t('h1', { textContent: 'hello world 2' }),
      t('h1', {
        textContent: 'hello world 3',
        onclick: () => console.log('hello world from 3 UPDATED')
      }),
    ])
  }
}

// let ws: WebSocket;
document.querySelector('#startForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const ws = new WebSocket('ws://localhost:3000');
  ws.onopen = () => {
    console.log('opened NEW TEST')
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
    const msg: ServerMsg = JSON.parse(ws.data)
    container.innerHTML = '';
    container.appendChild(renderOpts[msg.status](msg))
  }
})
