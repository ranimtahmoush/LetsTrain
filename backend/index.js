const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/letstrain').then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trainers', require('./routes/trainers'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/classes', require('./routes/classes'));

// Socket.io for chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinChat', ({ chatId }) => {
    socket.join(chatId);
  });

  socket.on('sendDirectMessage', ({ chatId, message, sender }) => {
    io.to(chatId).emit('receiveMessage', { message, sender, timestamp: new Date() });
  });

  socket.on('joinRoom', ({ bookingId }) => {
    socket.join(bookingId);
  });

  socket.on('sendMessage', ({ bookingId, message, sender }) => {
    io.to(bookingId).emit('message', { message, sender, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));