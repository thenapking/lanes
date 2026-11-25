class Destination {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.zealot = random() < 0.2;
    this.value = 0;
  }

  receive_cargo(cargo) {
    if (this.zealot) return;

    if (cargo === 0) {
      this.value = lerp(this.value, 1, EPISTEMIC_RATE);
    }
  }

  draw() {
    fill(0)
    noStroke()
    ellipse(this.position.x, this.position.y, 10, 10);
  }
}
