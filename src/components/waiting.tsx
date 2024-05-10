import { ActiveGame } from '@/types';

export default function Waiting({ gameData }: { gameData: ActiveGame }) {
  console.log(gameData)
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-xl'>Waiting</h1>
      {gameData.players.map(player => {
        return <div key={player.data.username}>{player.data.username}</div>
      })}
    </div>
  )
}
