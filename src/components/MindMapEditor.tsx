import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Edit3 } from 'lucide-react';

import { useMindMapStore } from '@/store/mindMapStore';
import MindMapNode from './MindMapNode';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const nodeTypes = {
  mindMapNode: MindMapNode,
};

interface MindMapEditorInnerProps {
  onGoHome?: () => void;
}

function MindMapEditorInner({ onGoHome }: MindMapEditorInnerProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    selectedNodeId,
    setSelectedNode,
    mapName,
    setMapName,
    edgeStyle,
    saveCurrentMap,
  } = useMindMapStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(mapName);

  useEffect(() => {
    setTitleValue(mapName);
  }, [mapName]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveCurrentMap();
        toast({
          title: 'Saved!',
          description: 'Your mind map has been saved.',
        });
        return;
      }

      switch (event.key) {
        case 'a':
        case 'A':
          event.preventDefault();
          addNode(selectedNodeId || undefined, 'text');
          break;
        case 'i':
        case 'I':
          event.preventDefault();
          addNode(selectedNodeId || undefined, 'image');
          toast({
            title: 'Image node added',
            description: 'Select the node and add an image URL in the properties panel.',
          });
          break;
        case 'Tab':
          if (selectedNodeId) {
            event.preventDefault();
            addNode(selectedNodeId, 'text');
            toast({
              title: 'Sub-node added',
              description: 'A new child node has been created.',
            });
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedNodeId && selectedNodeId !== 'root') {
            event.preventDefault();
            deleteNode(selectedNodeId);
          }
          break;
        case 'Escape':
          setSelectedNode(null);
          break;
      }
    },
    [addNode, deleteNode, selectedNodeId, setSelectedNode, saveCurrentMap]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) {
      setMapName(titleValue.trim());
    } else {
      setTitleValue(mapName);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
    if (e.key === 'Escape') {
      setTitleValue(mapName);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          
          {isEditingTitle ? (
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="w-64 h-8 font-semibold bg-secondary/50"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-secondary transition-colors group"
            >
              <h1 className="font-semibold text-foreground">{mapName}</h1>
              <Edit3 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          {nodes.length} nodes • {edges.length} connections
        </div>
      </motion.header>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          defaultEdgeOptions={{
            type: edgeStyle,
            style: { strokeWidth: 2, stroke: 'hsl(var(--primary))' },
          }}
          connectionLineStyle={{ strokeWidth: 2, stroke: 'hsl(var(--primary))' }}
          className="canvas-background"
          onPaneClick={() => setSelectedNode(null)}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          
          <Controls 
            className="!bg-card !border-border !shadow-lg"
            showInteractive={false}
          />
          
          <MiniMap
            className="!bg-card !border-border"
            nodeColor={(node) => {
              const colors: Record<string, string> = {
                blue: 'hsl(217 91% 60%)',
                purple: 'hsl(262 83% 58%)',
                green: 'hsl(142 76% 36%)',
                orange: 'hsl(25 95% 53%)',
                pink: 'hsl(330 81% 60%)',
                teal: 'hsl(173 80% 40%)',
                yellow: 'hsl(45 93% 47%)',
                gray: 'hsl(220 9% 46%)',
                transparent: 'hsl(220 13% 91%)',
              };
              return colors[node.data?.color as string] || colors.blue;
            }}
            maskColor="hsl(var(--background) / 0.7)"
          />

          {/* Floating Toolbar */}
          <Panel position="bottom-center" className="mb-4">
            <Toolbar onGoHome={onGoHome} />
          </Panel>

          {/* Properties Panel */}
          <Panel position="top-right" className="mt-4 mr-4">
            <PropertiesPanel />
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

interface MindMapEditorProps {
  onGoHome?: () => void;
}

export default function MindMapEditor({ onGoHome }: MindMapEditorProps) {
  return (
    <ReactFlowProvider>
      <MindMapEditorInner onGoHome={onGoHome} />
    </ReactFlowProvider>
  );
}
