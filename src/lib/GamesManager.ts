import {
  ActiveGame,
  GameInfo,
  GameTypes
} from '@/types';

export class GamesManager {
  activeGames: { [key: string]: ActiveGame }
  gameTypes: { [key in GameTypes]: GameInfo }

  constructor() {
    this.activeGames = {};
    this.gameTypes = {
      '3-5-8': {
        minPlayers: 3,
        maxPlayers: 3,
      },
      'shanghai': {
        minPlayers: 2,
        maxPlayers: 8,
      }
    };
  }
}
