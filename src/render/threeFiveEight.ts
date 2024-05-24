import { ServerMsg, SocketData } from '@/types';
import { fromCamelCase, getValById, sendMsg, getTag as t } from '@/lib/utils';

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

  return t('div', { className: 'showOutline flex flex-col gap-4 items-center w-11/12 sm:w-4/5 mx-auto my-8' }, [
    t('div', { className: 'flex flex-wrap gap-4 justify-center showOutline' }, [
      t('p', { textContent: `Current Round: ${msg.currentRound}` }),
      t('h1', { textContent: `Game: ${fromCamelCase(msg.gameType)}` }),
      t('a', {
        textContent: 'View Rules',
        href: msg.gameInfo.rules,
        className: 'underline',
      })
    ]),
    t('div', { className: 'flex flex-wrap gap-4 justify-center showOutline'}, currentRoundOrder.map((player, i) => {
      return t('div', { textContent: `${handCount[i]}: ${player.username}` })
    })),
    t('div', { className: 'showOutline flex gap-2 items-center', }, [
      t('p', { textContent: 'Trump Suit:' }),
      t('p', { textContent: msg.gameInfo.extraData.currentTrump, className: 'text-2xl' })
    ]),
    t('table', { className: 'w-full table-auto text-xl' }, [
      t('tr', {}, [
        t('td'),
        ...msg.gameInfo.extraData.trumpOpts.map(suit => (
          t('td', { textContent: suit })
        ))
      ]),
      ...orderedPlayers.map(player => {
        return t('tr', { className: msg.username !== player.username ? '' : 'secondary' }, [
          t('td', { textContent: player.username, className: 'text-sm' }),
          ...msg.gameInfo.extraData?.trumpOpts?.map(suit => {
            return t('td', {
              textContent: '✘',
              className: `text-red-500 px-0 ${player.chosenTrumps.includes(suit) ? '' : 'text-transparent'}`,
            })
          }) || []
        ])
      })
    ]),
    t('div', { className: 'w-full overflow-x-auto'}, [
      t('table', { className: 'w-full table-auto' }, [
        t('tr', {}, [
          t('td', { textContent: '' }),
          ...orderedPlayers.map(player => {
            return t('td', {
              textContent: player.username,
              className: `text-sm ${msg.username !== player.username ? '' : 'secondary'} ${player.isConnected ? '' : 'text-red-500'}`
            })
          })
        ]),
        ...[...Array(msg.currentRound).keys()].map(i => {
          return (t('tr', {} , [
            t('td', { textContent: i + 1, className: 'font-semibold w-1/6' }),
            ...orderedPlayers.map(player => {
              return t('td', {
                textContent: player.score[i] !== undefined ? player.score[i] : 'X',
                className: `border text-center ${msg.username !== player.username ? '' : 'secondary'}`
              })
            })
          ]))
        }),
        t('tr', {}, [
          t('td', { textContent: 'Total', className: 'font-semibold' }),
          ...orderedPlayers.map(player => {
            return t('td', {
              textContent: player.score.slice(0, msg.currentRound - 1).reduce((total, round) => total += round, 0),
              className: `font-semibold ${msg.username !== player.username ? '' : 'secondary'}`
            })
          })
        ])
      ]),
    ]),
    t('div', { className: 'showOutline' }, [
      needToPickTrump && currentRoundOrder[0].username === msg.username
        ? t('div', { className: 'grid grid-cols-2 gap-4' }, [
          t('div', { textContent: 'Choose trump suit for this round', className: 'col-span-2' }),
          ...msg.gameInfo.extraData?.trumpOpts.map(suit => {
            return t('button', {
              textContent: suit,
              disabled: currentPlayer?.chosenTrumps.includes(suit),
              className: `text-3xl ${currentPlayer?.chosenTrumps.includes(suit) ? 'blur-sm' : 'secondary' }`,
              onclick: () => {
                sendMsg({
                  action: 'trump',
                  suit,
                  username: msg.username,
                  userId: msg.userId,
                  // gameCode: msg.gameCode,
                })
              }
            })
          })
        ]
        ) : needToPickTrump && currentRoundOrder[0].username !== msg.username
          ? t('div', { textContent: 'Waiting for trump to be chosen' })
          : currentPlayer && currentPlayer.score.length === msg.currentRound
            ? t('p', {
              textContent: 'Waiting for other players to add their score for this round',
              className: 'text-center',
            })
            : t('div', { className: 'flex gap-4 justify-center'}, [
              t('label', { textContent: 'Score:', htmlFor: 'score', className: 'w-1/3' }),
              t('input', { type: 'number', id: 'score', value: '0', className: 'w-1/3' }),
              t('button', { textContent: 'Submit', className: 'w-1/3', onclick: () => {
                console.log('submit score')
                sendMsg({
                  action: 'score',
                  score: getValById('score'),
                  username: msg.username,
                  userId: msg.userId,
                  // gameCode: msg.gameCode,
                })
              }})
            ]),
    ])
  ])
}
