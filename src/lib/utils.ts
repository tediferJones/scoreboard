import home from '@/pages/home';
import getUsername from '@/pages/getUsername';
import waiting from '@/pages/waiting';
import error from '@/pages/error';
import threeFiveEight from '@/pages/threeFiveEight';
import shanghai from '@/pages/shanghai';
import { ClientMsg, ServerMsg } from '@/types';
import layout from '@/layout';

type StrIdx = { [key: string]: any }

export function getTag(
  type: keyof HTMLElementTagNameMap,
  props?: Partial<HTMLElementTagNameMap[typeof type]> & StrIdx,
  children?: HTMLElement[]
): HTMLElementTagNameMap[typeof type] {
  const node: HTMLElementTagNameMap[typeof type] & StrIdx = document.createElement(type);
  if (props) Object.keys(props).forEach(propKey => node[propKey] = props[propKey]);
  if (children?.length) node.append(...children);
  return node;
}

export function randStr(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return [...Array(length).keys()].map(() => {
    return chars[Math.floor(Math.random() * chars.length)]
  }).join('');
}

export function getValById(id: string) {
  return (document.querySelector(`#${id}`) as HTMLInputElement).value;
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

export function fromCamelCase(str: string, isPlural?: boolean) {
  return str.split('').reduce((str, char, i) => {
    if (i === 0) return char.toUpperCase();
    if ('A' <= char && char <= 'Z') return `${str} ${char}`;
    return str + char;
  }, '') + (isPlural ? 's' : '');
}

export const pages: { [key in ServerMsg['status']]: (msg: ServerMsg) => HTMLElement } = {
  home,
  getUsername,
  waiting,
  error,
  threeFiveEight,
  shanghai,
}

export let ws: WebSocket;
export function sendMsg(msg: ClientMsg) {
  ws.send(JSON.stringify(msg))
}

export function startWebSocket(initMsg: { [key: string]: string }) {
  ws = new WebSocket(`${window.location.protocol === 'http:' ? 'ws:' : 'wss:'}//${window.location.host}`)
  ws.onopen = () => {
    console.log('opened', initMsg)
    ws.send(JSON.stringify(initMsg))
  }

  ws.onmessage = (ws) => {
    const msg: ServerMsg = JSON.parse(ws.data)
    console.log('NEW MESSAGE', msg)
    const params = new URLSearchParams(window.location.toString())
    if (msg.status !== 'error' && (!params.get('username') || !params.get('gameCode'))) {
      setQueryParam({ username: msg.username, gameCode: msg.gameCode });
    }
    document.body.innerHTML = '';
    document.body.appendChild(layout(pages[msg.status](msg)));
  }
}
