import { io } from 'socket.io-client';

export const socket = io('http://localhost:3333', {
  autoConnect: false,
});

export function connectSocket() {
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}

export function joinBoard(boardId: string) {
  socket.emit('join:board', boardId);
}

export function leaveBoard(boardId: string) {
  socket.emit('leave:board', boardId);
}
