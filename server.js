const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = Number(process.env.PORT || 5505);
const ROOT = __dirname;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const ROUTE_REDIRECTS = new Map([
  ["/", "/main/index.html"],
  ["/admin", "/main/index.html#admin-login"],
  ["/admin-login", "/main/index.html#admin-login"],
  ["/evaluator", "/main/index.html#evaluator-login"],
  ["/evaluator-login", "/main/index.html#evaluator-login"],
  ["/applicant", "/main/index.html#login"],
  ["/applicant-login", "/main/index.html#login"],
  ["/main/admin", "/main/index.html#admin-login"],
  ["/main/admin-login", "/main/index.html#admin-login"],
  ["/main/evaluator", "/main/index.html#evaluator-login"],
  ["/main/evaluator-login", "/main/index.html#evaluator-login"],
  ["/main/applicant", "/main/index.html#login"],
  ["/main/applicant-login", "/main/index.html#login"],
  ["/main/index.html/admin", "/main/index.html#admin-login"],
  ["/main/index.html/admin-login", "/main/index.html#admin-login"],
  ["/main/index.html/evaluator", "/main/index.html#evaluator-login"],
  ["/main/index.html/evaluator-login", "/main/index.html#evaluator-login"],
  ["/main/index.html/applicant", "/main/index.html#login"],
  ["/main/index.html/applicant-login", "/main/index.html#login"],
]);

function sendRedirect(response, location) {
  response.writeHead(302, { Location: location });
  response.end();
}

function sendNotFound(response) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
}

function serveFile(response, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendNotFound(response);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    });
    response.end(data);
  });
}

function resolveStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, normalized);
  if (!filePath.startsWith(ROOT)) return "";
  return filePath;
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname.replace(/\/+$/, "") || "/";

  if (ROUTE_REDIRECTS.has(pathname)) {
    sendRedirect(response, ROUTE_REDIRECTS.get(pathname));
    return;
  }

  const filePath = resolveStaticPath(pathname);
  if (!filePath) {
    sendNotFound(response);
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isDirectory()) {
      const indexFile = path.join(filePath, "index.html");
      fs.access(indexFile, fs.constants.R_OK, (indexError) => {
        if (indexError) sendNotFound(response);
        else serveFile(response, indexFile);
      });
      return;
    }

    if (!error && stats.isFile()) {
      serveFile(response, filePath);
      return;
    }

    sendNotFound(response);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`TCB frontend server running at http://127.0.0.1:${PORT}/main/index.html`);
});
