import { sendMsg, setQueryParam, getTag as t, ws } from '@/lib/utils';
import { ClientMsg, ServerMsg } from '@/types';

export default function waiting(msg: ServerMsg) {
  const { minPlayers, maxPlayers } = msg.gameInfo;
  const requiredPlayers = minPlayers === maxPlayers ? minPlayers : `${minPlayers} - ${maxPlayers}`;
  setQueryParam({ gameCode: msg.gameCode })
  const joinUrl = window.location.href;

  return t('div', { className: 'showOutline flex flex-col gap-4 col-span-3 items-center' }, [
    t('h1', { textContent: 'Waiting...', className: 'text-xl' }),
    t('h1', { textContent: `${msg.gameType} requires ${requiredPlayers} players` }),
    t('h1', { textContent: 'Game Code:', className: 'flex flex-wrap gap-2' }, [
      t('a', { textContent: msg.gameCode, href: joinUrl, className: 'underline' }),
    ]),
    ...msg.players.map(player => 
      t('div', { className: 'flex gap-4 w-full' }, [
        t('p', { textContent: player.username, className: 'text-center my-auto flex-1' }),
        t('button', {
          textContent: player.ready ? '✓' : '✘',
          onclick: player.username !== msg.username ? undefined : (e: any) => {
            const gameCode = new URL(window.location.href).searchParams.get('gameCode');
            sendMsg({
              action: 'ready',
              gameCode: gameCode || undefined,
              username: player.username,
              userId: msg.userId,
            })
          }
        })
      ])
    ),
  ])
}
