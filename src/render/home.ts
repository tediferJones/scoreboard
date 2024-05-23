import {
  getTag as t,
  getValById,
  startWebSocket,
  validateInputs,
  randStr
} from '@/lib/utils';

export default function home() {
  return t('form', { className: 'showOutline w-4/5 grid grid-cols-3 gap-4', id: 'initForm' }, [
    t('button', {
      textContent: '🌗︎',
      onclick: (e: any) => {
        e.preventDefault()
        console.log('toggle theme')
        const theme = window.localStorage.getItem('theme')
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        if (theme) document.documentElement.classList.remove(theme);
        document.documentElement.classList.add(newTheme);
        window.localStorage.setItem('theme', newTheme);
      }
    }),
    t('h1', { textContent: 'Scoreboard', className: 'text-xl text-center col-span-3' }),
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
    t('select', { id: 'gameType', value: '' }, [
      t('option', { textContent: '3-5-8', value: 'threeFiveEight' }),
      t('option', { textContent: 'Shanghai', value: 'shanghai' }),
    ]),
    t('button', {
      textContent: 'Create Game',
      id: 'startGame',
      className: 'secondary',
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
    t('label', { textContent: 'Join Code:', htmlFor: 'joinCode' }),
    t('input', { id: 'joinCode', type: 'text', maxLength: '5' }),
    t('button', {
      textContent: 'Join Game',
      id: 'joinGame',
      className: 'secondary',
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
}
