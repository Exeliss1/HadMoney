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
    ballStop = random(0, Math.PI * 2);
    ballMaxDist = ballStopRounds * Math.PI * 2;
    ballMaxDist += ballStop;
}

function setup() {
    let canvas = createCanvas(1425, 780);
    canvas.id("p5-canvas");
}

let ballAngle = 0;
const rvals = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
    31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const ranges = [];
{
    for (let m = 0; m < 37; m++) {
        ranges.push(2 * Math.PI / 37 * (m + 0.5));
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
        if (j < 0) j = ranges.length - 1;
        const start = ensureRange(ranges[j] + angle, Math.PI * 2);
        const end = ensureRange(ranges[i] + angle, Math.PI * 2);

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

function drawWheel() {
    if (wheelSpinState < 1) wheelSpinState += random(0.004, 0.01);
    if (wheelSpinState > 1) wheelSpinState = 1;
    wheelAngle += (baseSpinRate * (1 - animate(wheelSpinState)));
    if (ballRounds < ballStopRounds || Math.abs(ballAngle - ballStop) > 0.1) {
        const speed = 1 - Math.max(animate(ballDist / ballMaxDist), 0.05);
        ballAngle -= 0.2 * speed;
        ballDist += 0.2 * speed;
    }
    if (wheelAngle >= 6.283) wheelAngle -= 6.283;

    push();
    translate(350, 0);

    const xOffset = 74 + (452 / 2);
    const yOffset = 74 + (452 / 2);

    translate(xOffset, yOffset);

    push();
    rotate(wheelAngle);
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
        ballAngle = Math.PI * 2;
        ballRounds++;
    }
    image(roulette_pill, 0, 0);
    pop();
}

let wheelAngle = 0;
let wheelSpinState = 0;
let spinning = false;

function animate(timeFraction) {
    return Math.pow(timeFraction, 2);
}

function isMouseOver(x, y, x2, y2) {
    if (mouseX >= x && mouseX <= x2) {
        return mouseY >= y && mouseY <= y2;
    }

    return false;
}

function drawTable() {
    push();
    translate(0, 46);

    for (let i = 0; i < 36; i++) {
        push();
        const v = i + 1;
        translate((i % 12) * 64, Math.floor(i / 12) * 64);

        textSize(20);
        let color = [255, 255, 255];
        if (i % 2 === 0) {
            color = [255, 0, 0];
        } else {
            color = [0, 0, 0];
        }


        fill(color);
        let xOffset = 0;
        if (i + 1 > 9) xOffset = 5;
        text(`${v}`, 50 - xOffset, 55);

        stroke(color);
        line(30, 20, 85, 20);
        line(85, 20, 85, 75);
        line(85, 75, 30, 75);
        line(30, 20, 30, 75);
        pop();
    }

    {
        push();
        translate(0, 3 * 64);

        fill(0, 255, 0);
        textSize(20);
        text("0", 85, 55);

        stroke(0, 255, 0);
        line(30, 20, 150, 20);
        line(150, 20, 150, 75);
        line(150, 75, 30, 75);
        line(30, 20, 30, 75);
        pop();
    }

    {
        push();
        translate(128, 3 * 64);

        fill(0);
        textSize(20);
        text("Black", 60, 55);

        stroke(0);
        line(30, 20, 150, 20);
        line(150, 20, 150, 75);
        line(150, 75, 30, 75);
        line(30, 20, 30, 75);
        pop();
    }

    {
        push();
        translate(256, 3 * 64);

        fill(255, 0, 0);
        textSize(20);
        text("Red", 70, 55);

        stroke(255, 0, 0);
        line(30, 20, 150, 20);
        line(150, 20, 150, 75);
        line(150, 75, 30, 75);
        line(30, 20, 30, 75);
        pop();
    }

    {
        push();
        translate(0, 4 * 64);

        fill(255);
        textSize(20);
        text("Spin", 64, 55);

        stroke(255);
        line(30, 20, 150, 20);
        line(150, 20, 150, 75);
        line(150, 75, 30, 75);
        line(30, 20, 30, 75);
        pop();
    }

    pop();
}

let bets = [];
if (storedGameState.roulette && storedGameState.roulette.bets) {
    bets = storedGameState.roulette.bets;
}

let lastBallDelta = -1;
let stopTimer = 1;
function draw() {
    textFont('DM Mono');
    background(79, 77, 104, 255);

    noStroke();
    tint(255, 255);


    push();
    translate(30, 46);

    fill(255);
    textSize(32);
    text(`Bets: ${bets.length * 50}`, 0, 0);
    pop();

    if (spinning) {
        drawWheel();

        let ballDelta = ballMaxDist - ballDist;
        if (lastBallDelta === ballDelta) {
            stopTimer -= 0.07;
            if (stopTimer < 0) {
                const ballPos = ballLocation(wheelAngle, ballAngle);
                const result = rvals[ballPos];

                let n = 0;
                (async () => {
                    let black = ballPos % 2 === 0;
                    console.log(black, result);

                    bets.forEach(b => {
                        if (b.startsWith("n")) {
                            const bn = parseInt(b.substring(1));
                            if (bn === result) n += 50 * 38;
                        } else {
                            if (b === "b") {
                                if (black) n += 50 * 3;
                            } else {
                                if (!black) n += 50 * 3;
                            }
                        }
                    });

                    const delta = n - bets.length * 50;

                    storedGameState.lastBet = delta;
                    await updateGameState();
                    await endGame(1);

                    if (delta === 0) {
                        alert('You broke even');
                        location.reload();
                        return;
                    }
                    if (delta < 0) {
                        alert(`You lost ${-delta}`);
                        location.reload();
                        return;
                    }

                    alert(`You won ${delta}`);
                    location.reload();
                })();

                spinning = false;
            }
        }
        lastBallDelta = ballDelta;
    } else {
        drawTable();
    }

    fill(255);
    textSize(20);
}

function onClick() {
    if (spinning) return;

    let v = -1;
    for (let i = 0; i < 36; i++) {
        const n1X = 46 + (i % 12) * 64;
        const n1Y = 46 + Math.floor(i / 12) * 64;
        if (isMouseOver(n1X, n1Y, n1X + 85, n1Y + 85)) {
            v = i + 1;
        }
    }

    const n2X = 46 + 30;
    const n2Y = 46 + (3 * 64) + 20;
    const n3X = n2X + 128;
    const n4X = n3X + 128;

    const n5X = 46 + 30;
    const n5Y = 46 + (4 * 64) + 20;

    if (isMouseOver(n2X, n2Y, n2X + 150, n2Y + 75)) {
        v = 0;
    }
    if (isMouseOver(n3X, n2Y, n3X + 150, n2Y + 75)) {
        v = -2;
    }
    if (isMouseOver(n4X, n2Y, n4X + 150, n2Y + 75)) {
        v = -3;
    }
    if (isMouseOver(n5X, n5Y, n5X + 150, n5Y + 75)) {
        v = -4;
    }

    switch (v) {
        case -1:
            break;
        case -2:
            bets.push("b");
            break;
        case -3:
            bets.push("r");
            break;
        case -4:
            spinning = true;
            break;
        default:
            bets.push(`n${v}`);
    }

    storedGameState.roulette = {bets};
    updateGameState();
}

document.body.onmousedown = onClick;