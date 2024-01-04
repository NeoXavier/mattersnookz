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
var coloredBalls;

var cue;

var TABLEWIDTH = 700;
var TABLELENGTH = TABLEWIDTH / 2;
var BALLDIA = TABLEWIDTH / 72;

var freeCueBall = false;
var cueBallConstraint;

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    engine = Engine.create();
    engine.world.gravity.y = 0;


    var centerX = width / 2;
    var centerY = height / 2;

    // Create Table
    table = new Table(centerX, centerY);

    // Create Balls
    cueBall = make_cue_ball((centerX) - (0.4 * TABLEWIDTH), centerY);

    var redsStartingX = (centerX)+ (TABLEWIDTH / 4) + BALLDIA + 2;
    redBalls = make_red_balls(redsStartingX, centerY);

    coloredBalls = make_colored_balls(centerX, centerY);
    
    // Create Cue
    cue = new Cue(cueBall.position.x, cueBall.position.y);

    initMouseConstraint();
    //Events.on(engine, 'collisionStart', displayCollision);
    //Events.on(engine, 'collisionActive', cueBallVelChecker);
}

function draw() {
    background(255, 254, 224);
    noStroke();
    Engine.update(engine);

    table.draw();
    draw_balls();
    cue.draw();
}

function initMouseConstraint() {
    var mouse = Mouse.create(canvas.elt);
    var mouseParams = {
        mouse: mouse,
    }
    var mouseConstraint = MouseConstraint.create(engine, mouseParams);
    mouseConstraint.mouse.pixelRatio = pixelDensity();
    mouseConstraint.collisionFilter = {
        category: 0x0008, // Cue category
        mask: 0x0004 // Cue ball category
    };
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


//function mouseReleased() {
    //releaseCueBall();
//}

// HELPER FUNCTIONS
function drawVertices(vertices) {
    beginShape();
    for (var i = 0; i < vertices.length; i++) {
        vertex(vertices[i].x, vertices[i].y);
    }
    endShape(CLOSE);
}

// draws an array of matter.js bodies
function draw_bodies(arr){
    for(var i = 0; i < arr.length; i++){
        fill(arr[i].render.fillStyle);
        drawVertices(arr[i].vertices);
    }
}


