class Table {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.pocketSize = BALLDIA * 1.5;

        // Pockets
        var pocketXOffset = halfTableWidth - 5;
        var pocketYOffset = halfTableLength - 5;
        this.pocketPositions = [
            // Top Left pocket
            { x: this.x - pocketXOffset, y: this.y - pocketYOffset },
            // Top Right pocket
            { x: this.x + pocketXOffset, y: this.y - pocketYOffset },
            // Bottom Left pocket
            { x: this.x - pocketXOffset, y: this.y + pocketYOffset },
            // Bottom Right pocket
            { x: this.x + pocketXOffset, y: this.y + pocketYOffset },
            // Bottom Middle pocket
            { x: this.x, y: this.y + halfTableLength },
            // Top Middle pocket
            { x: this.x, y: this.y - halfTableLength },
        ];

        this.pocketSensors = this.pocketPositions.map(({ x, y }) => this.create_pocket(x, y));

        // Cushions
        var cushionPositions = [
            // Top left
            { x: this.x - quarterTableWidth, y: this.y - ((halfTableLength) - 5), angle: PI },
            // Top right
            { x: this.x + quarterTableWidth, y: this.y - ((halfTableLength) - 5), angle: PI },
            // Bottom left
            { x: this.x - quarterTableWidth, y: this.y + ((halfTableLength) - 5), angle: 0 },
            // Bottom right
            { x: this.x + quarterTableWidth, y: this.y + ((halfTableLength) - 5), angle: 0 },
            // Left 
            { x: this.x - halfTableWidth + 5, y: this.y, angle: HALF_PI },
            // Right
            { x: this.x + halfTableWidth - 5, y: this.y, angle: -HALF_PI },
        ]
        this.cushions = cushionPositions.map(({ x, y, angle }) => this.create_cushion(x, y, angle));

        World.add(engine.world, [...this.pocketSensors, ...this.cushions]);
    };

    // Draws the components of the table
    draw() {
        rectMode(CENTER);
        // Brown portion of table
        fill("#41230e")
        rect(this.x, this.y, TABLEWIDTH + 20, TABLELENGTH + 20, 10);

        // Yellow corners
        fill("#f4d749")
        rect(this.x, this.y - ((halfTableLength) + 5), 20, 10); // top middle
        rect(this.x, this.y + ((halfTableLength) + 5), 20, 10); // bottom middle
        rect(this.x - halfTableWidth, this.y - halfTableLength, 20, 20, 10, 0, 0, 0) //top left
        rect(this.x + halfTableWidth, this.y - halfTableLength, 20, 20, 0, 10, 0, 0) //top right
        rect(this.x + halfTableWidth, this.y + halfTableLength, 20, 20, 0, 0, 10, 0) //bottom right
        rect(this.x - halfTableWidth, this.y + halfTableLength, 20, 20, 0, 0, 0, 10) //bottom left

        // Draw green portion of table
        fill("#4e8734");
        rect(this.x, this.y, TABLEWIDTH, TABLELENGTH, 10);

        // Pockets 
        fill("#000000");
        this.pocketPositions.forEach(({ x, y }) => ellipse(x, y, this.pocketSize));

        push();

        // Baulk line
        // Baulk line is 29 inches from left cushion which is approx. 0.2 of table width (i.e 0.3 tablewidths from center of table)
        stroke("#ffffff");
        line(this.x - (0.3 * TABLEWIDTH), this.y - (halfTableLength), this.x - (0.3 * TABLEWIDTH), this.y + (halfTableLength))

        //the "D"
        // Diameter of the D is 23 inches which is approx. 0.16 of table width
        noFill();
        var dDiameter = 0.16 * TABLEWIDTH;
        arc(this.x - (0.3 * TABLEWIDTH), this.y, dDiameter, dDiameter, HALF_PI, -HALF_PI, OPEN);

        pop();

        draw_bodies(this.pocketSensors);

        draw_bodies(this.cushions);
    };

    // Creates a cushion 
    // returns a matter.js body
    create_cushion(x, y, angle) {
        var cushionWidth = (TABLEWIDTH) / 2 - 20;
        var cushion = Bodies.trapezoid(x, y, cushionWidth, 10, 0.1, {
            friction: 0,
            restitution: 1,
            angle: angle,
            isStatic: true,
            render:
                { fillStyle: '#325f18' }
        });
        return cushion;
    }

    // Creates a collision sensor for the pockets 
    // returns a matter.js body
    create_pocket(x, y) {
        var pocket = Bodies.circle(x, y, this.pocketSize / 2, {
            isStatic: true,
            isSensor: true,
            label: "pocketSensor",
            render:
                { fillStyle: 'black' }
        });
        return pocket;
    }
}

