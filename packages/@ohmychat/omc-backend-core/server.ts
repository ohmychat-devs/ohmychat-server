import express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';

const
    cors_options = {
        origin: true,
        credentials: true,
    },
    app = express(),
    __dirname = process.cwd(),
    server = http.createServer(app),
    io = new Server(server, { cors: cors_options, cookie: true })

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function setCommonHeaders(req, res, next) {
    res.set("Access-Control-Allow-Private-Network", "true");
    next();
});
app.use(cors(cors_options));
app.use(express.static(__dirname + '/dist'));

export { app, server, io };