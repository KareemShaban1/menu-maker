import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";

interface SortableCategoryProps {
  id: string;
  children: ReactNode;
}

export const SortableCategory = ({ id, children }: SortableCategoryProps) => {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-6 w-7 h-7 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      {children}
    </div>
  );
};



