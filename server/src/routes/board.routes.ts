import { Router } from 'express';
import { getBoards, getBoardById, createBoard, updateBoard, deleteBoard } from '../controllers/board.controller';
import { authenticate } from '../middlewares/authenticate';

export const boardRoutes = Router();

boardRoutes.use(authenticate);

boardRoutes.get('/', getBoards);
boardRoutes.get('/:id', getBoardById);
boardRoutes.post('/', createBoard);
boardRoutes.put('/:id', updateBoard);
boardRoutes.delete('/:id', deleteBoard);
