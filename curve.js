class CurvePath {
  static build(sources, lane_width, height, max_index) {
    const first_x = sources[0].position.x;
    const last_x = sources[sources.length - 1].position.x;
    const centre_x = (first_x + last_x) / 2;
    const maximum_offset = Math.abs(last_x - first_x) / 2 + lane_width;
    return new CurvePath(centre_x, maximum_offset, height, max_index);
  }

  constructor(centre_x, maximum_offset, height, max_index) {
    this.centre_x = centre_x;
    this.height = height;
    this.max_index = max_index;
    this.spacing = height / max_index;
    this.displacements = this.displacements();
    this.strength = this.safe_strength(maximum_offset);
    this.geometry = new LaneGeometry(
      this.create_positions(),
      this.create_normals()
    );
  }

  displacements() {
    const displacements = [];
    // Include one extra sample at either end for centred derivatives.
    for (let i = -1; i <= this.max_index + 1; i++) {
      const y = i * this.spacing - this.height / 2;
      displacements.push(this.displacement_at(y));
    }
    return displacements;
  }

  curvature() {
    let maximum = 0;

    for (let i = 0; i <= this.max_index; i++) {
      const second_derivative = (
        this.displacements[i]
        - 2 * this.displacements[i + 1]
        + this.displacements[i + 2]
      ) / (this.spacing * this.spacing);
      maximum = Math.max(
        maximum,
        Math.abs(second_derivative)
      );
    }

    return maximum;
  }

  safe_strength(maximum_offset) {
    // Bound curvature so inner lane offsets do not collapse.
    const curvature = this.curvature();
    const curvature_limit = curvature === 0
      ? Infinity
      : 0.85 / (maximum_offset * curvature);
    return Math.min(Math.max(0, DISTORTION_STRENGTH), curvature_limit);
  }

  create_positions() {
    const positions = [];
    for (let index = 0; index <= this.max_index; index++) {
      let position = createVector(
        this.centre_x + this.strength * this.displacements[index + 1],
        index * this.spacing
      )

      positions.push(position);
    }
    return positions;
  }

  create_normals() {
    const normals = [];
    for (let index = 0; index <= this.max_index; index++) {
      const slope = this.strength * (
        this.displacements[index + 2] - this.displacements[index]
      ) / (2 * this.spacing);
      const length = Math.hypot(1, slope);
      const normal = createVector(1 / length, -slope / length)
      normals.push(normal);
    }
    return normals;
  }

  displacement_at(y) {
    switch (DISTORTION_STRATEGY) {
      case "arc":
        return this.arc_displacement_at(y);
      case "sine":
        return 150 * Math.sin(2 * Math.PI * y / 1950 + 0.6);
      case "layered_sines":
        return 2 * Math.sin(2 * Math.PI * y / 1800 + 0.6)
          + 24 * Math.sin(2 * Math.PI * y / 840 - 1);
      case "noise":
        return this.noise_displacement_at(y);
      default:
        throw new Error("Unknown distortion strategy: " + DISTORTION_STRATEGY);
    }
  }

  arc_displacement_at(y) {
    const centre_y = this.height * ARC_CENTER_BELOW_CURVE;
    const top_y = -this.height / 2;
    const bottom_y = this.height / 2;
    const maximum_vertical_offset = Math.max(
      Math.abs(top_y - centre_y),
      Math.abs(bottom_y - centre_y)
    ) + this.spacing;
    const radius = Math.max(
      this.height * ARC_RADIUS_FACTOR,
      maximum_vertical_offset
    );
    const bottom_horizontal_offset = Math.sqrt(
      radius * radius - (bottom_y - centre_y) ** 2
    );
    const top_horizontal_offset = Math.sqrt(
      radius * radius - (top_y - centre_y) ** 2
    );
    const maximum_sagitta = bottom_horizontal_offset - top_horizontal_offset;
    const target_sagitta = this.height * ARC_MAX_DISPLACEMENT_FACTOR;
    const scale = maximum_sagitta === 0 ? 0 : target_sagitta / maximum_sagitta;
    const vertical_offset = y - centre_y;
    const horizontal_offset = Math.sqrt(
      radius * radius - vertical_offset * vertical_offset
    );
    return (bottom_horizontal_offset - horizontal_offset) * scale;
  }

  noise_at(i) {
    return noise(i * NOISE_FREQUENCY);
  }

  interpolate_noise(fraction, previous, first, second, next) {
    return first + 0.5 * fraction * (
      second - previous + fraction * (
        2 * previous - 5 * first + 4 * second - next
        + fraction * (
          3 * first - previous - 3 * second + next
        )
      )
    );
  }

  noise_displacement_at(y) {
    const position = y / NOISE_SAMPLE_SPACING + NOISE_COORDINATE_OFFSET;
    const i = Math.floor(position);
    const fraction = position - i;
    const value = this.interpolate_noise(
      fraction,
      this.noise_at(i - 1),
      this.noise_at(i),
      this.noise_at(i + 1),
      this.noise_at(i + 2)
    );

    return NOISE_AMPLITUDE * (value - NOISE_MIDPOINT);
  }
}


