class Table {
    constructor(x, y, tableWidth, tableLength, ballDiameter) {
        this.x = x;
        this.y = y;
        this.tableWidth = tableWidth;
        this.tableLength = tableLength;
        this.ballDiameter = ballDiameter;
        this.pocketSize = ballDiameter * 1.5;

        // Pockets
        var pocketXOffset = (this.tableWidth / 2);
        var pocketYOffset = (this.tableLength / 2);
        this.pocketPositions = [
            // Top Left pocket
            { x: this.x - pocketXOffset+5, y: this.y - pocketYOffset+5 },
            // Top Right pocket
            { x: this.x + pocketXOffset-5, y: this.y - pocketYOffset+5 },
            // Bottom Left pocket
            { x: this.x - pocketXOffset+5, y: this.y + pocketYOffset-5 },
            // Bottom Right pocket
            { x: this.x + pocketXOffset-5, y: this.y + pocketYOffset-5 },
            // Bottom Middle pocket
            { x: this.x, y: this.y + pocketYOffset },
            // Top Middle pocket
            { x: this.x, y: this.y - pocketYOffset },
        ];
        this.pocketSensors = [];
        for (var i = 0; i < this.pocketPositions.length; i++) {
            var pocket = this.create_pocket(this.pocketPositions[i].x, this.pocketPositions[i].y);
            this.pocketSensors.push(pocket);
        }

        // Cushions
        var cushionPositions = [
            // Top left
            {x: this.x - this.tableWidth/4, y: this.y - ((this.tableLength/2) - 5), angle: PI},
            // Top right
            {x: this.x + this.tableWidth/4, y: this.y - ((this.tableLength/2) - 5), angle: PI},
            // Bottom left
            {x: this.x - this.tableWidth/4, y: this.y + ((this.tableLength/2) - 5), angle: 0},
            // Bottom right
            {x: this.x + this.tableWidth/4, y: this.y + ((this.tableLength/2) - 5), angle: 0},
            // Left 
            {x: this.x - this.tableWidth/2 + 5, y: this.y, angle: HALF_PI},
            // Right
            {x: this.x + this.tableWidth/2 - 5, y: this.y, angle: -HALF_PI},
        ]
        this.cushions = [];
        for(var i = 0; i < cushionPositions.length; i++){
            var cushion = this.create_cushion(cushionPositions[i].x, cushionPositions[i].y, cushionPositions[i].angle);
            this.cushions.push(cushion);
        }

        World.add(engine.world, [...this.pocketSensors, ...this.cushions]);
    };

    // Draws the components of the table
    draw() {
        rectMode(CENTER);
        // Brown portion of table
        fill("#41230e")
        rect(this.x, this.y, this.tableWidth + 20, this.tableLength+20, 10);

        // Yellow corners
        fill("#f4d749")
        rect(this.x, this.y - ((this.tableLength/2) + 5), 20, 10); // top middle
        rect(this.x, this.y + ((this.tableLength/2) + 5), 20, 10); // bottom middle
        rect(this.x - this.tableWidth/2, this.y - this.tableLength/2, 20, 20, 10, 0, 0, 0) //top left
        rect(this.x + this.tableWidth/2, this.y - this.tableLength/2, 20, 20, 0, 10, 0, 0) //top right
        rect(this.x + this.tableWidth/2, this.y + this.tableLength/2, 20, 20, 0, 0, 10, 0) //bottom right
        rect(this.x - this.tableWidth/2, this.y + this.tableLength/2, 20, 20, 0, 0, 0, 10) //bottom left

        // Draw green portion of table
        fill("#4e8734");
        rect(this.x, this.y, this.tableWidth, this.tableLength, 10);

        // Pockets 
        fill("#000000");
        for(var i = 0; i < this.pocketPositions.length; i++){
            ellipse(this.pocketPositions[i].x, this.pocketPositions[i].y, this.pocketSize, this.pocketSize);
        }
        this.draw_bodies(this.pocketSensors);
        
        this.draw_bodies(this.cushions);
    };
    
    // Creates a cushion 
    // returns a matter.js body
    create_cushion(x, y, angle){
        var cushionWidth = (this.tableWidth)/2 - 20;
        var cushion = Bodies.trapezoid(x, y, cushionWidth, 10, 0.1, { angle: angle, isStatic: true, render: { fillStyle: '#325f18' } });
        return cushion;
    }

    // Creates a collision sensor for the pockets 
    // returns a matter.js body
    create_pocket(x, y){
        var pocket = Bodies.circle(x, y, this.pocketSize / 2, { isStatic: true, isSensor: true, label: "pocketSensor", render: { fillStyle: 'black' } });
        return pocket;
    }

    // draws an array of matter.js bodies
    draw_bodies(arr){
        for(var i = 0; i < arr.length; i++){
            fill(arr[i].render.fillStyle);
            drawVertices(arr[i].vertices);
        }
    }
}

