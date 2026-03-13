import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { List } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { CardItem } from './CardItem';
import toast from 'react-hot-toast';

interface Props {
  list: List;
  boardId: string;
}

export function ListColumn({ list, boardId }: Props) {
  const { createCard, updateList, deleteList } = useBoardStore();
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);

  async function handleAddCard() {
    if (!newCardTitle.trim()) return;
    try {
      await createCard(newCardTitle, list.id, boardId);
      setNewCardTitle('');
      setShowCardForm(false);
    } catch {
      toast.error('Erro ao criar card');
    }
  }

  async function handleUpdateTitle() {
    if (!title.trim() || title === list.title) {
      setTitle(list.title);
      setIsEditingTitle(false);
      return;
    }
    try {
      await updateList(list.id, title);
      setIsEditingTitle(false);
    } catch {
      toast.error('Erro ao atualizar lista');
    }
  }

  async function handleDeleteList() {
    if (!confirm(`Deletar a lista "${list.title}" e todos os seus cards?`)) return;
    try {
      await deleteList(list.id);
    } catch {
      toast.error('Erro ao deletar lista');
    }
  }

  return (
    <div className="w-72 flex-shrink-0 bg-gray-900 rounded-xl border border-gray-800 flex flex-col max-h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-800">
        {isEditingTitle ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateTitle(); if (e.key === 'Escape') { setTitle(list.title); setIsEditingTitle(false); } }}
            className="flex-1 bg-gray-800 text-white text-sm font-semibold px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            autoFocus
          />
        ) : (
          <h3
            className="text-sm font-semibold text-gray-200 cursor-pointer hover:text-white flex-1"
            onClick={() => setIsEditingTitle(true)}
          >
            {list.title}
          </h3>
        )}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{list.cards.length}</span>
          <button
            onClick={handleDeleteList}
            className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none"
            title="Deletar lista"
          >
            ×
          </button>
        </div>
      </div>

      {/* Cards */}
      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin min-h-[8px] transition-colors ${snapshot.isDraggingOver ? 'bg-gray-800/50' : ''}`}
          >
            {list.cards.map((card, index) => (
              <CardItem key={card.id} card={card} index={index} boardId={boardId} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Card */}
      <div className="p-2 border-t border-gray-800">
        {showCardForm ? (
          <div>
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Título do card..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
              rows={2}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); } if (e.key === 'Escape') setShowCardForm(false); }}
            />
            <div className="flex gap-2 mt-1.5">
              <button onClick={handleAddCard} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded-lg">Adicionar</button>
              <button onClick={() => setShowCardForm(false)} className="px-3 py-1.5 text-gray-500 hover:text-white text-xs">Cancelar</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCardForm(true)}
            className="w-full text-left text-sm text-gray-500 hover:text-gray-300 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Adicionar card
          </button>
        )}
      </div>
    </div>
  );
}
