class Agent {
  constructor(lane, index, length) {
    this.lane = lane;
    this.length = length;
    this.index = index || 0;
    this.value = random();
    this.set_cargo();
    this.zealot = this.lane.end.zealot;
  }

  set_cargo() {
    this.cargo = this.value < 0.5 ? 0 : 1;
  }

  deliver_cargo(destination) {
    destination.receive_cargo(this.cargo);
    this.value = lerp(
      this.value,
      this.lane.end.value,
      DESTINATION_STEP
    );
  }

  update(){
    this.update_position();
    this.calculate_value();
  }

  update_position() {
    this.index += this.lane.speed;
    if (this.index > this.lane.n) {
      this.index = this.lane.n;
    }
    if (this.index == this.lane.n) {
      this.index = 0;
      this.deliver_cargo(this.lane.end);
      this.set_cargo();
    }
  }

  centre() {
    return this.index + this.length / 2;
  }

  aligned_index() {
    return this.lane.direction > 0
      ? this.centre()
      : this.lane.n - this.centre();
  }

  distance_to(other) {
    return Math.abs(this.aligned_index() - other.aligned_index());
  }

  calculate_value() {
    const agentIndex = this.lane.agents.indexOf(this);
    const neighbours = [];

    // AGENTS IN THIS LANE

    if (agentIndex > 0) {
      neighbours.push(this.lane.agents[agentIndex - 1]);
    }
    if (agentIndex < this.lane.agents.length - 1) {
      neighbours.push(this.lane.agents[agentIndex + 1]);
    }


    for (const lane of this.lane.neighbours) {
      for (const candidate of lane.agents) {
        if (this.distance_to(candidate) <= NEIGHBOUR_DISTANCE) {
          neighbours.push(candidate);
        }
      }
    }

    if(neighbours.length === 0) {
      this.nextValue = this.value;
      return;
    }

    const average = neighbours.reduce((sum, neighbour) => sum + neighbour.value, 0) / neighbours.length
    this.nextValue = lerp(this.value, average, VALUE_STEP);
  }

  draw() {
    const frontIndex = constrain(this.index, 0, this.lane.n);
    const rearIndex = constrain(this.index + this.length, 0, this.lane.n);
    let front_position = this.lane.position_at(frontIndex);
    let rear_position = this.lane.position_at(rearIndex);
    let front_normal = this.lane.normal_at(frontIndex);
    let rear_normal = this.lane.normal_at(rearIndex);
    
    let front_left = front_position.copy().add(front_normal.copy().mult(this.lane.width / 2));
    let front_right = front_position.copy().add(front_normal.copy().mult(-this.lane.width / 2));
    let rear_left = rear_position.copy().add(rear_normal.copy().mult(this.lane.width / 2));
    let rear_right = rear_position.copy().add(rear_normal.copy().mult(-this.lane.width / 2));

    if(this.value < 0.5){
      fill(255, 0, 0);
    } else {
      fill(255, 255, 255);
    }

    stroke(0);

    beginShape();
      vertex(front_left.x, front_left.y);
      vertex(front_right.x, front_right.y);
      vertex(rear_right.x, rear_right.y);
      vertex(rear_left.x, rear_left.y);
    endShape(CLOSE);

    if(this.zealot){
      fill(0, 0, 255);
      ellipse((front_left.x + rear_right.x) / 2, (front_left.y + rear_right.y) / 2, 5, 5);
    }
  }
}
