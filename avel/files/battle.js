class Battle extends Emitter {
  constructor(hero, monster, options) {
    super();
    const settings = options || {};
    this.hero = hero;
    this.monster = monster;
    this.random = settings.random || Math.random;
    this.diceFactory = settings.diceFactory || new DiceFactory(DICE_FACES);
    this.maxClashes = settings.maxClashes || 3;
    this.clashNumber = 0;
    this.phase = BattlePhase.READY;
    this.heroDice = [];
    this.monsterDice = [];
    this.spellChoices = {};
    this.availableRerolls = this.hero.rerollTokens.slice();
    this.lastResult = null;
    this.outcome = null;
    this.reward = null;
    this.heroAlsoStunned = false;
  }

  rollClash() {
    if (this.phase !== BattlePhase.READY) {
      return;
    }
    this.clashNumber += 1;
    this.spellChoices = {};
    this.heroDice = this.buildHeroDice();
    this.monsterDice = this.buildMonsterDice();
    for (const die of this.heroDice) {
      die.roll(this.random);
    }
    for (const die of this.monsterDice) {
      die.roll(this.random);
    }
    this.autoAssignSpells();
    this.phase = BattlePhase.ROLLED;
    this.emit('changed');
  }

  buildHeroDice() {
    let colors = this.hero.battleDiceColors();
    if (this.monster.attribute) {
      colors = this.monster.applyAttributeToHeroColors(colors);
    }
    return this.diceFactory.createMany(colors);
  }

  buildMonsterDice() {
    return this.diceFactory.createMany(this.monster.rollColors());
  }

  autoAssignSpells() {
    this.heroDice.forEach((die, index) => {
      if (die.result === BattleSymbol.SPELL) {
        this.spellChoices[index] = BattleSymbol.ATTACK;
      }
    });
  }

  setSpellChoice(index, choice) {
    if (this.phase !== BattlePhase.ROLLED) {
      return;
    }
    const die = this.heroDice[index];
    if (die && die.result === BattleSymbol.SPELL) {
      this.spellChoices[index] = choice;
      this.emit('changed');
    }
  }

  toggleSpellChoice(index) {
    const current = this.spellChoices[index];
    const next = current === BattleSymbol.ATTACK ? BattleSymbol.DEFENSE : BattleSymbol.ATTACK;
    this.setSpellChoice(index, next);
  }

  canReroll(index) {
    if (this.phase !== BattlePhase.ROLLED) {
      return false;
    }
    const die = this.heroDice[index];
    if (!die) {
      return false;
    }
    return this.availableRerolls.indexOf(die.color) >= 0;
  }

  reroll(index) {
    if (!this.canReroll(index)) {
      return;
    }
    const die = this.heroDice[index];
    const position = this.availableRerolls.indexOf(die.color);
    this.availableRerolls.splice(position, 1);
    die.roll(this.random);
    if (die.result === BattleSymbol.SPELL && this.spellChoices[index] === undefined) {
      this.spellChoices[index] = BattleSymbol.ATTACK;
    }
    this.emit('changed');
  }

  resolvedHeroSymbols() {
    return this.heroDice.map((die, index) => {
      if (die.result === BattleSymbol.SPELL) {
        return this.spellChoices[index] || BattleSymbol.ATTACK;
      }
      return die.result;
    });
  }

  resolveClash() {
    if (this.phase !== BattlePhase.ROLLED) {
      return;
    }
    const heroSymbols = this.resolvedHeroSymbols();
    const monsterSymbols = this.monsterDice.map(die => die.result);
    const result = computeClash(heroSymbols, monsterSymbols);
    this.monster.takeWounds(result.woundsToMonster);
    this.hero.takeWounds(result.woundsToHero);
    this.lastResult = result;
    if (this.monster.isDefeated()) {
      this.finish(BattleOutcome.MONSTER_DEFEATED);
    } else if (this.hero.isStunned()) {
      this.finish(BattleOutcome.HERO_STUNNED);
    } else if (this.clashNumber >= this.maxClashes) {
      this.finish(BattleOutcome.ENDED_UNDEFEATED);
    } else {
      this.phase = BattlePhase.RESOLVED;
      this.emit('changed');
    }
  }

  continueBattle() {
    if (this.phase !== BattlePhase.RESOLVED) {
      return;
    }
    this.phase = BattlePhase.READY;
    this.emit('changed');
  }

  retreat() {
    if (this.phase !== BattlePhase.RESOLVED) {
      return;
    }
    this.finish(BattleOutcome.ENDED_UNDEFEATED);
  }

  finish(outcome) {
    this.outcome = outcome;
    this.phase = BattlePhase.FINISHED;
    if (outcome === BattleOutcome.MONSTER_DEFEATED) {
      this.reward = this.monster.reward;
      this.heroAlsoStunned = this.hero.isStunned();
    }
    this.emit('changed');
    this.emit('finished', { outcome: outcome, reward: this.reward });
  }
}
