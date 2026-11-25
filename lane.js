class Lane {
  constructor(source, destination, speed) {
    this.source = source;
    this.destination = destination;
    this.max_index = LANE_MAX_INDEX;
    this.width = LANE_WIDTH;
    this.speed = speed || 1;

    this.agents = [];
    this.neighbours = [];
    
    this.travel_direction = destination.position.y >= source.position.y ? 1 : -1;
    
    this.geometry = this.geometry();
    this.shape = new Shape(this);
  }

  // when an agent delivers its cargo it is reset to the start of the lane
  // so we need to sort the agents after each move
  update() {
    this.agents.sort((first_agent, second_agent) =>
      first_agent.index - second_agent.index
    );
  }

  geometry(){
    const lane_offset = this.source.position.x - curve.centre_x;

    return new LaneGeometry(
      curve.geometry.positions,
      curve.geometry.normals,
      lane_offset,
      this.travel_direction
    );
  }

  draw() {
    this.shape.draw();
  }
}
