class Lane {
  constructor(start, end, n, width, speed) {
    this.start = start;
    this.end = end;
    this.n = n;
    this.width = width;
    this.agents = [];
    this.previous = null;
    this.next = null;
    this.neighbours = [];
    this.direction = end.position.y >= start.position.y ? 1 : -1;
    this.speed = speed || 1; 
    this.construct();
  }
  
  construct() {
    this.points = [];
    for (let i = 0; i <= this.n; i++) {
      let t = i / this.n;
      let x = lerp(this.start.position.x, this.end.position.x, t);
      let y = lerp(this.start.position.y, this.end.position.y, t);
      this.points.push(createVector(x, y));
    }

    this.a = this.normal_at(0).mult(this.width).add(this.points[0]);
    this.b = this.normal_at(0).mult(-this.width).add(this.points[0]);
    this.c = this.normal_at(this.n).mult(this.width).add(this.points[this.n]);
    this.d = this.normal_at(this.n).mult(-this.width).add(this.points[this.n]);
  }

  update(){
    this.agents.sort((a, b) => a.index - b.index);
  }

  position_at(i){
    return this.points[i];
  }

  normal_at(i){
    const segmentIndex = Math.min(Math.max(i, 0), this.points.length - 2);
    let p0 = this.points[segmentIndex];
    let p1 = this.points[segmentIndex + 1];
    let dir = p5.Vector.sub(p1, p0);
    return createVector(-dir.y, dir.x).normalize();
  }

  draw() {
    stroke(0);
    noFill();

    beginShape();
      vertex(this.a.x, this.a.y);
      vertex(this.b.x, this.b.y);
      vertex(this.d.x, this.d.y);
      vertex(this.c.x, this.c.y);
    endShape(CLOSE);
  }
}
