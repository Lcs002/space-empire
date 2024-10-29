import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Game } from './game';
import jwt from 'jsonwebtoken'; 
import { PlayerManager } from './manager/player-manager';

export const JWT_SECRET = 'your_jwt_secret_key';
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create HTTP server and WebSocket server
const server = http.createServer(app);
export const socketServer = new SocketIOServer(server, {
  cors: {
    origin: "*", // Allow frontend on any origin
    methods: ["GET", "POST"]
  }
});


Game.initializeGame();

function setupHTTP(app: any) {
  PlayerManager.setupHTTP(app);
}

setupHTTP(app);

socketServer.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) return next(new Error('Authentication error'));

  jwt.verify(token, 'your_jwt_secret_key', (err, decoded) => {
      if (err) return next(new Error('Authentication error'));

      // Store username in socket object
      socket.data.username = decoded.username;
      next();
  });
});

// WebSocket connection handling
socketServer.on('connection', (socket) => Game.setupWebSocket(socket));

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
