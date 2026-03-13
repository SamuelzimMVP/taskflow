import { Server, Socket } from 'socket.io';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a board room to receive real-time updates
    socket.on('join:board', (boardId: string) => {
      socket.join(`board:${boardId}`);
      console.log(`📋 Socket ${socket.id} joined board:${boardId}`);
    });

    socket.on('leave:board', (boardId: string) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
}

// Helper to emit board updates from controllers
export function emitBoardUpdate(io: Server, boardId: string, event: string, data: unknown) {
  io.to(`board:${boardId}`).emit(event, data);
}
