class Ball {
    constructor(x, y, radius, label, color, category, mask = CUEBALL) {
        this.originalPos = { x: x, y: y };
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.options = {
            restitution: 1,
            friction: 0,
            frictionStatic: 0,
            label: label,
            render: {
                fillStyle: color
            },
            collisionFilter: {
                category: category,
                mask: mask | TABLE | BALL
            }
        }
        this.inWorld;
        this.body;

        this.add(x, y);
    }

    // creates a matter.js body and adds it to the world
    add(x, y) {
        // if this method is called to reposition the ball
        if (this.inWorld) {
            this.remove();
        }
        this.body = Bodies.circle(x, y, this.radius, this.options);
        World.add(engine.world, this.body);
        this.x = x;
        this.y = y;
        this.inWorld = true;
    }

    // removes the body from the world
    remove() {
        World.remove(engine.world, this.body);
        this.inWorld = false;
    }

    // draws the body
    draw() {
        if (this.inWorld) {
            fill(this.body.render.fillStyle);
            drawVertices(this.body.vertices);
        }
    }
}

// Creates 15 red balls in a triangle pattern with the tip pointing left
// x and y are the tip of the triangle
//         *
//       * *
//  -> * * *
//       * *
//         *
// Returns an array of red ball objects
function make_red_balls(x, y) {
    var ballRadius = BALLDIA / 2;
    var redBalls = [];
    var colDistance = Math.sqrt(Math.pow(BALLDIA, 2) - Math.pow(ballRadius, 2));

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
                y: y - ((ballCount - 1) / 2) * BALLDIA
            }
        }
        for (var i = 0; i < ballCount; i++) {
            var ball = new Ball(topPosition.x, topPosition.y + (i * BALLDIA), ballRadius, "red ball", "red", BALL);
            redBalls.push(ball);
        }
    }
    return redBalls;
}

// Creates 6 colored balls
// Input: x, y are the coordinates of the center of the table
// Returns an array of colored ball objects
function make_colored_balls(x, y) {
    var colored_balls = [];
    var ballRadius = BALLDIA / 2;

    // Blue ball placed in the center of the table
    var blueBall = new Ball(x, y, ballRadius, "color blue ball", "blue", BALL);
    colored_balls.push(blueBall);

    // Pink ball is placed inbetween blue ball and right cushion 
    var pinkBall = new Ball(x + (TABLEWIDTH / 4), y, ballRadius, "color pink ball", "pink", BALL);
    colored_balls.push(pinkBall);

    // Black ball is placed 12.8 inches (approx. 0.09 of table width) from right cushion 
    var blackBall = new Ball(x + (TABLEWIDTH / 2) - (0.09 * TABLEWIDTH), y, ballRadius, "color black ball", "black", BALL);
    colored_balls.push(blackBall);

    // Brown ball is placed 29 inches (approx. 0.3 table widths) from center of table
    var brownBall = new Ball(x - (0.3 * TABLEWIDTH), y, ballRadius, "color brown ball", "#c17a44", BALL);
    colored_balls.push(brownBall);

    // Green ball is placed above brown ball where the "D" meets the baulk line
    var greenBall = new Ball(x - (0.3 * TABLEWIDTH), y - (0.08 * TABLEWIDTH), ballRadius, "color green ball", "#7eed63", BALL);
    colored_balls.push(greenBall);

    // Yellow ball is placed below brown ball where the "D" meets the baulk line
    var yellowBall = new Ball(x - (0.3 * TABLEWIDTH), y + (0.08 * TABLEWIDTH), ballRadius, "color yellow ball", "#f3f357", BALL);
    colored_balls.push(yellowBall);

    return colored_balls;
}

// Draw the cue ball, red balls and colored balls
function draw_balls() {
    push();
    if (freeCueBall) { // highlight cue ball if it is free
        stroke("#7af952");
        strokeWeight(3);
    }
    cueBall.draw();
    pop();

    redBalls.forEach(ball => ball.draw());
    coloredBalls.forEach(ball => ball.draw());
}


////////////////////////////////////////
/////// Ball modes /////////////////////
////////////////////////////////////////

function balls_to_original_pos() {
    cueBall.add(cueBall.originalPos.x, cueBall.originalPos.y);
    cue.add(cueBall.originalPos.x, cueBall.originalPos.y);
    redBalls.forEach(ball => { ball.add(ball.originalPos.x, ball.originalPos.y) });
    coloredBalls.forEach(ball => { ball.add(ball.originalPos.x, ball.originalPos.y) });
}

function randomize_balls(option) {
    let xRange = { min: (width / 2) - halfTableWidth + 10, max: (width / 2) + halfTableWidth - 10 };
    let yRange = { min: (height / 2) - halfTableLength + 10, max: (height / 2) + halfTableLength - 10 };

    // Array of ball positions
    let ballsPos;

    if (option == "red") {
        coloredBalls.forEach(ball => {
            ball.add(ball.originalPos.x, ball.originalPos.y);
        });

        ballsPos = coloredBalls.map(ball => ball.body.position);
        ballsPos.push(cueBall.body.position);
    }
    if (option == "all") {
        ballsPos = [cueBall.body.position];
        coloredBalls.forEach(ball => check_and_add_random_ball_pos(ball, ballsPos, xRange, yRange));
    }

    redBalls.forEach(ball => check_and_add_random_ball_pos(ball, ballsPos, xRange, yRange));
}

// Generates a random position for a ball and checks if it is too close to any other ball
// Inputs: 
//  ball : ball object to be repositioned,
//  ballsPos : array of ball positions,
//  xRange : object with min and max x values
//  yRange : object with min and max y values
function check_and_add_random_ball_pos(ball, ballsPos, xRange, yRange) {
    let randomPosX;
    let randomPosY;
    let validPos = false;
    let loopCounter = 0;

    while (!validPos) {
        randomPosX = random(xRange.min, xRange.max);
        randomPosY = random(yRange.min, yRange.max);
        for (let i = 0; i < ballsPos.length; i++) {
            if (dist(randomPosX, randomPosY, ballsPos[i].x, ballsPos[i].y) < BALLDIA) {
                break;
            }
            if (i == ballsPos.length - 1) {
                validPos = true;
            }
        }
        loopCounter++;
        if (loopCounter > 100) {
            console.log("looped too many times");
            break;
        }
    }
    ballsPos.push({ x: randomPosX, y: randomPosY });
    ball.add(randomPosX, randomPosY);
}
