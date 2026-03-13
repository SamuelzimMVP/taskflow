import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useBoardStore } from '../store/boardStore';
import { socket, joinBoard, leaveBoard } from '../services/socket';
import { ListColumn } from '../components/board/ListColumn';
import toast from 'react-hot-toast';

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const {
    activeBoard, fetchBoard, isLoading,
    createList, moveCard,
    handleListCreated, handleListUpdated, handleListDeleted,
    handleCardCreated, handleCardUpdated, handleCardDeleted, handleCardMoved,
  } = useBoardStore();

  const [newListTitle, setNewListTitle] = useState('');
  const [showListForm, setShowListForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchBoard(id);
    joinBoard(id);

    socket.on('list:created', handleListCreated);
    socket.on('list:updated', handleListUpdated);
    socket.on('list:deleted', handleListDeleted);
    socket.on('card:created', handleCardCreated);
    socket.on('card:updated', handleCardUpdated);
    socket.on('card:deleted', handleCardDeleted);
    socket.on('card:moved', handleCardMoved);

    return () => {
      leaveBoard(id);
      socket.off('list:created');
      socket.off('list:updated');
      socket.off('list:deleted');
      socket.off('card:created');
      socket.off('card:updated');
      socket.off('card:deleted');
      socket.off('card:moved');
    };
  }, [id]);

  async function handleAddList() {
    if (!newListTitle.trim() || !id) return;
    try {
      await createList(newListTitle, id);
      setNewListTitle('');
      setShowListForm(false);
    } catch {
      toast.error('Erro ao criar lista');
    }
  }

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination || !id) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      await moveCard(draggableId, destination.droppableId, destination.index, id);
    } catch {
      toast.error('Erro ao mover card');
    }
  }

  if (isLoading || !activeBoard) {
    return <div className="flex items-center justify-center h-96 text-gray-500">Carregando board...</div>;
  }

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      <div className="px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeBoard.color }} />
          <h1 className="text-xl font-bold text-white">{activeBoard.title}</h1>
          <span className="text-gray-600 text-sm ml-2">{activeBoard.members.length} membros</span>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full items-start">
            {activeBoard.lists.map((list) => (
              <ListColumn key={list.id} list={list} boardId={activeBoard.id} />
            ))}

            <Droppable droppableId="new-list" isDropDisabled={true}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="w-72 flex-shrink-0">
                  {showListForm ? (
                    <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
                      <input
                        type="text"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        placeholder="Nome da lista"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500 mb-2"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddList(); if (e.key === 'Escape') setShowListForm(false); }}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleAddList} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg">Adicionar</button>
                        <button onClick={() => setShowListForm(false)} className="px-3 py-1.5 text-gray-400 hover:text-white text-sm">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowListForm(true)}
                      className="w-full py-3 rounded-xl border-2 border-dashed border-gray-700 hover:border-gray-500 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                    >
                      + Adicionar lista
                    </button>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
