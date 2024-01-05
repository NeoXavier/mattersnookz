// x, y are the center of the cue ball
class Cue{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.length = 300;
        this.width = 10;
        this.inWorld ;


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
        this.add(this.x, this.y);
    }
    
    draw(){
        if (this.inWorld){
            push();
            translate(this.cueBody.position.x, this.cueBody.position.y);
            rotate(this.cueBody.angle);

            imageMode(CENTER);
            image(cueImg, 0, 0, this.length, this.width);
            pop();
        }
    }

    remove(){
        World.remove(engine.world, [this.cueBody, this.cueConstraint]);
        this.inWorld = false;
    }

    // x, y are the center of the cue ball
    add(x, y){
        this.cueBody = Bodies.rectangle(x - (this.length/2)-(BALLDIA/2)-5, y, this.length, this.width, this.options);
        this.cueConstraint = Constraint.create({
            pointA:{
                x: x,
                y: y
            },
            bodyB: this.cueBody,
            pointB: {
                x: this.length/2,
                y: 0
            },
            stiffness: 0.2,
        });
        this.inWorld = true;
        World.add(engine.world, [this.cueBody, this.cueConstraint]); 
    }
}
