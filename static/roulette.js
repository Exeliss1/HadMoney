let roulette_base;
let roulette_pill;
let roulette_wheel;

let baseSpinRate = 0.1;

function preload() {
    roulette_base = loadImage('roulette/roulette_base.png');
    roulette_pill = loadImage('roulette/roulette_pill.png');
    roulette_wheel = loadImage('roulette/roulette_wheel.png');

    baseSpinRate += random(0.02, 0.1);
}

function setup() {
    let canvas = createCanvas(1425, 780);
    canvas.id("p5-canvas");
}

function drawWheel(angle) {
    const xOffset = 74+(452/2);
    const yOffset = 74+(452/2);

    image(roulette_base, 0, 0);

    translate(xOffset, yOffset);

    rotate(angle);
    imageMode(CENTER);
    image(roulette_wheel, 0, 0, 452, 452);
    imageMode(CORNER);

    translate(-xOffset, -yOffset);
}

let i = 0;
let wheelSpinState = 0;

function animate(timeFraction) {
    return Math.pow(timeFraction, 2);
}

function draw() {
    background(79, 77, 104, 255);

    noStroke();
    tint(255, 255);

    let fps = frameRate();
    text(fps, 50, 50);

    if (wheelSpinState < 1) wheelSpinState += random(0.004, 0.01);
    if (wheelSpinState > 1) wheelSpinState = 1;
    i += (baseSpinRate * (1 - animate(wheelSpinState)));
    if (i >= 6.283) i -= 6.283;

    push();
    translate(350, 0);
    drawWheel(i);
    pop();
}