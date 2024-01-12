// x, y are the center of the cue ball
class Cue {
    constructor(x, y) {
        this.length = 300;
        this.width = 10;
        this.inWorld;


        this.options = {
            label: "cue",
            isSensor: true,
            render: {
                fillStyle: "#41230e"
            },
            collisionFilter: {
                category: CUE,
                mask: CUEBALL | MOUSE
            }
        };
        this.add(x, y);
    }

    draw(cueIndex) {
        if (this.inWorld) {
            push();

            translate(this.cueBody.position.x, this.cueBody.position.y);
            rotate(this.cueBody.angle);

            imageMode(CENTER);
            image(cueImages[cueIndex], 0, 0, this.length, this.width);

            pop();
        }


    }

    drawTrajectory() {
        if (!this.inWorld) return;
        // distance between tip of cue and cue ball
        let distance = dist(this.cueBody.position.x, this.cueBody.position.y, cueBall.body.position.x, cueBall.body.position.y) * 2;

        // Projected end point of guide line
        let x = cueBall.body.position.x + distance * Math.cos(this.cueBody.angle);
        let y = cueBall.body.position.y + distance * Math.sin(this.cueBody.angle);

        let lowerBound = height / 2 + halfTableLength - 10;
        let upperBound = height / 2 - halfTableLength + 10;
        let leftBound = width / 2 - halfTableWidth + 10;
        let rightBound = width / 2 + halfTableWidth - 10;

        stroke(255);
        strokeWeight(1);
        let newX, newY;
        if (y > lowerBound) {
            // Reflected Y coordinate
            newY = (2 * lowerBound) - y;

            let x2 = cueBall.body.position.x + (lowerBound - cueBall.body.position.y) / Math.tan(this.cueBody.angle);
            let y2 = lowerBound;
            // line to from ball to bottom cushion
            line(cueBall.body.position.x, cueBall.body.position.y, x2, y2);
            // line from left cushion to reflection point
            line(x2, y2, x, newY);
        }
        else if (y < upperBound) {
            // Reflected Y coordinate
            newY = (2 * upperBound) - y;

            let x2 = cueBall.body.position.x + (upperBound - cueBall.body.position.y) / Math.tan(this.cueBody.angle);
            let y2 = upperBound;
            // line to from ball to top cushion
            line(cueBall.body.position.x, cueBall.body.position.y, x2, y2);
            // line from left cushion to reflection point
            line(x2, y2, x, newY);
        }
        else if (x < leftBound) {
            // Reflected X coordinate
            newX = (2 * leftBound) - x;

            let y2 = cueBall.body.position.y + (leftBound - cueBall.body.position.x) * Math.tan(this.cueBody.angle);
            let x2 = leftBound;
            // line to from ball to top cushion
            line(cueBall.body.position.x, cueBall.body.position.y, x2, y2);
            // line from left cushion to reflection point
            line(x2, y2, newX, y);
        }
        else if (x > rightBound) {
            // Reflected X coordinate
            newX = (2 * rightBound) - x;

            let y2 = cueBall.body.position.y + (rightBound - cueBall.body.position.x) * Math.tan(this.cueBody.angle);
            let x2 = rightBound;
            // line to from ball to bottom cushion
            line(cueBall.body.position.x, cueBall.body.position.y, x2, y2);
            // line from left cushion to reflection point
            line(x2, y2, newX, y);
        }
        else {
            // straight trajectory
            line(cueBall.body.position.x, cueBall.body.position.y, x, y);
        }
    }

    // remove cue from world
    remove() {
        World.remove(engine.world, [this.cueBody, this.cueConstraint]);
        this.inWorld = false;
    }

    // x, y are the center of the cue ball
    add(x, y) {
        // If cue is already in world, remove it. Used when add() is called to reposition the cue
        if (this.inWorld){ this.remove() }

        this.cueBody = Bodies.rectangle(x - (this.length / 2) - (BALLDIA / 2) - 5, y, this.length, this.width, this.options);
        this.cueConstraint = Constraint.create({
            pointA: {
                x: x,
                y: y
            },
            bodyB: this.cueBody,
            pointB: {
                x: this.length / 2,
                y: 0
            },
            stiffness: 0.2,
        });
        this.inWorld = true;
        World.add(engine.world, [this.cueBody, this.cueConstraint]);
    }
}
