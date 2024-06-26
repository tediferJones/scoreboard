import {
  getTag as t,
  getValById,
  startWebSocket,
  validateInputs,
  randStr
} from '@/lib/utils';
import { GameTypes, ServerMsg } from '@/types';

export default function home(msg: ServerMsg<'home'>) {
  return t('form', { className: 'showOutline grid grid-cols-3 gap-4', id: 'initForm' }, [
    t('div', { className: `${msg.errorMsg ? 'text-red-500 col-span-3 text-center' : 'hidden'}`, textContent: msg.errorMsg }),
    t('label', { textContent: 'Username:', htmlFor: 'username' }),
    t('input', {
      className: 'col-span-2',
      id: 'username',
      type: 'text',
      maxLength: '8',
      required: true,
      value: randStr(8),
    }),
    t('hr', { className: 'col-span-3' }),
    t('label', { textContent: 'Game Type:', htmlFor: 'gameType' }),
    t('select', { id: 'gameType' }, [
      t('option', { textContent: '3-5-8', value: 'threeFiveEight' }),
      t('option', { textContent: 'Shanghai', value: 'shanghai' }),
      t('option', { textContent: 'Thousand', value: 'thousand' }),
    ]),
    t('button', {
      textContent: 'Create',
      id: 'startGame',
      className: 'secondary',
      onclick: (e) => {
        e.preventDefault();
        if (validateInputs('initForm', ['username', 'gameType'])) {
          startWebSocket({
            action: 'start',
            gameType: getValById('gameType') as GameTypes,
            username: getValById('username'),
            gameCode: '',
          })
        }
      }
    }),
    t('label', { textContent: 'Game Code:', htmlFor: 'gameCode' }),
    t('input', { id: 'gameCode', type: 'text', maxLength: '5' }),
    t('button', {
      textContent: 'Join',
      id: 'joinGame',
      className: 'secondary',
      onclick: (e) => {
        e.preventDefault();
        if (validateInputs('initForm', ['gameCode', 'username'])) {
          startWebSocket({
            action: 'join',
            gameCode: getValById('gameCode'),
            username: getValById('username'),
          });
        }
      }
    }),
  ])
}
