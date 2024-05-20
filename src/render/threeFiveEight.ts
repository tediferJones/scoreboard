import { ServerMsg, SocketData } from '@/types';
import { getValById, sendMsg, getTag as t } from '@/lib/utils';

export default function threeFiveEight(msg: ServerMsg) {
  const currentPlayer = msg.players.find(player => player.username === msg.username);
  const orderedPlayers = msg.players.reduce((ordered, playerData) => {
    ordered[playerData.position - 1] = playerData;
    return ordered;
  }, [] as SocketData[])

  return t('div', { className: 'showOutline flex flex-col gap-4 items-center w-4/5 mx-auto' }, [
    t('h1', { textContent: 'Playing:' + msg.gameType }),
    t('a', {
      textContent: 'View Rules',
      href: msg.gameInfo.rules,
      className: 'underline',
    }),
    t('p', { textContent: `Current Round: ${msg.currentRound}` }),
    t('table', { className: 'w-11/12' }, [
      t('tr', {}, [
        t('th', { textContent: 'Round #', className: 'border' }),
        ...orderedPlayers.map(player => {
          return t('th', { className: `border px-4 ${msg.username !== player.username ? '' : 'bg-gray-100'}` }, [
            t('div', { className: 'flex' }, [
              t('p', { textContent: player.username, className: 'text-center flex-1' }),
              t('div', { className: `my-auto rounded-full h-4 w-4 ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}` })
            ])
          ])
        })
      ]),
      ...[...Array(msg.currentRound - 1).keys()].map(i => {
        return (t('tr', {} , [
          t('td', { textContent: `Round ${i + 1}`, className: 'border text-center font-semibold' }),
          ...orderedPlayers.map(player => {
            return t('td', {
              textContent: player.score[i] !== undefined ? player.score[i] : 'X',
              className: `border text-center ${msg.username !== player.username ? '' : 'bg-gray-100'}`
            })
          })
        ]))
      }),
      t('tr', {}, [
        t('td', { textContent: 'Total', className: 'border text-center font-semibold' }),
        ...orderedPlayers.map(player => {
          return t('td', {
            textContent: player.score.slice(0, msg.currentRound - 1).reduce((total, round) => total += round, 0),
            className: `border text-center font-semibold ${msg.username !== player.username ? '' : 'bg-gray-100'}`
          })
        })
      ])
    ]),
    currentPlayer && currentPlayer.score.length === msg.currentRound
      ? t('p', { textContent: 'Waiting for other players to add their score for this round' })
      : t('div', { className: 'flex flew-wrap gap-4'}, [
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
