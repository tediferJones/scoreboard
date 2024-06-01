import { ServerMsg } from '@/types';
import { sendMsg, getTag as t } from '@/lib/utils';
import scoreTable from '@/components/scoreTable';
import basicGameInfo from '@/components/basicGameInfo';
import scoreInput from '@/components/scoreInput';

export default function threeFiveEight(msg: ServerMsg) {
  const currentPlayer = msg.players.find(player => player.username === msg.username)!;
  const orderedPlayers = msg.players;
  const handCount = [8, 5, 3];
  const offset = (msg.currentRound - 1) % 3;
  const currentRoundOrder = orderedPlayers.slice(offset).concat(orderedPlayers.slice(0, offset));
  const needToPickTrump = (
    msg.players.map(player => player.chosenTrumps.length)
    .reduce((total, count) => total + count) < msg.currentRound
  );

  if (!msg.gameInfo.extraData.trumpOpts) throw Error('cant find trump options');
  if (!msg.gameInfo.extraData.maxRound) throw Error('cant find maxRound')

  return t('div', { className: 'showOutline flex flex-col gap-4 items-center' }, [
    basicGameInfo({
      currentRound: msg.currentRound,
      gameType: msg.gameType,
      rules: msg.gameInfo.rules,
    }),
    t('div', { className: 'flex flex-wrap gap-4 justify-center showOutline'},
      currentRoundOrder.map((player, i) => {
        return t('div', { textContent: `${handCount[i]}: ${player.username}` })
      })
    ),
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
    scoreTable({
      orderedPlayers,
      currentRound: msg.currentRound,
      currentUser: currentPlayer.username,
      maxRound: msg.gameInfo.extraData.maxRound,
    }),
    t('div', { className: 'showOutline' }, [
      msg.currentRound > msg.gameInfo.extraData.maxRound
        ? t('h1', { textContent: 'GAME OVER', className: 'font-bold text-xl' }) :
        needToPickTrump && currentRoundOrder[0].username === msg.username
          ? t('div', { className: 'grid grid-cols-2 gap-4' }, [
            t('div', { textContent: 'Choose trump suit for this round', className: 'col-span-2' }),
            ...msg.gameInfo.extraData?.trumpOpts.map(suit => {
              return t('button', {
                textContent: suit,
                disabled: currentPlayer?.chosenTrumps.includes(suit),
                className: `text-3xl ${currentPlayer?.chosenTrumps.includes(suit) ? 'blur-sm' : 'secondary' }`,
                onclick: () => sendMsg({ action: 'trump', suit }),
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
              : scoreInput(),
    ])
  ])
}
