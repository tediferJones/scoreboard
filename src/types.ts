import { ServerWebSocket } from 'bun';

export interface SocketData {
  username: string,
  score: number,
}

export type ClientSocket = ServerWebSocket<SocketData>

export interface ActiveGame {
  status: 'waiting' | 'running'
  players: ClientSocket[],
  gameType: string,
  gameInfo: GameInfo
}

export interface GameInfo {
  minPlayers: number,
  maxPlayers: number,
}

export interface ServerMsg extends Omit<ActiveGame, 'players'> {
  players: SocketData[],
  render: string,
}
