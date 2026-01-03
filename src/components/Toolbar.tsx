import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  LucideIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMindMapStore } from '@/store/mindMapStore';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useReactFlow } from 'reactflow';
import { toast } from '@/hooks/use-toast';

interface ToolItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  shortcut?: string;
  variant?: 'primary';
}

interface DividerItem {
  type: 'divider';
}

type ToolbarItem = ToolItem | DividerItem;

interface ToolbarProps {
  className?: string;
}

export default function Toolbar({ className }: ToolbarProps) {
  const { 
    selectedNodeId, 
    addNode, 
    deleteNode, 
    clearMap, 
    exportToJson, 
    importFromJson 
  } = useMindMapStore();
  
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleAddNode = () => {
    addNode(selectedNodeId || undefined);
    toast({
      title: 'Node added',
      description: 'Double-click to edit the node text.',
    });
  };

  const handleDeleteNode = () => {
    if (selectedNodeId && selectedNodeId !== 'root') {
      deleteNode(selectedNodeId);
      toast({
        title: 'Node deleted',
      });
    }
  };

  const handleExport = () => {
    const json = exportToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Exported successfully',
      description: 'Your mind map has been downloaded as JSON.',
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const json = event.target?.result as string;
          importFromJson(json);
          toast({
            title: 'Imported successfully',
            description: 'Your mind map has been loaded.',
          });
          setTimeout(() => fitView({ padding: 0.2 }), 100);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    clearMap();
    toast({
      title: 'Mind map cleared',
      description: 'Started fresh with a new central idea.',
    });
    setTimeout(() => fitView({ padding: 0.5 }), 100);
  };

  const tools: ToolbarItem[] = [
    { 
      icon: Plus, 
      label: 'Add Node', 
      onClick: handleAddNode, 
      shortcut: 'A',
      variant: 'primary'
    },
    { 
      icon: Trash2, 
      label: 'Delete Node', 
      onClick: handleDeleteNode, 
      disabled: !selectedNodeId || selectedNodeId === 'root',
      shortcut: 'Del' 
    },
    { type: 'divider' },
    { icon: ZoomIn, label: 'Zoom In', onClick: () => zoomIn(), shortcut: '+' },
    { icon: ZoomOut, label: 'Zoom Out', onClick: () => zoomOut(), shortcut: '-' },
    { icon: Maximize2, label: 'Fit View', onClick: () => fitView({ padding: 0.2 }) },
    { type: 'divider' },
    { icon: Download, label: 'Export JSON', onClick: handleExport },
    { icon: Upload, label: 'Import JSON', onClick: handleImport },
    { icon: RotateCcw, label: 'Clear Map', onClick: handleClear },
  ];

  const isDivider = (item: ToolbarItem): item is DividerItem => {
    return 'type' in item && item.type === 'divider';
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className={`toolbar flex items-center gap-1 px-3 py-2 ${className}`}
    >
      {tools.map((tool, index) => {
        if (isDivider(tool)) {
          return (
            <div 
              key={`divider-${index}`} 
              className="w-px h-6 bg-border mx-1" 
            />
          );
        }

        const Icon = tool.icon;
        const isPrimary = tool.variant === 'primary';

        return (
          <Tooltip key={tool.label}>
            <TooltipTrigger asChild>
              <Button
                variant={isPrimary ? 'default' : 'ghost'}
                size="icon"
                onClick={tool.onClick}
                disabled={tool.disabled}
                className={isPrimary ? 'bg-primary hover:bg-primary/90' : 'toolbar-button'}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex items-center gap-2">
              <span>{tool.label}</span>
              {tool.shortcut && (
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">
                  {tool.shortcut}
                </kbd>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </motion.div>
  );
}
