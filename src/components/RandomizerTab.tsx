import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { TableBlockData, ManualInputData, BlockItem, ColumnData } from '../types';
import ColumnBlock from './ColumnBlock';
import ManualInputBlock from './ManualInputBlock';
import SortableBlockWrapper from './SortableBlockWrapper';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function getRandomItems(arr: string[], count: number): string[] {
  if (count <= 0) return [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function parseSpreadsheet(data: ArrayBuffer, fileName: string): TableBlockData {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

  if (jsonData.length === 0) {
    return { id: generateId(), fileName, columns: [], columnOrder: [], collapsed: false };
  }

  const headers = jsonData[0].map((h) => String(h || 'Пусто'));
  const columnOrder: string[] = [];
  const columns: ColumnData[] = headers.map((header, colIndex) => {
    const values = jsonData
      .slice(1)
      .map((row) => String(row[colIndex] || ''))
      .filter((v) => v.trim() !== '');
    const colId = `col_${colIndex}_${generateId()}`;
    columnOrder.push(colId);
    const selectedValues = getRandomItems(values, 1);
    return {
      id: colId,
      header,
      values,
      enabled: true,
      count: 1,
      weight: 1,
      frozen: false,
      selectedValues,
      showOnlySelected: false,
      listCollapsed: true,
    };
  });

  return { id: generateId(), fileName, columns, columnOrder, collapsed: false };
}

export default function RandomizerTab() {
  const [blocks, setBlocks] = useState<BlockItem[]>([
    {
      type: 'table',
      data: {
        id: generateId(),
        fileName: '',
        columns: [],
        columnOrder: [],
        collapsed: false,
      },
    },
  ]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [copyTooltip, setCopyTooltip] = useState(false);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getBlockId = (block: BlockItem): string => {
    return block.type === 'table' ? block.data.id : block.data.id;
  };

  const addTableBlock = () => {
    const newBlock: TableBlockData = {
      id: generateId(),
      fileName: '',
      columns: [],
      columnOrder: [],
      collapsed: false,
    };
    setBlocks((prev) => [...prev, { type: 'table', data: newBlock }]);
  };

  const addManualInput = () => {
    const newBlock: ManualInputData = {
      id: generateId(),
      text: '',
    };
    setBlocks((prev) => [...prev, { type: 'manual', data: newBlock }]);
  };

  const handleFileUpload = (blockId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as ArrayBuffer;
      const tableData = parseSpreadsheet(data, file.name);
      setBlocks((prev) =>
        prev.map((b) =>
          b.type === 'table' && b.data.id === blockId
            ? { type: 'table', data: tableData }
            : b
        )
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (blockId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(blockId, file);
  };

  const updateColumn = (blockId: string, colId: string, updates: Partial<ColumnData>) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.type === 'table' && b.data.id === blockId) {
          const newColumns = b.data.columns.map((col) =>
            col.id === colId ? { ...col, ...updates } : col
          );
          return { type: 'table', data: { ...b.data, columns: newColumns } };
        }
        return b;
      })
    );
  };

  const randomizeColumn = (blockId: string, colId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.type === 'table' && b.data.id === blockId) {
          const newColumns = b.data.columns.map((col) => {
            if (col.id === colId && !col.frozen) {
              return { ...col, selectedValues: getRandomItems(col.values, col.count) };
            }
            return col;
          });
          return { type: 'table', data: { ...b.data, columns: newColumns } };
        }
        return b;
      })
    );
  };

  const randomizeTableBlock = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.type === 'table' && b.data.id === blockId) {
          const newColumns = b.data.columns.map((col) => ({
            ...col,
            selectedValues: col.frozen ? col.selectedValues : getRandomItems(col.values, col.count),
          }));
          return { type: 'table', data: { ...b.data, columns: newColumns } };
        }
        return b;
      })
    );
  };

  const randomizeAll = () => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.type === 'table') {
          const newColumns = b.data.columns.map((col) => ({
            ...col,
            selectedValues: col.frozen ? col.selectedValues : getRandomItems(col.values, col.count),
          }));
          return { type: 'table', data: { ...b.data, columns: newColumns } };
        }
        return b;
      })
    );
  };

  const toggleTableCollapse = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.type === 'table' && b.data.id === blockId) {
          return { type: 'table', data: { ...b.data, collapsed: !b.data.collapsed } };
        }
        return b;
      })
    );
  };

  const getTableBlockResult = (tableData: TableBlockData): string => {
    const parts: string[] = [];
    for (const colId of tableData.columnOrder) {
      const col = tableData.columns.find((c) => c.id === colId);
      if (col && col.enabled && col.selectedValues.length > 0) {
        if (col.weight !== 1) {
          parts.push(`(${col.selectedValues.join(', ')}:${col.weight})`);
        } else {
          parts.push(col.selectedValues.join(', '));
        }
      }
    }
    return parts.join(', ');
  };

  const getGlobalResult = (): string => {
    const parts: string[] = [];
    for (const block of blocks) {
      if (block.type === 'table') {
        const result = getTableBlockResult(block.data);
        if (result) parts.push(result);
      } else if (block.type === 'manual') {
        if (block.data.text.trim()) parts.push(block.data.text.trim());
      }
    }
    return parts.join(', ');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => getBlockId(b) === active.id);
        const newIndex = prev.findIndex((b) => getBlockId(b) === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleColumnDragEnd = (blockId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.type === 'table' && b.data.id === blockId) {
            const oldIndex = b.data.columnOrder.indexOf(active.id as string);
            const newIndex = b.data.columnOrder.indexOf(over.id as string);
            if (oldIndex === -1 || newIndex === -1) return b;
            return {
              type: 'table',
              data: {
                ...b.data,
                columnOrder: arrayMove(b.data.columnOrder, oldIndex, newIndex),
              },
            };
          }
          return b;
        })
      );
    }
  };

  const updateManualInput = (blockId: string, text: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.type === 'manual' && b.data.id === blockId
          ? { type: 'manual', data: { ...b.data, text } }
          : b
      )
    );
  };

  const removeBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => getBlockId(b) !== blockId));
  };

  const handleCopy = () => {
    const text = getGlobalResult();
    if (text) {
      navigator.clipboard.writeText(text);
      setCopyTooltip(true);
      setTimeout(() => setCopyTooltip(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={blocks.map(getBlockId)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block) => {
            const blockId = getBlockId(block);

            if (block.type === 'table') {
              const tableData = block.data;
              return (
                <SortableBlockWrapper key={blockId} id={blockId}>
                  <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`flex-1 min-h-[40px] border border-dashed rounded px-3 py-2 flex items-center transition-colors ${
                          dragOverId === tableData.id
                            ? 'border-blue-500 bg-blue-900/30'
                            : 'border-gray-600 bg-gray-900/50'
                        }`}
                        onDrop={(e) => { handleDrop(tableData.id, e); setDragOverId(null); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDragEnter={(e) => { e.preventDefault(); setDragOverId(tableData.id); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragOverId(null); }}
                      >
                        {tableData.fileName ? (
                          <span className="text-blue-400 font-medium">📄 {tableData.fileName}</span>
                        ) : (
                          <span className="text-gray-500">Перетащите файл сюда или нажмите кнопку →</span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleTableCollapse(tableData.id)}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors whitespace-nowrap"
                        title={tableData.collapsed ? 'Развернуть' : 'Свернуть'}
                      >
                        {tableData.collapsed ? '▼' : '▲'}
                      </button>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        ref={(el) => {
                          if (el) fileInputRefs.current.set(tableData.id, el);
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(tableData.id, file);
                        }}
                      />
                      <button
                        onClick={() => fileInputRefs.current.get(tableData.id)?.click()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        Загрузить из файла
                      </button>
                      <button
                        onClick={() => removeBlock(tableData.id)}
                        className="px-3 py-2 bg-red-600/80 hover:bg-red-700 rounded text-sm transition-colors"
                        title="Удалить блок"
                      >
                        ✕
                      </button>
                    </div>

                    {tableData.columns.length > 0 && !tableData.collapsed && (
                      <>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleColumnDragEnd(tableData.id)}
                        >
                          <SortableContext
                            items={tableData.columnOrder}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                              {tableData.columnOrder.map((colId) => {
                                const col = tableData.columns.find((c) => c.id === colId);
                                if (!col) return null;
                                return (
                                  <ColumnBlock
                                    key={colId}
                                    column={col}
                                    onUpdate={(updates) => updateColumn(tableData.id, colId, updates)}
                                    onRandomize={() => randomizeColumn(tableData.id, colId)}
                                  />
                                );
                              })}
                            </div>
                          </SortableContext>
                        </DndContext>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-300 min-h-[36px] break-all">
                            {getTableBlockResult(tableData) || <span className="text-gray-600">Результат...</span>}
                          </div>
                          <button
                            onClick={() => randomizeTableBlock(tableData.id)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium transition-colors whitespace-nowrap"
                          >
                            🎲 Random
                          </button>
                        </div>
                      </>
                    )}

                    {tableData.columns.length > 0 && tableData.collapsed && (
                      <div className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-300 break-all">
                        {getTableBlockResult(tableData) || <span className="text-gray-600">Результат...</span>}
                      </div>
                    )}
                  </div>
                </SortableBlockWrapper>
              );
            } else {
              return (
                <SortableBlockWrapper key={blockId} id={blockId}>
                  <ManualInputBlock
                    data={block.data}
                    onUpdate={(text: string) => updateManualInput(block.data.id, text)}
                    onRemove={() => removeBlock(block.data.id)}
                  />
                </SortableBlockWrapper>
              );
            }
          })}
        </SortableContext>
      </DndContext>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={addTableBlock}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
        >
          + Добавить таблицу
        </button>
        <button
          onClick={addManualInput}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium transition-colors text-black"
        >
          + Добавить ввод тегов
        </button>
      </div>

      <hr className="border-gray-600" />

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          📝 Глобальный итоговый результат:
        </label>
        <div className="flex items-start gap-2">
          <div className="flex-1 bg-gray-900 border border-gray-600 rounded px-4 py-3 text-gray-200 min-h-[60px] break-all">
            {getGlobalResult() || <span className="text-gray-600">Здесь появится итоговый текст...</span>}
          </div>
          <div className="flex flex-col gap-2 relative">
            <button
              onClick={randomizeAll}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded text-sm font-bold transition-colors whitespace-nowrap"
            >
              🎲 Random (всё)
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium transition-colors whitespace-nowrap"
              title="Скопировать в буфер обмена"
            >
              📋 Копировать
            </button>
            {copyTooltip && (
              <div className="absolute top-full mt-2 left-0 bg-green-600 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-50">
                ✓ Текст скопирован в буфер обмена
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
