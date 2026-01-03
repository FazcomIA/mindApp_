import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Calendar, 
  SortAsc, 
  SortDesc, 
  Trash2, 
  FileJson,
  Upload
} from 'lucide-react';
import { useMindMapStore, SavedMap } from '@/store/mindMapStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type SortBy = 'name' | 'createdAt' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

interface HomeScreenProps {
  onOpenEditor: () => void;
}

export default function HomeScreen({ onOpenEditor }: HomeScreenProps) {
  const { savedMaps, loadMap, deleteMap, createNewMap, importFromJson } = useMindMapStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredAndSortedMaps = useMemo(() => {
    let maps = [...savedMaps];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      maps = maps.filter(map => 
        map.name.toLowerCase().includes(query)
      );
    }
    
    // Sort
    maps.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return maps;
  }, [savedMaps, searchQuery, sortBy, sortOrder]);

  const handleNewMap = () => {
    createNewMap();
    onOpenEditor();
    toast({
      title: 'New map created',
      description: 'Start adding nodes to your new mind map!',
    });
  };

  const handleLoadMap = (mapId: string) => {
    loadMap(mapId);
    onOpenEditor();
  };

  const handleDeleteMap = (mapId: string, mapName: string) => {
    deleteMap(mapId);
    toast({
      title: 'Map deleted',
      description: `"${mapName}" has been removed.`,
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
          onOpenEditor();
          toast({
            title: 'Imported successfully',
            description: 'Your mind map has been loaded.',
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10"
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">MindFlow</h1>
                <p className="text-sm text-muted-foreground">Visual Mind Mapping</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import JSON
              </Button>
              <Button onClick={handleNewMap}>
                <Plus className="h-4 w-4 mr-2" />
                New Map
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search maps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Sort by: {sortBy === 'name' ? 'Name' : sortBy === 'createdAt' ? 'Created' : 'Updated'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
                  Created Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('updatedAt')}>
                  Updated Date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="icon" onClick={toggleSortOrder}>
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Maps Grid */}
        {filteredAndSortedMaps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            {savedMaps.length === 0 ? (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <FileJson className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">No mind maps yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create your first mind map to get started organizing your ideas visually.
                </p>
                <Button onClick={handleNewMap} size="lg" className="mt-4">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Map
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">No results found</h2>
                <p className="text-muted-foreground">
                  No mind maps match your search "{searchQuery}"
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedMaps.map((map, index) => (
              <MapCard
                key={map.id}
                map={map}
                index={index}
                onOpen={() => handleLoadMap(map.id)}
                onDelete={() => handleDeleteMap(map.id, map.name)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface MapCardProps {
  map: SavedMap;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
}

function MapCard({ map, index, onOpen, onDelete, formatDate }: MapCardProps) {
  const nodeCount = map.nodes.length;
  const edgeCount = map.edges.length;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className={cn(
        "group relative bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer",
        "hover:border-primary/50"
      )}
      onClick={onOpen}
    >
      {/* Preview dots pattern */}
      <div className="h-24 bg-secondary/50 rounded-lg mb-4 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold text-primary/20">
            {nodeCount}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground truncate">{map.name}</h3>
        <p className="text-sm text-muted-foreground">
          {nodeCount} nodes • {edgeCount} connections
        </p>
        <p className="text-xs text-muted-foreground">
          Updated {formatDate(map.updatedAt)}
        </p>
      </div>

      {/* Delete button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{map.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your mind map.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
