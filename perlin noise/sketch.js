let example = 1;
const width = 600;
const height = 600;

//first example
const scale = 10;
const count = 6*width/(7*scale);
let randomArray = [];
let noiseArray = [];
let scroll = 0;

//second example
const w = 1200;
const h = 900;
const scl = 20;
const cols = w/scl;
const rows = h/scl;
let flying = 0;
const terrain = new Array(cols).fill(0).map(() => new Array(rows).fill(0));

function setup() {
    createCanvas(width, height, WEBGL);
    frameRate(30);

    const firstExampleButton = document.getElementById('firstExample');
    firstExampleButton.addEventListener('click', () => example = 1);
    for (let i = 0; i < count; i++)
    {
        randomArray.push(random(-height/2 + height/7, -height/7));
    }
    for (let i = 0; i < count; i++)
    {
        noiseArray.push(map(noise(i/scale), 0, 1, 0, height/2));
    }

    const secondExampleButton = document.getElementById('secondExample');
    secondExampleButton.addEventListener('click', () => example = 2);

    drawFirstExample();
}

function draw() {
    if (example === 1)
    {
        drawFirstExample();
    }

    if (example === 2)
    {
        drawSecondExample();
    }
}

function drawFirstExample()
{
    translate(-3*width/7,0);
    background(0);
    noFill();

    stroke(0, 0, 255);
    line(0, height/2-4*height/7, 0, -3*height/7);
    line(-10, 20-3*height/7, 0, -3*height/7);
    line(10, 20-3*height/7, 0, -3*height/7);
    line(0, -height/7, 6*width/7, -height/7);
    line(6*width/7 - 20, -height/7-10, 6*width/7, -height/7);
    line(6*width/7 - 20, 10-height/7, 6*width/7, -height/7);

    line(0, 4*height/7, 0, 0);
    line(-10, 20, 0, 0);
    line(10, 20, 0, 0);
    line(0, 3*height/7, 6*width/7, 3*height/7);
    line(6*width/7 - 20, 3*height/7 - 10, 6*width/7, 3*height/7);
    line(6*width/7 - 20, 3*height/7 + 10, 6*width/7, 3*height/7);

    
    stroke(255);
    beginShape();
    for (let x = 0; x < count; x++)
    {
        vertex(x*scale, randomArray[x]);
    }
    endShape();
    
    beginShape();
    vertex(0, noiseArray[0]);
    for (let x = 0; x < count; x++)
    {
        curveVertex(x*scale, noiseArray[x]);
    }
    endShape();
}

function mouseWheel(event)
{
    randomArray = [];
    noiseArray = [];
    scroll += event.delta/100;
    for (let i = 0; i < count; i++)
    {
        randomArray.push(random(-height/2 + height/7, -height/7));
    }
    for (let i = 0; i < count; i++)
    {
        noiseArray.push(map(noise(i/scale + scroll), 0, 1, 0, height/2));
    }
}

function drawSecondExample()
{
    let yoff = flying;
    for (let y = 0; y < rows; y++)
    {
        let xoff = 0;
        for (let x = 0; x < cols; x++)
        {
            terrain[x][y] = map(noise(xoff, yoff), 0, 1, -100, 100);
            xoff += 0.1;
        }
        yoff += 0.1;
    }

    rotateX(Math.PI/3);
    translate(-w/2,-h/2,0);

    background(0);
    stroke(255);
    noFill();

    for (let y = 0; y < rows; y++)
    {
        beginShape(TRIANGLE_STRIP);
        for (let x = 0; x < cols; x++)
        {
            vertex(x*scl, y*scl, terrain[x][y]);
            vertex(x*scl, (y+1)*scl, terrain[x][y + 1]);
        }
        endShape();
    }

    flying -= 0.05;
}
