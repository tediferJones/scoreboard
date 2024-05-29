import { ServerMsg } from '@/types';
import { getValById, sendMsg, getTag as t } from '@/lib/utils';
import scoreTable from '@/components/scoreTable';
import basicGameInfo from '@/components/basicGameInfo';

export default function shanghai(msg: ServerMsg) {
  // return t('h1', { textContent: 'Shanghai game is running' })
  console.log(msg)
  const currentPlayer = msg.players.find(player => player.username === msg.username)!;
  return t('div', { className: 'showOutline flex flex-col gap-4 items-center' }, [
    basicGameInfo({
      currentRound: msg.currentRound,
      gameType: msg.gameType,
      rules: msg.gameInfo.rules,
    }),
    t('div', {
      textContent: `Goal: ${msg.gameInfo.extraData?.roundGoal?.[msg.currentRound - 1]}`,
      className: `showOutline ${msg.currentRound > msg.gameInfo.maxRound ? 'hidden' : 'block'}`
    }),
    scoreTable({
      orderedPlayers: msg.players,
      currentUser: msg.username,
      currentRound: msg.currentRound,
      maxRound: msg.gameInfo.maxRound,
    }),
    t('div', { className: 'showOutline' }, [
      msg.currentRound > msg.gameInfo.maxRound
        ? t('h1', { textContent: 'GAME OVER', className: 'font-bold text-xl' })
        : currentPlayer.score.length === msg.currentRound
          ? t('p', {
            textContent: 'Waiting for other players to add their score for this round',
            className: 'text-center',
          })
          : t('div', { className: 'flex gap-4 justify-center'}, [
            t('label', { textContent: 'Score:', htmlFor: 'score', className: 'w-1/3' }),
            t('input', { type: 'number', id: 'score', value: '0', className: 'w-1/3', /*inputMode: 'numeric'*/ }),
            t('button', { textContent: 'Submit', className: 'w-1/3', onclick: () => {
              console.log('submit score')
              sendMsg({
                action: 'score',
                score: Number(getValById('score')),
                username: msg.username,
                userId: msg.userId,
                // gameCode: msg.gameCode,
              })
            }})
          ])
    ])
  ])
}
