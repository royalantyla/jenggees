const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(__dirname));

// Game rooms storage
const rooms = new Map();

// Room class to manage game state
class GameRoom {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = [];
        this.gameState = null;
        this.maxPlayers = 4;
        this.isGameStarted = false;
        this.host = null;
    }

    addPlayer(socket, playerName) {
        if (this.players.length >= this.maxPlayers) {
            return false;
        }

        const player = {
            id: socket.id,
            socket: socket,
            name: playerName,
            isHost: this.players.length === 0,
            isBot: false,
            ready: false
        };

        if (player.isHost) {
            this.host = socket.id;
        }

        this.players.push(player);
        return true;
    }

    removePlayer(socketId) {
        const index = this.players.findIndex(p => p.id === socketId);
        if (index !== -1) {
            const removedPlayer = this.players.splice(index, 1)[0];
            
            // If host left, assign new host
            if (removedPlayer.isHost && this.players.length > 0) {
                this.players[0].isHost = true;
                this.host = this.players[0].id;
                this.players[0].socket.emit('hostChanged', { isHost: true });
            }
            
            return true;
        }
        return false;
    }

    getPlayer(socketId) {
        return this.players.find(p => p.id === socketId);
    }

    broadcastToRoom(event, data, excludeSocket = null) {
        this.players.forEach(player => {
            if (!excludeSocket || player.socket.id !== excludeSocket.id) {
                player.socket.emit(event, data);
            }
        });
    }

    getRoomInfo() {
        return {
            roomId: this.roomId,
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                isHost: p.isHost,
                isBot: p.isBot,
                ready: p.ready
            })),
            isGameStarted: this.isGameStarted,
            maxPlayers: this.maxPlayers
        };
    }
}

// Generate random room ID
function generateRoomId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Create or join room
    socket.on('createRoom', (data) => {
        const roomId = generateRoomId();
        const room = new GameRoom(roomId);
        
        if (room.addPlayer(socket, data.playerName)) {
            rooms.set(roomId, room);
            socket.join(roomId);
            socket.emit('roomCreated', { 
                roomId: roomId, 
                roomInfo: room.getRoomInfo() 
            });
            console.log(`Room ${roomId} created by ${data.playerName}`);
        }
    });

    socket.on('joinRoom', (data) => {
        const room = rooms.get(data.roomId);
        
        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        if (room.isGameStarted) {
            socket.emit('error', { message: 'Game already started' });
            return;
        }

        if (room.addPlayer(socket, data.playerName)) {
            socket.join(data.roomId);
            socket.emit('roomJoined', { 
                roomId: data.roomId, 
                roomInfo: room.getRoomInfo() 
            });
            
            // Notify other players
            room.broadcastToRoom('playerJoined', {
                roomInfo: room.getRoomInfo()
            }, socket);
            
            console.log(`${data.playerName} joined room ${data.roomId}`);
        } else {
            socket.emit('error', { message: 'Room is full' });
        }
    });

    // Player ready/unready
    socket.on('toggleReady', (data) => {
        const room = rooms.get(data.roomId);
        if (!room) return;

        const player = room.getPlayer(socket.id);
        if (player) {
            player.ready = !player.ready;
            room.broadcastToRoom('roomUpdate', {
                roomInfo: room.getRoomInfo()
            });
        }
    });

    // Start game (host only)
    socket.on('startGame', (data) => {
        const room = rooms.get(data.roomId);
        if (!room) return;

        const player = room.getPlayer(socket.id);
        if (!player || !player.isHost) {
            socket.emit('error', { message: 'Only host can start the game' });
            return;
        }

        const readyPlayers = room.players.filter(p => p.ready || p.isHost);
        if (readyPlayers.length < 2) {
            socket.emit('error', { message: 'Need at least 2 ready players to start' });
            return;
        }

        room.isGameStarted = true;
        room.gameState = {
            numPlayers: readyPlayers.length,
            playerNames: readyPlayers.map(p => p.name),
            playerIds: readyPlayers.map(p => p.id),
            ...data.gameState
        };

        room.broadcastToRoom('gameStarted', {
            gameState: room.gameState,
            roomInfo: room.getRoomInfo()
        });

        console.log(`Game started in room ${data.roomId}`);
    });

    // Game state updates
    socket.on('gameStateUpdate', (data) => {
        const room = rooms.get(data.roomId);
        if (!room || !room.isGameStarted) return;

        room.gameState = { ...room.gameState, ...data.gameState };
        
        // Broadcast to all players in room
        room.broadcastToRoom('gameStateSync', {
            gameState: room.gameState
        }, socket);
    });

    // Game actions (draw, discard, meld, etc.)
    socket.on('gameAction', (data) => {
        const room = rooms.get(data.roomId);
        if (!room || !room.isGameStarted) return;

        // Broadcast action to all players
        room.broadcastToRoom('gameActionReceived', {
            action: data.action,
            playerId: socket.id,
            data: data.actionData
        }, socket);
    });

    // Chat messages
    socket.on('chatMessage', (data) => {
        const room = rooms.get(data.roomId);
        if (!room) return;

        const player = room.getPlayer(socket.id);
        if (player) {
            room.broadcastToRoom('chatMessage', {
                playerName: player.name,
                message: data.message,
                timestamp: Date.now()
            });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        
        // Find and remove player from any room
        for (const [roomId, room] of rooms.entries()) {
            if (room.removePlayer(socket.id)) {
                if (room.players.length === 0) {
                    // Delete empty room
                    rooms.delete(roomId);
                    console.log(`Room ${roomId} deleted (empty)`);
                } else {
                    // Notify remaining players
                    room.broadcastToRoom('playerLeft', {
                        roomInfo: room.getRoomInfo()
                    });
                }
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to play`);
});
