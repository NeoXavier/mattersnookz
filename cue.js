// x, y are the center of the cue ball
class Cue{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.length = 100;
        this.width = 10;
        var options = {
            render: {
                fillStyle: "#41230e"
            },
            collisionFilter: {
                category: 0x0004,
                mask:0x0002 | 0x0008 
            }
        };
        this.cue = Bodies.rectangle(this.x - (this.length/2)-(BALLDIA/2), this.y, this.length, this.width, options);
        console.log(this.cue)
        var cueBallConstraint = Constraint.create({
            pointA:{
                x: this.x,
                y: this.y
            },
            bodyB: this.cue,
            pointB: {
                x: this.length/2,
                y: 0
            },
            stiffness: 0.8,
            damping: 0.2,
        });
        World.add(engine.world, [this.cue, cueBallConstraint]);
    }
    
    draw(){
        fill(this.cue.render.fillStyle);
        drawVertices(this.cue.vertices);
    }
}
