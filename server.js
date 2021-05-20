const express = require('express');
const app = express();
const http = require('http').Server(app);
var chatServer = require('./lib/chat_server');
var cache = {};

http.listen(8080, () => {
    app.use(express.static('public'));
    console.log('Listen to port 8080');
});

chatServer.listen(http);

// const fs = require('fs');
// const mime = require('mime');
// const path = require('path');
// var chatServer = require('./lib/chat_server');
/*
function serveStatic(res, cache, filePath) {
    if (cache[filePath]) {
        res.writeHead(200, {'content-type': mime.lookup(path.basename(filePath))});
        res.end(cache[filePath]);
        // sendFile(res, filePath, cache[filePath]);
    } else {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                send404(res);
            } else {
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        send404(res);
                    } else {
                        cache[filePath] = data;
                        res.writeHead(200, {'content-type': mime.lookup(path.basename(filePath))});
                        res.end(data);
                        // sendFile(res, filePath, data);
                    }
                });
            }
        });
    }
};

function send404(res) {
    res.writeHead(404, {
        'content-type': 'text/plain'
    });
    res.write('Error 404: Not found');
    res.end();
}

function sendFile(res, filePath, fileContents) {
    res.writeHead(200, {"content-type": mime.lookup(path.basename(filePath))});
    res.end(fileContents);
}
*/