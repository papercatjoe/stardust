import * as config from './config'

import { Game } from '.'

export const ignorableTemplates = new Set<number>([
  // temporary work around for ignoring templates
  11911,
  11912,
])

export const deleteAll = config.isTestEnv ? {
  players: async (game: Game) => {
    const { data } = await game.player.getAll()
    await Promise.all(data.map(({ playerId }) => (
      game.player.remove(playerId)
    )))
  },
  templates: async (game: Game) => {
    const { data } = await game.template.getAll()
    await Promise.all(data.map(async ({ id }) => {
      if (ignorableTemplates.has(id)) {
        return
      }
      await game.template.remove(id)
    }))
  },
  tokens: async (game: Game) => {
    const { data: players } = await game.player.getAll()
    await Promise.all(players.map(async (player) => {
      const { data: equipment } = await game.player.getInventory(player.playerId)
      await game.token.burn(player.playerId, equipment)
    }))
  },
} : {
  // extra safety
  players: async () => Promise.resolve(undefined),
  templates: async () => Promise.resolve(undefined),
  tokens: async () => Promise.resolve(undefined),
}
