import { ServerMsg } from '@/types';
import { getValById, sendMsg, getTag as t } from '@/lib/utils';

export default function threeFiveEight(msg: ServerMsg) {
  const roundCount = msg.players[0].score.length;
  return t('div', { className: 'showOutline flex flex-col gap-4 items-center w-4/5 mx-auto' }, [
    t('h1', { textContent: 'Playing:' + msg.gameType }),
    t('table', { className: 'w-4/5'}, [
      t('tr', {}, [
        t('th', { textContent: 'Round #', className: 'border' }),
        ...msg.players.map(player => {
          return t('th', { textContent: player.username, className: 'border' })
        })
      ]),
      ...msg.players[0].score.map((_, i) => {
        return (t('tr', {} , [
          t('td', { textContent: `Round ${i + 1}`, className: 'border text-center font-semibold' }),
          ...msg.players.map(player => {
            return t('td', {
              textContent: player.score[i] !== undefined ? player.score[i] : 'X',
              className: 'border text-center'
            })
          })
        ]))
      }),
      t('tr', {}, [
        t('td', { textContent: 'Total', className: 'border text-center font-semibold' }),
        ...msg.players.map(player => {
          return t('td', {
            textContent: player.score.reduce((total, round) => total += round, 0),
            className: 'border text-center font-semibold'
          })
        })
      ])
    ]),
    t('div', { className: 'flex flew-wrap gap-4'}, [
      t('label', { textContent: 'Score:', for: 'score' }),
      t('input', { type: 'number', id: 'score', value: '0' }),
      t('button', { textContent: 'Submit', onclick: () => {
        console.log('submit score')
        sendMsg({
          action: 'score',
          score: getValById('score'),
          username: msg.username,
          userId: msg.userId,
          gameCode: msg.gameCode,
        })
      }})
    ]),
    t('div', { textContent: JSON.stringify(msg) })
  ])
}
