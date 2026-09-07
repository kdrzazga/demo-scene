class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  create() {
    this.centerX = 600;
    this.hero = new Hero({ name: 'Gileada', maxToughness: 5, rerollTokens: [DieColor.GREEN] });
    this.monsterFactory = new MonsterFactory();
    this.lastRewardMessage = null;
    this.layer = this.add.container(0, 0);
    this.add.text(this.centerX, 24, 'CHRONICLES OF AVEL — BATTLE', {
      fontFamily: 'monospace', fontSize: '20px', color: '#7fd7ff'
    }).setOrigin(0.5);
    this.beginBattle(this.monsterFactory.create('small', 0));
  }

  beginBattle(monster) {
    this.monster = monster;
    this.lastRewardMessage = null;
    this.battle = new Battle(this.hero, monster);
    this.battle.on('changed', () => this.render());
    this.battle.on('finished', info => this.onFinished(info));
    this.render();
  }

  beginBattleForKind(kind) {
    this.beginBattle(this.monsterFactory.random(kind, Math.random));
  }

  onFinished(info) {
    if (info.outcome === BattleOutcome.MONSTER_DEFEATED && info.reward) {
      this.lastRewardMessage = applyReward(this.hero, info.reward, Math.random);
    }
    this.render();
  }

  render() {
    this.layer.removeAll(true);
    this.renderSetup();
    this.renderMonster();
    this.renderClashInfo();
    this.renderHeroDice();
    this.renderControls();
    this.renderHeroPanel();
    this.renderLegend();
  }

  addButton(x, y, label, callback, options) {
    const button = new Button(this, x, y, label, callback, options);
    this.layer.add(button);
    return button;
  }

  addText(x, y, text, size, color, originX) {
    const label = this.add.text(x, y, text, { fontFamily: 'monospace', fontSize: size + 'px', color: color });
    label.setOrigin(originX === undefined ? 0.5 : originX, 0.5);
    this.layer.add(label);
    return label;
  }

  renderSetup() {
    this.addButton(455, 66, 'New Small', () => this.beginBattleForKind('small'), { width: 140 });
    this.addButton(600, 66, 'New Big', () => this.beginBattleForKind('big'), { width: 140 });
    this.addButton(745, 66, 'New Beast', () => this.beginBattleForKind('beast'), { width: 140 });
  }

  renderMonster() {
    const monster = this.monster;
    this.addText(this.centerX, 108, monster.name, 20, '#f2c6c6');
    const info = monster.kind.toUpperCase() + '  ·  ' + monster.color + '  ·  Toughness '
      + monster.remainingToughness() + ' / ' + monster.toughness;
    this.addText(this.centerX, 134, info, 15, '#c9d3dd');
    if (this.showRolled(this.battle.monsterDice)) {
      this.renderDiceRow(this.battle.monsterDice.map(die => ({ dieColor: die.color, symbol: die.result })), 186);
    } else {
      this.renderDiceRow(monster.rollColors().map(color => ({ dieColor: color, faceDown: true })), 186);
    }
  }

  showRolled(dice) {
    return dice.length > 0 && this.battle.phase !== BattlePhase.READY;
  }

  renderClashInfo() {
    const battle = this.battle;
    this.addText(this.centerX, 250, 'Clash ' + Math.max(1, battle.clashNumber) + ' / ' + battle.maxClashes, 16, '#9fb2c4');
    if (battle.lastResult && (battle.phase === BattlePhase.RESOLVED || battle.phase === BattlePhase.FINISHED)) {
      const line = 'You dealt ' + battle.lastResult.woundsToMonster + '   ·   took ' + battle.lastResult.woundsToHero;
      this.addText(this.centerX, 276, line, 15, '#e0e6ec');
    }
  }

  renderHeroDice() {
    const battle = this.battle;
    const y = 330;
    if (this.showRolled(battle.heroDice)) {
      const descriptors = battle.heroDice.map((die, index) => {
        const isSpell = die.result === BattleSymbol.SPELL;
        const symbol = isSpell ? (battle.spellChoices[index] || BattleSymbol.ATTACK) : die.result;
        const clickable = isSpell && battle.phase === BattlePhase.ROLLED;
        return {
          dieColor: die.color,
          symbol: symbol,
          spell: isSpell,
          onClick: clickable ? () => battle.toggleSpellChoice(index) : null
        };
      });
      this.renderDiceRow(descriptors, y, (index, x) => {
        if (battle.phase === BattlePhase.ROLLED && battle.canReroll(index)) {
          this.addButton(x, y + 46, 'reroll', () => battle.reroll(index), { width: 76, height: 22 });
        }
      });
    } else {
      this.renderDiceRow(this.heroPreviewColors().map(color => ({ dieColor: color, faceDown: true })), y);
    }
  }

  heroPreviewColors() {
    let colors = this.hero.battleDiceColors();
    if (this.monster.attribute) {
      colors = this.monster.applyAttributeToHeroColors(colors);
    }
    return colors;
  }

  renderDiceRow(descriptors, y, perDieExtra) {
    const size = 54;
    const spacing = size + 16;
    const startX = this.centerX - ((descriptors.length - 1) * spacing) / 2;
    descriptors.forEach((descriptor, index) => {
      const x = startX + index * spacing;
      const dieView = new DieView(this, x, y, {
        dieColor: descriptor.dieColor,
        symbol: descriptor.symbol,
        faceDown: descriptor.faceDown,
        spell: descriptor.spell,
        onClick: descriptor.onClick,
        size: size
      });
      this.layer.add(dieView);
      if (perDieExtra) {
        perDieExtra(index, x);
      }
    });
  }

  renderControls() {
    const battle = this.battle;
    const y = 430;
    if (battle.phase === BattlePhase.READY) {
      this.addButton(this.centerX, y, 'Roll clash', () => battle.rollClash(), { width: 190 });
    } else if (battle.phase === BattlePhase.ROLLED) {
      this.addButton(this.centerX, y, 'Resolve clash', () => battle.resolveClash(), { width: 190 });
      this.addText(this.centerX, y + 34, 'Gold-badge dice: click to switch hit / block', 13, '#8a94a0');
    } else if (battle.phase === BattlePhase.RESOLVED) {
      this.addButton(this.centerX - 100, y, 'Continue', () => battle.continueBattle(), { width: 150 });
      this.addButton(this.centerX + 100, y, 'Retreat', () => battle.retreat(), { width: 150 });
    } else if (battle.phase === BattlePhase.FINISHED) {
      this.renderFinished(y);
    }
    if (this.canRest()) {
      this.addButton(1065, 66, 'Rest +2', () => this.rest(), { width: 120 });
    }
  }

  renderFinished(y) {
    const battle = this.battle;
    let message = 'Monster survived — its damage is kept.';
    let color = '#e6c86a';
    if (battle.outcome === BattleOutcome.MONSTER_DEFEATED) {
      message = battle.heroAlsoStunned ? 'Victory! (but you were stunned)' : 'Victory!';
      color = '#8ede8e';
    } else if (battle.outcome === BattleOutcome.HERO_STUNNED) {
      message = 'You were stunned!';
      color = '#ff8a8a';
    }
    this.addText(this.centerX, y, message, 18, color);
    if (this.lastRewardMessage) {
      this.addText(this.centerX, y + 26, this.lastRewardMessage, 14, '#cfe0f0');
    }
    if (battle.outcome === BattleOutcome.HERO_STUNNED) {
      this.addButton(this.centerX, y + 58, 'Recover', () => this.recover(), { width: 170 });
    } else if (battle.outcome === BattleOutcome.ENDED_UNDEFEATED) {
      this.addButton(this.centerX, y + 58, 'Fight again', () => this.beginBattle(this.monster), { width: 170 });
    }
  }

  canRest() {
    const battle = this.battle;
    if (battle.phase === BattlePhase.FINISHED) {
      return true;
    }
    return battle.phase === BattlePhase.READY && battle.clashNumber === 0;
  }

  rest() {
    this.hero.heal(2);
    this.render();
  }

  recover() {
    this.hero.fullHeal();
    this.hero.coins = 0;
    if (this.hero.bonusDice.length > 0) {
      this.hero.bonusDice.pop();
    }
    this.beginBattleForKind('small');
  }

  renderHeroPanel() {
    const y = 540;
    this.addText(this.centerX, y, this.hero.name, 18, '#cfe0f0');
    this.renderHearts(y + 30);
    this.addText(this.centerX, y + 62, 'Coins: ' + this.hero.coins, 15, '#e6c84f');
    const rerolls = this.battle.availableRerolls.length > 0 ? this.battle.availableRerolls.join(', ') : 'none';
    this.addText(this.centerX, y + 86, 'Rerolls available: ' + rerolls, 14, '#9fb2c4');
  }

  renderHearts(y) {
    const total = this.hero.maxToughness;
    const spacing = 30;
    const startX = this.centerX - ((total - 1) * spacing) / 2;
    for (let index = 0; index < total; index++) {
      const filled = index < this.hero.toughness;
      const heart = this.add.rectangle(startX + index * spacing, y, 20, 20, filled ? 0xd85a5a : 0x39424c);
      heart.setStrokeStyle(2, 0x10141a);
      this.layer.add(heart);
    }
  }

  renderLegend() {
    const y = 770;
    const items = [
      { symbol: BattleSymbol.ATTACK, label: 'hit' },
      { symbol: BattleSymbol.DEFENSE, label: 'block' },
      { symbol: BattleSymbol.SPELL, label: 'choose' }
    ];
    const spacing = 150;
    const startX = this.centerX - ((items.length - 1) * spacing) / 2;
    items.forEach((item, index) => {
      const x = startX + index * spacing;
      const swatch = new DieView(this, x - 22, y, { dieColor: null, symbol: item.symbol, size: 32 });
      this.layer.add(swatch);
      this.addText(x + 6, y, item.label, 14, '#9fb2c4', 0);
    });
  }
}
