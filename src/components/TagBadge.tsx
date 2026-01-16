import { X } from 'lucide-react';
import { getTagColor } from '../types';

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function TagBadge({ tag, onRemove, onClick, size = 'sm' }: TagBadgeProps) {
  const colors = getTagColor(tag);
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      {tag}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
