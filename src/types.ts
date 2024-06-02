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

export type Errors = 'refresh' | 'badUsername'

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
  }
}

export interface ActiveGame<T extends GameTypes> {
  status: Pages
  players: { [key: string]: ClientSocket },
  gameType: GameTypes,
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
  [key in GameTypes]: {
    status: Pages
    players: { [key: string]: ClientSocket },
    gameType: key,
    gameCode: string,
    errorMsg?: string,
    currentRound: number,
    closeTimeout?: Timer,
    gameInfo: {
      minPlayers: number,
      maxPlayers: number,
      rules: string,
      extraData: AllExtraData[key],
    }
  }
}[GameTypes]

// export interface ServerMsg extends Omit<Omit<AnyExtraData, 'players'>, 'status'> {
export interface ServerMsg extends Omit<Omit<ActiveGameOLD, 'players'>, 'status'> {
  status: Pages | Errors,
  players: Omit<SocketData, 'userId'>[],
  userId: string,
  username: string,
}

export interface ActiveGameOLD {
  status: Pages
  players: { [key: string]: ClientSocket },
  gameType: GameTypes,
  gameInfo: GameInfoOLD,
  gameCode: string,
  errorMsg?: string,
  currentRound: number,
  closeTimeout?: Timer,
}

export interface GameInfoOLD {
  minPlayers: number,
  maxPlayers: number,
  rules: string,
  extraData: {
    trumpOpts?: string[],
    currentTrump?: string,
    roundGoal?: string[],
    maxScore?: number,
    maxRound?: number,
  },
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
    suit: string
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
