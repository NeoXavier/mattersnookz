class Ball
{
    constructor(x, y, radius, label, color, category){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.options = {
            restitution: 1,
            friction: .2,
            label: label,
            render: {
                fillStyle: color
            },
            collisionFilter: {
                category: category
            }
        }
    }
    make_ball(){
        var ball = Bodies.circle(this.x, this.y, this.radius, this.options);
        World.add(engine.world, ball)
        return ball;
    }
}

function make_cue_ball(x, y){
    var cueBall = new Ball(x, y,  BALLDIA / 2, "cueBall", "white", 0x0002)
    return cueBall.make_ball();
}

// 15 red balls in a triangle pattern with the tip pointing left
// x and y are the tip of the triangle
//         *
//       * *
//  -> * * *
//       * *
//         *
function make_red_balls(x, y){
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
            var ball = new Ball(topPosition.x, topPosition.y + (i * BALLDIA), ballRadius, "reds", "red", 0x0001);
            redBalls.push(ball.make_ball());
        }
    }
    return redBalls;
}

// x, y are the coordinates of the center of the table
function make_colored_balls(x, y){
    var colored_balls = [];
    var ballRadius = BALLDIA / 2;

    // Blue ball placed in the center of the table
    var blueBall = new Ball(x, y, ballRadius, "blue", "blue", 0x0001);
    colored_balls.push(blueBall.make_ball());

    // Pink ball is placed inbetween blue ball and right cushion 
    var pinkBall = new Ball(x + (TABLEWIDTH / 4), y, ballRadius, "pink", "pink", 0x0001);
    colored_balls.push(pinkBall.make_ball());
    
    // Black ball is placed 12.8 inches (approx. 0.09 of table width) from right cushion 
    var blackBall = new Ball(x + (TABLEWIDTH / 2) - (0.09 * TABLEWIDTH), y, ballRadius, "black", "black", 0x0001);
    colored_balls.push(blackBall.make_ball());
    
    // Brown ball is placed 29 inches (approx. 0.3 table widths) from center of table
    var brownBall = new Ball(x - (0.3 * TABLEWIDTH), y, ballRadius, "brown", "#c17a44", 0x0001);
    colored_balls.push(brownBall.make_ball());

    // Green ball is placed above brown ball where the "D" meets the baulk line
    var greenBall = new Ball(x - (0.3 * TABLEWIDTH), y - (0.08 * TABLEWIDTH), ballRadius, "green", "#7eed63", 0x0001);
    colored_balls.push(greenBall.make_ball());

    // Yellow ball is placed below brown ball where the "D" meets the baulk line
    var yellowBall = new Ball(x - (0.3 * TABLEWIDTH), y + (0.08 * TABLEWIDTH), ballRadius, "yellow", "#f3f357", 0x0001);
    colored_balls.push(yellowBall.make_ball());

    return colored_balls;
}

function draw_balls(){
    fill(cueBall.render.fillStyle)
    drawVertices(cueBall.vertices);
    draw_bodies(redBalls);
    draw_bodies(coloredBalls);
}

