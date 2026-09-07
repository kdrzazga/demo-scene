class DiceFactory {
  constructor(faceTable) {
    this.faceTable = faceTable || DICE_FACES;
  }

  create(color) {
    return new Die(color, this.faceTable[color]);
  }

  createMany(colors) {
    return colors.map(color => this.create(color));
  }
}
