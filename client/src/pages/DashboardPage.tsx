import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/boardStore';
import toast from 'react-hot-toast';

const BOARD_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#10b981', '#0ea5e9'];

export function DashboardPage() {
  const { boards, fetchBoards, createBoard, deleteBoard, isLoading } = useBoardStore();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(BOARD_COLORS[0]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  async function handleCreate() {
    if (!title.trim()) return;
    try {
      const board = await createBoard(title, color);
      setTitle('');
      setShowForm(false);
      toast.success('Board criado!');
      navigate(`/board/${board.id}`);
    } catch {
      toast.error('Erro ao criar board');
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm('Deletar este board?')) return;
    try {
      await deleteBoard(id);
      toast.success('Board deletado');
    } catch {
      toast.error('Erro ao deletar board');
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Meus Boards</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          + Novo Board
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-5 bg-gray-900 border border-gray-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Criar novo board</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome do board"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 mb-4"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-2 mb-4">
            {BOARD_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">Criar</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg">Cancelar</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-500 text-center py-20">Carregando...</div>
      ) : boards.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Nenhum board ainda.</p>
          <p className="text-gray-600 text-sm mt-1">Crie seu primeiro board para começar!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              className="group relative p-5 rounded-xl cursor-pointer border border-gray-800 hover:border-gray-700 transition-all hover:scale-[1.02] bg-gray-900"
            >
              <div className="w-full h-2 rounded-full mb-4" style={{ backgroundColor: board.color }} />
              <h3 className="font-semibold text-white mb-1">{board.title}</h3>
              {board.description && <p className="text-sm text-gray-400 truncate">{board.description}</p>}
              <p className="text-xs text-gray-600 mt-3">{board._count?.lists ?? 0} listas</p>
              <button
                onClick={(e) => handleDelete(e, board.id)}
                className="absolute top-3 right-3 text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
