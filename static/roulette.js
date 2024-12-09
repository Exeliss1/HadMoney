let roulette_base;
let roulette_pill;
let roulette_wheel;

let baseSpinRate = 0.1;
let ballRounds = 0;
let ballStopRounds = 0;
let ballMaxDist = 0;
let ballDist = 0;
let ballStop = 0;

function preload() {
    roulette_base = loadImage('roulette/roulette_base.png');
    roulette_pill = loadImage('roulette/roulette_pill.png');
    roulette_wheel = loadImage('roulette/roulette_wheel.png');

    baseSpinRate += random(0.02, 0.1);
    ballStopRounds = Math.floor(random(4, 8));
    ballStop = random(0, Math.PI*2);
    ballMaxDist = ballStopRounds*Math.PI*2;
    ballMaxDist += ballStop;
}

function setup() {
    let canvas = createCanvas(1425, 780);
    canvas.id("p5-canvas");
}

let ballAngle = 0;
const rvals = [0, 32, 15, 19, 4, 21, 2, 25, 17, 13, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 13, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const ranges = [];
{
    for (let m = 0; m < 37; m++) {
        ranges.push(2*Math.PI/37*(m+0.5));
    }
}

function ensureRange(n, n2) {
    let n3 = n;
    while (n3 >= n2) n3 -= n2;

    return n3;
}

function ballLocation(angle, ballPos) {
    for (let i = 0; i < ranges.length; i++) {
        let j = i - 1;
        if (j < 0) j = ranges.length-1;
        const start = ensureRange(ranges[j] + angle, Math.PI*2);
        const end = ensureRange(ranges[i] + angle, Math.PI*2);

        if (start > end) {
            if (ballPos > start || ballPos < end) {
                return i;
            }
        } else {
            if (ballPos >= start && ballPos <= end) return i;
        }
    }

    debugger;
}

function drawWheel(angle) {
    const xOffset = 74+(452/2);
    const yOffset = 74+(452/2);

    translate(xOffset, yOffset);

    push();
    rotate(angle);
    imageMode(CENTER);
    image(roulette_wheel, 0, 0, 452, 452);
    pop();

    push();
    translate(-xOffset, -yOffset);

    imageMode(CORNER);
    image(roulette_base, 0, 0);
    pop();

    imageMode(CENTER);

    const circScale = ballDist / ballMaxDist;
    scale(0.8 - (0.25 * circScale));
    rotate(ballAngle);
    if (ballAngle < 0) {
        ballAngle = Math.PI*2;
        ballRounds++;
        console.log(ballRounds);
    }
    image(roulette_pill, 0, 0);
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

    if (wheelSpinState < 1) wheelSpinState += random(0.004, 0.01);
    if (wheelSpinState > 1) wheelSpinState = 1;
    i += (baseSpinRate * (1 - animate(wheelSpinState)));
    if (ballRounds < ballStopRounds || Math.abs(ballAngle - ballStop) > 0.1) {
        const speed = 1 - Math.max(animate(ballDist / ballMaxDist), 0.05);
        console.log(speed);

        ballAngle -= 0.2 * speed;
        ballDist += 0.2 * speed;
    }
    if (i >= 6.283) i -= 6.283;

    push();
    translate(350, 0);
    drawWheel(i);
    pop();
}