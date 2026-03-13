import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authenticate';
import { io } from '../index';
import { emitBoardUpdate } from '../config/socket';

const cardSchema = z.object({
  title: z.string().min(1),
  listId: z.string(),
  boardId: z.string(),
});

const cardUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  assigneeId: z.string().nullable().optional(),
});

export async function createCard(req: AuthRequest, res: Response) {
  const parsed = cardSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos' });

  const { title, listId, boardId } = parsed.data;

  const lastCard = await prisma.card.findFirst({
    where: { listId },
    orderBy: { position: 'desc' },
  });

  const card = await prisma.card.create({
    data: { title, listId, position: (lastCard?.position ?? -1) + 1 },
    include: { assignee: { select: { id: true, name: true, avatar: true } } },
  });

  await prisma.activity.create({
    data: { action: `criou o card "${title}"`, userId: req.userId!, boardId, cardId: card.id },
  });

  emitBoardUpdate(io, boardId, 'card:created', { card, listId });
  return res.status(201).json(card);
}

export async function updateCard(req: AuthRequest, res: Response) {
  const parsed = cardUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos' });

  const card = await prisma.card.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : parsed.data.dueDate,
    },
    include: { assignee: { select: { id: true, name: true, avatar: true } } },
  });

  const list = await prisma.list.findUnique({ where: { id: card.listId } });
  if (list) emitBoardUpdate(io, list.boardId, 'card:updated', card);

  return res.json(card);
}

export async function deleteCard(req: AuthRequest, res: Response) {
  const card = await prisma.card.delete({ where: { id: req.params.id } });
  const list = await prisma.list.findUnique({ where: { id: card.listId } });
  if (list) emitBoardUpdate(io, list.boardId, 'card:deleted', { id: card.id, listId: card.listId });
  return res.status(204).send();
}

export async function moveCard(req: AuthRequest, res: Response) {
  const { listId, position, boardId } = req.body;

  const card = await prisma.card.update({
    where: { id: req.params.id },
    data: { listId, position },
    include: { assignee: { select: { id: true, name: true, avatar: true } } },
  });

  emitBoardUpdate(io, boardId, 'card:moved', { card, listId, position });
  return res.json(card);
}
