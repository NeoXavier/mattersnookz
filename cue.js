// x, y are the center of the cue ball
class Cue{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.length = 100;
        this.width = 10;
        this.inWorld ;


        this.options = {
            label: "cue",
            isSensor: true,
            render: {
                fillStyle: "#41230e"
            },
            collisionFilter: {
                category: 0x0004,
                mask:0x0002 | 0x0008 
            }
        };
        this.add(this.x, this.y);
    }
    
    draw(){
        if (this.inWorld){
            fill(this.cueBody.render.fillStyle);
            drawVertices(this.cueBody.vertices);
        }
    }

    remove(){
        World.remove(engine.world, [this.cueBody, this.cueConstraint]);
        this.inWorld = false;
    }

    // x, y are the center of the cue ball
    add(x, y){
        this.cueBody = Bodies.rectangle(x - (this.length/2)-(BALLDIA/2)-1, y, this.length, this.width, this.options);
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
