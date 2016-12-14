'use strict';

const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const console = require("console");
const http = require("http");
const extend = require("./extend");
const app = express();
const env = process.env.NODE_ENV;

env === 'production' && app.disable('verbose extend') || app.enable('verbose extend');

app.use('/v1', require('./routes/v1'));
(env === 'test') || app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use([extend.errors.error400, extend.errors.error500]);

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
server.on('error', (err) => {
    if (err.syscall !== 'listen') {
        throw err;
    }
    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
    switch (err.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw err;
    }
});
server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
});