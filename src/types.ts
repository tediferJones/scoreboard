import { ServerWebSocket } from 'bun';

export interface SocketData {
  username: string,
  score: number,
  ready: boolean,
}

export type ClientSocket = ServerWebSocket<SocketData>

export type GameTypes = '3-5-8' | 'shanghai'

export interface ActiveGame {
  status: 'waiting' | 'running' | 'error' | 'home' | 'getUsername'
  // players: ClientSocket[],
  players: { [key: string]: ClientSocket }
  gameType: GameTypes,
  gameInfo: GameInfo
  gameCode: string,
  errorMsg?: string,
}

export interface GameInfo {
  minPlayers: number,
  maxPlayers: number,
}

export interface ServerMsg extends Omit<ActiveGame, 'players'> {
  players: SocketData[],
  userId: string,
  username: string,
}

export interface StrObj {
  [key: string]: string | undefined
}

export interface ClientMsg extends StrObj {
  action: 'start' | 'join' | 'ready',
  username: string,
  gameType?: GameTypes,
  gameCode?: string,
  userId: string,
}

export type RequireProp<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
