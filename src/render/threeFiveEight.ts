import { ServerMsg, SocketData } from '@/types';
import { getValById, sendMsg, getTag as t } from '@/lib/utils';

export default function threeFiveEight(msg: ServerMsg) {
  const currentPlayer = msg.players.find(player => player.username === msg.username);
  const orderedPlayers = msg.players.reduce((ordered, playerData) => {
    ordered[playerData.position - 1] = playerData;
    return ordered;
  }, [] as SocketData[])
  const handCount = [8, 5, 3];
  const offset = (msg.currentRound - 1) % 3;
  const currentRoundOrder = orderedPlayers.slice(offset).concat(orderedPlayers.slice(0, offset));
  const needToPickTrump = (
    msg.players.map(player => player.chosenTrumps.length)
    .reduce((total, count) => total + count) < msg.currentRound
  )
  console.log('need to pick trump?:', needToPickTrump)

  if (!msg.gameInfo.extraData?.trumpOpts) throw Error('cant find trump options');

  return t('div', { className: 'showOutline flex flex-col gap-4 items-center w-11/12 sm:w-4/5 mx-auto' }, [
    t('h1', { textContent: 'Playing:' + msg.gameType }),
    t('a', {
      textContent: 'View Rules',
      href: msg.gameInfo.rules,
      className: 'underline',
    }),
    t('p', { textContent: `Current Round: ${msg.currentRound}` }),
    t('div', { className: 'flex flex-col gap-4'}, currentRoundOrder.map((player, i) => {
      return t('div', { textContent: `${handCount[i]}: ${player.username}` })
    })),
    t('table', { className: 'w-full'}, [
      t('tr', {}, [
        t('th', { className: 'w-1/3' }),
        ...msg.gameInfo.extraData?.trumpOpts.map(suit => (
          t('th', { textContent: suit, className: 'text-2xl' })
        )) || []
      ]),
      ...orderedPlayers.map(player => {
        return t('tr', { className: msg.username !== player.username ? '' : 'bg-gray-100' }, [
          t('td', { textContent: player.username, className: 'p-1 text-center truncate max-w-0' }),
          ...msg.gameInfo.extraData?.trumpOpts.map(suit => {
            return t('td', {
              textContent: '✘',
              className: `text-center text-red-500 px-2 ${player.chosenTrumps.includes(suit) ? '' : 'text-transparent'}`,
            })
          }) || []
        ])
      })
    ]),
    t('table', { className: 'w-full' }, [
      t('tr', {}, [
        t('th', { textContent: 'Round #', className: 'border' }),
        ...orderedPlayers.map(player => {
          return t('th', { className: `border px-4 ${msg.username !== player.username ? '' : 'bg-gray-100'}` }, [
            t('div', { className: 'flex sm:flex-row flex-col justify-center items-center' }, [
              t('p', { textContent: player.username, className: 'text-center flex-1 break-all' }),
              t('div', { className: `my-auto rounded-full h-4 w-4 ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}` })
            ])
          ])
          // return t('td', { textContent: player.username, className: `p-1 text-center truncate max-w-0 border ${msg.username !== player.username ? '' : 'bg-gray-100'}` }, [
          //   t('div', { className: `my-auto rounded-full h-4 w-4 ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}` })
          // ])
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
    needToPickTrump && currentRoundOrder[0].username === msg.username
      ? t('div', { className: 'grid grid-cols-2 gap-4' }, [
        t('div', { textContent: 'Choose trump suit for this round', className: 'col-span-2' }),
        ...msg.gameInfo.extraData?.trumpOpts.map(suit => {
          return t('button', {
            textContent: suit,
            // disabled: true,
            disabled: currentPlayer?.chosenTrumps.includes(suit),
            className: `text-3xl ${currentPlayer?.chosenTrumps.includes(suit) ? 'bg-gray-400' : ''}`,
            onclick: () => {
              sendMsg({
                action: 'trump',
                suit,
                username: msg.username,
                userId: msg.userId,
                gameCode: msg.gameCode,
              })
            }
          })
        })
      ]
      ) : needToPickTrump && currentRoundOrder[0].username !== msg.username
        ? t('div', { textContent: 'Waiting for trump to be chosen' })
        : currentPlayer && currentPlayer.score.length === msg.currentRound
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
    // t('div', { textContent: JSON.stringify(msg) })
  ])
}
