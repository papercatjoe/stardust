# Stardust.gg

interact with the stardust api over http using your favorite language - javascript! (typescript too!)

```bash
npm i stardust.gg
yarn add stardust.gg
```

## Stardust dashboard setup

To hit the stardust api directly a few items must be completed.
- login to stardust
- create a game (preferrably an isolated one - called test) on polygon
- create an api key
- copy the api key into your `.env` file under `STARDUST_APIKEY`
- create a template called test
- copy the template id into your `.env` file under `TEMPLATE_ID`

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
