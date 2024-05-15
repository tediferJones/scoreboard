import { ServerMsg } from '@/types';

interface StrIdxNode extends HTMLElement {
  [key: string]: any
}

interface Props extends Partial<{ [key in keyof HTMLElement]: any }> {
  [key: string]: any
};

function t(type: keyof HTMLElementTagNameMap, props?: Props, children?: HTMLElement[]) {
  const node: StrIdxNode = document.createElement(type);
  if (props) Object.keys(props).forEach(propKey => node[propKey] = props[propKey]);
  if (children?.length) node.append(...children);
  return node;
}
// t('h1', {
//   textContent: 'hello world 3',
//   onclick: () => console.log('hello world from 3 UPDATED')
// }),

function validateInputs(formId: string, inputIds: string[]) {
  const validity = inputIds.every(inputId => {
    return getValById(inputId) || (document.querySelector(`#${inputId}`) as HTMLInputElement).setCustomValidity(`${inputId} is required`);
  })
  return validity || (document.querySelector(`#${formId}`) as HTMLFormElement).reportValidity();
}
          
const renderOpts: { [key: string]: (msg: ServerMsg) => Node } = {
  home() {
    return t('form', { className: 'showOutline w-4/5 grid grid-cols-3 gap-4', id: 'initForm' }, [
      t('h1', { textContent: 'Scoreboard', className: 'text-xl text-center col-span-3' }),
      t('label', { textContent: 'Username:', for: 'username' }),
      t('input', {
        className: 'col-span-2',
        id: 'username',
        type: 'text',
        maxLength: '32',
        required: true,
        value: 'testUser',
      }),
      t('hr', { className: 'col-span-3' }),
      t('label', { textContent: 'Game Type:', for: 'gameType' }),
      t('select', { id: 'gameType', value: '' }, [
        t('option', { textContent: '3-5-8', value: '3-5-8' }),
        t('option', { textContent: 'Shanghai', value: 'shanghai' }),
      ]),
      t('button', {
        textContent: 'Create Game',
        id: 'startGame',
        onclick: (e: any) => {
          e.preventDefault();
          if (validateInputs('initForm', ['username', 'gameType'])) {
            startWebSocket({
              action: 'start',
              gameType: getValById('gameType'),
              username: getValById('username'),
            })
          }
        }
      }),
      t('label', { textContent: 'Join Code:', for: 'joinCode' }),
      t('input', { id: 'joinCode', type: 'text', maxLength: '5' }),
      t('button', {
        textContent: 'Join Game',
        id: 'joinGame',
        onclick: (e: any) => {
          e.preventDefault();
          if (validateInputs('initForm', ['joinCode', 'username'])) {
            startWebSocket({
              action: 'join',
              gameCode: getValById('joinCode'),
              username: getValById('username'),
            });
          }
        }
      })
    ])
  },
  waiting(msg) {
    console.log(msg.status)
    const { minPlayers, maxPlayers } = msg.gameInfo;
    const requiredPlayers = minPlayers === maxPlayers ? minPlayers : `${minPlayers} - ${maxPlayers}`;
    return t('div', { className: 'flex flex-col gap-4 col-span-3 items-center' }, [
      t('h1', { textContent: 'Waiting...', className: 'text-xl' }),
      t('h1', { textContent: `${msg.gameType} requires ${requiredPlayers} players` }),
      t('h1', { textContent: `Game Code: ${msg.gameCode}` }),
      ...msg.players.map(player => t('p', { textContent: player.username })),
    ])
  },
  error() {
    return t('h1', { textContent: 'Display error msg' })
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
    const container = document.body;
    console.log(ws.data)
    const msg: ServerMsg = JSON.parse(ws.data)
    container.innerHTML = '';
    container.appendChild(renderOpts[msg.status](msg))
  }
}

document.body.append(renderOpts.home({} as ServerMsg))

// document.querySelector('#joinGame')?.addEventListener('click', (e) => {
//   e.preventDefault();
//   startWebSocket({
//     action: 'join',
//     gameCode: getValById('joinCode'),
//     username: getValById('username'),
//   });
// })

// document.querySelector('#startGame')?.addEventListener('click', (e) => {
//   e.preventDefault();
//   startWebSocket({
//     action: 'start',
//     gameType: getValById('gameType'),
//     username: getValById('username'),
//   });
// })
