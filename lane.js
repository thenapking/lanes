class Lane {
  constructor(start, end, n, width) {
    this.start = start;
    this.end = end;
    this.n = n;
    this.width = width;
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

  position_at(i){
    return this.points[i];
  }

  // TODO the normal will be undefined for the last point, need to handle it
  normal_at(i){
    let p0 = this.points[i];
    let p1 = this.points[i + 1];
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
