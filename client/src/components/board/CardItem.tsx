import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, LABEL_COLORS } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { CardModal } from './CardModal';

interface Props {
  card: Card;
  index: number;
  boardId: string;
}

export function CardItem({ card, index, boardId }: Props) {
  const [showModal, setShowModal] = useState(false);

  const hasDueDate = !!card.dueDate;
  const isOverdue = hasDueDate && new Date(card.dueDate!) < new Date();

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setShowModal(true)}
            className={`bg-gray-800 border rounded-lg p-3 cursor-pointer hover:border-gray-600 transition-all group ${
              snapshot.isDragging
                ? 'border-primary-500 shadow-lg shadow-primary-500/20 rotate-1'
                : 'border-gray-700'
            }`}
          >
            {/* Labels */}
            {card.labels.length > 0 && (
              <div className="flex gap-1 mb-2 flex-wrap">
                {card.labels.map((label) => (
                  <span
                    key={label}
                    className={`h-1.5 w-8 rounded-full ${LABEL_COLORS[label] ?? 'bg-gray-600'}`}
                  />
                ))}
              </div>
            )}

            <p className="text-sm text-gray-200 leading-snug">{card.title}</p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {hasDueDate && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${isOverdue ? 'bg-red-900/50 text-red-400' : 'bg-gray-700 text-gray-400'}`}>
                    📅 {new Date(card.dueDate!).toLocaleDateString('pt-BR')}
                  </span>
                )}
                {card.description && (
                  <span className="text-xs text-gray-600" title="Tem descrição">≡</span>
                )}
              </div>
              {card.assignee && (
                <div
                  className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white"
                  title={card.assignee.name}
                >
                  {card.assignee.name[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {showModal && (
        <CardModal card={card} boardId={boardId} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
