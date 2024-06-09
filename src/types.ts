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

export type Errors = 'refresh' | 'badUsername' | 'gameFull'

type AllExtraData = {
  threeFiveEight: {
    trumpOpts: string[],
    currentTrump: string,
    maxRound: number,
  },
  shanghai: {
    roundGoal: string[],
    maxRound: number,
  },
  thousand: {
    maxScore: number,
    maxRound: number,
  }
}

export interface ActiveGame<T extends GameTypes> {
  status: Pages
  players: { [key: string]: ClientSocket },
  gameType: T,
  gameInfo: {
    minPlayers: number,
    maxPlayers: number,
    rules: string,
    extraData: AllExtraData[T]
  }
  gameCode: string,
  errorMsg?: string,
  currentRound: number,
  closeTimeout?: Timer,
}

export type AnyActiveGame = {
  [key in GameTypes]: ActiveGame<key> 
}[GameTypes]

export type ErrorMsg<T extends Errors = Errors> = {
  status: T,
  errorMsg: string,
  gameCode?: string
}

export type Statuses = Pages | Errors
export type ServerMsg<T extends Statuses = Statuses> = T extends Errors ? ErrorMsg<T> : T extends GameTypes ? Fixed<T> : FixedAny
export interface Fixed<T extends GameTypes> extends Omit<ActiveGame<T>, 'players'> {
  players: Omit<SocketData, 'userId'>[],
  userId: string,
  username: string,
}

export interface FixedAny extends Omit<AnyActiveGame, 'players'> {
  players: Omit<SocketData, 'userId'>[],
  userId: string,
  username: string,
}

type ClientMsgOpts = {
  start: {
    username: string,
    gameType: GameTypes,
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
    suit: string,
  },
  fixScore: {
    fixedScore: number,
    index: number,
  }
}

export type ClientActions = keyof ClientMsgOpts;
export type ClientMsg<T extends ClientActions> = {
  action: T,
} & ClientMsgOpts[T]

export type AnyClientMsg = {
  [Action in ClientActions]: {
    action: Action
  } & ClientMsgOpts[Action]
}[ClientActions]
