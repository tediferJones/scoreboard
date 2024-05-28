import { getTag as t } from '@/lib/utils';
import { SocketData } from '@/types';

export default function scoreTable({
  orderedPlayers,
  currentUser,
  currentRound
}: {
  orderedPlayers: SocketData[],
  currentUser: string,
  currentRound: number
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
      ...[...Array(currentRound).keys()].map(i => {
        return (t('tr', {} , [
          t('td', { textContent: `${i + 1}`, className: 'font-semibold w-1/6' }),
          ...orderedPlayers.map(player => {
            return t('td', {
              textContent: player.score[i] !== undefined ? `${player.score[i]}` : 'X',
              className: `border text-center ${currentUser !== player.username ? '' : 'secondary'}`
            })
          })
        ]))
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
