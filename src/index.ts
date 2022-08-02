import { Template } from './template'
import { Token } from './token'
import { Player } from './player'
import type { Fee } from './type'
import * as health from './health'
import * as request from './request'

export type GameInstance = {
  ownerId: string;
  name: string;
  desc: string;
  image: string;
  blockchain: number;
  escrow: string;
  royalty: number;
  stardustFee: number;
  news: null;
  id: number;
  fees: Fee[];
  bucketName: string;
}

export class Game {
  template: Template
  player: Player
  token: Token
  health: typeof health
  constructor(protected apikey: string) {
    this.template = new Template(apikey)
    this.player = new Player(apikey)
    this.token = new Token(apikey)
    this.health = health
  }
  async get() {
    return request.core<Game>(this.apikey, 'get', 'game/get')
  }
}
