import { Router } from 'express';
import { createList, updateList, deleteList, reorderLists } from '../controllers/list.controller';
import { authenticate } from '../middlewares/authenticate';

export const listRoutes = Router();

listRoutes.use(authenticate);

listRoutes.post('/', createList);
listRoutes.put('/reorder', reorderLists);
listRoutes.put('/:id', updateList);
listRoutes.delete('/:id', deleteList);
