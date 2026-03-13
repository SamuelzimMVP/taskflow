import { useState, useEffect, useRef } from 'react';
import { Card, LABEL_COLORS } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import toast from 'react-hot-toast';

interface Props {
  card: Card;
  boardId: string;
  onClose: () => void;
}

const AVAILABLE_LABELS = Object.keys(LABEL_COLORS);

export function CardModal({ card, boardId, onClose }: Props) {
  const { updateCard, deleteCard, activeBoard } = useBoardStore();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? '');
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.slice(0, 10) : '');
  const [labels, setLabels] = useState<string[]>(card.labels);
  const [assigneeId, setAssigneeId] = useState(card.assignee?.id ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function toggleLabel(label: string) {
    setLabels((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateCard(card.id, {
        title,
        description: description || null,
        dueDate: dueDate || null,
        labels,
        assigneeId: assigneeId || null,
      });
      toast.success('Card atualizado!');
      onClose();
    } catch {
      toast.error('Erro ao salvar card');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Deletar este card?')) return;
    try {
      await deleteCard(card.id, card.listId);
      onClose();
    } catch {
      toast.error('Erro ao deletar card');
    }
  }

  const members = activeBoard?.members ?? [];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Editar Card</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Adicione uma descrição..."
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Prazo</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Etiquetas</label>
            <div className="flex gap-2 flex-wrap">
              {AVAILABLE_LABELS.map((label) => (
                <button
                  key={label}
                  onClick={() => toggleLabel(label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    labels.includes(label)
                      ? 'border-transparent text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                  style={labels.includes(label) ? { backgroundColor: getComputedColor(label) } : {}}
                >
                  <span className={`w-2 h-2 rounded-full ${LABEL_COLORS[label]}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          {members.length > 0 && (
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Responsável</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">Nenhum</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-400 transition-colors"
          >
            Deletar card
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 rounded-lg">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg font-medium"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getComputedColor(label: string): string {
  const map: Record<string, string> = {
    red: '#ef4444', yellow: '#eab308', green: '#22c55e',
    blue: '#3b82f6', purple: '#a855f7', pink: '#ec4899',
  };
  return map[label] ?? '#6366f1';
}
