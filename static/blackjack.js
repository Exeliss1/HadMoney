const cards = ["2C","2D","2H","2S","3C","3D","3H","3S","4C","4D","4H","4S","5C","5D","5H","5S","6C","6D","6H","6S","7C","7D","7H","7S","8C","8D","8H","8S","9C","9D","9H","9S","aC","aD","aH","aS","jC","jD","jH","jS","kC","kD","kH","kS","qC","qD","qH","qS","tC","tD","tH","tS"];
const srcs = cards.map(m => m);
srcs.push("cardBack");

let player = [];
let player2 = [];
let dealer = [];

let freeze = false;

let halfBustAnimation = 0;
let endingAnimation = -0.1;
let cardStun = 0;

let busted = false;
let playerWinSoEzJajajajjaa = false;
let dealerWin = false;
let push = false;

let split = false;
let bottomBust = false;
let topBust = false;

const imgs = new Map();

function _rcard() {
    return cards[Math.floor(Math.random() * cards.length)];
}

function _rcard2(selfArr, otherArr, hidden) {
    let reroll = false;
    do {
        reroll = false;
        let newCard = _rcard();
        console.log(newCard, otherArr);

        otherArr.forEach(c => {
            const { card } = c;

            if (card === newCard) reroll = true;
        });

        if (!reroll) selfArr.push({card: newCard, hidden});
    } while (reroll);
}

function randomCard(selfArr, otherArr, otherOtherArr, hidden) {
    let card = _rcard2(selfArr, otherArr, hidden);
    if (otherOtherArr.includes(card)) card = _rcard2(selfArr, otherOtherArr, hidden);
    
    return card;
}

function preload() {    
    player.push({ card: "5C", hidden: false });
    player.push({ card: "5D", hidden: false });
    // randomCard(player, dealer, false);
    // randomCard(player, dealer, false);
    
    randomCard(dealer, player, player2, false);
    randomCard(dealer, player, player2, true);
    
    srcs.forEach(s => imgs.set(s, loadImage(`cards/${s}.png`)));
}

function setup() {
    let canvas = createCanvas(1425, 780);
    canvas.id("p5-canvas");
}

function drawCard(id, x, y) {
    image(imgs.get(id), x, y);
}

function drawCardsCentered(cardList, y) {
    let x = 0;
    let margin = 0;

    switch (cardList.length) {
        case 7:
            x = 60;
            break;
        case 6:
            x = 160;
            break;
        case 5:
            x = 260;
            break;
        case 4:
            x = 360;
            break;
        case 3:
            x = 460;
            break;
            case 2:
            x = 550;
            break;
        default:
            x = 650;
            break;
    }

    if (cardList.length > 0) margin = 200;

    for (const card of cardList) {
        let cardImg = card.card;
        if (card.hidden) cardImg = "cardBack";
        drawCard(cardImg, x, y);
        
        x += margin;
    }
}

function calcPoints(cards, calcAce = true) {
    let sum = 0;
    for (const card of cards) {
        const vl = card.card[0];
        let value = parseInt(vl);

        if (isNaN(value)) {
            switch (vl) {
                case 't':
                    value = 10;
                    break;
                case 'j':
                case 'q':
                case 'k':
                    value = 10;
                    break;
                case 'a':
                    if (calcAce) {
                        const acelessPoints = calcPoints(cards, false);

                        if (acelessPoints + 11 < 21) {
                            value = 11;
                        } else {
                            value = 1;
                        }
                    } else {
                        value = 11;
                    }
                    break;
                default:
                    throw `Unknown value: ${vl}`;
            }
        }

        sum += value;
    }

    return sum;
}

function animateEnding(timeFraction) {
    return Math.pow(timeFraction, 2);
}

function draw() {
    background(79, 77, 104, 255);

    noStroke();
    tint(255, 255);

    if (dealerWin || playerWinSoEzJajajajjaa || push || busted) {
        if (cardStun < 1) {
            revealCards();
            freeze = true;
            cardStun += 0.01;
        } else {
            if (endingAnimation < 1) {
                endingAnimation += 0.02;
            }
            if (endingAnimation > 1) endingAnimation = 1;
        }
    }

    if (cardStun > 1) {
        if (dealerWin) {
            textSize(127);
            fill(255, 0, 0);
            textFont("DM Mono");
            text("Dealer wins", 330, animateEnding(endingAnimation) * 350);

            return;
        }

        if (playerWinSoEzJajajajjaa) {
            textSize(127);
            fill(52, 235, 97);
            textFont("DM Mono");
            text("BIG WIN", 490, animateEnding(endingAnimation) * 350);

            return;
        }

        if (push) {
            textSize(127);
            fill(255, 151, 0);
            textFont("DM Mono");
            text("PUSH", 590, animateEnding(endingAnimation) * 350);
            
            return;
        }

        if (busted) {
            textSize(127);
            fill(255, 0, 0);
            textFont("DM Mono");
            text("BUST", 590, animateEnding(endingAnimation) * 350);

            return;
        }
    }

    if (!split) {
        drawCardsCentered(dealer, 100);
    } else {
        drawCardsCentered(dealer, 0);
    }
    
    if (!split) {
        drawCardsCentered(player, 500);
    } else {
        drawCardsCentered(player, 300);
        drawCardsCentered(player2, 500);
    }

    textSize(18);

    fill(255, 0, 0);
    text(calcPoints(dealer), 100, 680);

    fill(255, 255, 255);
    text(`${calcPoints(player)}:${calcPoints(player2)}`, 100, 700);
}

function revealCards() {
    for (const card of dealer) {
        if (card.hidden) {
            card.hidden = false;
            break;
        }
    }
}

function dealerRound() {
    let playerPoints = calcPoints(player);
    let dealerPoints = calcPoints(dealer);

    while (dealerPoints < playerPoints && dealerPoints < 17) {
        randomCard(dealer, player, player2, false);

        playerPoints = calcPoints(player);
        dealerPoints = calcPoints(dealer);
    }

    if (playerPoints > 21) {
        busted = true;
    }

    if (dealerPoints > 21 || playerPoints > dealerPoints) {
        playerWinSoEzJajajajjaa = true;
    } else if (playerPoints == dealerPoints) {
        push = true;
    } else if (dealerPoints > playerPoints) {
        dealerWin = true;
    }
}

function g_hit() {
    if (freeze) return;
    
    if (!split) {
        randomCard(player, dealer, player2, false);
        let playerPoints = calcPoints(player);
        if (playerPoints > 21) busted = true;    
    } else {
        randomCard(player, dealer, player2, false);
        let playerPoints = calcPoints(player);
        randomCard(player2, dealer, false);
        let playerPoints2 = calcPoints(player2);

        console.log(playerPoints, playerPoints2);
    }
}

function g_stand() {
    if (freeze) return;

    dealerRound();
}

function g_split() {
    if (freeze) return;
    if (player.length !== 2) return;
    if (player[0].card.charCodeAt(0) !== player[1].card.charCodeAt(0)) return;
    if (split) return;

    split = true;
    
    const [ first, second ] = player;
    player = [first];
    player2 = [second];

    randomCard(player, dealer, player2, false);
    randomCard(player2, dealer, player, false);
    // dealerRound();
}

function g_double() {
    if (freeze) return;
    if (split) return;

    randomCard(player, dealer, player2, false);
    let playerPoints = calcPoints(player);
    if (playerPoints > 21) busted = true;
    dealerRound();
}