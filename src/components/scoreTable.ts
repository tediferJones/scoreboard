import { sendMsg, getTag as t } from '@/lib/utils';
import { SocketData } from '@/types';

export default function scoreTable({
  orderedPlayers,
  currentUser,
  currentRound,
  maxRound,
}: {
  orderedPlayers: Omit<SocketData, 'userId'>[],
  currentUser: string,
  currentRound: number,
  maxRound: number,
}) {
  return t('div', { className: 'w-full overflow-x-auto'}, [
    t('table', { className: 'w-full table-auto' }, [
      t('tr', {}, [
        t('td', { textContent: '' }),
        ...orderedPlayers.map(player => {
          return t('td', {
            textContent: player.username,
            className: `text-sm ${currentUser !== player.username ? '' : 'secondary'} ${player.isConnected ? '' : 'text-red-500'}`
          })
        })
      ]),
      ...[...Array(currentRound > maxRound ? maxRound : currentRound).keys()].map(i => {
        return t('tr', {} , [
          t('td', { textContent: `${i + 1}`, className: 'font-semibold w-1/6' }),
          ...orderedPlayers.map(player => {
            const elementId = `cell-${player.username}-${i}`;
            const scoreIsValid = typeof(player.score[i]) === 'number'
            let isOpen = false;
            return t('td', {
              textContent: scoreIsValid ? `${player.score[i]}` : 'X',
              className: `border text-center ${currentUser !== player.username ? '' : 'secondary'}`,
              id: elementId,
              ondblclick: () => {
                if (!isOpen && scoreIsValid && currentUser === player.username) {
                  console.log('held down for 2 seconds')
                  isOpen = true;
                  const element: HTMLTableCellElement | null = document.querySelector(`#${elementId}`)
                  if (element) {
                    element.innerText = '';
                    element.appendChild(
                      t('input', {
                        type: 'number',
                        className: 'w-16',
                        value: player.score[i],
                        autofocus: true,
                        onblur: (e) => {
                          console.log('submit fixed score')
                          sendMsg({
                            action: 'fixScore',
                            fixedScore: Number((e.currentTarget as HTMLInputElement).value),
                            index: i
                          })
                          isOpen = false;
                        }
                      })
                    )
                  }
                }
              },
            })
          })
        ])
      }),
      t('tr', {}, [
        t('td', { textContent: 'Total', className: 'font-semibold' }),
        ...orderedPlayers.map(player => {
          return t('td', {
            textContent: `${player.score.reduce((total, round) => total += round, 0)}`,
            className: `font-semibold ${currentUser !== player.username ? '' : 'secondary'}`
          })
        })
      ])
    ]),
  ])
}
