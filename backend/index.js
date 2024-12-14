// server.js
const express = require('express');
const WebSocket = require('ws');
const amqp = require('amqplib');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const cors = require('cors')
const morgan = require('morgan')

const app = express();
const prisma = new PrismaClient();
const redis = new Redis();
const PORT = 3000;
app.use(morgan('combined'))
app.use(cors({
    origin: 'https://chat.kamerrezz.test',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true 
}));

// Configura claves de JWT
const JWT_SECRET = 'tu_clave_secreta'; 

app.use(bodyParser.json());

const wss = new WebSocket.Server({ noServer: true });
const clients = new Map(); 

let channel;
const RABBIT_QUEUE = 'messages_queue';

const initRabbitMQ = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue(RABBIT_QUEUE, { durable: true });
        console.log('Conectado a RabbitMQ');
    } catch (err) {
        console.error('Error conectando a RabbitMQ:', err);
    }
};

const setupConsumer = async () => {
    if (!channel) return;
    await channel.consume(
        RABBIT_QUEUE,
        async (msg) => {
            const message = JSON.parse(msg.content.toString());
            console.log(`[x] Recibido: ${message.content}`);

            await prisma.message.create({
                data: {
                    content: message.content,
                    room: message.room,
                    userId: message.userId,
                },
            });

            const roomClients = clients.get(message.room) || [];
            
            roomClients.forEach((ws) => {
                if (ws.ws.readyState === WebSocket.OPEN) {
                    ws.ws.send(JSON.stringify(message));
                }
            });

            channel.ack(msg);
        },
        { noAck: false }
    );
};

const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        const user = await prisma.user.create({ data: { username, password } });
        res.status(201).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar usuario', detail: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
});

app.post('/send', authenticateJWT, async (req, res) => {
    const { content, room } = req.body;
    if (!content || !room) {
        return res.status(400).json({ error: 'El contenido y la sala son obligatorios' });
    }

    try {
        await channel.sendToQueue(RABBIT_QUEUE, Buffer.from(JSON.stringify({
            content,
            room,
            userId: req.user.id,
            username: req.user.username
        })));
        res.status(200).json({ success: true, message: 'Mensaje enviado' });
    } catch (err) {
        res.status(500).json({ error: 'Error enviando mensaje' });
    }
});

wss.on('connection', (ws, request) => {
    const params = new URLSearchParams(request.url.split('?')[1]);
    const room = params.get('room');
    const token = params.get('token');

    if (!room || !token) {
        ws.close(1008, 'Sala y token requeridos');
        return;
    }

    let user;
    try {
        user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        ws.close(1008, 'Token inválido');
        return;
    }

    const roomClients = clients.get(room) || [];
    const existingClient = roomClients.find((client) => client.user.id === user.id);

    if (existingClient) {
        existingClient.ws.close(1008, 'Conexión duplicada detectada');
        roomClients.splice(roomClients.indexOf(existingClient), 1);
    }

    roomClients.push({ ws, user });
    clients.set(room, roomClients);

    const connectedUsers = roomClients.map(({ user }) => ({ id: user.id, username: user.username }));
    roomClients.forEach(({ ws }) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'user_list', users: connectedUsers }));
        }
    });

    // Manejar cierre de conexión
    ws.on('close', () => {
        const updatedRoomClients = clients.get(room).filter((client) => client.ws !== ws);
        clients.set(room, updatedRoomClients);

        // Emitir lista actualizada de usuarios conectados
        const updatedUsers = updatedRoomClients.map(({ user }) => ({ id: user.id, username: user.username }));
        updatedRoomClients.forEach(({ ws }) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'user_list', users: updatedUsers }));
            }
        });
    });
});

const server = app.listen(PORT, async () => {
    console.log(`Servidor en http://localhost:${PORT}`);
    await initRabbitMQ();
    await setupConsumer();
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
