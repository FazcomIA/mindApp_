import { useRef } from 'react';
import { NodeToolbar, Position } from 'reactflow';
import { useMindMapStore, NodeColor } from '@/store/mindMapStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Palette,
    GitFork,
    ListTree,
    Trash2,
    Box,
    Layout,
    Type
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface NodeStylingToolbarProps {
    nodeId: string;
    className?: string;
    data: any;
}

const colors: { value: NodeColor; label: string; class: string }[] = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
    { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
    { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
];

export function NodeStylingToolbar({ nodeId, className, data }: NodeStylingToolbarProps) {
    const {
        updateNodeData,
        addNode,
        addTopic,
        deleteNode
    } = useMindMapStore();

    const handleColorChange = (color: NodeColor) => {
        updateNodeData(nodeId, { color, backgroundColor: undefined }); // Reset custom bg when choosing theme
    };

    const handleCustomBgChange = (value: string) => {
        updateNodeData(nodeId, { backgroundColor: value });
    };

    return (
        <NodeToolbar
            isVisible={undefined} /* Visible when selected by default */
            position={Position.Top}
            offset={10}
            className={cn("flex items-center gap-1 p-1 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg", className)}
        >
            {/* Create Child Node (Edge) */}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted"
                onClick={() => addNode(nodeId, 'text')}
                title="Adicionar Nó Filho"
            >
                <GitFork className="h-4 w-4" />
            </Button>

            {/* Add Internal Topic */}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted"
                onClick={() => addTopic(nodeId)}
                title="Adicionar Subtópico Interno"
            >
                <ListTree className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Styling Popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" title="Estilo">
                        <Palette className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="center">
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                <Box className="h-3 w-3" /> Cor do Tema
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {colors.map((c) => (
                                    <button
                                        key={c.value}
                                        className={cn(
                                            "w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                            c.class
                                        )}
                                        onClick={() => handleColorChange(c.value)}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                <Layout className="h-3 w-3" /> Fundo
                            </h4>
                            <div className="flex gap-2">
                                <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-md p-1">
                                    <input
                                        type="color"
                                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                                        value={data.backgroundColor || '#ffffff'}
                                        onChange={(e) => handleCustomBgChange(e.target.value)}
                                    />
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {data.backgroundColor || 'Transparente'}
                                    </span>
                                </div>
                                {data.backgroundColor && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={() => updateNodeData(nodeId, { backgroundColor: undefined })}
                                    >
                                        Redefinir
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => deleteNode(nodeId)}
                title="Excluir Nó"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </NodeToolbar>
    );
}
