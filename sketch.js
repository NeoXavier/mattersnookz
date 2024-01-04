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

const TABLEWIDTH = 700;
const TABLELENGTH = TABLEWIDTH / 2;
const BALLDIA = TABLEWIDTH / 72;
const halfTableWidth = TABLEWIDTH / 2;
const halfTableLength = TABLELENGTH / 2;
const quarterTableWidth = TABLEWIDTH / 4;

// Collision Categories
const MOUSE = 0x0016;
const CUE = 0x0008;
const CUEBALL = 0x0004;
const BALL = 0x0002;

var cueBallInMotion = false;
var freeCueBall;

var cueBallCache = {};

var mouseConstraint;

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    engine = Engine.create();
    engine.world.gravity.y = 0;


    var centerX = width / 2;
    var centerY = height / 2;

    initMouseConstraint();

    // Create Table
    table = new Table(centerX, centerY);

    // Create Balls
    cueBall = new Ball((centerX) - (0.4 * TABLEWIDTH), centerY,  BALLDIA / 2, "cue ball", "white", 0x0002)

    var redsStartingX = (centerX)+ (TABLEWIDTH / 4) + BALLDIA + 2;
    redBalls = make_red_balls(redsStartingX, centerY);

    coloredBalls = make_colored_balls(centerX, centerY);
    
    // Create Cue
    cue = new Cue(cueBall.body.position.x, cueBall.body.position.y);

    cueBallFree();

    Events.on(engine, 'collisionStart', collisionHandler);
    Events.on(engine, 'beforeUpdate', cachedForces);
    Events.on(mouseConstraint, 'enddrag', mouseDragHandler)
}


function draw() {
    background(255, 254, 224);
    noStroke();
    Engine.update(engine);

    table.draw();
    draw_balls();
    cue.draw();
    cueBallVelChecker();
}

function initMouseConstraint() {
    var mouse = Mouse.create(canvas.elt);
    var mouseParams = {
        mouse: mouse,
    }
    mouseConstraint = MouseConstraint.create(engine, mouseParams);
    mouseConstraint.mouse.pixelRatio = pixelDensity();
    mouseConstraint.collisionFilter = {
        category: 0x0008, // Mouse category
        mask: 0x0004 // Cue category
    };
    World.add(engine.world, [mouseConstraint]);
}

// Applies a constraint to the cue ball if it is not moving
function cueBallVelChecker() {
    if (cueBallInMotion && !freeCueBall) {
        if (Math.abs(cueBall.body.velocity.x) < 0.05 && Math.abs(cueBall.body.velocity.y) < 0.05) {
            cueBallInMotion = false;
            Body.setVelocity(cueBall.body, { x: 0, y: 0 })
            const { x, y } = cueBall.body.position;
            cue.add(x, y);
        }
    }
}

function collisionHandler(event) {
    let pairs = event.pairs;
    pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        // When cue hits cue ball
        if (bodyA.label == "cue" || bodyB.label == "cue") {
            let mappedSpeed = map(Body.getSpeed(cue.cueBody), 0, 50, 0, 0.005);
            let cueAngle = cue.cueBody.angle;
            let force = p5.Vector.fromAngle(cueAngle).setMag(mappedSpeed);
            cueBallCache = {cueBall: cueBall.body, force: {x: force.x, y: force.y}};
        }

        if(bodyA.label.includes("ball") && bodyB.label == "pocketSensor"){
            if(bodyA.label.includes("cue")){
                // Free cue ball
                cueBallFree();

                Body.setVelocity(bodyA, {x: 0, y: 0});
                Body.setPosition(bodyA, {
                    x: cueBall.originalPos.x,
                    y: cueBall.originalPos.y
                });
            }
            else if(bodyA.label.includes("color")){
                let coloredBall = coloredBalls.find(ball => ball.body == bodyA); 
                Body.setVelocity(bodyA, {x: 0, y: 0});
                Body.setPosition(bodyA, {
                    x: coloredBall.originalPos.x,
                    y: coloredBall.originalPos.y
                });
            }
            else{
                var redBall = redBalls.find(ball => ball.body == bodyA);
                redBall.remove();
            }
        }

        if(bodyB.label.includes("ball") && bodyA.label == "pocketSensor"){
            if(bodyB.label.includes("cue")){
                // Free cue ball
                cueBallFree();

                Body.setVelocity(bodyB, {x: 0, y: 0});
                Body.setPosition(bodyB, {
                    x: cueBall.originalPos.x,
                    y: cueBall.originalPos.y
                });
            }
            else if(bodyB.label.includes("color")){
                let coloredBall = coloredBalls.find(ball => ball.body == bodyB); 
                Body.setVelocity(bodyB, {x: 0, y: 0});
                Body.setPosition(bodyB, {
                    x: coloredBall.originalPos.x,
                    y: coloredBall.originalPos.y
                });
            }
            else{
                let redBall = redBalls.find(ball => ball.body == bodyB);
                redBall.remove();
            }
        }

    })
}

function mouseDragHandler(event){
    console.log("mouse dragged");
    const { body } = event;

    // if mouse draged on cue ball
    if (body.label == "cue ball"){
        freeCueBall = false;
        // Mouse no longer able to move cue ball
        mouseConstraint.collisionFilter.mask &= ~0x0002;

        Body.setVelocity(cueBall.body, { x: 0, y: 0 })
        const { x, y } = cueBall.body.position;
        cue.add(x, y);
    }
}

function cueBallFree(){
    freeCueBall = true;
    // Remove cue from world
    cue.remove();
    // Let cue ball be moved by mouse
    mouseConstraint.collisionFilter.mask |= 0x0002;
}

// Function to apply force engine update as forces are cleared after each Engine.update
// As such placing applyForce in collisionHandler does not work
function cachedForces(){
    if (cueBallCache.cueBall){
        Body.applyForce(cueBallCache.cueBall, cueBallCache.cueBall.position, cueBallCache.force);
        console.log("cue ball hit");
        cueBallCache = {};

        // Set cue motion flag and remove cue AFTER force applied
        cueBallInMotion = true;
        cue.remove();
    }
}

//function mouseReleased() {
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


