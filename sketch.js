const DPI = 96
const wi = 5
const hi = 7;
const bwi = 1;
const W = wi * DPI;
const H = hi * DPI;
const BW = bwi * DPI;
const FW = W + 2 * BW;
const FH = H + 2 * BW;
const BWS = 5

const LANE_WIDTH = 8;
const LANE_MAX_INDEX = 4000;
const HATCH_SPACING = 3;
const HATCH_EDGE_INSET = 0.5;
const DISTORTION_STRATEGY = "noise"; // "straight", "arc", "sine", "layered_sines", "noise"
const DISTORTION_STRENGTH = 1;
const ARC_RADIUS_FACTOR = 3.93;
const ARC_CENTER_BELOW_CURVE = 0.016125;
const ARC_MAX_DISPLACEMENT_FACTOR = 0.25;

// Curvature parameters
const NOISE_SAMPLE_SPACING = 350;
const NOISE_COORDINATE_OFFSET = 100;
const NOISE_FREQUENCY = 0.73;
const NOISE_AMPLITUDE = 250;
const NOISE_MIDPOINT = 0.5;
const OUTLINE_SAMPLE_STEP = 16;

const MIN_SPEED = 2;
const MAX_SPEED = 15;
const MIN_LENGTH_INDEX = 50;
const MAX_LENGTH_INDEX = 100;
const MIN_GAP_INDEX = 6;
const MAX_GAP_INDEX = 40;
const GAP_MEAN_INDEX = 20;
const GAP_DEVIATION_INDEX = 5;
const NUMBER_OF_LANES = 4;
const NEIGHBOUR_DISTANCE = 25;
const ZEALOT_INTERVAL = 12;
const ZEALOT_OFFSET = 4;

const OFFSCREEN_MULTIPLIER = 3

const VALUE_STEP = 0.01;
const DESTINATION_STEP = 0.1;
const EPISTEMIC_RATE = 0.1;
const HUMAN_SOCIAL_STEP = 0.3;


let DISPLAY_CARGO = true;
let DISPLAY_HATCHING = false;
let recording = false;

const ANGLE = 3.141592653589793 / 5;

let lanes = [];
let sources = [];
let destinations = [];
let curve;

function setup() {
  createCanvas(FW, FH);

  palette = palettes["Pumpkin"];

  create_sources_and_destinations();
  create_curve();
  create_lanes();
  create_agents();
}

function draw() {
  background(palette.bg);

  recording = begin_svg_export();
  
  push();
    translate(0, -H)
    
    rotate_viewpoint();

    move_agents();
    share_information();
    update_opinions();

    for (let lane of lanes) {
      lane.draw();
      for (let agent of lane.agents) {
        agent.draw();
      }
    }

  pop();
  
  draw_borders();

  end_svg_export(recording);
}

function move_agents() {
  for (let lane of lanes) {
    for (let agent of lane.agents) {
      agent.update();
    }
    lane.update();
  }
}

function share_information() {
  for (let lane of lanes) {
    for (let agent of lane.agents) {
      agent.enquire();
    }
  }
}

function update_opinions(){
  for (let lane of lanes) {
    for (let agent of lane.agents) {
      agent.value = agent.next_value;
    }
  }
}

function create_sources_and_destinations(){
  let wd = 0;

  while(wd < W * OFFSCREEN_MULTIPLIER) {
    let top = random() < 0.5;
    let source_y = top ? 0 : H * OFFSCREEN_MULTIPLIER
    let destination_y = top ? H * OFFSCREEN_MULTIPLIER : 0;
    const current_source = new Source(wd, source_y);
    sources.push(current_source);
    const current_destination = new Destination(wd, destination_y);
    destinations.push(current_destination);
    wd += LANE_WIDTH*2;
  }

  const offset = Math.floor(ZEALOT_INTERVAL / 2);

  for (let i = offset; i < destinations.length; i += ZEALOT_INTERVAL) {
    const index = i + int(random(1-ZEALOT_OFFSET, ZEALOT_OFFSET));
    destinations[index].zealot = true;
  }
}

function create_curve() {
  curve = CurvePath.build(
    sources,
    LANE_WIDTH,
    H * OFFSCREEN_MULTIPLIER,
    LANE_MAX_INDEX
  );
}

function create_lanes(){
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i];
    let destination = destinations[i];
    let speed = int(random(MIN_SPEED, MAX_SPEED));
    const current_lane = new Lane(
      source,
      destination,
      speed
    );
    lanes.push(current_lane);
  }

  set_lane_neighbours();
}

function set_lane_neighbours() {
  for (let i = 0; i < lanes.length; i++) {
    lanes[i].neighbours = [];

    for (let offset = -NUMBER_OF_LANES; offset <= NUMBER_OF_LANES; offset++) {
      if (offset === 0) continue;

      const neighbour = lanes[i + offset];
      if (neighbour) {
        lanes[i].neighbours.push(neighbour);
      }
    }
  }
}

function create_agents(){
  for (const lane of lanes) {
    let index = 0;
    while (index < lane.max_index) {
      const maximum_length_index = Math.min(
        MAX_LENGTH_INDEX,
        lane.max_index - index
      );
      if (maximum_length_index < MIN_LENGTH_INDEX) break;

      const length_index = int(random(
        MIN_LENGTH_INDEX,
        maximum_length_index + 1
      ));
      const next_index = index + length_index;
      lane.agents.push(new Agent(lane, index, length_index));

      const gap_index = constrain(
        int(randomGaussian(GAP_MEAN_INDEX, GAP_DEVIATION_INDEX)),
        MIN_GAP_INDEX,
        MAX_GAP_INDEX
      );

      index = next_index + gap_index;
    }
  }
}

function rotate_viewpoint() {
  translate(W / 2, H / 2);
  rotate(ANGLE);
  translate(-W / 2, -H / 2);
}

function draw_borders() {
  push();
  noStroke();
    // solid borders
    fill(palette.bg);
    rect(0, 0, FW, BW);           // top
    rect(0, FH - BW, FW, BW);     // bottom
    rect(0, 0, BW, FH);          // left
    rect(FW - BW, 0, BW, FH);     // right

    // outline borders
    noFill();
    stroke(palette.pen);
    strokeWeight(1.5);
    translate(BW, BW)
    rect(0, 0, W, H);
    rect(-BWS, -BWS, W + 2 * BWS, H + 2 * BWS);
  pop();
}

function keyPressed() {
  if (key === 'c' || key === 'C') {
    DISPLAY_CARGO = !DISPLAY_CARGO;
  } else if (key === '=' || key === '+') {
    change_palette('=');
  } else if (key === '-' || key === '_') {
    change_palette('-');
  } else if (key === 'S' || key === 's') {
    saveCanvas('lanes', 'png');
  } else if (key === 'v' || key === 'V') {
    request_svg_export();
  } else if (key === 'h' || key === 'H') {
    DISPLAY_HATCHING = !DISPLAY_HATCHING;
  }
}
