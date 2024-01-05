class Ball {
    constructor(x, y, radius, label, color, category, mask = CUEBALL ) {
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

// 15 red balls in a triangle pattern with the tip pointing left
// x and y are the tip of the triangle
//         *
//       * *
//  -> * * *
//       * *
//         *
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

// x, y are the coordinates of the center of the table
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

function draw_balls() {
    push();
    if(freeCueBall){
        stroke("#7af952");
        strokeWeight(3);
    }
    cueBall.draw();
    pop();
    redBalls.forEach(ball => ball.draw());
    coloredBalls.forEach(ball => ball.draw());
}

