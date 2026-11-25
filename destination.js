class Destination {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.zealot = false
    this.value = 0;
    this.illnesses = 0;
  }

  receive_cargo(cargo, agent) {
    if (cargo === 0) {
      this.illnesses++;
    }

    if (this.zealot) return;

    // learn from the agents
    this.value = lerp(this.value, agent.value, HUMAN_SOCIAL_STEP);

    if (cargo === 0) {
      this.value = lerp(this.value, 1, EPISTEMIC_RATE);
    }
  }
}
