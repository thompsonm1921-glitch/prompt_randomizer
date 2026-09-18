--- src/components/ColumnBlock.tsx (原始)
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnData } from '../types';

interface ColumnBlockProps {
  column: ColumnData;
  onUpdate: (updates: Partial<ColumnData>) => void;
  onRandomize: () => void;
}

export default function ColumnBlock({ column, onUpdate, onRandomize }: ColumnBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const displayValues = column.showOnlySelected
    ? column.selectedValues
    : column.values;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-3 transition-all ${
        column.enabled
          ? 'border-gray-600 bg-gray-800'
          : 'border-gray-700 bg-gray-800/30 opacity-50'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"
          title="Перетащить"
        >
          ⠿
        </div>

        {/* Enable/disable toggle */}
        <button
          onClick={() => onUpdate({ enabled: !column.enabled })}
          className={`w-8 h-5 rounded-full relative transition-colors ${
            column.enabled ? 'bg-green-500' : 'bg-gray-600'
          }`}
          title={column.enabled ? 'Включено' : 'Выключено'}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
              column.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </button>

        {/* Count input */}
        <input
          type="number"
          min={1}
          value={column.count}
          onChange={(e) => {
            const val = Math.max(1, parseInt(e.target.value) || 1);
            onUpdate({ count: val });
          }}
          className="w-12 h-6 bg-gray-900 border border-gray-600 rounded text-center text-xs text-gray-200"
          title="Количество строк для рандома"
        />

        {/* Randomize button */}
        <button
          onClick={onRandomize}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
          title="Рандомизировать этот столбец"
        >
          🎲
        </button>

        {/* Category name */}
        <span className="font-medium text-sm text-gray-200 truncate flex-1">
          {column.header}
        </span>

        {/* Show toggle */}
        <button
          onClick={() => onUpdate({ showOnlySelected: !column.showOnlySelected })}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            column.showOnlySelected
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
          title={column.showOnlySelected ? 'Показать только выбранное' : 'Показать всё содержимое'}
        >
          {column.showOnlySelected ? '🎯' : '📋'}
        </button>
      </div>

      {/* Values display */}
      <div className="bg-gray-900/70 border border-gray-700 rounded p-2 max-h-32 overflow-y-auto">
        <div className="text-xs text-gray-400 space-y-0.5">
          {displayValues.length > 0 ? (
            displayValues.map((val, i) => (
              <div key={i} className="truncate">
                {val}
              </div>
            ))
          ) : (
            <div className="text-gray-600 italic">Пусто</div>
          )}
        </div>
      </div>

      {/* Selected values indicator */}
      {column.enabled && column.selectedValues.length > 0 && (
        <div className="mt-2 text-xs text-blue-400">
          Выбрано: {column.selectedValues.join(', ')}
        </div>
      )}
    </div>
  );
}


+++ src/components/ColumnBlock.tsx (修改后)
import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnData } from '../types';

interface ColumnBlockProps {
  column: ColumnData;
  onUpdate: (updates: Partial<ColumnData>) => void;
  onRandomize: () => void;
}

export default function ColumnBlock({ column, onUpdate, onRandomize }: ColumnBlockProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const displayValues = column.showOnlySelected
    ? column.selectedValues
    : column.values;

  // Фильтрация тегов по поисковому запросу
  const filteredTags = searchQuery.trim()
    ? column.values.filter(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Добавление тега к выбранным
  const addTag = (tag: string) => {
    if (!column.selectedValues.includes(tag)) {
      onUpdate({ selectedValues: [...column.selectedValues, tag] });
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Удаление тега из выбранных
  const removeTag = (tag: string) => {
    onUpdate({ selectedValues: column.selectedValues.filter(t => t !== tag) });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-3 transition-all ${
        column.enabled
          ? column.frozen
            ? 'border-cyan-600 bg-gray-800'
            : 'border-gray-600 bg-gray-800'
          : 'border-gray-700 bg-gray-800/30 opacity-50'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"
          title="Перетащить"
        >
          ⠿
        </div>

        {/* Enable/disable toggle */}
        <button
          onClick={() => onUpdate({ enabled: !column.enabled })}
          className={`w-8 h-5 rounded-full relative transition-colors ${
            column.enabled ? 'bg-green-500' : 'bg-gray-600'
          }`}
          title={column.enabled ? 'Включено' : 'Выключено'}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
              column.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </button>

        {/* Freeze button */}
        <button
          onClick={() => onUpdate({ frozen: !column.frozen })}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            column.frozen
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
              : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
          }`}
          title={column.frozen ? 'Заморожено (не меняется при рандоме)' : 'Разморозить'}
        >
          {column.frozen ? '🔒' : '🔓'}
        </button>

        {/* Count input */}
        <input
          type="number"
          min={1}
          value={column.count}
          onChange={(e) => {
            const val = Math.max(1, parseInt(e.target.value) || 1);
            onUpdate({ count: val });
          }}
          className="w-12 h-6 bg-gray-900 border border-gray-600 rounded text-center text-xs text-gray-200"
          title="Количество строк для рандома"
        />

        {/* Weight input */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400" title="Вес тега">⚖️</span>
          <input
            type="number"
            min={1}
            value={column.weight}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value) || 1);
              onUpdate({ weight: val });
            }}
            className="w-12 h-6 bg-gray-900 border border-gray-600 rounded text-center text-xs text-gray-200"
            title="Вес тега (если > 1, формат: (тег:вес))"
          />
        </div>

        {/* Randomize button */}
        <button
          onClick={onRandomize}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
          title="Рандомизировать этот столбец"
        >
          🎲
        </button>

        {/* Category name */}
        <span className="font-medium text-sm text-gray-200 truncate flex-1">
          {column.header}
        </span>

        {/* Show toggle */}
        <button
          onClick={() => onUpdate({ showOnlySelected: !column.showOnlySelected })}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            column.showOnlySelected
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
          title={column.showOnlySelected ? 'Показать только выбранное' : 'Показать всё содержимое'}
        >
          {column.showOnlySelected ? '🎯' : '📋'}
        </button>
      </div>

      {/* Search input */}
      <div className="relative mb-2" ref={dropdownRef}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="🔍 Поиск тегов..."
          className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
        />
        {showDropdown && filteredTags.length > 0 && (
          <div className="dropdown-enter absolute z-10 w-full mt-1 bg-gray-900 border border-gray-600 rounded max-h-32 overflow-y-auto">
            {filteredTags.map((tag, i) => (
              <div
                key={i}
                onClick={() => addTag(tag)}
                className="px-2 py-1 text-xs text-gray-300 hover:bg-blue-600 hover:text-white cursor-pointer"
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected values */}
      {column.selectedValues.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {column.selectedValues.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-blue-600/30 border border-blue-600 rounded px-2 py-0.5 text-xs text-blue-200"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-blue-300 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Values display */}
      <div className="bg-gray-900/70 border border-gray-700 rounded p-2 max-h-32 overflow-y-auto">
        <div className="text-xs text-gray-400 space-y-0.5">
          {displayValues.length > 0 ? (
            displayValues.map((val, i) => (
              <div key={i} className="truncate">
                {val}
              </div>
            ))
          ) : (
            <div className="text-gray-600 italic">Пусто</div>
          )}
        </div>
      </div>

      {/* Selected values indicator */}
      {column.enabled && column.selectedValues.length > 0 && (
        <div className="mt-2 text-xs text-blue-400">
          {column.weight > 1 ? (
            <>Выбрано: ({column.selectedValues.join(', ')}:{column.weight})</>
          ) : (
            <>Выбрано: {column.selectedValues.join(', ')}</>
          )}
        </div>
      )}
    </div>
  );
}
