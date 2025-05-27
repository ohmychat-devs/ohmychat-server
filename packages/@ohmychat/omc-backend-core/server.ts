import express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import ServerlessHttp from 'serverless-http';

const
    cors_options = {
        origin: true,
        credentials: true,
    },
    app = express(),
    __dirname = process.cwd(),
    server = http.createServer(app),
    io = new Server(/*server, { maxHttpBufferSize: 1e8, cors: cors_options, cookie: true }*/)

io.attach(server, { maxHttpBufferSize: 1e8, cors: cors_options, cookie: true });

app.use(function setCommonHeaders(req, res, next) {
    res.set("Access-Control-Allow-Private-Network", "true");
    next();
});

app.use(cors(cors_options));
app.use(express.static(__dirname + '/dist'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

export const handler = ServerlessHttp(app);

export { app, server, io };