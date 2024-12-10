async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const req = await fetch(`/auth/login`, {
        method: 'POST',
        body: JSON.stringify({username, password})
    });
    const resp = await req.json();

    if (resp.success) {
        localStorage.setItem('token', resp.token);
        location.href = "/games.html";
        alert('Successfully authenticated');
    } else {
        alert(resp.error);
    }
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const req = await fetch(`/auth/register`, {
        method: 'POST',
        body: JSON.stringify({username, password})
    });
    const resp = await req.json();

    if (resp.success) {
        location.href = '/login.html';
    } else {
        alert(resp.error);
    }
}

var user = null;
var storedGameState = null;

async function updateGameState() {
    const req = await fetch(`/profile/game?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        body: JSON.stringify(storedGameState),
    });

    const resp = await req.json();

    if (!resp.success) {
        alert(resp.error);
    }
}

async function endGame(mul) {
    const req = await fetch(`/profile/endGame?token=${localStorage.getItem('token')}&w=${mul}`, {
        method: 'POST',
    });

    const resp = await req.json();

    if (!resp.success) {
        alert(resp.error);
    }

    storedGameState = null;
}

(async () => {
    const path = location.pathname;
    if (path !== "/login.html" && path !== "/register.html") {
        const token = localStorage.getItem("token");
        if (token !== null) {
            document.getElementById("loginBtn").remove();
            document.getElementById("registerBtn").remove();

            const userReq = await fetch(`/profile/me?token=${token}`);
            const userResp = await userReq.json();
            const gameReq = await fetch(`/profile/game?token=${token}`);
            const gameResp = await gameReq.json();

            if (!userResp.success || !gameResp.success) {
                localStorage.clear();
                location.reload();
                return;
            }

            user = userResp.user;
            storedGameState = {lastBet: gameResp.lastBet, blackjack: gameResp.blackjack, roulette: gameResp.roulette};
            document.getElementById('profile').innerText = `${user.username} (${user.money})`;

            if (window.postAuth) window.postAuth();
        } else {

        }
    }
})();