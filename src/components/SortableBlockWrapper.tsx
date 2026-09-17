import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';

interface SortableBlockWrapperProps {
  id: string;
  children: ReactNode;
}

export default function SortableBlockWrapper({ id, children }: SortableBlockWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="flex items-start gap-1">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-300 select-none text-xl pt-4 px-1 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0"
          title="Перетащить блок"
        >
          ⠿
        </div>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
