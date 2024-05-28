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
  // gameInfo: GameInfo<ActiveGame['gameType']>,
  gameInfo: GameInfo,
  gameCode: string,
  errorMsg?: string,
  currentRound: number,
  closeTimeout?: Timer,
}

export interface GameInfo {
  minPlayers: number,
  maxPlayers: number,
  rules: string,
  maxRound: number,
  extraData?: {
    trumpOpts?: string[],
    currentTrump?: string,
    roundGoal?: string[],
  },
}

// export type AllGameInfo = { [key in GameTypes]: GameInfo<GameData[key]> }
// 
// type GameData = {
//   threeFiveEight: {
//     trumpOpts: string[],
//     currentTrump?: string,
//   }
//   shanghai: {
//     roundGoal: string[]
//   }
// }

// export interface GameInfo<T> {
//   minPlayers: number,
//   maxPlayers: number,
//   rules: string,
//   maxRound: number,
//   extraData: T,
// }

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
  score?: number,
}

// type ClientActions = 'start' | 'join' | 'position' | 'ready' | 'score' | 'trump'
// type Client<T> = {
//   action: ClientActions
// } & ClientActions[]

// export type ClientMsg = ({
//   action: 'start',
//   username: string,
//   gameType: string,
// } | {
//   action: 'join',
//   username: string,
//   gameType: string,
// } | {
//   action: 'position',
//   position: 1 | -1,
// }) & StrObj;

// type ClientActions = 'start' | 'join' | 'position' | 'ready' | 'score' | 'trump'
// type ClientMsg<T> = {
//   action: ClientActions,
//   []
// }

// export type RequireProp<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
