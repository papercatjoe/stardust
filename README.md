# Stardust.gg

interact with the stardust api over http using your favorite language - javascript! (typescript too!)

```bash
npm i stardust.gg
yarn add stardust.gg
```

## Create a game

```ts
// game.ts
import * as stardust from 'stardust.gg'
export const game = new stardust.Game('API_KEY_HERE')
```

## Reference the game you created

```ts
// app.ts
import { game } from './game'
main()
  .catch(console.error)

async function main() {
  await game.health.check() // { data: { status: 'OK' } }
  const { data: gameInstance } = await game.get()
  const { data: player } = await game.player.get('PLAYER_ID_HERE')
}
```
