import {loadOrInitDB, saveDB, type User} from "./db.ts";
import {randomBytes} from "crypto";

function urlToPath(dir: String, pathname: String) {
    if (pathname.includes('..') || pathname.includes('//')) throw 'Invalid path';

    let filePath = `${dir}${pathname}`;
    if (filePath.endsWith('/')) filePath += 'index.html';

    return filePath;
}

const db = await loadOrInitDB();

process.on("exit", () => {
    console.log("Saving database...");
    saveDB(db);
});

setInterval(async () => {
    await saveDB(db);
}, 1_800_000);

const server = Bun.serve({
    async fetch(req) {
        const { url } = req;
        const { pathname, searchParams } = new URL(url);

        switch (pathname) {
            case "/profile/me":
                const m_token = searchParams.get("token");
                let m_user: User | undefined;
                db.users.forEach((u) => {
                    if (u.token.length > 1 && u.token === m_token) m_user = u;
                })
                if (!m_user) {
                    return Response.json({
                        success: false,
                        error: "Invalid token"
                    });
                }

                return Response.json({
                    success: true,
                    user: {
                        username: m_user.username,
                        money: m_user.money
                    },
                });
            case "/auth/login":
                const { username: login_username, password: login_password } = await req.json();
                const user = db.users.get(login_username);

                if (!user) {
                    return Response.json({
                        success: false,
                        error: "Authentication failure",
                    });
                }
                const hashMatches = Bun.password.verify(login_password, user.hash);
                if (!hashMatches) {
                    return Response.json({
                        success: false,
                        error: "Authentication failure",
                    });
                }

                user.token = randomBytes(48).toString("hex");
                saveDB(db);

                return Response.json({
                    success: true,
                    token: user.token,
                });
            case "/auth/register":
                const { username: reg_username, password: reg_password } = await req.json();
                const hash = await Bun.password.hash(reg_password, {algorithm: "argon2id"});

                if (db.users.has(reg_username)) {
                    return Response.json({
                        success: false,
                        error: "User already exists"
                    });
                }

                db.users.set(reg_username, {
                    username: reg_username,
                    hash,
                    money: 100_000,
                    token: ""
                });

                saveDB(db);

                return Response.json({
                    success: true
                });
        }

        const file = Bun.file(urlToPath('./static', pathname));
        return new Response(file);
    },
    error(error) {
        if (error.code === 'ENOENT') return new Response('Page not found', { status: 404 });

        console.log(error.code);
        return new Response(`<pre>${error}\n${error.stack}</pre>`, {
            headers: {
                "Content-Type": "text/html",
            },
        });
    }
});

console.log(`Listening on ${server.port}`);