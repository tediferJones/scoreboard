import home from '@/render/home';
import getUsername from '@/render/getUsername';
import waiting from '@/render/waiting';
import { ClientMsg, ServerMsg } from '@/types';
import error from '@/render/error';
import running from '@/render/running';

export interface StrIdxNode extends HTMLElement {
  [key: string]: any
}

interface Props extends Partial<{ [key in keyof HTMLElement]: any }> {
  [key: string]: any
};

export function getTag(type: keyof HTMLElementTagNameMap, props?: Props, children?: HTMLElement[]) {
  const node: StrIdxNode = document.createElement(type);
  if (props) Object.keys(props).forEach(propKey => node[propKey] = props[propKey]);
  if (children?.length) node.append(...children);
  return node;
}

export function randStr(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return [...Array(length).keys()].map(() => {
    return chars[Math.floor(Math.random() * chars.length)]
  }).join('')
}

export function getValById(id: string) {
  return (document.querySelector(`#${id}`) as HTMLInputElement).value
}

export function validateInputs(formId: string, inputIds: string[]) {
  const validity = inputIds.every(inputId => {
    return getValById(inputId) || (document.querySelector(`#${inputId}`) as HTMLInputElement).setCustomValidity(`${inputId} is required`);
  })
  return validity || (document.querySelector(`#${formId}`) as HTMLFormElement).reportValidity();
}

export function setQueryParam(params: { [key: string]: string }) {
  const url = new URL(window.location.toString());
  Object.keys(params).forEach(key => {
    url.searchParams.set(key, params[key])
  })
  window.history.pushState({}, '', url);
}

export const renderOpts: { [key in ServerMsg['status']]: (msg: ServerMsg) => Node } = {
  home,
  getUsername,
  waiting,
  error,
  running,
}

// export let sendFunc: Function;
export let ws: WebSocket;
export function sendMsg(msg: ClientMsg) {
  ws.send(JSON.stringify(msg))
}

export function startWebSocket(initMsg: { [key: string]: string }) {
  ws = new WebSocket('ws://localhost:3000');
  ws.onopen = () => {
    console.log('opened', initMsg)
    ws.send(JSON.stringify(initMsg))
    // sendFunc = ws.send.bind(ws)
  }

  ws.onmessage = (ws) => {
    const msg: ServerMsg = JSON.parse(ws.data)
    console.log('NEW MESSAGE', msg)
    document.body.innerHTML = '';
    document.body.appendChild(renderOpts[msg.status](msg))
  }
}
