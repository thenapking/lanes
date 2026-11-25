class LaneGeometry {
  constructor(source_positions, source_normals, lane_offset = 0, travel_direction = 1) {
    this.max_index = source_positions.length - 1;
    this.positions = [];
    this.normals = [];
    this.lane_offset = lane_offset;
    this.travel_direction = travel_direction;

    this.construct(source_positions, source_normals);

    this.arc_distances = this.measure_arc_distances();
    this.total_arc_distance = this.arc_distances[this.max_index];
  }

  construct(source_positions, source_normals) {
    for (let index = 0; index <= this.max_index; index++) {
      const source_index = this.travel_direction > 0
        ? index
        : this.max_index - index;
      const source_position = source_positions[source_index];
      const source_normal = source_normals[source_index];

      this.positions.push(createVector(
        source_position.x + source_normal.x * this.lane_offset,
        source_position.y + source_normal.y * this.lane_offset
      ));
      this.normals.push(source_normal);
    }
  }

  position(index) {
    return this.interpolate(this.positions, index);
  }

  normal(index) {
    return this.interpolate(this.normals, index).normalize();
  }

  offset_position(index, offset) {
    return this.position(index).add(this.normal(index).mult(offset));
  }

  arc_distance(index) {
    return lerp(
      this.arc_distances[this.lower(index)],
      this.arc_distances[this.upper(index)],
      this.fraction(index)
    );
  }

  arc_distance_between(from_index, to_index) {
    return this.arc_distance(to_index) - this.arc_distance(from_index);
  }

  index_at_arc_distance(arc_distance) {
    const constrained_arc_distance = constrain(
      arc_distance,
      0,
      this.total_arc_distance
    );
    let lower_index = 0;
    let upper_index = this.max_index;

    while (upper_index - lower_index > 1) {
      const middle_index = Math.floor((lower_index + upper_index) / 2);
      if (this.arc_distances[middle_index] < constrained_arc_distance) {
        lower_index = middle_index;
      } else {
        upper_index = middle_index;
      }
    }

    const segment_arc_distance = this.arc_distances[upper_index]
      - this.arc_distances[lower_index];
    if (segment_arc_distance === 0) return lower_index;

    return lower_index + (
      (constrained_arc_distance - this.arc_distances[lower_index])
      / segment_arc_distance
    );
  }

  measure_arc_distances() {
    const arc_distances = [0];
    for (let index = 1; index <= this.max_index; index++) {
      arc_distances.push(
        arc_distances[index - 1]
        + p5.Vector.dist(this.positions[index - 1], this.positions[index])
      );
    }
    return arc_distances;
  }

  interpolate(vectors, index) {
    return p5.Vector.lerp(
      vectors[this.lower(index)],
      vectors[this.upper(index)],
      this.fraction(index)
    );
  }

  constrain_index(index) {
    return constrain(index, 0, this.max_index);
  }

  lower(index) {
    return Math.floor(this.constrain_index(index));
  }

  upper(index) {
    return Math.min(this.lower(index) + 1, this.max_index);
  }

  fraction(index) {
    return this.constrain_index(index) - this.lower(index);
  }
}
