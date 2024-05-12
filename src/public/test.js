/**
 * @typedef {import("@/types").ServerMsg} ServerMsg
 */

// /**
//  * Create a dom node
//  * @param {string} type Tag name to create (i.e div)
//  * @param {Object.<string, any>} attrs The second value
//  */
// function getTag(type, attrs) {
//   const tag = document.createElement(type);
//   Object.keys(attrs).forEach(key => {
//     // @ts-ignore
//     // tag[key] = attrs[key]
//     // @ts-ignore
//     // typeof(tag[key]) === 'function' ? tag[key](attrs[key]) : tag[key] = attrs[key]
//     if (typeof(tag[key]) === 'function') {
// 
//     } else {
//       tag[key] = attrs[key];
//     }
//   });
//   return tag;
// }

const tailwind = document.createElement('div');
tailwind.className = ''

/**
 * @param {string} id Id of a dom node
 */ 
function getValById(id) {
  // @ts-ignore
  return document.querySelector(`#${id}`).value
}

// @ts-ignore
const { div } = van.tags;

/**
 * @type {Object<string, (data: ServerMsg) => void>}
 */
const renderOpts = {
  waiting: (data) => {
    console.log('display waiting screen')
    const container = document.querySelector('#container')
    if (!container) throw Error('cant find container')
    // console.log('div', getTag('div', { innerText: 'hello world' }))
    container.innerHTML = ''
    container.append(
      // getTag('div', {
      //   innerText: 'hello world',
      // }),
      // getTag('div', { innerText: 'hello world' }),
      div({ className: 'bg-red-500' }, 'hello world')
    )
  },
  running: (data) => {},
}

document.querySelector('#startForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('submitted')
  /** @type {WebSocket} */
  const ws = new WebSocket('ws://localhost:3000');
  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        action: 'start',
        gameType: getValById('gameType'),
        username: getValById('username'),
      })
    )
  }
  ws.onmessage = (ws) => {
    /** @type {import("@/types").ServerMsg} */
    const data = JSON.parse(ws.data);
    renderOpts[data.status](data);
    console.log(data)
  }
})
