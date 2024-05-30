import { ServerWebSocket } from 'bun';

export interface SocketData {
  username: string,
  userId: string,
  score: number[],
  ready: boolean,
  gameCode: string,
  isConnected: boolean,
  position: number,
  chosenTrumps: string[],
}

export type ClientSocket = ServerWebSocket<SocketData>

export type GameTypes = 'threeFiveEight' | 'shanghai' | 'thousand'

export type Pages = GameTypes | 'home' | 'getUsername' | 'waiting'

export interface ActiveGame {
  // status: 'home' | 'getUsername' | 'waiting' | 'error' | 'refresh' | GameTypes,
  status: Pages | 'error' | 'refresh'
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
  extraData: {
    trumpOpts?: string[],
    currentTrump?: string,
    roundGoal?: string[],
    maxScore?: number,
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
  players: Omit<SocketData, 'userId'>[],
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

type ClientMsgTest = {
  start: {
    username: string,
    gameType: GameTypes,
    gameCode: string,
  },
  join: {
    username: string,
    gameCode: string,
  },
  position: {
    position: 1 | -1,
  },
  ready: {},
  score: {
    score: number,
  },
  trump: {
    suit: string
  }
}

export type ClientActions = keyof ClientMsgTest;
export type Test2<T extends ClientActions> = { // Name: ClientMsg
  action: T,
} & ClientMsgTest[T]

export type Test3 = { // Name: AnyClientMsg
  [Action in ClientActions]: {
    action: Action
  } & ClientMsgTest[Action]
}[ClientActions]

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
//   gameCode: string,
// } | {
//   action: 'position',
//   position: 1 | -1,
// } | {
//   action: 'ready'
// } | {
//   action: 'score',
//   score: number,
// } | {
//   action: 'trump',
//   suit: string,
// })// & StrObj;

// type ClientActions = 'start' | 'join' | 'position' | 'ready' | 'score' | 'trump'
// type ClientMsg<T> = {
//   action: ClientActions,
//   []
// }

// export type RequireProp<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
