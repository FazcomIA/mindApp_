import {
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  LucideIcon,
  ImageIcon,
  GitBranch,
  Home,
  Palette,
  Minus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMindMapStore, EdgeStyle, EdgeLineStyle } from '@/store/mindMapStore';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
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

interface DropdownItem {
  type: 'dropdown';
  icon: LucideIcon;
  label: string;
}

type ToolbarItem = ToolItem | DividerItem | DropdownItem;

interface ToolbarProps {
  className?: string;
  onGoHome?: () => void;
}

const edgeStyles: { value: EdgeStyle; label: string }[] = [
  { value: 'smoothstep', label: 'Smooth Step' },
  { value: 'bezier', label: 'Bezier Curve' },
  { value: 'straight', label: 'Straight Line' },
  { value: 'step', label: 'Step' },
];

export default function Toolbar({ className, onGoHome }: ToolbarProps) {
  const {
    selectedNodeId,
    addNode,
    deleteNode,
    clearMap,
    exportToJson,
    importFromJson,
    edgeStyle,
    setEdgeStyle,
    edgeColor,
    setEdgeColor,
    edgeLineStyle,
    setEdgeLineStyle,
    saveCurrentMap,
  } = useMindMapStore();

  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleAddNode = () => {
    addNode(selectedNodeId || undefined, 'text');
    toast({
      title: 'Node added',
      description: 'Double-click to edit the node text.',
    });
  };

  const handleAddImageNode = () => {
    addNode(selectedNodeId || undefined, 'image');
    toast({
      title: 'Image node added',
      description: 'Select the node and add an image URL in the properties panel.',
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

  const handleSave = () => {
    saveCurrentMap();
    toast({
      title: 'Saved!',
      description: 'Your mind map has been saved.',
    });
  };

  const handleEdgeStyleChange = (style: EdgeStyle) => {
    setEdgeStyle(style);
    toast({
      title: 'Line style changed',
      description: `Connections now use ${edgeStyles.find(s => s.value === style)?.label.toLowerCase()}.`,
    });
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className={`toolbar flex items-center gap-1 px-3 py-2 ${className}`}
    >
      {/* Home Button */}
      {onGoHome && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onGoHome}
                className="toolbar-button"
              >
                <Home className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span>Home</span>
            </TooltipContent>
          </Tooltip>
          <div className="w-px h-6 bg-border mx-1" />
        </>
      )}

      {/* Add Node */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            size="icon"
            onClick={handleAddNode}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>Add Node</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">A</kbd>
        </TooltipContent>
      </Tooltip>

      {/* Add Image Node */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddImageNode}
            className="toolbar-button"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>Add Image</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">I</kbd>
        </TooltipContent>
      </Tooltip>

      {/* Delete Node */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteNode}
            disabled={!selectedNodeId || selectedNodeId === 'root'}
            className="toolbar-button"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>Delete Node</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Del</kbd>
        </TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Edge Style Dropdown */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="toolbar-button">
                <GitBranch className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>Line Style</span>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="center">
          <DropdownMenuLabel>Connection Style</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {edgeStyles.map((style) => (
            <DropdownMenuItem
              key={style.value}
              onClick={() => handleEdgeStyleChange(style.value)}
              className={edgeStyle === style.value ? 'bg-secondary' : ''}
            >
              {style.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edge Color */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="toolbar-button">
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>Line Color</span>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="center">
          <DropdownMenuLabel>Line Color</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-2">
            <input
              type="color"
              value={edgeColor.startsWith('hsl') ? '#3b82f6' : edgeColor}
              onChange={(e) => setEdgeColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer border border-border"
            />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEdgeColor('hsl(var(--edge-primary))')}>
            Default
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEdgeColor('hsl(var(--primary))')}>
            Primary
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEdgeColor('hsl(var(--accent))')}>
            Accent
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEdgeColor('#3b82f6')}>
            Blue
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEdgeColor('#8b5cf6')}>
            Purple
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEdgeColor('#10b981')}>
            Green
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEdgeColor('#f59e0b')}>
            Orange
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEdgeColor('#ef4444')}>
            Red
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edge Line Style (Solid/Dashed) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEdgeLineStyle(edgeLineStyle === 'solid' ? 'dashed' : 'solid')}
            className="toolbar-button"
          >
            {edgeLineStyle === 'dashed' ? (
              <Minus className="h-4 w-4" />
            ) : (
              <GitBranch className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>{edgeLineStyle === 'solid' ? 'Solid' : 'Dashed'} Line</span>
        </TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Zoom Controls */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => zoomIn()}
            className="toolbar-button"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>Zoom In</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">+</kbd>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => zoomOut()}
            className="toolbar-button"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>Zoom Out</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">-</kbd>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fitView({ padding: 0.2 })}
            className="toolbar-button"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>Fit View</span>
        </TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Save */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className="toolbar-button"
          >
            <Download className="h-4 w-4 rotate-180" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>Save</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+S</kbd>
        </TooltipContent>
      </Tooltip>

      {/* Export */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExport}
            className="toolbar-button"
          >
            <Download className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>Export JSON</span>
        </TooltipContent>
      </Tooltip>

      {/* Import */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleImport}
            className="toolbar-button"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>Import JSON</span>
        </TooltipContent>
      </Tooltip>

      {/* Clear */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="toolbar-button"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>Clear Map</span>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}
