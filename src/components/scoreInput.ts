import { getValById, sendMsg, getTag as t } from '@/lib/utils';

export default function scoreInput() {
  return t('div', { className: 'flex flex-wrap gap-4 justify-center' }, [
    t('label', { textContent: 'Score:', htmlFor: 'score', className: 'flex-1' }),
    t('div', { className: 'flex flex-1' }, [
      t('button', {
        id: 'scoreSign',
        textContent: '+',
        className: 'flex justify-center items-center text-2xl aspect-square w-8 rounded-r-none secondary font-bold',
        type: 'button',
        onclick: (e) => {
          const target = e.currentTarget as HTMLButtonElement;
          target.textContent = target.textContent === '+' ? '-' : '+';
        }
      }),
      t('input', {
        type: 'number',
        id: 'score',
        // value: '0',
        className: 'w-16 rounded-l-none border-l-0',
        inputMode: 'numeric',
        min: '0'
      }),
    ]),
    t('button', {
      type: 'button',
      textContent: 'Submit',
      className: 'flex-1',
      onclick: () => {
        sendMsg({
          action: 'score',
          score: Number(getValById('score')) * 
            (document.querySelector('#scoreSign')?.textContent === '+' ? 1 : -1)
        })
      }})
  ])
}
