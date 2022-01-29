// function that draw cartesian coordinate plane (X/Y axis)
var coord = function(scale) {
    
  stroke(0, 0, 0);
  line(200, 20, 200, 380);
  line(20, 200, 380, 200);

  fill(0, 0, 0);
  noStroke();
  triangle(197, 30, 200, 19, 204, 30);
  triangle(370, 197, 380, 200, 370, 204);

  text("y", 208, 25);
  text("x", 379, 194);
  stroke(0, 0, 0);
  for (var i = -160; i < 160; i++) {
    if (i % scale === 0) {
      line(i + 200, 198, i + 200, 202);
      line(198, i + 200, 202, i + 200);
    }
  }
  strokeWeight(1);
};
// if difference is too big don't draw the line (e.g. for Math.tan)
var diff = 1000;
// draw line on our coordinate system (so point 0,0 is in the middle)
var plot_line = function(x1, y1, x2, y2) {
  line(x1 + 200, -y1 + 200, x2 + 200, -y2 + 200);
};

// ploting function that accept function and scale
var plot = function(f, scale) {
  scale = scale || 1;
  for (var x = -200; x < 200; x++) {
    var y1 = f(x / scale) * scale;
    var y2 = f((x + 1) / scale) * scale;
    if (Math.abs(y2 - y1) < diff) {
      plot_line(x, y1, x + 1, y2);
    }
  }
};

// draw point function
var P = function(x, y, scale) {
  point(x * scale + 200, -y * scale + 200);
};