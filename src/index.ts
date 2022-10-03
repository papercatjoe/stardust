import { Template } from './template'
import { Token } from './token'
import { Player } from './player'
import type { GameInstance } from './type'
import * as request from './request'
import * as health from './health'

export * from './config'
export * from './health'
export * from './player'
export * from './request'
export * from './template'
export * from './token'
export * from './type'
export * from './utils'

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
  get() {
    return request.core<GameInstance>(this.apikey, 'get', 'game/get')
  }
}
