class Agent {
  constructor(lane, length) {
    this.lane = lane;
    this.length = length;
    this.index = 0;
  }

  draw() {
    let front_position = this.lane.position_at(this.index);
    let rear_position = this.lane.position_at(this.index - this.length);
    let front_normal = this.lane.normal_at(this.index);
    let rear_normal = this.lane.normal_at(this.index - this.length);
    
    let front_left = front_position.copy().add(front_normal.copy().mult(this.lane.width / 2));
    let front_right = front_position.copy().add(front_normal.copy().mult(-this.lane.width / 2));
    let rear_left = rear_position.copy().add(rear_normal.copy().mult(this.lane.width / 2));
    let rear_right = rear_position.copy().add(rear_normal.copy().mult(-this.lane.width / 2));

    beginShape();
      vertex(front_left.x, front_left.y);
      vertex(front_right.x, front_right.y);
      vertex(rear_right.x, rear_right.y);
      vertex(rear_left.x, rear_left.y);
    endShape(CLOSE);
  }
}
