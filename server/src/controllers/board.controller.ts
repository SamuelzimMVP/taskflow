import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authenticate';
import { io } from '../index';
import { emitBoardUpdate } from '../config/socket';

const boardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
});

export async function getBoards(req: AuthRequest, res: Response) {
  const boards = await prisma.board.findMany({
    where: {
      OR: [
        { ownerId: req.userId },
        { members: { some: { userId: req.userId } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      _count: { select: { lists: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(boards);
}

export async function getBoardById(req: AuthRequest, res: Response) {
  const board = await prisma.board.findFirst({
    where: {
      id: req.params.id,
      OR: [
        { ownerId: req.userId },
        { members: { some: { userId: req.userId } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      lists: {
        orderBy: { position: 'asc' },
        include: {
          cards: {
            orderBy: { position: 'asc' },
            include: {
              assignee: { select: { id: true, name: true, avatar: true } },
            },
          },
        },
      },
    },
  });

  if (!board) return res.status(404).json({ message: 'Board não encontrado' });
  return res.json(board);
}

export async function createBoard(req: AuthRequest, res: Response) {
  const parsed = boardSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos' });

  const board = await prisma.board.create({
    data: {
      ...parsed.data,
      ownerId: req.userId!,
      members: {
        create: { userId: req.userId!, role: 'OWNER' },
      },
    },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
    },
  });

  return res.status(201).json(board);
}

export async function updateBoard(req: AuthRequest, res: Response) {
  const parsed = boardSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos' });

  const board = await prisma.board.findFirst({
    where: { id: req.params.id, ownerId: req.userId },
  });

  if (!board) return res.status(404).json({ message: 'Board não encontrado ou sem permissão' });

  const updated = await prisma.board.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  emitBoardUpdate(io, req.params.id, 'board:updated', updated);
  return res.json(updated);
}

export async function deleteBoard(req: AuthRequest, res: Response) {
  const board = await prisma.board.findFirst({
    where: { id: req.params.id, ownerId: req.userId },
  });

  if (!board) return res.status(404).json({ message: 'Board não encontrado ou sem permissão' });

  await prisma.board.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}
