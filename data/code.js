background(255);
define("command", "");

define("bpm", 60);
bpm = 60;
var hz = bpm / 60;
var seq = (millis() / 1000 * hz) % 7;
var phase = seq - Math.floor(seq);

var rawKey = key;

var Agent = function(x, y, j, i) {
  this.x = x;
  this.y = y;
  this.vx = random(-1, 1);
  this.vy = random(-1, 1);
  this.ax = 0;
  this.ay = 0;
  this.j = j;
  this.i = i;
  this.c = 0;
  this.theta = 0;
  this.vtheta = 0;
  this.age = 0;
  this.trace = [];
  this.wx = x;
  this.wy = y;
}

translate(width/2, height/2);
colorMode(3, 255);

stroke(128)

define("agent", new Agent(0, 0, 0, 0));
define("wagent", new Agent(0, 0, 0, 0));
define("grids", []);
define("anchors", []);
if(grids.length == 0) {
  for(var i = 0; i < 8; i++) {
    grids.push([]);
    for(var j = 0; j < 8; j++) {
      grids[i].push(new Agent(0, 0, j, i));
    }
  }
}
if(anchors.length == 0) {
  for(var j = 0; j < 8; j++) {
    anchors.push(grids[0][j]);
  }
}

var aclosest;
var alength = 10000;
for each(r in grids) {
  for each(a in r) {
    var xdiff = a.x - (mouseX - width/2);
    var ydiff = a.y - (mouseY - height/2);
    var length = Math.abs(xdiff) + Math.abs(ydiff);
    if(length < alength) {
      alength = length;
      aclosest = a;
    }
  }
}

for each(r in grids) {
  for each(a in r) {
    pushMatrix();
    a.x = (a.j - 3.5) * 150;
    a.y = (a.i - 3.5) * 150;
    a.wx = a.x;
    a.wy = a.y;
    stroke(0);
    strokeWeight(1);
    if(a == aclosest) {
      if('1' <= key && key <= '8') {
        anchors[key - '0' - 1] = a;
        key = 0;
      }
      fill(0);
    }
    else {
      noFill();
    }
    ellipse(a.x, a.y, 20, 20);

    stroke(128);
    if(a.j < 7) {
      var an = r[a.j+1];
      line(a.x, a.y, an.x, an.y);
    }
    if(a.i < 7) {
      var an = grids[a.i+1][a.j];
      line(a.x, a.y, an.x, an.y);
    }


    popMatrix();
  }
}

// swap them!
if(command.length == 2) {
  var count = 0;
  for each(a in anchors) {
    var x = a.x;
    var y = a.y;
    if(String(a.i) == command.charAt(0)) {
      if(!orth) {
        x = grids[parseInt(command.charAt(1))][a.j].x;
        y = grids[parseInt(command.charAt(1))][a.j].y;
      } else {
        x = grids[a.j][parseInt(command.charAt(1))].x;
        y = grids[a.j][parseInt(command.charAt(1))].y;
      }
    }
    if(String(a.i) == command.charAt(1)) {
      if(!orth) {
        x = grids[parseInt(command.charAt(0))][a.j].x;
        y = grids[parseInt(command.charAt(0))][a.j].y;
      } else {
        x = grids[a.j][parseInt(command.charAt(0))].x;
        y = grids[a.j][parseInt(command.charAt(0))].y;
      }
    }
    a.wx = x;
    a.wy = y;

    count++;
  }
}

var count = 0;
for each(a in anchors) {
  fill(128);
  noStroke();
  ellipse(a.x, a.y, 20, 20);
  fill(128, 255, 255);
  pushMatrix();
  translate(10, 10);
  ellipse(a.wx, a.wy, 20, 20);
  popMatrix();

  stroke(0);
  textSize(24);
  fill(0);
  text(String(count + 1), a.x + 10, a.y);
  pushMatrix();
  translate(10, 10);
  fill(128, 255, 255);
  text(String(count + 1), a.wx + 10, a.wy);
  popMatrix();

  strokeWeight(3);
  stroke(0, 50);
  if(count < anchors.length - 1) {
    var an = anchors[count+1];
    line(a.x, a.y, an.x, an.y);
  }
  stroke(128, 255, 255, 50);
  pushMatrix();
  translate(10, 10);
  if(count < anchors.length - 1) {
    var an = anchors[count+1];
    line(a.wx, a.wy, an.wx, an.wy);
  }
  popMatrix();
  count++;
}

// var c = 0.95;
// agent.x = agent.x * c + (1-c) * anchors[Math.floor(seq)].x;
// agent.y = agent.y * c + (1-c) * anchors[Math.floor(seq)].y;
// if(seq < 0.05) {
//   agent.x = anchors[Math.floor(seq)].x;
//   agent.y = anchors[Math.floor(seq)].y;
// }
strokeWeight(3);
stroke(0);

function updateAgent(agent, color, isTransposed) {
  var nx = anchors[Math.floor(seq + 1)].x;
  var ny = anchors[Math.floor(seq + 1)].y;
  if(isTransposed) {
    nx = anchors[Math.floor(seq + 1)].wx;
    ny = anchors[Math.floor(seq + 1)].wy;
  }
  var theta = Math.atan2(ny - agent.y, nx - agent.x);
  if(agent.theta - theta > Math.PI) {
    theta += Math.PI * 2;
  }
  else if(agent.theta - theta < -Math.PI) {
    agent.theta += Math.PI * 2;
  }
  agent.theta = agent.theta * 0.75 + theta * 0.25;
  // var dx = nx - anchors[Math.floor(seq)].x;
  // agent.x = dx * phase + anchors[Math.floor(seq)].x;
  // var dy = ny - anchors[Math.floor(seq)].y;
  // agent.y = dy * phase + anchors[Math.floor(seq)].y;
  var dx = nx - agent.x;
  var dy = ny - agent.y;
  var v = Math.sqrt(dx*dx+dy*dy) * 0.02;
  agent.vx = agent.vx * 0.9 + 0.1 * Math.cos(agent.theta) * v;
  agent.vy = agent.vy * 0.9 + 0.1 * Math.sin(agent.theta) * v;
  agent.x += agent.vx;
  agent.y += agent.vy;
  if(seq < 0.05) {
    agent.x = anchors[0].x;
    agent.y = anchors[0].y;
    if(isTransposed) {
      agent.x = anchors[0].wx;
      agent.y = anchors[0].wy;
    }
    agent.vx = 0;
    agent.vy = 0;
    agent.trace = [];
  }
  agent.trace.push({x:agent.x, y:agent.y});

  pushMatrix();
  if(isTransposed) {
    translate(10, 10);
  }
  noFill();
  stroke(color);
  if(isTransposed) stroke(128, 255, 255);
  ellipse(agent.x, agent.y, 30, 30);

  pushMatrix();
  translate(agent.x, agent.y);
  rotate(agent.theta);
  line(0, 0, 40, 0);
  popMatrix();

  for(var i = 0; i < agent.trace.length - 1; i++) {
    line(agent.trace[i].x, agent.trace[i].y, agent.trace[i+1].x, agent.trace[i+1].y)
  }
  popMatrix();
}
updateAgent(agent, 0, false);
updateAgent(wagent, 128, true);


// stroke(0);
// line(agent.x, agent.y, wagent.x, wagent.y);

// command = "";
if(command.length > 2) command = command.substring(command.length - 2);
var commandn = -1;
var commandlist = ["q", "w", "e", "r", "t", "y", "u", "i"];
var count = 0;
for each(cl in commandlist) {
  if(key == cl) {
    commandn = count;
    command += String(commandn);
    key = 0;
    break;
  }
  count++;
}

fill(0)
var comorth = "ortho";
if(!orth) comorth = "nonortho"
text("command:" + command + comorth, -500, 580);