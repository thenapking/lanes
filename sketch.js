const DPI = 96
const wi = 5
const hi = 7;
const bwi = 1;
const W = wi * DPI;
const H = hi * DPI;
const BW = bwi * DPI;
const FW = W + 2 * BW;
const FH = H + 2 * BW;

const LANE_WIDTH = 20;
const LANE_RESOLUTION = 10;

let agents = [];
let lanes = [];
let sources = [];
let destinations = [];

function setup() {
  createCanvas(FW, FH);

  create_sources_and_destinations();
  create_lanes();
}

function draw() {
  background(220);
  for (let source of sources) {
    source.draw();
  }
  for (let destination of destinations) {
    destination.draw();
  }
  for (let lane of lanes) {
    lane.draw();
  }
}

function create_sources_and_destinations(){
  let source = new Source(100, 0);
  sources.push(source);
  let destination = new Destination(100, H);
  destinations.push(destination);
}

function create_lanes(){
  for (let i = 0; i < sources.length; i++) {
    let start = sources[i];
    let end = destinations[i];
    let lane = new Lane(start, end, LANE_RESOLUTION, LANE_WIDTH);
    lanes.push(lane);
  }
}
