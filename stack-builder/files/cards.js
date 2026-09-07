class Card {
  constructor(name, cost, type) {
    this.name = name;
    this.cost = cost;
    this.type = type;
  }

  isTreasure() {
    return this.type === CardType.TREASURE;
  }

  isVictory() {
    return this.type === CardType.VICTORY;
  }

  isAction() {
    return this.type === CardType.ACTION;
  }

  playableDuring(phase) {
    return false;
  }

  play(game) {
  }

  victoryPoints() {
    return 0;
  }

  describe() {
    return '';
  }
}

class TreasureCard extends Card {
  constructor(name, cost, power) {
    super(name, cost, CardType.TREASURE);
    this.power = power;
  }

  playableDuring(phase) {
    return phase === Phase.BUY;
  }

  play(game) {
    game.addPurchasingPower(this.power);
  }

  describe() {
    return '+' + this.power + ' power';
  }
}

class VictoryCard extends Card {
  constructor(name, cost, points) {
    super(name, cost, CardType.VICTORY);
    this.points = points;
  }

  victoryPoints() {
    return this.points;
  }

  describe() {
    return this.points + ' VP';
  }
}

class ActionCard extends Card {
  constructor(name, cost) {
    super(name, cost, CardType.ACTION);
  }

  playableDuring(phase) {
    return phase === Phase.ACTION;
  }
}

class BronzeCard extends TreasureCard {
  constructor() {
    super('Bronze', 0, 1);
  }
}

class SilverCard extends TreasureCard {
  constructor() {
    super('Silver', 3, 2);
  }
}

class GoldCard extends TreasureCard {
  constructor() {
    super('Gold', 6, 3);
  }
}

class EstateCard extends VictoryCard {
  constructor() {
    super('Estate', 2, 1);
  }
}

class DuchyCard extends VictoryCard {
  constructor() {
    super('Duchy', 5, 3);
  }
}

class ProvinceCard extends VictoryCard {
  constructor() {
    super('Province', 8, 6);
  }
}

class TwoActionsCard extends ActionCard {
  constructor() {
    super('TwoActions', 3);
  }

  play(game) {
    game.addActions(2);
  }

  describe() {
    return '+2 actions';
  }
}

class CardFactory {
  constructor() {
    this.constructors = {
      Bronze: BronzeCard,
      Silver: SilverCard,
      Gold: GoldCard,
      Estate: EstateCard,
      Duchy: DuchyCard,
      Province: ProvinceCard,
      TwoActions: TwoActionsCard
    };
  }

  create(name) {
    const CardClass = this.constructors[name];
    return new CardClass();
  }

  names() {
    return Object.keys(this.constructors);
  }
}
