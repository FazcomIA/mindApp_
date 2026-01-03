import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { useMindMapStore, MindMapNodeData, NodeColor } from '@/store/mindMapStore';
import { cn } from '@/lib/utils';

const colorClasses: Record<NodeColor, string> = {
  blue: 'border-node-blue bg-node-blue/10',
  purple: 'border-node-purple bg-node-purple/10',
  green: 'border-node-green bg-node-green/10',
  orange: 'border-node-orange bg-node-orange/10',
  pink: 'border-node-pink bg-node-pink/10',
  teal: 'border-node-teal bg-node-teal/10',
  yellow: 'border-node-yellow bg-node-yellow/10',
  gray: 'border-node-gray bg-node-gray/10',
};

const colorTextClasses: Record<NodeColor, string> = {
  blue: 'text-node-blue',
  purple: 'text-node-purple',
  green: 'text-node-green',
  orange: 'text-node-orange',
  pink: 'text-node-pink',
  teal: 'text-node-teal',
  yellow: 'text-node-yellow',
  gray: 'text-node-gray',
};

function MindMapNode({ id, data, selected }: NodeProps<MindMapNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { updateNodeData, setSelectedNode } = useMindMapStore();

  useEffect(() => {
    setEditValue(data.label);
  }, [data.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim()) {
      updateNodeData(id, { label: editValue.trim() });
    } else {
      setEditValue(data.label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setEditValue(data.label);
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    setSelectedNode(id);
  };

  const isRoot = id === 'root';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'mind-node px-6 py-4 min-w-[140px] max-w-[280px] border-2 bg-card',
        colorClasses[data.color],
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        isRoot && 'min-w-[180px] py-5'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card"
      />
      
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full bg-transparent text-center font-semibold outline-none',
            isRoot ? 'text-lg' : 'text-sm',
            colorTextClasses[data.color]
          )}
        />
      ) : (
        <div
          className={cn(
            'text-center font-semibold cursor-text select-none',
            isRoot ? 'text-lg' : 'text-sm',
            colorTextClasses[data.color]
          )}
        >
          {data.label}
        </div>
      )}

      {data.description && (
        <p className="text-xs text-muted-foreground mt-2 text-center line-clamp-2">
          {data.description}
        </p>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card"
      />
    </motion.div>
  );
}

export default memo(MindMapNode);
