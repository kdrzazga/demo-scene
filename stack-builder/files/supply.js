class SupplyStack {
  constructor(sampleCard, count) {
    this.sampleCard = sampleCard;
    this.count = count;
  }

  get name() {
    return this.sampleCard.name;
  }

  get cost() {
    return this.sampleCard.cost;
  }

  get type() {
    return this.sampleCard.type;
  }

  isEmpty() {
    return this.count <= 0;
  }
}

class Supply {
  constructor(stacks) {
    this.stacks = stacks;
  }

  stackByName(name) {
    return this.stacks.find(stack => stack.name === name);
  }

  emptyStackCount() {
    let empties = 0;
    for (const stack of this.stacks) {
      if (stack.isEmpty()) {
        empties++;
      }
    }
    return empties;
  }
}
