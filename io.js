const http = require('http');
const socketio = require('socket.io');
const socketioInit = require('./socket/socketio');
const sessionConfig = require('./config/sessionConfig');
const app = require('./app');

const server = http.createServer(app);
const io = socketio(server);

socketioInit(io, sessionConfig);

exports.io = io;
exports.server = server;
