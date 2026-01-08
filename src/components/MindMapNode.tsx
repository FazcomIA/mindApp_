import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizer, NodeToolbar } from 'reactflow';
import { motion } from 'framer-motion';
import { ImageIcon, Plus, Trash2, Palette, GitBranch, CornerDownRight, CopyPlus } from 'lucide-react';
import { useMindMapStore, MindMapNodeData, NodeColor, TextColor, FontFamily, TextSize } from '@/store/mindMapStore';
import { cn } from '@/lib/utils';



const CollapseToggle = ({ collapsed, onClick }: { collapsed: boolean; onClick: (e: React.MouseEvent) => void }) => (
  <div
    onClick={(e) => { e.stopPropagation(); onClick(e); }}
    className={cn(
      "w-4 h-4 bg-background border border-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-muted transition-all shadow-sm absolute z-50",
      collapsed && "bg-muted"
    )}
    title={collapsed ? "Expand" : "Collapse"}
  >
    <div className={cn("w-2 h-0.5 bg-foreground transition-transform", collapsed && "rotate-90")} />
  </div>
);

const colorClasses: Record<NodeColor, string> = {
  blue: 'border-node-blue bg-node-blue/10',
  purple: 'border-node-purple bg-node-purple/10',
  green: 'border-node-green bg-node-green/10',
  orange: 'border-node-orange bg-node-orange/10',
  pink: 'border-node-pink bg-node-pink/10',
  teal: 'border-node-teal bg-node-teal/10',
  yellow: 'border-node-yellow bg-node-yellow/10',
  gray: 'border-node-gray bg-node-gray/10',
  transparent: 'border-border bg-transparent',
};

const textColorClasses: Record<TextColor, string> = {
  default: '',
  white: 'text-white',
  black: 'text-black',
  blue: 'text-node-blue',
  purple: 'text-node-purple',
  green: 'text-node-green',
  orange: 'text-node-orange',
  pink: 'text-node-pink',
  teal: 'text-node-teal',
  red: 'text-destructive',
};

const fontFamilyClasses: Record<FontFamily, string> = {
  default: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
  handwriting: 'font-handwriting',
  modern: 'font-modern',
  slab: 'font-slab',
  condensed: 'font-condensed',
  marker: 'font-marker',
};

const textSizeClasses: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

function MindMapNode({ id, data, selected }: NodeProps<MindMapNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const { updateNodeData, setSelectedNode, toggleCollapse, addSibling, addNode } = useMindMapStore();

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
    if (data.nodeType !== 'image') {
      setIsEditing(true);
    }
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

  const onNodeKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) return;

    if (e.key === 'Tab') {
      // e.preventDefault();
      // useMindMapStore.getState().addNode(id);
      // Let the global handler in MindMapEditor handle this
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      useMindMapStore.getState().addSibling(id);
    }
  };

  const handleClick = () => {
    setSelectedNode(id);
  };

  const isRoot = id === 'root';
  const isImage = data.nodeType === 'image';
  const textColor = data.textColor || 'default';
  const fontFamily = data.fontFamily || 'default';
  const textSize = data.textSize || (isRoot ? 'lg' : 'sm');

  // Custom background color style
  const backgroundStyle = {
    ...(data.backgroundColor ? { backgroundColor: data.backgroundColor } : {}),
    ...(data.borderColor ? { borderColor: data.borderColor, borderStyle: 'solid' } : {}),
  };

  return (
    <>
      {selected && isImage && (
        <NodeResizer
          color="#3b82f6"
          isVisible={true}
          minWidth={100}
          minHeight={100}
          handleStyle={{ width: 12, height: 12, borderRadius: '50%' }}
          lineStyle={{ borderWidth: 1 }}
        />
      )}

      {selected && (
        <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2 bg-card border border-border p-1 rounded-md shadow-sm">
          <button
            onClick={() => useMindMapStore.getState().addNode(id, 'text', 'default')}
            className="p-1.5 hover:bg-secondary rounded-sm transition-colors"
            title="Add Normal Child (Free)"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => useMindMapStore.getState().addNode(id, 'text', 'stacked')}
            className="p-1.5 hover:bg-secondary rounded-sm transition-colors"
            title="Add Tree Child (List/Locked)"
          >
            <GitBranch className="h-4 w-4" />
          </button>
          <button
            onClick={() => useMindMapStore.getState().deleteNode(id)}
            className="p-1.5 hover:bg-destructive/10 text-destructive rounded-sm transition-colors"
            title="Delete Node"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </NodeToolbar>
      )}
      {/* Number Badge for Ordered Topics */}
      {data.order !== undefined && (
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground z-10 shadow-sm">
          {data.order}
        </div>
      )}

      <motion.div
        tabIndex={0} // Make focusable for key events
        onKeyDown={onNodeKeyDown}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={{ ...backgroundStyle, width: '100%', height: '100%' }}
        className={cn(
          'mind-node px-6 py-4 border-2 bg-card outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          isRoot ? 'min-w-[200px] py-5' : 'min-w-[140px]',
          !isImage && 'max-w-[320px]',
          colorClasses[data.color],
          selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
          isImage && 'p-2 min-w-[160px] w-full h-full flex flex-col'
        )}
      >
        {/* Handles - Vertical para root, horizontal para demais */}
        {/* Handles */}
        {isRoot ? (
          <>
            {/* Root Node: Source on Right (for tree flow), Target on Left (optional, maybe not needed if strict root) */}
            <Handle
              type="target"
              position={Position.Left}
              className="!w-3 !h-3 !bg-primary !border-2 !border-card"
            />
            <Handle
              type="source"
              position={Position.Right}
              className="!w-3 !h-3 !bg-primary !border-2 !border-card"
            />
          </>
        ) : (
          <>
            {/* Child Node: Target Left, Source Right */}
            <Handle
              type="target"
              position={Position.Left}
              className="!w-3 !h-3 !bg-primary !border-2 !border-card"
            />

            {/* Right Handle (Source) - Valid connection point */}
            <Handle
              type="source"
              position={Position.Right}
              className="!w-3 !h-3 !bg-primary !border-2 !border-card"
            />

            {/* Collapse Toggle - Independent overlay positioned near the right handle */}
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-50">
              <CollapseToggle collapsed={!!data.collapsed} onClick={() => toggleCollapse(id)} />
            </div>
          </>
        )}

        {isImage ? (
          <div className="space-y-2 flex-1 flex flex-col">
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt={data.label}
                className="w-full h-full object-cover rounded-lg flex-1 min-h-0"
              />
            ) : (
              <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <p className={cn(
              'text-center',
              textSizeClasses[textSize],
              textColorClasses[textColor],
              fontFamilyClasses[fontFamily],
              textColor === 'default' && 'text-muted-foreground'
            )}>
              {data.label}
            </p>
          </div>
        ) : (
          <>
            {isEditing ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={cn(
                  'w-full bg-transparent text-center font-semibold outline-none',
                  textSizeClasses[textSize],
                  textColorClasses[textColor],
                  fontFamilyClasses[fontFamily]
                )}
              />
            ) : (
              <div
                className={cn(
                  'text-center font-semibold cursor-text select-none',
                  textSizeClasses[textSize],
                  textColorClasses[textColor],
                  fontFamilyClasses[fontFamily],
                  textColor === 'default' && 'text-foreground'
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
          </>
        )}
      </motion.div>
    </>
  );
}

export default memo(MindMapNode);
