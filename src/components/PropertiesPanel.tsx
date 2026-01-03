import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Type, FileText } from 'lucide-react';
import { useMindMapStore, NodeColor } from '@/store/mindMapStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const nodeColors: { value: NodeColor; label: string; class: string }[] = [
  { value: 'blue', label: 'Blue', class: 'bg-node-blue' },
  { value: 'purple', label: 'Purple', class: 'bg-node-purple' },
  { value: 'green', label: 'Green', class: 'bg-node-green' },
  { value: 'orange', label: 'Orange', class: 'bg-node-orange' },
  { value: 'pink', label: 'Pink', class: 'bg-node-pink' },
  { value: 'teal', label: 'Teal', class: 'bg-node-teal' },
  { value: 'yellow', label: 'Yellow', class: 'bg-node-yellow' },
  { value: 'gray', label: 'Gray', class: 'bg-node-gray' },
];

interface PropertiesPanelProps {
  className?: string;
}

export default function PropertiesPanel({ className }: PropertiesPanelProps) {
  const { nodes, selectedNodeId, updateNodeData, setSelectedNode } = useMindMapStore();
  
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label);
      setDescription(selectedNode.data.description || '');
    }
  }, [selectedNode]);

  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, { label: value });
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, { description: value });
    }
  };

  const handleColorChange = (color: NodeColor) => {
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, { color });
    }
  };

  const handleClose = () => {
    setSelectedNode(null);
  };

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn('properties-panel w-72 p-4', className)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Properties</h3>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-5">
            {/* Label */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Type className="h-3.5 w-3.5" />
                Label
              </Label>
              <Input
                value={label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Enter node label..."
                className="bg-secondary/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Add a description..."
                className="bg-secondary/50 resize-none h-20"
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Palette className="h-3.5 w-3.5" />
                Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {nodeColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className={cn(
                      'color-dot',
                      color.class,
                      selectedNode.data.color === color.value && 'selected ring-foreground'
                    )}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {selectedNodeId === 'root' ? 'Root node' : `Node ID: ${selectedNodeId?.slice(0, 8)}...`}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
