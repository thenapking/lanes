class Shape {
  constructor(object) {
    this.object = object;
    if (this.object instanceof Lane) {
      this.vertices = this.outline(
        this.object,
        0,
        this.object.max_index,
        this.object.width
      );
    }
  }

  draw() {
    stroke(palette.pen);

    if (this.object instanceof Lane) {
      noFill();
      this.draw_outline(this.vertices);
      return;
    }

    if (this.object instanceof Agent) {
      this.draw_agent();
    }
  }

  draw_agent() {
    if (this.draw_mode() === "screen") {
      fill(this.object.cargo < 0.5 ? palette.pen : palette.other_pen);
    } else {
      noFill();
    }

    this.draw_outline(this.outline(
      this.object.lane,
      this.object.index,
      this.rear_index(),
      this.object.lane.width / 2
    ));

    if (this.draw_mode() !== "screen") {
      this.hatch();
    }
  }

  draw_outline(vertices) {
    beginShape();
    for (const point of vertices) {
      vertex(point.x, point.y);
    }
    endShape(CLOSE);
  }

  outline(lane, start_index, end_index, offset) {
    const indices = [start_index];
    for (
      let index = start_index + OUTLINE_SAMPLE_STEP;
      index < end_index;
      index += OUTLINE_SAMPLE_STEP
    ) {
      indices.push(index);
    }
    indices.push(end_index);

    const vertices = [];
    for (const direction of [1, -1]) {
      const side_indices = direction > 0 ? indices : indices.slice().reverse();
      for (const index of side_indices) {
        vertices.push(
          lane.geometry.offset_position(index, offset * direction)
        );
      }
    }
    return vertices;
  }

  draw_mode() {
    return recording ? "svg" : DISPLAY_HATCHING ? "hatch" : "screen";
  }

  half_width() {
    return this.object.lane.width / 2 - HATCH_EDGE_INSET;
  }

  rear_index() {
    return Math.min(
      this.object.index + this.object.length_indices,
      this.object.lane.max_index
    );
  }

  centre_index() {
    return (this.object.index + this.rear_index()) / 2;
  }

  hatch() {
    if (this.object instanceof Lane) return;
    if (this.half_width() <= 0) return;

    const agent = this.object;
    if (agent.cargo >= 0.5 || HATCH_SPACING <= 0) return;

    const geometry = agent.lane.geometry;
    const start_arc_distance = geometry.arc_distance(agent.index)
      + HATCH_SPACING;
    const end_arc_distance = geometry.arc_distance(this.rear_index());

    for (
      let arc_distance = start_arc_distance;
      arc_distance <= end_arc_distance;
      arc_distance += HATCH_SPACING
    ) {
      const index = geometry.index_at_arc_distance(arc_distance);
      const start = geometry.offset_position(index, -this.half_width());
      const end = geometry.offset_position(index, this.half_width());

      beginShape();
        vertex(start.x, start.y);
        vertex(end.x, end.y);
      endShape();
    }
  }
}
