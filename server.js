"use strict";

// A small local server made only with features already included in Node.js.
const http = require("http");
const fs = require("fs");
const path = require("path");

// `npm start` uses 8000. `node server.js 8080` would use port 8080 instead.
const port = Number(process.argv[2]) || 8000;
const projectFolder = __dirname;

const contentTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const requestedFile = urlPath === "/" ? "index.html" : urlPath.slice(1);
  const filePath = path.resolve(projectFolder, requestedFile);

  // Do not allow a URL to read files above the project folder.
  if (!filePath.startsWith(projectFolder + path.sep)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, file) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("File not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, { "Content-Type": contentTypes[extension] || "application/octet-stream" });
    response.end(file);
  });
});

server.listen(port, () => {
  console.log(`Kitsu Cove is running at http://localhost:${port}`);
  console.log("Press Ctrl + C to stop the server.");
});
