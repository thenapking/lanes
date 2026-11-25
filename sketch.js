const DPI = 96
const wi = 5
const hi = 7;
const bwi = 1;
const W = wi * DPI;
const H = hi * DPI;
const BW = bwi * DPI;
const FW = W + 2 * BW;
const FH = H + 2 * BW;

const LANE_WIDTH = 8;
const LANE_RESOLUTION = 4000;
const MIN_SPEED = 2;
const MAX_SPEED = 20;
const MIN_LENGTH = 50;
const MAX_LENGTH = 100;
const MIN_GAP = 5;
const MAX_GAP = 40;
const NUMBER_OF_LANES = 4;
const NEIGHBOUR_DISTANCE = 100;

const OFFSCREEN_MULTIPLIER = 3

const VALUE_STEP = 0.01;
const DESTINATION_STEP = 0.1;
const EPISTEMIC_RATE = 0.1;

const ANGLE = 3.141592653589793 / 5;

let lanes = [];
let sources = [];
let destinations = [];

function setup() {
  createCanvas(FW, FH);

  create_sources_and_destinations();
  create_lanes();
  create_agents();
}

function draw() {
  background(220);
  
  translate(BW, BW);
  translate(0, -H)
  
  rotate_the_canvas();
 
  for (let lane of lanes) {
    lane.update();
    lane.draw();
  }


  for (let lane of lanes) {
    for (let agent of lane.agents) {
      agent.update();
      agent.draw();
    }
  }

  for (let lane of lanes) {
    for (let agent of lane.agents) {
      agent.value = agent.nextValue;
    }
  }
}

function create_sources_and_destinations(){
  let wd = 0;

  while(wd < W * OFFSCREEN_MULTIPLIER) {
    let top = random() < 0.5;
    let source_y = top ? 0 : H * OFFSCREEN_MULTIPLIER
    let destination_y = top ? H *OFFSCREEN_MULTIPLIER : 0;
    let source = new Source(wd, source_y);
    sources.push(source);
    let destination = new Destination(wd, destination_y);
    destinations.push(destination);
    wd += LANE_WIDTH*2;
  }
  
}

function create_lanes(){
  for (let i = 0; i < sources.length; i++) {
    let start = sources[i];
    let end = destinations[i];
    let speed = int(random(MIN_SPEED, MAX_SPEED))
    let lane = new Lane(start, end, LANE_RESOLUTION, LANE_WIDTH, speed);
    lanes.push(lane);
  }

  for (let i = 0; i < lanes.length; i++) {
    lanes[i].previous = lanes[i - 1] || null;
    lanes[i].next = lanes[i + 1] || null;
  }

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
  for (let lane of lanes) {
    let index = 0;
    while(index < lane.n) { 
      let length = int(random(MIN_LENGTH, MAX_LENGTH));
      let agent = new Agent(lane, index, length);
      let gap = constrain(int(randomGaussian(20, 10)), MIN_GAP, MAX_GAP);
      index += length + gap;
      lane.agents.push(agent);
    }
  }
}

function rotate_the_canvas() {
  translate(W / 2, H / 2);
  rotate(ANGLE);
  translate(-W / 2, -H / 2);
}
