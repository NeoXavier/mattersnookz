// module aliases
var Engine = Matter.Engine;
//var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Constraint = Matter.Constraint;
var Mouse = Matter.Mouse;
var MouseConstraint = Matter.MouseConstraint;
var Events = Matter.Events;

var engine;
var table;

var cueBall;
var redBalls;

var TABLEWIDTH = 700;
var TABLELENGTH = TABLEWIDTH / 2;
var BALLDIA = TABLEWIDTH / 72;

var freeCueBall = false;
var cueBallConstraint;

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    engine = Engine.create();
    engine.world.gravity.y = 0;

    table = new Table(width / 2, height / 2, TABLEWIDTH, TABLELENGTH, BALLDIA);
    //table = setupTable(width / 2, height / 2, TABLEWIDTH, TABLELENGTH, BALLDIA);

    //generateCueBall();
    //redsStartingX = (width / 2)+ (TABLEWIDTH / 4) + BALLDIA + 2;
    //redBalls = generate_red_balls(redsStartingX, height / 2, BALLDIA);

    //initMouseConstraint();
    //Events.on(engine, 'collisionStart', displayCollision);
    //Events.on(engine, 'collisionActive', cueBallVelChecker);
}

function draw() {
    background(255, 254, 224);
    noStroke();
    Engine.update(engine);

    table.draw();
    //drawTable(table);

    //drawCueBall();
    //draw_balls();
}

// Wrapper function for creating cue ball
function createBall(x, y, radius, label, color, category) {
    var options = {
        restitution: 1,
        friction: .2,
        label: label,
        collisionFilter: {
            category: category
        },
        render: {
            fillStyle: color
        }
    }
    return Bodies.circle(x, y, radius, options);
}

// 15 red balls in a triangle pattern with the tip pointing left
// x and y are the tip of the triangle
//         *
//       * *
//  -> * * *
//       * *
//         *
function generate_red_balls(x, y, ballDiameter) {
    var ballRadius = ballDiameter / 2;
    var redBalls = [];
    var colDistance = Math.sqrt(Math.pow(ballDiameter, 2) - Math.pow(ballRadius, 2));

    for (var ballCount = 1; ballCount <= 5; ballCount++) {
        if (ballCount % 2 == 0) { // 2, 4
            var topPosition = {
                x: x + ((ballCount - 1) * colDistance),
                y: y - ((ballCount - 1) * ballRadius)
            }
        }
        else { // 1, 3, 5
            var topPosition = {
                x: x + ((ballCount - 1) * colDistance),
                y: y - ((ballCount - 1) / 2) * ballDiameter
            }
        }
        for (var i = 0; i < ballCount; i++) {
            var ball = createBall(topPosition.x, topPosition.y + (i * ballDiameter), ballRadius, "reds", "red", 0x0001);
            redBalls.push(ball);
        }
    }

    World.add(engine.world, redBalls);
    return redBalls;
}

// x and y is the center of the table
function generate_colored_balls(x, y){

}

function generateCueBall() {
    cueBall = createBall(width / 2 - 200, height / 2, BALLDIA / 2, "cue", "white", 0x0002);
    cueBallConstraint = Constraint.create({
        pointA: { x: width / 2 - 200, y: height / 2 },
        bodyB: cueBall,
        stiffness: 0.2,
    });
    World.add(engine.world, [cueBall, cueBallConstraint]);
}

function draw_balls() {
    for (var i = 0; i < redBalls.length; i++) {
        fill(redBalls[i].render.fillStyle);
        drawVertices(redBalls[i].vertices);
    }
}

function drawCueBall() {
    fill(cueBall.render.fillStyle);
    drawVertices(cueBall.vertices);
}

function initMouseConstraint() {
    var mouse = Mouse.create(canvas.elt);
    var mouseParams = {
        mouse: mouse,
    }
    var mouseConstraint = MouseConstraint.create(engine, mouseParams);
    mouseConstraint.mouse.pixelRatio = pixelDensity();
    mouseConstraint.collisionFilter.mask = 0x0002;
    World.add(engine.world, [mouseConstraint]);
}

function releaseCueBall() {
    const timeout = setTimeout(() => {
        freeCueBall = true;
        World.remove(engine.world, cueBallConstraint);
        clearTimeout(timeout);
    }, 10);
}

// Applies a constraint to the cue ball if it is not moving
function cueBallVelChecker() {
    //console.log(freeCueBall);
    if (freeCueBall) {
        if (Math.abs(cueBall.velocity.x) < 0.1 && Math.abs(cueBall.velocity.y) < 0.1) {
            freeCueBall = false;
            const { x, y } = cueBall.position;
            cueBallConstraint.pointA.x = x;
            cueBallConstraint.pointA.y = y;
            World.add(engine.world, cueBallConstraint);
        }
    }
}

function displayCollision(event) {
    var pairs = event.pairs;
    //for (var i = 0; i < pairs.length; i++) {
    //var pair = pairs[i];

    //console.log(pair.bodyA.label);
    //console.log(pair.bodyB.label);
    //}
}


function mouseReleased() {
    releaseCueBall();
}

// HELPER FUNCTIONS
function drawVertices(vertices) {
    beginShape();
    for (var i = 0; i < vertices.length; i++) {
        vertex(vertices[i].x, vertices[i].y);
    }
    endShape(CLOSE);
}



