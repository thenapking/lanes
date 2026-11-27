class Agent {
  constructor(lane, index, length_indices) {
    this.lane = lane;
    this.index = index || 0;
    this.length_indices = length_indices;
    this.value = random();
    this.cargo = index < this.lane.max_index * 0.75 ? 1 :  random();
    this.shape = new Shape(this);
  }

  update() {
    this.index += this.lane.speed;
    this.edges();
    this.arrive();
  }

  edges() {
    this.index = constrain(this.index, 0, this.lane.max_index);
  }

  arrive() {
    if (this.index === this.lane.max_index) {
      this.index = 0;
      this.deliver();
      this.collect();
    }
  }

  collect() {
    this.cargo = this.value < 0.5 ? 0 : 1;
  }

  deliver() {
    this.lane.destination.receive_cargo(this.cargo, this);
    this.value = lerp(this.value, this.lane.destination.value, DESTINATION_STEP);
  }


  distance(other) {
    return Math.abs(this.index - other.index);
  }

  neighbours() {
    const neighbours = [];

    for (const lane of this.lane.neighbours) {
      for (const agent of lane.agents) {
        if (this.distance(agent) <= NEIGHBOUR_DISTANCE) {
          neighbours.push(agent);
        }
      }
    }

    return neighbours;
  }

  enquire() {
    const neighbours = this.neighbours();
    if (neighbours.length === 0) {
      this.next_value = this.value;
      return;
    }

    let total_value = 0;
    for (const nearby_agent of neighbours) {
      total_value += nearby_agent.value;
    }
    const average_value = total_value / neighbours.length;
    this.next_value = lerp(this.value, average_value, VALUE_STEP);
  }

  draw() {
    this.shape.draw();
  }
}
