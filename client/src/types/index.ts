export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  dueDate?: string;
  labels: string[];
  listId: string;
  assignee?: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface BoardMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  color: string;
  owner: Pick<User, 'id' | 'name' | 'avatar'>;
  members: BoardMember[];
  lists: List[];
  _count?: { lists: number };
}

export const LABEL_COLORS: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};
