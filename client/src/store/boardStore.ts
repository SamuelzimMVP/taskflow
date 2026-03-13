import { create } from 'zustand';
import { Board, List, Card } from '../types';
import { api } from '../services/api';

interface BoardState {
  boards: Board[];
  activeBoard: Board | null;
  isLoading: boolean;

  fetchBoards: () => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (title: string, color: string) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;

  createList: (title: string, boardId: string) => Promise<void>;
  updateList: (id: string, title: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;

  createCard: (title: string, listId: string, boardId: string) => Promise<void>;
  updateCard: (id: string, data: Partial<Card>) => Promise<void>;
  deleteCard: (id: string, listId: string) => Promise<void>;
  moveCard: (cardId: string, listId: string, position: number, boardId: string) => Promise<void>;

  // Real-time update handlers
  handleListCreated: (list: List) => void;
  handleListUpdated: (list: List) => void;
  handleListDeleted: (payload: { id: string }) => void;
  handleCardCreated: (payload: { card: Card; listId: string }) => void;
  handleCardUpdated: (card: Card) => void;
  handleCardDeleted: (payload: { id: string; listId: string }) => void;
  handleCardMoved: (payload: { card: Card; listId: string; position: number }) => void;
}

export const useBoardStore = create<BoardState>()((set, get) => ({
  boards: [],
  activeBoard: null,
  isLoading: false,

  fetchBoards: async () => {
    set({ isLoading: true });
    const { data } = await api.get('/boards');
    set({ boards: data, isLoading: false });
  },

  fetchBoard: async (id) => {
    set({ isLoading: true });
    const { data } = await api.get(`/boards/${id}`);
    set({ activeBoard: data, isLoading: false });
  },

  createBoard: async (title, color) => {
    const { data } = await api.post('/boards', { title, color });
    set((s) => ({ boards: [data, ...s.boards] }));
    return data;
  },

  deleteBoard: async (id) => {
    await api.delete(`/boards/${id}`);
    set((s) => ({ boards: s.boards.filter((b) => b.id !== id) }));
  },

  createList: async (title, boardId) => {
    await api.post('/lists', { title, boardId });
  },

  updateList: async (id, title) => {
    await api.put(`/lists/${id}`, { title });
  },

  deleteList: async (id) => {
    await api.delete(`/lists/${id}`);
  },

  createCard: async (title, listId, boardId) => {
    await api.post('/cards', { title, listId, boardId });
  },

  updateCard: async (id, data) => {
    await api.put(`/cards/${id}`, data);
  },

  deleteCard: async (id) => {
    await api.delete(`/cards/${id}`);
  },

  moveCard: async (cardId, listId, position, boardId) => {
    await api.put(`/cards/${cardId}/move`, { listId, position, boardId });
  },

  // --- Real-time handlers ---
  handleListCreated: (list) => {
    set((s) => {
      if (!s.activeBoard) return s;
      return { activeBoard: { ...s.activeBoard, lists: [...s.activeBoard.lists, list] } };
    });
  },

  handleListUpdated: (list) => {
    set((s) => {
      if (!s.activeBoard) return s;
      return {
        activeBoard: {
          ...s.activeBoard,
          lists: s.activeBoard.lists.map((l) => (l.id === list.id ? { ...l, ...list } : l)),
        },
      };
    });
  },

  handleListDeleted: ({ id }) => {
    set((s) => {
      if (!s.activeBoard) return s;
      return { activeBoard: { ...s.activeBoard, lists: s.activeBoard.lists.filter((l) => l.id !== id) } };
    });
  },

  handleCardCreated: ({ card, listId }) => {
    set((s) => {
      if (!s.activeBoard) return s;
      return {
        activeBoard: {
          ...s.activeBoard,
          lists: s.activeBoard.lists.map((l) =>
            l.id === listId ? { ...l, cards: [...l.cards, card] } : l
          ),
        },
      };
    });
  },

  handleCardUpdated: (card) => {
    set((s) => {
      if (!s.activeBoard) return s;
      return {
        activeBoard: {
          ...s.activeBoard,
          lists: s.activeBoard.lists.map((l) => ({
            ...l,
            cards: l.cards.map((c) => (c.id === card.id ? card : c)),
          })),
        },
      };
    });
  },

  handleCardDeleted: ({ id, listId }) => {
    set((s) => {
      if (!s.activeBoard) return s;
      return {
        activeBoard: {
          ...s.activeBoard,
          lists: s.activeBoard.lists.map((l) =>
            l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== id) } : l
          ),
        },
      };
    });
  },

  handleCardMoved: ({ card, listId }) => {
    set((s) => {
      if (!s.activeBoard) return s;
      const lists = s.activeBoard.lists.map((l) => ({
        ...l,
        cards: l.cards.filter((c) => c.id !== card.id),
      }));
      return {
        activeBoard: {
          ...s.activeBoard,
          lists: lists.map((l) =>
            l.id === listId ? { ...l, cards: [...l.cards, card].sort((a, b) => a.position - b.position) } : l
          ),
        },
      };
    });
  },
}));
