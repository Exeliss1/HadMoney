function urlToPath(dir: String, pathname: String) {
    if (pathname.includes('..') || pathname.includes('//')) throw 'Invalid path';

    let filePath = `${dir}${pathname}`;
    if (filePath.endsWith('/')) filePath += 'index.html';

    return filePath;
}



const server = Bun.serve({
    async fetch(req) {
        const { url } = req;
        const { pathname } = new URL(url);

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