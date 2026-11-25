class Destination {
  constructor(x, y) {
    this.position = createVector(x, y);
  }

  draw() {
    fill(0)
    noStroke()
    ellipse(this.position.x, this.position.y, 10, 10);
  }
}
