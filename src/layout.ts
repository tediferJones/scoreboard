import { getTag as t } from '@/lib/utils';

export default function layout(children: HTMLElement) {
  let holdTimeout: Timer;
  window.addEventListener('mousedown', () => {
    console.log('down')
    holdTimeout = setTimeout(() => {
      console.log('held down for 5 seconds')
    }, 5000)
  })

  window.addEventListener('mouseup', () => {
    console.log('up')
    clearTimeout(holdTimeout)
  })

  return t('div', { className: 'min-h-screen flex flex-col' }, [
    t('div', { className: 'flex justify-between items-center px-8 py-4 border-b' }, [
      t('a', { textContent: 'Scoreboard', className: 'text-xl font-semibold', href: '/' }),
      t('button', {
        textContent: '🌗︎',
        className: 'secondary',
        onclick: (e) => {
          e.preventDefault()
          const theme = window.localStorage.getItem('theme')
          const newTheme = theme === 'dark' ? 'light' : 'dark';
          if (theme) document.documentElement.classList.remove(theme);
          document.documentElement.classList.add(newTheme);
          window.localStorage.setItem('theme', newTheme);
        }
      }),
    ]),
    t('div', { className: 'flex-1 flex justify-center items-center sm:w-4/5 w-11/12 mx-auto my-8' }, [children])
  ])
}
