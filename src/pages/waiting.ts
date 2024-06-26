import { fromCamelCase, sendMsg, getTag as t } from '@/lib/utils';
import { ServerMsg } from '@/types';

export default function waiting(msg: ServerMsg<'waiting'>) {
  const { minPlayers, maxPlayers } = msg.gameInfo;
  const requiredPlayers = minPlayers === maxPlayers ? minPlayers : `${minPlayers} - ${maxPlayers}`;
  console.log('Ordered players:', msg.players)

  const joinUrl = new URL(window.location.href);
  joinUrl.searchParams.delete('username');

  return t('div', { className: 'showOutline flex flex-col gap-4 col-span-3 items-center' }, [
    t('h1', { textContent: 'Waiting...', className: 'text-xl' }),
    t('h1', { textContent: `${fromCamelCase(msg.gameType)} requires ${requiredPlayers} players` }),
    t('h1', { textContent: 'Game Code:', className: 'flex flex-wrap gap-2' }, [
      t('a', {
        textContent: msg.gameCode,
        href: joinUrl.toString(),
        className: 'underline',
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
    ]),
    ...msg.players.map(player => 
      t('div', { className: `showOutline flex gap-4 w-full ${player.username !== msg.username ? '' : 'secondary'}` }, [
        t('p', { textContent: player.username, className: 'text-center my-auto flex-1' }),
        t('div', { className: 'flex flex-col'}, player.username !== msg.username ? [] : [
          t('button', {
            textContent: '↥',
            className: 'py-0 bg-transparent border-2 border-b-0 rounded-b-none',
            onclick: () => sendMsg({ action: 'position', position: -1 }),
          }),
          t('button', {
            textContent: '↧',
            className: 'py-0 bg-transparent border-2 rounded-t-none',
            onclick: () => sendMsg({ action: 'position', position: 1 }),
          }),
        ]),
        t('button', {
          textContent: player.ready ? '✓' : '✘',
          className: `text-xl ${player.ready ? 'bg-green-500' : 'bg-red-500'}`,
          onclick: () => player.username === msg.username && sendMsg({ action: 'ready' })
        })
      ])
    ),
  ])
}
