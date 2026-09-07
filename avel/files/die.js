class Die {
  constructor(color, faces) {
    this.color = color;
    this.faces = faces;
    this.result = null;
  }

  roll(random) {
    const index = Math.floor(random() * this.faces.length);
    this.result = this.faces[index];
    return this.result;
  }

  isHeroic() {
    return this.color === DieColor.GREEN
      || this.color === DieColor.BLUE
      || this.color === DieColor.YELLOW
      || this.color === DieColor.ORANGE;
  }
}
