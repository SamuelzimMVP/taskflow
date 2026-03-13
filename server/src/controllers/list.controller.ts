import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authenticate';
import { io } from '../index';
import { emitBoardUpdate } from '../config/socket';

const listSchema = z.object({
  title: z.string().min(1),
  boardId: z.string(),
});

export async function createList(req: AuthRequest, res: Response) {
  const parsed = listSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos' });

  const { title, boardId } = parsed.data;

  const lastList = await prisma.list.findFirst({
    where: { boardId },
    orderBy: { position: 'desc' },
  });

  const list = await prisma.list.create({
    data: { title, boardId, position: (lastList?.position ?? -1) + 1 },
    include: { cards: true },
  });

  emitBoardUpdate(io, boardId, 'list:created', list);
  return res.status(201).json(list);
}

export async function updateList(req: AuthRequest, res: Response) {
  const { title } = req.body;
  const list = await prisma.list.update({
    where: { id: req.params.id },
    data: { title },
  });

  emitBoardUpdate(io, list.boardId, 'list:updated', list);
  return res.json(list);
}

export async function deleteList(req: AuthRequest, res: Response) {
  const list = await prisma.list.delete({ where: { id: req.params.id } });
  emitBoardUpdate(io, list.boardId, 'list:deleted', { id: list.id });
  return res.status(204).send();
}

export async function reorderLists(req: AuthRequest, res: Response) {
  const { boardId, lists } = req.body as { boardId: string; lists: { id: string; position: number }[] };

  await Promise.all(
    lists.map((l) => prisma.list.update({ where: { id: l.id }, data: { position: l.position } }))
  );

  emitBoardUpdate(io, boardId, 'lists:reordered', lists);
  return res.status(204).send();
}
