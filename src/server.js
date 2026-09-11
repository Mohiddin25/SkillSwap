const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  if (env.NODE_ENV === 'development') {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
  }

  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on('join_conversation', (conversationId) => {
    if (conversationId) {
      socket.join(conversationId);
    }
  });

  socket.on('message:send', async (data) => {
    const { conversationId, senderId, text } = data;
    try {
      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        text
      });
      await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name email profileImage');

      io.to(conversationId).emit('message:receive', populatedMessage);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('typing:start', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typing:start', { userId });
  });

  socket.on('typing:stop', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typing:stop', { userId });
  });

  socket.on('disconnect', () => {
    if (env.NODE_ENV === 'development') {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    }
  });
});

// Start Server after Database Connection
const startServer = async () => {
  await connectDB();
  server.listen(env.PORT, () => {
    console.log(`🚀 SkillSwap Backend Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`📚 Swagger API Docs available at http://localhost:${env.PORT}/api-docs`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = server;
