import { getValById, randStr, startWebSocket, getTag as t } from '@/lib/utils';
import { ServerMsg } from '@/types';

export default function getUsername(msg: ServerMsg) {
  const gameCode = new URL(window.location.href).searchParams.get('gameCode')
  return t('form', { className: 'showOutline p-4 flex flex-col gap-4' }, [
    t('p', { textContent: `Game Code: ${gameCode}`, className: 'text-center' }),
    t('p', { className: `text-center text-red-500 ${msg.errorMsg ? 'block' : 'hidden'}`, textContent: msg.errorMsg }),
    t('form', { className: 'flex flex-wrap gap-4' }, [
      t('label', { textContent: 'Username:', htmlFor: 'username' }),
      t('input', {
        className: 'flex-1',
        id: 'username',
        type: 'text',
        maxLength: '8',
        required: true,
        value: /*'testUser-' + */randStr(8),
      }),
      t('button', {
        textContent: 'Join Game',
        className: 'w-full',
        onclick: (e: any) => {
          e.preventDefault();
          startWebSocket({
            action: 'join',
            gameCode: gameCode!,
            username: getValById('username'),
          });
        }
      })
    ]),
  ])
}
