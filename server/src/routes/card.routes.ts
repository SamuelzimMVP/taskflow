import { Router } from 'express';
import { createCard, updateCard, deleteCard, moveCard } from '../controllers/card.controller';
import { authenticate } from '../middlewares/authenticate';

export const cardRoutes = Router();

cardRoutes.use(authenticate);

cardRoutes.post('/', createCard);
cardRoutes.put('/:id', updateCard);
cardRoutes.put('/:id/move', moveCard);
cardRoutes.delete('/:id', deleteCard);
