/*
    * Commentary
    * The app is designed such that each game element is an object. Upon creation, these objects instantiate a matter.js body and add it to the world.
    * These objects contain methods enabling them to remove or add themselves to the world, as well as render themselves on the canvas.
    * These objects are created as global variables so that they can be accessed throughout the program. Other global variables include game states, UI components, collision bitmasks and some app specific constants.
    *
    * Cue interaction is achieved by connecting the cue to the cue ball's position using a constraint with low stiffness, which simulates the effect of pulling back a cue stick.
    * The cue's movement is driven by mouse interactions via a mouse constraint, allowing the user to manipulate the cue by dragging it backwards and releasing it.
    * Given the difficulty in controlling the speed of a constrained body, the collision detection engine is used to identify when the cue strikes the cue ball and apply a force to the cue ball, proportional to the cue's speed.
    *
    * Collision management between bodies is achieved by implementing collision filters and masks. This is crucial to prevent the cue from interfering with balls other than the cue ball and from colliding with the table cushions.
    * Utilizing collision filters is also essential for the mouse constraint, ensuring that the user can only manipulate the cue stick. The user is also granted the ability to manipulate the cue ball at the start of the game or after it has been pocketed. 
    * This is accomplished by managing the collision filters of the mouse constraint and the ball.
    *
    * Overall the application is designed to use only mouse interaction as its controls as I felt that it was more intuitive and does not require an additional guide for key controls.
    * The app features two extensions: an option to display a guide line for the cue ball's trajectory and another to change the cue stick. Of the two, implementing the guide line posed a greater challenge due to the extensive use of trigonometry required to calculate reflections.
*/





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
var lastPocketedBall = "";

var cue;

// Constants
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
const TABLE = 0x0001;

var cueBallInMotion = false;
var freeCueBall;
var cueBallCache = {};

var cueSelector;
var guideToggle;
var showGuide = false;

var mouseConstraint;

function preload() {
    // Load cue images
    cueImages = ['cue-stick.png', 'drumstick.png', 'matchstick.png', 'stick.png'];
    cueImages.forEach((img, index) => {
        cueImages[index] = loadImage("assets/" + img);
    })
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    engine = Engine.create();
    engine.world.gravity.y = 0;

    // Center of canvas
    const centerX = width / 2;
    const centerY = height / 2;

    UI_setup();

    initMouseConstraint();

    // Create Table
    table = new Table(centerX, centerY);

    // Create Balls
    cueBall = new Ball((centerX) - (0.35 * TABLEWIDTH), centerY, BALLDIA / 2, "cue ball", "white", CUEBALL, CUE)

    var redsStartingX = (centerX) + (TABLEWIDTH / 4) + BALLDIA + 2;
    redBalls = make_red_balls(redsStartingX, centerY);

    coloredBalls = make_colored_balls(centerX, centerY);

    // Create Cue
    cue = new Cue(cueBall.body.position.x, cueBall.body.position.y);

    cueBallFree();

    Events.on(engine, 'collisionStart', collisionHandler);
    Events.on(engine, 'beforeUpdate', apply_cached_forces);
    Events.on(mouseConstraint, 'enddrag', mouseDragHandler)
}

function draw() {
    background(255, 254, 224);
    noStroke();
    Engine.update(engine);

    // Draw game elements
    table.draw();
    draw_balls();
    cue.draw(cueSelector.value());
    if (showGuide) { cue.drawTrajectory() };

    // Check if cue ball has stopped
    cueBallVelChecker();
}

//////////////////////////////////////
/// Sequential Execution Functions ///
//////////////////////////////////////

// Sets up the UI elements
function UI_setup() {
    var title = createElement('h2', 'Game Modes:');
    title.position(10, 0);
    var buttons = ["Normal", "Random Red", "All Random"]
    buttons.forEach((buttonName, index) => {
        let button = createButton(buttonName);
        button.position(10, 50 + (index * 40));
        button.mousePressed(() => changeGameModes(buttonName));
    });

    var cueTitle = createElement('h2', 'Cue Selector:');
    cueTitle.position(10, 150);
    cueSelector = createSelect();
    cueSelector.position(10, 200);
    let cues = ["Cue Stick", "Drumstick", "Matchstick", "Stick"];
    cues.forEach((cue, index) => { cueSelector.option(cue, index) });

    guideToggle = createButton("Show Guide");
    guideToggle.position(10, 250);
    guideToggle.mousePressed(() => {
        if (!showGuide) { guideToggle.html("Hide Guide") }
        else { guideToggle.html("Show Guide") }
        showGuide = !showGuide;
    });
}

// Creates a mouse constraint for the user to move the cue / cueball
function initMouseConstraint() {
    var mouse = Mouse.create(canvas.elt);
    var mouseParams = {
        mouse: mouse,
    }
    mouseConstraint = MouseConstraint.create(engine, mouseParams);
    mouseConstraint.mouse.pixelRatio = pixelDensity();
    mouseConstraint.collisionFilter = {
        category: MOUSE,
        mask: CUE
    };
    World.add(engine.world, [mouseConstraint]);
}

// Checks if the cue ball has stopped, so that the cue can be added back to the world
function cueBallVelChecker() {
    if (cueBallInMotion && !freeCueBall) {
        if (Math.abs(cueBall.body.velocity.x) < 0.1 && Math.abs(cueBall.body.velocity.y) < 0.1) {
            cueBallInMotion = false;
            Body.setVelocity(cueBall.body, { x: 0, y: 0 })
            const { x, y } = cueBall.body.position;
            cue.add(x, y);
        }
    }
}

// Allows the user to move the cue ball with the mouse
function cueBallFree() {
    freeCueBall = true;
    // Mouse able to move cue ball
    cueBall.body.collisionFilter.mask |= MOUSE;
    // Cue ball able to collide with other balls
    cueBall.body.collisionFilter.mask &= ~BALL;
    // Remove cue from world
    cue.remove();
    // Let cue ball be moved by mouse
    mouseConstraint.collisionFilter.mask |= CUEBALL;
}


// Decision tree for different balls entering pockets
function ball_pocket_collision(ball) {
    if (ball.label.includes("cue")) {
        cueBallFree(); // Free cue ball
        Body.setVelocity(ball, { x: 0, y: 0 });
        Body.setPosition(ball, {
            x: cueBall.originalPos.x,
            y: cueBall.originalPos.y
        });
        return;
    }

    if (ball.label.includes("color")) {
        let coloredBall = coloredBalls.find(b => b.body == ball);
        Body.setVelocity(ball, { x: 0, y: 0 });
        Body.setPosition(ball, {
            x: coloredBall.originalPos.x,
            y: coloredBall.originalPos.y
        });
        if (lastPocketedBall.includes("color")) {
            alert("Mistake: Two consecutive colored balls pocketed");
        }
    }
    else {
        var redBall = redBalls.find(b => b.body == ball);
        redBall.remove();
    }
    lastPocketedBall = ball.label;
}

// Function to apply force before engine updates as forces are cleared after each Engine.update
// As such placing applyForce in collisionHandler does not work
function apply_cached_forces() {
    if (cueBallCache.cueBall) {
        Body.applyForce(cueBallCache.cueBall, cueBallCache.cueBall.position, cueBallCache.force);
        cueBallCache = {};

        // Set cue motion flag and remove cue AFTER force applied
        cueBallInMotion = true;
        cue.remove();
    }
}


////////////////////////////
////// Event Handlers //////
////////////////////////////

function collisionHandler(event) {
    let pairs = event.pairs;
    pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        console.log(bodyA.label + " - " + bodyB.label)

        // When cue hits cue ball
        if (bodyA.label == "cue" || bodyB.label == "cue") {
            //let mappedSpeed = map(Body.getSpeed(cue.cueBody), 0, 50, 0, 0.005);
            let adjustedSpeed = Body.getSpeed(cue.cueBody) / 20000;
            let cueAngle = cue.cueBody.angle;
            let force = p5.Vector.fromAngle(cueAngle).setMag(adjustedSpeed);
            cueBallCache = { cueBall: cueBall.body, force: { x: force.x, y: force.y } };
        }

        // When a ball collides with a pocket or vice versa
        if (bodyA.label.includes("ball") && bodyB.label == "pocketSensor") { ball_pocket_collision(bodyA); }
        if (bodyB.label.includes("ball") && bodyA.label == "pocketSensor") { ball_pocket_collision(bodyB); }

    })
}

// Function called after the mouse has dragged a body
function mouseDragHandler(event) {
    const { body } = event;

    // if mouse draged on cue ball
    if (body.label == "cue ball") {
        freeCueBall = false;
        // Mouse no longer able to move cue ball
        mouseConstraint.collisionFilter.mask &= ~CUEBALL;
        // Cue ball able to collide with other balls
        cueBall.body.collisionFilter.mask |= BALL;
        Body.setVelocity(cueBall.body, { x: 0, y: 0 })

        const { x, y } = cueBall.body.position;
        cue.add(x, y);
    }
}

// Function to change game modes
function changeGameModes(mode) {
    switch (mode) {
        case "Normal":
            balls_to_original_pos();
            break;
        case "Random Red":
            randomize_balls("red");
            break;
        case "All Random":
            randomize_balls("all");
            break;
        default:
            break;
    }
}

// HELPER FUNCTIONS
function drawVertices(vertices) {
    beginShape();
    for (var i = 0; i < vertices.length; i++) {
        vertex(vertices[i].x, vertices[i].y);
    }
    endShape(CLOSE);
}

// draws an array of matter.js bodies
function draw_bodies(arr) {
    for (var i = 0; i < arr.length; i++) {
        fill(arr[i].render.fillStyle);
        drawVertices(arr[i].vertices);
    }
}


