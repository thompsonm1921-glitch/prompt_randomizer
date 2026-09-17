import { ManualInputData } from '../types';

interface ManualInputBlockProps {
  data: ManualInputData;
  onUpdate: (text: string) => void;
  onRemove: () => void;
}

export default function ManualInputBlock({ data, onUpdate, onRemove }: ManualInputBlockProps) {
  return (
    <div className="border border-yellow-700/50 rounded-lg p-4 bg-yellow-900/10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-yellow-400">✏️ Ручной ввод тегов</span>
        <button
          onClick={onRemove}
          className="ml-auto px-3 py-1 bg-red-600/80 hover:bg-red-700 rounded text-xs transition-colors"
        >
          ✕
        </button>
      </div>
      <textarea
        value={data.text}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Введите теги через запятую..."
        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 resize-y min-h-[60px] focus:outline-none focus:border-yellow-600"
      />
    </div>
  );
}
