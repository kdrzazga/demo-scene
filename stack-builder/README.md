# Stack Builder

A small single-player **deck-building** game built with [Phaser 3.55.2](https://phaser.io/) and plain
JavaScript (no bundler, no modules). It is a simplified take on *Dominion*: you start with a weak deck of
ten cards, use it to generate purchasing power, and buy stronger cards that get shuffled back into your
deck over time.

The Phaser runtime is shared from the sibling folder `../common/phaser.min.js`, matching the convention of
every other project in `demo-scene`.

---

## Gameplay

You begin with **10 cards**: 7 `Bronze` (treasure) and 3 `Estate` (victory). Each turn you draw a hand of
**5 cards** and spend three resources:

| Resource | Start of turn | Meaning |
| --- | --- | --- |
| `actions` | 1 | How many action cards you may play |
| `purchasingPower` | 0 | Coins available to buy cards (built up by playing treasures) |
| `numberOfBuys` | 1 | How many cards you may buy |

A turn has two phases:

1. **Action phase** — play action cards (each costs one action). `TwoActions` grants `+2 actions`. Press
   **End Actions** to move on (the phase also ends automatically if `actions` reaches 0). If the hand holds
   no action card — as in the opening turns, before you buy any — this phase is skipped and you begin in the
   buy phase.
2. **Buy phase** — play treasure cards to raise `purchasingPower`, then buy up to `numberOfBuys` cards, each
   costing no more than your current `purchasingPower`. Buying a card spends its cost.

Pressing **End Turn** runs cleanup: every card you played and every card left unplayed in your hand goes to
the discard pile; resources reset; you draw a fresh hand of 5. When the draw pile can't fill a hand, the
discard pile is shuffled and becomes the new draw pile.

The game ends when the **Province** pile is emptied, or when any **3 supply piles** are emptied. Your score
is the total victory points across your whole deck (draw + hand + discard + in-play).

### Card set

The supply holds **10 of each** card type.

| Card | Type | Cost | Effect |
| --- | --- | --- | --- |
| `Bronze` | treasure | 0 | +1 purchasing power |
| `Silver` | treasure | 3 | +2 purchasing power |
| `Gold` | treasure | 6 | +3 purchasing power |
| `Estate` | victory | 2 | 1 VP |
| `Duchy` | victory | 5 | 3 VP |
| `Province` | victory | 8 | 6 VP |
| `TwoActions` | action | 3 | +2 actions |

---

## Running

The project is static; plain `<script>` tags work over `file://`, so you can open `index.html` directly.
To serve it instead:

```bash
cd D:/code/demo-scene/stack-builder
python -m http.server 8000
```

- Game: `http://localhost:8000/`
- Engine tests: `http://localhost:8000/test.html`

---

## Architecture

The code is split into two layers with a hard boundary between them:

- **Engine** — pure game logic and rules. It never references `Phaser` and can run in any JavaScript
  environment (that is what `test.html` exercises).
- **Presentation** — Phaser scenes and game objects. It reads engine state, renders it, and forwards player
  input back to the engine as intents.

They communicate one way for state and one way for intents:

```
  player input (clicks)
        |
        v
  GameScene  --intents-->  Game (engine)
        ^                     |
        |                     | emits 'changed' / 'gameOver'
        +----- re-render -----+
```

The engine extends a tiny `Emitter`. After any state change it emits a `changed` event; `GameScene`
subscribes and simply rebuilds the visible cards from the current state. This keeps rendering dumb and
correct — there is no incremental view state to fall out of sync.

### Load order

There is no module system; every file defines global classes and is loaded in dependency order by
`index.html`:

```
../common/phaser.min.js   (Phaser first: view classes extend Phaser.*)
constants.js              (CardType, Phase)
emitter.js                (Emitter — Game extends it)
cards.js                  (Card hierarchy + CardFactory)
pile.js                   (Pile)
player.js                 (Player — uses Pile)
supply.js                 (Supply, SupplyStack)
game.js                   (Game — uses everything above)
cardView.js               (CardView — extends Phaser container)
button.js                 (Button — extends Phaser container)
gameScene.js              (GameScene — extends Phaser scene)
main.js                   (config + Phaser.Game boot)
```

---

## Directory structure

```
stack-builder/
├── index.html            Game page; loads Phaser + all engine/view scripts
├── test.html             Engine unit-test runner (no Phaser)
├── test.js               The engine test suite
├── README.md             This file
└── files/
    ├── constants.js      CardType and Phase enums
    ├── emitter.js        Minimal event emitter
    ├── cards.js          Card class hierarchy + CardFactory
    ├── pile.js           Pile: an ordered stack of cards
    ├── player.js         Player: the three piles + turn resources
    ├── supply.js         Supply and SupplyStack: the shop
    ├── game.js           Game: turn state machine and rules
    ├── cardView.js       CardView: a rendered card (Phaser container)
    ├── button.js         Button: a clickable UI button (Phaser container)
    ├── gameScene.js      GameScene: layout, input, rendering
    └── main.js           Game configuration + Phaser boot
```

---

## File reference

### Engine layer

#### `files/constants.js`
Two frozen enum objects shared across the engine and view.

- `CardType` — `TREASURE`, `VICTORY`, `ACTION`.
- `Phase` — `ACTION`, `BUY`.

Kept as top-level constants (not class fields) so both layers can reference them without importing anything.

#### `files/emitter.js`
`Emitter` — a minimal publish/subscribe base class so the engine can notify the view without depending on
Phaser.

- `on(eventName, handler)` — register a listener; returns `this` for chaining.
- `emit(eventName, payload)` — call every listener registered for that event.

#### `files/cards.js`
The card model as an OOP hierarchy plus a factory. Each card knows how to play itself (`play(game)`), which
keeps card behaviour out of the `Game` class.

Base and category classes:

- `Card(name, cost, type)` — common fields and defaults. Helpers `isTreasure()`, `isVictory()`,
  `isAction()`. Overridable hooks: `playableDuring(phase)` (default `false`), `play(game)` (default no-op),
  `victoryPoints()` (default `0`), `describe()` (default `''`).
- `TreasureCard(name, cost, power)` — playable during the **buy** phase; `play()` adds `power` to
  `purchasingPower`.
- `VictoryCard(name, cost, points)` — never playable; contributes `points` to the score.
- `ActionCard(name, cost)` — playable during the **action** phase.

Concrete cards (each a one-line subclass fixing its stats):
`BronzeCard`, `SilverCard`, `GoldCard`, `EstateCard`, `DuchyCard`, `ProvinceCard`, `TwoActionsCard`
(`TwoActionsCard.play()` grants `+2 actions`).

Factory:

- `CardFactory` — holds a `name → constructor` registry built in its constructor. `create(name)` returns a
  fresh card instance; `names()` lists the registered names. Used to mint the starting deck, the supply, and
  every purchased card.

#### `files/pile.js`
`Pile` — an ordered list of cards used for all three piles plus the in-play area.

- `count` (getter), `isEmpty()`
- `add(card)`, `addAll(cards)`
- `drawTop()` — remove and return the top card
- `remove(card)` — remove a specific card by identity
- `takeAll()` — empty the pile and return its cards
- `shuffle()` — in-place Fisher–Yates shuffle
- `totalVictoryPoints()` — sum of `victoryPoints()` over the cards

#### `files/player.js`
`Player` — owns the player's cards and current turn resources. Created with the starting deck, which it
shuffles into `drawPile`.

Piles: `drawPile` (the "unused" pile), `hand`, `discardPile`, `playArea`.
Resources: `actions`, `purchasingPower`, `numberOfBuys`.

- `reshuffleDiscardIntoDraw()` — move the discard pile into the draw pile and shuffle it.
- `drawOne()` — draw the top card into the hand, reshuffling the discard first if the draw pile is empty;
  returns `null` if no cards remain anywhere.
- `drawCards(amount)` — draw up to `amount` cards (fewer if both piles run dry).
- `moveToPlayArea(card)` — move a card from the hand into the play area.
- `discardHandAndPlayArea()` — cleanup: send the leftover hand and the played cards to the discard pile.
- `totalVictoryPoints()` — score across all four piles.

#### `files/supply.js`
The shop the player buys from.

- `SupplyStack(sampleCard, count)` — one buyable stack. Holds a `sampleCard` (used for its `name`, `cost`,
  and `type` via getters, and for display) plus a remaining `count`. `isEmpty()` reports an exhausted stack.
- `Supply(stacks)` — the collection of stacks. `stackByName(name)` looks one up; `emptyStackCount()` counts
  exhausted stacks (used for the end-game check).

#### `files/game.js`
`Game extends Emitter` — the turn state machine and the single source of truth for the rules. Holds the
injected `config`, the `factory`, the `player`, the `supply`, the current `turn` number, the current `phase`,
and a `finished` flag.

Setup:

- `buildStartingCards()` — expand `config.startingDeck` into card instances.
- `buildSupply()` — build one `SupplyStack` per `config.supply` entry.
- `resetTurnResources()` — reset `actions` / `purchasingPower` / `numberOfBuys` to their configured starts.
- `phaseForNewHand()` — pick the phase after a hand is drawn: the action phase if a playable action card is
  in hand, otherwise the buy phase (so turns with no action cards skip straight to buying).

Effects invoked by cards:

- `addActions(amount)`, `addPurchasingPower(amount)`, `addBuys(amount)`.

Intents (each validates, mutates state, then emits `changed`):

- `canPlay(card)` / `playCard(card)` — play an action (spends one action) or a treasure, moving it to the
  play area and applying its effect. Auto-advances to the buy phase if actions reach 0.
- `playAllTreasures()` — convenience: play every treasure in hand (buy phase only).
- `canBuy(stack)` / `buyCard(stack)` — buy a card: decrement the stack, spend a buy and the card's cost,
  put a fresh copy on the discard pile, then run the end-game check.
- `endActionPhase()` — leave the action phase for the buy phase.
- `endTurn()` — run cleanup, reset resources, draw a new hand, advance the turn, return to the action phase.
- `checkGameEnd()` — if Province is empty or 3 piles are empty, set `finished` and emit `gameOver` with
  `{ score, turns }`.

Events emitted: `changed` (after every state change) and `gameOver`.

### Presentation layer

#### `files/cardView.js`
`CardView extends Phaser.GameObjects.Container` — the visual for a single card, built from primitives (no
image assets). Colour-coded by type: treasure = gold, victory = green, action = blue.

Constructed as `new CardView(scene, x, y, card, options)` where `options` may contain:

- `onClick` — callback fired on click (omit to make the card non-interactive).
- `dimmed` — draw a dark overlay and skip interactivity (used for cards that can't be played/bought now).
- `countLabel` — a small label under the card (used to show supply stack counts, e.g. `x10`).

`build()` assembles the background, name, cost badge, type label, effect text, and optional count/overlay,
and wires hover/click when interactive.

#### `files/button.js`
`Button extends Phaser.GameObjects.Container` — a labelled, clickable UI button with hover feedback.

- `new Button(scene, x, y, label, onClick)`
- `setEnabled(enabled)` — toggle interactivity and recolour to an enabled/disabled style. A disabled button
  ignores clicks.

#### `files/gameScene.js`
`GameScene extends Phaser.Scene` — the only scene. Builds the engine, lays out the screen, and re-renders on
engine events. The engine instance is stored as `this.engine` (Phaser already owns `this.game`).

- `create()` — construct the `Game`, create the card layer, build static UI, subscribe to `changed` and
  `gameOver`, and do the first render.
- `buildStaticUi()` — the HUD text, the section labels, and the three buttons (**End Actions**,
  **Play Treasures**, **End Turn**), created once.
- `render()` — clear and rebuild all card views, then refresh the HUD and button states. Called on every
  `changed` event.
- `renderSupply()` / `renderHand()` — draw the supply row and the hand, dimming cards that fail
  `canBuy` / `canPlay` and wiring the rest to the matching intent.
- `renderPlayArea()` — draw the cards played this turn, scaled down.
- `renderPiles()` — draw the face-down draw and discard stacks with their counts.
- `updateHud()` — refresh the turn / phase / resources readout.
- `updateButtons()` — enable each button only when its action is currently legal.
- `showGameOver(payload)` — dim the screen and show the final score and turn count.

### Entry point and tests

#### `files/main.js`
- `buildConfig()` — returns the injected game configuration: the `CardFactory`, `handSize`, the starting
  resource values, the `startingDeck`, and the `supply` composition. Configuration lives here rather than
  inside the engine classes, so rules and tuning are changed in one place.
- `STACK_CONFIG` — the built config, read by `GameScene`.
- The `Phaser.Game` boot: 1200×800, mounted on `#game`, running `GameScene`.

#### `index.html`
The game page. Loads Phaser from `../common/phaser.min.js`, then every engine and view script in dependency
order, then `main.js`.

#### `test.html` and `test.js`
A headless check of the engine only (it loads the engine scripts but **not** Phaser). `test.js` exposes
`runTests()`, which plays a scripted turn and asserts on setup, phase transitions, treasure math, buying,
cleanup, and the end condition. `test.html` runs it and prints a pass/fail list with a summary. This is the
fastest way to verify a rules change without touching the UI.

---

## Configuration

All tuning is data in `buildConfig()` (`files/main.js`):

```js
{
  factory: new CardFactory(),
  handSize: 5,
  startingActions: 1,
  startingPurchasingPower: 0,
  startingBuys: 1,
  startingDeck: [ { name: 'Bronze', count: 7 }, { name: 'Estate', count: 3 } ],
  supply: [ { name: 'Bronze', count: 10 }, ... ]
}
```

Change starting resources, hand size, the opening deck, or the supply here without editing the engine.

---

## Events

| Event | Emitted by | Payload | Meaning |
| --- | --- | --- | --- |
| `changed` | `Game` | none | State changed; the view should re-render |
| `gameOver` | `Game` | `{ score, turns }` | End condition reached |

Subscribe with `game.on('changed', handler)`.

---

## Extending: adding a card

1. In `files/cards.js`, subclass the right category and fix its stats, overriding `play(game)` and
   `describe()` if it has an effect. Example:

   ```js
   class MarketCard extends ActionCard {
     constructor() { super('Market', 5); }
     play(game) { game.addActions(1); game.addBuys(1); game.addPurchasingPower(1); }
     describe() { return '+1 action +1 buy +1 power'; }
   }
   ```

2. Register it in `CardFactory` (`this.constructors`) under its name.
3. Add it to the `supply` list in `buildConfig()` so it can be bought.

Because the view renders from card data and type, no changes to `CardView` or `GameScene` are needed.

An effect the current engine has no helper for (for example drawing cards) needs a one-line passthrough on
`Game` first, e.g. `drawCards(amount) { this.player.drawCards(amount); }`, which the card's `play(game)` can
then call.

---

## Conventions

- Vanilla global-class style with ordered `<script>` tags — no bundler or ES modules, matching the rest of
  `demo-scene`.
- The engine is Phaser-free and unit-testable on its own.
- Configuration is injected through the constructor, not stored as class-level state.
