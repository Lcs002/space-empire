import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { handleConnection, initializeGame } from './game';
import { register, login } from './auth';
import { Player } from '../../shared/models/player'; 
import jwt from 'jsonwebtoken'; 

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Users Data
export const users = new Map<string, Player>();

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Allow frontend on any origin
    methods: ["GET", "POST"]
  }
});

// Initialize game state
initializeGame();


app.post('/register', async (req: Request, res: Response) => {
    register(req, res);
});

app.post('/login', (req: Request, res: Response) => {
    login(req, res)
});

io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) return next(new Error('Authentication error'));

    jwt.verify(token, 'your_jwt_secret_key', (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        next();
    });
});

// WebSocket connection handling
io.on('connection', (socket) => handleConnection(socket));

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
