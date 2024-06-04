import { ServerMsg } from '@/types';
import { getTag as t } from '@/lib/utils';
import basicGameInfo from '@/components/basicGameInfo';
import scoreTable from '@/components/scoreTable';
import scoreInput from '@/components/scoreInput';

export default function thousand(msg: ServerMsg<'thousand'>) {
  const currentPlayer = msg.players.find(player => player.username === msg.username)!;
  return t('div', { className: 'showOutline flex flex-col gap-4 items-center' }, [
    basicGameInfo({
      currentRound: msg.currentRound,
      gameType: msg.gameType,
      rules: msg.gameInfo.rules,
    }),
    scoreTable({
      orderedPlayers: msg.players,
      currentRound: msg.currentRound,
      currentUser: currentPlayer.username,
      maxRound: msg.gameInfo.extraData.maxRound,
    }),
    msg.currentRound > msg.gameInfo.extraData.maxRound
      ? t('h1', { textContent: 'GAME OVER', className: 'font-bold text-xl' })
      : scoreInput()
  ])
}
