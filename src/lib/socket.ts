import { Server } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join room for order updates
    socket.on('joinOrderRoom', (orderId: string) => {
      socket.join(`order-${orderId}`);
      console.log(`Client ${socket.id} joined order room: ${orderId}`);
    });

    // Join admin room for all order updates
    socket.on('joinAdminRoom', () => {
      socket.join('admin');
      console.log(`Client ${socket.id} joined admin room`);
    });

    // Handle order status updates
    socket.on('updateOrderStatus', (data: { orderId: string; status: string }) => {
      // Broadcast to order room
      io.to(`order-${data.orderId}`).emit('orderStatusUpdate', {
        orderId: data.orderId,
        status: data.status,
        timestamp: new Date().toISOString()
      });
      
      // Broadcast to admin room
      io.to('admin').emit('orderStatusUpdate', {
        orderId: data.orderId,
        status: data.status,
        timestamp: new Date().toISOString()
      });
    });

    // Handle new order notifications
    socket.on('newOrder', (orderData: any) => {
      // Broadcast to admin room
      io.to('admin').emit('newOrder', {
        ...orderData,
        timestamp: new Date().toISOString()
      });
    });

    // Handle messages (keep existing functionality)
    socket.on('message', (msg: { text: string; senderId: string }) => {
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to SmartDine WebSocket Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};