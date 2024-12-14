const cards = ["2C", "2D", "2H", "2S", "3C", "3D", "3H", "3S", "4C", "4D", "4H", "4S", "5C", "5D", "5H", "5S", "6C", "6D", "6H", "6S", "7C", "7D", "7H", "7S", "8C", "8D", "8H", "8S", "9C", "9D", "9H", "9S", "aC", "aD", "aH", "aS", "jC", "jD", "jH", "jS", "kC", "kD", "kH", "kS", "qC", "qD", "qH", "qS", "tC", "tD", "tH", "tS"];
const srcs = cards.map(m => m);
srcs.push("cardBack");

let player = [];
let playerCardPos = [];
let player2 = [];
let player2CardPos = [];
let dealer = [];
let dealerCardPos = [];

let freeze = false;

let halfBustAnimation = 0;
let dealerNext = false;
let endingAnimation = -0.1;
let cardStun = 0;

let busted = false;
let splitBusted = [false, false];
let playerWins = false;
let dealerWin = false;
let s_push = false;
let resetting = false;
let split = false;

var debug = false;

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
            const {card} = c;

            if (card === newCard) reroll = true;
        });

        if (!reroll) {
            selfArr.push({card: newCard, hidden});
            return newCard;
        }
    } while (reroll);
}

function randomCard(selfArr, otherArr, otherOtherArr, hidden) {
    let card = _rcard2(selfArr, otherArr, hidden);
    if (otherOtherArr.includes(card)) card = _rcard2(selfArr, otherOtherArr, hidden);

    return card;
}

let gameFinished = false;

async function updateBlackjack() {
    storedGameState.blackjack = {
        player,
        player2,
        dealer,
        split,
        splitBusted
    };
    await updateGameState();
}

function preload() {
    if (storedGameState.blackjack === "start") {
        randomCard(player, dealer, player2, false);
        randomCard(player, dealer, player2, false);

        randomCard(dealer, player, player2, false);
        randomCard(dealer, player, player2, true);
        updateBlackjack();
    } else {
        player = storedGameState.blackjack.player;
        player2 = storedGameState.blackjack.player2;
        dealer = storedGameState.blackjack.dealer;
        split = storedGameState.blackjack.split;
        splitBusted = storedGameState.blackjack.splitBusted;
    }

    srcs.forEach(s => imgs.set(s, loadImage(`cards/${s}.png`)));
}

function setup() {
    let canvas = createCanvas(1425, 780);
    canvas.id("p5-canvas");
}

function drawCard(id, anim, x, y) {
    push();
    let offset = -100;
    if (y < 300) {
        offset = 100;
    }
    translate(0, -offset);
    translate(0, offset * animateEnding(anim));
    image(imgs.get(id), x, y);
    pop();
}

function drawCardsCentered(cardList, animList, y) {
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

    for (let i = 0; i < cardList.length; i++) {
        const card = cardList[i];
        let cardImg = card.card;
        if (card.hidden) cardImg = "cardBack";
        drawCard(cardImg, animList[i], x, y);

        x += margin;
    }
}

function calcPoints(cards, ignoreAces = false) {
    let sum = 0;
    let aceCount = 0;
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
                    if (ignoreAces) {
                        value = 0;
                    } else {
                        const baseValue = calcPoints(cards, true);

                        if (aceCount > 0 || baseValue + 11 > 21) {
                            value = 1;
                        } else {
                            value = 11;
                        }
                    }
                    aceCount++;
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

function resetGame() {
    location.reload();
}

let bigWining = false;
function bigWin() {
    if (bigWining) return;
    bigWining = true;

    const video = document.createElement('video');
    const canvas = document.getElementById('p5-canvas');
    const buttons = document.querySelector('.buttons');
    canvas.style.display = 'none';
    video.src = '/bigwin.webm';
    video.style.width = canvas.style.width;
    video.style.height = canvas.style.height;
    video.style.marginLeft = '200px';

    document.querySelector("main").insertBefore(video, canvas);
    buttons.style.display = 'none';
    video.play();

    const interval = setInterval(() => {
        if (video.currentTime > 5) {
            bigWining = false;
            clearInterval(interval);
            video.remove();
            buttons.style.display = '';
            canvas.style.display = 'block';

            resetGame();
        }
    }, 100);
}

function animateCards(animArr, arr) {
    if (animArr.length > arr.length) {
        animArr = [];
        for (let i = 0; i < arr.length; i++) {
            animArr.push(1);
        }
    }
    while (animArr.length < arr.length) {
        animArr.push(0);
    }

    for (let i = 0; i < animArr.length; i++) {
        if (animArr[i] < 1) {
            animArr[i] += 0.05;
        }
        if (animArr[i] > 1) animArr[i] = 1;
    }
}

async function draw() {
    background(79, 77, 104, 255);

    noStroke();
    tint(255, 255);

    animateCards(dealerCardPos, dealer);
    animateCards(playerCardPos, player);
    animateCards(player2CardPos, player2);

    if ((splitBusted[0] || splitBusted[1]) && !busted) {
        if (halfBustAnimation < 1) {
            halfBustAnimation += 0.05;
            if (dealerNext) {
                dealerRound();
                dealerNext = false;
            }

            if (halfBustAnimation > 1) halfBustAnimation = 1;
        }
    }

    if (dealerWin || playerWins || s_push || busted) {
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
            if (storedGameState !== null) {
                if (!gameFinished) {
                    gameFinished = true;
                    const {lastBet} = storedGameState;
                    await endGame(-1);
                    alert(`You have lost ${lastBet}`);
                }
            }
            textSize(127);
            fill(255, 0, 0);
            textFont("DM Mono");
            text("Dealer wins", 330, animateEnding(endingAnimation) * 350);

            if (!resetting) {
                resetting = true;
                setTimeout(() => {
                    resetGame();
                }, 2500);
            }

            return;
        }

        if (playerWins) {
            if (storedGameState !== null) {
                if (!gameFinished) {
                    gameFinished = true;
                    const {lastBet} = storedGameState;
                    await endGame(2);
                    alert(`You have won ${lastBet * 2}`);
                }
            }
            if (!bigWining) bigWin();

            return;
        }

        if (s_push) {
            if (storedGameState !== null) {
                await endGame(0);
            }
            textSize(127);
            fill(255, 151, 0);
            textFont("DM Mono");
            text("PUSH", 590, animateEnding(endingAnimation) * 350);

            if (!resetting) {
                resetting = true;
                setTimeout(() => {
                    resetGame();
                }, 2500);
            }

            return;
        }

        if (busted) {
            if (storedGameState !== null) {
                if (!gameFinished) {
                    gameFinished = true;
                    const {lastBet} = storedGameState;
                    await endGame(-1);
                    alert(`You have lost ${lastBet}`);
                }
            }
            textSize(127);
            fill(255, 0, 0);
            textFont("DM Mono");
            text("BUST", 590, animateEnding(endingAnimation) * 350);

            if (!resetting) {
                resetting = true;
                setTimeout(() => {
                    resetGame();
                }, 2500);
            }

            return;
        }
    }

    if (!split) {
        drawCardsCentered(dealer, dealerCardPos, 100);
    } else {
        drawCardsCentered(dealer, dealerCardPos, 0);
    }

    if (!split) {
        drawCardsCentered(player, playerCardPos, 500);
    } else {
        if (splitBusted[0]) tint(255, 255, 255, 255 - (255*halfBustAnimation));
        drawCardsCentered(player, playerCardPos, 300);
        tint(255, 255, 255, 255);
        if (splitBusted[1]) tint(255, 255, 255, 255 - (255*halfBustAnimation));
        drawCardsCentered(player2, player2CardPos, 500);
        tint(255, 255, 255, 255);
    }

    if (window.debug) {
        textSize(18);
        fill(255, 0, 0);
        text(calcPoints(dealer), 100, 680);

        fill(255, 255, 255);
        text(`${calcPoints(player)}:${calcPoints(player2)}`, 100, 700);
    }
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
    if (split) {
        const p2 = calcPoints(player2);

        if (!splitBusted[1]) playerPoints = Math.max(playerPoints, p2);
        if (splitBusted[0]) playerPoints = p2;
    }
    let dealerPoints = calcPoints(dealer);

    if (playerPoints !== 21) {
        while (dealerPoints < playerPoints && dealerPoints < 17) {
            randomCard(dealer, player, player2, false);

            playerPoints = calcPoints(player);
            dealerPoints = calcPoints(dealer);
        }
    }

    if (playerPoints > 21) {
        busted = true;
    }

    if (dealerPoints > 21 || playerPoints > dealerPoints) {
        playerWins = true;
    } else if (playerPoints === dealerPoints) {
        s_push = true;
    } else if (dealerPoints > playerPoints) {
        dealerWin = true;
    }
}

async function g_hit() {
    if (freeze) return;
    if (splitBusted[0] || splitBusted[1]) return;

    if (!split) {
        randomCard(player, dealer, player2, false);
        let playerPoints = calcPoints(player);
        if (playerPoints > 21) busted = true;
        if (!busted) await updateBlackjack();
    } else {
        randomCard(player, dealer, player2, false);
        let playerPoints = calcPoints(player);
        randomCard(player2, dealer, player, false);

        dealerNext = true;

        if (playerPoints > 21) splitBusted[0] = true;
        if (playerPoints2 > 21) splitBusted[1] = true;
        if (splitBusted[0] && splitBusted[1]) busted = true;
        if (!busted) await updateBlackjack();
    }
}

async function g_stand() {
    if (freeze) return;

    await updateBlackjack();
    dealerRound();
}

async function g_split() {
    if (freeze) return;
    if (player.length !== 2) return;
    if (player[0].card.charCodeAt(0) !== player[1].card.charCodeAt(0)) return;
    if (split) return;

    split = true;

    const [first, second] = player;
    player = [first];
    player2 = [second];

    randomCard(player, dealer, player2, false);
    randomCard(player2, dealer, player, false);
    await updateBlackjack();
}

async function g_double() {
    if (freeze) return;
    if (split) return;

    randomCard(player, dealer, player2, false);
    let playerPoints = calcPoints(player);
    if (playerPoints > 21) busted = true;
    await updateBlackjack();
    dealerRound();
}