import { ServerWebSocket } from 'bun';

export interface SocketData {
  username: string,
  score: number[],
  ready: boolean,
  gameCode: string,
  isConnected: boolean,
  position: number,
  chosenTrumps: string[],
}

export type ClientSocket = ServerWebSocket<SocketData>

export type GameTypes = 'threeFiveEight' | 'shanghai'

export interface ActiveGame {
  status: 'home' | 'getUsername' | 'waiting' | 'error' | GameTypes,
  players: { [key: string]: ClientSocket },
  gameType: GameTypes,
  gameInfo: GameInfo,
  gameCode: string,
  errorMsg?: string,
  currentRound: number,
  closeTimeout?: NodeJS.Timeout,
}

export interface GameInfo {
  minPlayers: number,
  maxPlayers: number,
  rules: string,
  maxRound: number,
  extraData?: {
    trumpOpts?: string[],
    currentTrump?: string,
  },
}

export interface ServerMsg extends Omit<ActiveGame, 'players'> {
  players: SocketData[],
  userId: string,
  username: string,
}

export interface StrObj {
  // [key: string]: string | undefined
  [key: string]: number | string | undefined
}

export interface ClientMsg extends StrObj {
  action: 'start' | 'join' | 'position' | 'ready' | 'score' | 'trump',
  username: string,
  userId: string,
  gameType?: GameTypes,
  gameCode?: string,
  position?: 1 | -1,
  suit?: string,
}

export type RequireProp<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
