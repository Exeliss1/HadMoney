async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const req = await fetch(`/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
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
        body: JSON.stringify({ username, password })
    });
    const resp = await req.json();

    if (resp.success) {
        alert('Successfully registered');
        location.href = '/login.html';
    } else {
        alert(resp.error);
    }
}

var user = null;

(async ()=>{
    const path = location.pathname;
    if (path !== "/login.html" && path !== "/register.html") {
        document.getElementById("loginBtn").remove();
        document.getElementById("registerBtn").remove();
        const token = localStorage.getItem("token");
        if (token !== null) {
            console.log(token);
            const req = await fetch(`/profile/me?token=${token}`);
            const resp = await req.json();

            if (!resp.success) {
                alert(resp.error);
                return;
            }

            user = resp.user;
            document.getElementById('profile').innerText = `${user.username} (${user.money})`;
        } else {

        }
    }
})();