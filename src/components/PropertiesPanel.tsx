import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Type, FileText, Image as ImageIcon, PaintBucket, Pipette } from 'lucide-react';
import { useMindMapStore, NodeColor, TextColor, FontFamily } from '@/store/mindMapStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  { value: 'transparent', label: 'Transparent', class: 'bg-transparent border-2 border-dashed border-border' },
];

const textColors: { value: TextColor; label: string; class: string }[] = [
  { value: 'default', label: 'Default', class: 'bg-foreground' },
  { value: 'white', label: 'White', class: 'bg-white border border-border' },
  { value: 'black', label: 'Black', class: 'bg-black' },
  { value: 'blue', label: 'Blue', class: 'bg-node-blue' },
  { value: 'purple', label: 'Purple', class: 'bg-node-purple' },
  { value: 'green', label: 'Green', class: 'bg-node-green' },
  { value: 'orange', label: 'Orange', class: 'bg-node-orange' },
  { value: 'pink', label: 'Pink', class: 'bg-node-pink' },
  { value: 'teal', label: 'Teal', class: 'bg-node-teal' },
  { value: 'red', label: 'Red', class: 'bg-destructive' },
];

const fontFamilies: { value: FontFamily; label: string }[] = [
  { value: 'default', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Monospace' },
  { value: 'handwriting', label: 'Handwriting' },
];

interface PropertiesPanelProps {
  className?: string;
}

export default function PropertiesPanel({ className }: PropertiesPanelProps) {
  const { nodes, selectedNodeId, updateNodeData, setSelectedNode } = useMindMapStore();
  
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [customBgColor, setCustomBgColor] = useState('');

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label);
      setDescription(selectedNode.data.description || '');
      setImageUrl(selectedNode.data.imageUrl || '');
      setCustomBgColor(selectedNode.data.backgroundColor || '');
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
      updateNodeData(selectedNodeId, { color, backgroundColor: undefined });
      setCustomBgColor('');
    }
  };

  const handleTextColorChange = (textColor: TextColor) => {
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, { textColor });
    }
  };

  const handleFontFamilyChange = (fontFamily: FontFamily) => {
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, { fontFamily });
    }
  };

  const handleImageUrlChange = (value: string) => {
    setImageUrl(value);
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, { imageUrl: value });
    }
  };

  const handleCustomBgColorChange = (value: string) => {
    setCustomBgColor(value);
    if (selectedNodeId && value) {
      updateNodeData(selectedNodeId, { backgroundColor: value, color: 'transparent' });
    }
  };

  const handleClose = () => {
    setSelectedNode(null);
  };

  const isImageNode = selectedNode?.data.nodeType === 'image';

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn('properties-panel w-72 p-4 max-h-[80vh] overflow-y-auto', className)}
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

            {/* Image URL (for image nodes) */}
            {isImageNode && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Image URL
                </Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-secondary/50"
                />
              </div>
            )}

            {/* Description */}
            {!isImageNode && (
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
            )}

            {/* Font Family */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Type className="h-3.5 w-3.5" />
                Font
              </Label>
              <Select 
                value={selectedNode.data.fontFamily || 'default'} 
                onValueChange={(value) => handleFontFamilyChange(value as FontFamily)}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span className={cn(
                        font.value === 'serif' && 'font-serif',
                        font.value === 'mono' && 'font-mono',
                        font.value === 'handwriting' && 'font-handwriting'
                      )}>
                        {font.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Pipette className="h-3.5 w-3.5" />
                Text Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {textColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleTextColorChange(color.value)}
                    className={cn(
                      'color-dot',
                      color.class,
                      selectedNode.data.textColor === color.value && 'selected ring-foreground'
                    )}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Border Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Palette className="h-3.5 w-3.5" />
                Border Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {nodeColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className={cn(
                      'color-dot',
                      color.class,
                      selectedNode.data.color === color.value && !selectedNode.data.backgroundColor && 'selected ring-foreground'
                    )}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <PaintBucket className="h-3.5 w-3.5" />
                Background Color
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customBgColor || '#ffffff'}
                  onChange={(e) => handleCustomBgColorChange(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                />
                <Input
                  value={customBgColor}
                  onChange={(e) => handleCustomBgColorChange(e.target.value)}
                  placeholder="#hex or transparent"
                  className="bg-secondary/50 flex-1"
                />
                {customBgColor && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setCustomBgColor('');
                      if (selectedNodeId) {
                        updateNodeData(selectedNodeId, { backgroundColor: undefined });
                      }
                    }}
                  >
                    Clear
                  </Button>
                )}
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
