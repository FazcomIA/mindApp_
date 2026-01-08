import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Palette, ChevronRight, ChevronDown } from 'lucide-react';
import { Topic, useMindMapStore } from '@/store/mindMapStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TopicItemProps {
    topic: Topic;
    nodeId: string;
    depth?: number;
}

export function TopicItem({ topic, nodeId, depth = 0 }: TopicItemProps) {
    const { updateTopic, addTopic, deleteTopic } = useMindMapStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(topic.label);
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (editValue.trim() !== topic.label) {
            updateTopic(nodeId, topic.id, { label: editValue.trim() });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
        if (e.key === 'Escape') {
            setEditValue(topic.label);
            setIsEditing(false);
        }
    };

    const handleStyleChange = (key: keyof NonNullable<Topic['style']>, value: string) => {
        updateTopic(nodeId, topic.id, {
            style: {
                ...topic.style,
                [key]: value
            }
        });
    };

    const style = topic.style || {};

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center gap-1 min-h-[32px]">
                {/* Expand/Collapse for children */}
                {topic.subTopics.length > 0 ? (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-0.5 hover:bg-black/5 rounded cursor-pointer z-20 bg-background border border-border/50 text-muted-foreground"
                    >
                        {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    </button>
                ) : (
                    // Dot for leaf nodes
                    <div className="w-2 h-2 rounded-full bg-border mx-1" />
                )}

                <div
                    className={cn(
                        "flex-1 flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all border shadow-sm",
                        style.backgroundColor ? '' : 'bg-card hover:bg-accent/50',
                    )}
                    style={{
                        backgroundColor: style.backgroundColor || 'hsl(var(--card))',
                        borderColor: style.borderColor || 'hsl(var(--border))',
                        borderWidth: style.borderWidth || '1px',
                        borderStyle: (style.borderStyle as any) || 'solid',
                    }}
                >
                    {isEditing ? (
                        <Input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="h-6 text-sm px-1 py-0 min-w-[80px]"
                        />
                    ) : (
                        <span
                            onClick={() => setIsEditing(true)}
                            className={cn(
                                "text-sm cursor-text flex-1 select-none font-medium",
                                style.textColor ? '' : 'text-foreground',
                                style.fontSize === 'lg' ? 'text-base font-semibold' : ''
                            )}
                            style={{ color: style.textColor }}
                        >
                            {topic.label}
                        </span>
                    )}

                    {/* Floating Actions */}
                    <div className={cn(
                        "flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2",
                        "bg-popover shadow-sm rounded-md border border-border"
                    )}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => addTopic(nodeId, topic.id)}
                            title="Adicionar Subtópico"
                        >
                            <Plus size={12} />
                        </Button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Palette size={12} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" side="right" align="start">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground">Estilo do Tópico</p>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-muted-foreground">Fundo</label>
                                        <div className="flex gap-1 flex-wrap">
                                            {['transparent', '#fef2f2', '#f0f9ff', '#f0fdf4', '#fdf4ff', '#fff7ed'].map(color => (
                                                <button
                                                    key={color}
                                                    className={cn(
                                                        "w-5 h-5 rounded border",
                                                        color === 'transparent' ? "bg-white relative overflow-hidden" : ""
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => handleStyleChange('backgroundColor', color)}
                                                    title={color}
                                                >
                                                    {color === 'transparent' && <div className="absolute inset-0 border-r border-red-500 transform rotate-45" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-muted-foreground">Texto</label>
                                        <div className="flex gap-1 flex-wrap">
                                            {['inherit', '#000000', '#ef4444', '#3b82f6', '#10b981', '#ffffff'].map(color => (
                                                <button
                                                    key={color}
                                                    className="w-5 h-5 rounded border"
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => handleStyleChange('textColor', color)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-muted-foreground">Borda</label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className={cn("px-2 py-0.5 text-[10px] bg-secondary rounded", !style.borderWidth && 'ring-1 ring-primary')}
                                                onClick={() => {
                                                    handleStyleChange('borderWidth', '0px');
                                                    handleStyleChange('borderColor', 'hsl(var(--border))');
                                                }}
                                            >
                                                Padrão
                                            </button>
                                            <button
                                                className="w-5 h-5 rounded border border-blue-500"
                                                onClick={() => {
                                                    handleStyleChange('borderWidth', '1px');
                                                    handleStyleChange('borderColor', '#3b82f6');
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => deleteTopic(nodeId, topic.id)}
                        >
                            <Trash2 size={12} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Recursive Children with Tree Lines */}
            <AnimatePresence>
                {isExpanded && topic.subTopics.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-6"
                    >
                        <div className="flex flex-col gap-2 relative mt-2">
                            {/* Vertical Spine for this level */}
                            <div className="absolute left-0 top-0 bottom-4 w-0.5 bg-border" />

                            {topic.subTopics.map((sub, idx) => (
                                <div key={sub.id} className="relative pl-4">
                                    {/* Horizontal connection */}
                                    <div className="absolute top-4 left-0 w-4 h-0.5 bg-border" />
                                    {/* Cover spine if last item */}
                                    {idx === topic.subTopics.length - 1 && (
                                        <div className="absolute left-[-2px] top-4 bottom-0 w-1 bg-background" />
                                    )}
                                    <TopicItem topic={sub} nodeId={nodeId} depth={depth + 1} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
