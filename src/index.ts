import { Template } from './template'
import { Token } from './token'
import { Player } from './player'
import type { GameInstance } from './type'
import * as request from './request'
import * as health from './health'

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
    return request.core<GameInstance>(this.apikey, 'get', 'game/get')
  }
}
