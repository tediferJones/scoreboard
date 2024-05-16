import { setQueryParam, getTag as t, sendFunc } from '@/lib/utils';
import { ServerMsg } from '@/types';

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
      t('p', { textContent: player.username }, [
        t('button', {
          textContent: `is ready? ${player.ready}`,
          onclick: (e: any) => {
            console.log(e, 'send ready state')
            sendFunc('hello')
          }
        })
      ])
    ),
  ])
}
