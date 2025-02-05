import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import authMiddleware from './middlewares/authMiddleware.js';
import path from 'path';
import { Server } from "socket.io";

dotenv.config();

const app = express();
const __dirname = path.resolve();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/chat', authMiddleware, (req, res) => {
  res.json({ message: 'Chat protegido.' });
});

// Ruta para la raíz (esto responderá a las peticiones GET en http://localhost:3000/)
app.get('/', (req, res) => {
  res.send('¡Bienvenido a la aplicación!');
});

const MONGO_URI = process.env.MONGO_URI;
console.log("MONGO_URI:", MONGO_URI);

mongoose.connect(MONGO_URI);


// Crear el servidor con http.createServer
const server = http.createServer(app);

// Escuchar el puerto 3000
server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});


const io = new Server(server);

const users = {}; // Guardar usuarios conectados con sus IDs de socket

io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    // Manejo de nombres de usuario
    socket.on("set username", (username) => {
        users[socket.id] = username;
        io.emit("update user list", users);
    });

    // Mensajes públicos
    socket.on("chat message", (msg) => {
        io.emit("chat message", `${users[socket.id] || "Anónimo"}: ${msg}`);
    });

    // Mensajes privados
    socket.on("private message", ({ destinatario, message }) => {
        if (users[destinatario]) {
            io.to(destinatario).emit("private message", {
                emisor: users[socket.id],
                message
            });
        }
    });

    // Desconexión
    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("update user list", users);
        console.log("Usuario desconectado:", socket.id);
    });
});



