# Eagle Eye — Spot the Difference

[![Spot the difference game](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Rahullpc/best-spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Rahullpc/best-spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game that runs offline in a desktop browser, built for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

Two near-identical pictures side by side — find the differences. Three hand-drawn scenes (City Park, Kitchen, Beach), 8 differences each, with markers on every find, a counter of how many remain, a timer, hints, and sounds.

## Play

Serve it locally and open it in a desktop browser:

```sh
node serve.ts
# open http://localhost:8080
```

Click a difference on either picture. Keyboard: `H` hint, `M` mute, `R` restart, `Enter` continue.

## Files

- `game/` — the playable game as static files (`index.html` + ES modules, no network requests)
- `screenshots/` — 3–4 real renders of the game
- `main.ts` — hands the game in (copies `game/` and `screenshots/` to `/output`, writes `dossier.json`)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
