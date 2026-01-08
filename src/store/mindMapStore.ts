import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  addEdge,
} from 'reactflow';

export type NodeColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal' | 'yellow' | 'gray' | 'transparent';
export type TextColor = 'default' | 'white' | 'black' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal' | 'red';
export type FontFamily = 'default' | 'serif' | 'mono' | 'handwriting' | 'modern' | 'slab' | 'condensed' | 'marker';
export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
export type EdgeStyle = 'smoothstep' | 'straight' | 'step' | 'bezier';
export type EdgeLineStyle = 'solid' | 'dashed';
export type NodeType = 'text' | 'image';

export interface SubTopic {
  id: string;
  label: string;
}

export interface Topic {
  id: string;
  label: string;
  subTopics: SubTopic[];
}

export interface MindMapNodeData {
  label: string;
  color: NodeColor;
  description?: string;
  icon?: string;
  textColor?: TextColor;
  textSize?: TextSize;
  topics?: Topic[];
  order?: number;
  collapsed?: boolean;
  isRoot?: boolean;
  fontFamily?: FontFamily;
  backgroundColor?: string;
  nodeType?: NodeType;
  imageUrl?: string;
  layoutType?: 'default' | 'stacked' | 'structure';
  borderColor?: string;
}

export interface SavedMap {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodes: Node<MindMapNodeData>[];
  edges: Edge[];
}

export interface MindMapState {
  nodes: Node<MindMapNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  mapName: string;
  mapId: string;
  edgeStyle: EdgeStyle;
  edgeColor: string;
  edgeLineStyle: EdgeLineStyle;
  savedMaps: SavedMap[];
  past: { nodes: Node<MindMapNodeData>[]; edges: Edge[] }[];
  future: { nodes: Node<MindMapNodeData>[]; edges: Edge[] }[];

  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (parentId?: string, nodeType?: NodeType, layoutType?: 'default' | 'stacked' | 'structure') => void;
  updateNodeData: (nodeId: string, data: Partial<MindMapNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setMapName: (name: string) => void;
  setEdgeStyle: (style: EdgeStyle) => void;
  setEdgeColor: (color: string) => void;
  setEdgeLineStyle: (style: EdgeLineStyle) => void;
  toggleCollapse: (nodeId: string) => void;
  addSibling: (nodeId: string) => void;
  addTopic: (nodeId: string) => void;
  updateTopic: (nodeId: string, topicId: string, label: string) => void;
  deleteTopic: (nodeId: string, topicId: string) => void;
  addSubTopic: (nodeId: string, topicId: string) => void;
  updateSubTopic: (nodeId: string, topicId: string, subTopicId: string, label: string) => void;
  deleteSubTopic: (nodeId: string, topicId: string, subTopicId: string) => void;
  clearMap: () => void;
  exportToJson: () => string;
  importFromJson: (json: string) => void;
  saveCurrentMap: () => void;
  loadMap: (mapId: string) => void;
  deleteMap: (mapId: string) => void;
  createNewMap: () => void;
  addToHistory: () => void;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
}

const initialNodes: Node<MindMapNodeData>[] = [
  {
    id: 'root',
    type: 'mindMapNode',
    position: { x: 400, y: 300 },
    data: { label: 'Central Idea', color: 'blue', nodeType: 'text' },
  },
];

const initialEdges: Edge[] = [];

let nodeIdCounter = 1;

const generateNodeId = () => {
  nodeIdCounter += 1;
  return `node-${nodeIdCounter}-${Date.now()}`;
};

const generateMapId = () => {
  return `map-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useMindMapStore = create<MindMapState>()(
  persist(
    (set, get) => ({
      nodes: initialNodes,
      edges: initialEdges,
      selectedNodeId: null,
      mapName: 'Untitled Mind Map',
      mapId: generateMapId(),
      edgeStyle: 'smoothstep',
      edgeColor: 'hsl(var(--edge-primary))',
      edgeLineStyle: 'solid',
      savedMaps: [],
      past: [],
      future: [],

      addToHistory: () => {
        const { nodes, edges } = get();
        set((state) => ({
          past: [...state.past, { nodes, edges }],
          future: [],
        }));
      },

      undo: () => {
        const { past, future, nodes, edges } = get();
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);

        set({
          past: newPast,
          future: [...future, { nodes, edges }],
          nodes: previous.nodes,
          edges: previous.edges,
        });
      },

      redo: () => {
        const { past, future, nodes, edges } = get();
        if (future.length === 0) return;

        const next = future[future.length - 1];
        const newFuture = future.slice(0, -1);

        set({
          past: [...past, { nodes, edges }],
          future: newFuture,
          nodes: next.nodes,
          edges: next.edges,
        });
      },

      onNodesChange: (changes) => {
        // Only save history for user-initiated changes that aren't selection or dimensions (dimensions happen on load often)
        const meaningfulChanges = changes.filter(c => c.type !== 'select' && c.type !== 'dimensions');

        // Handling dragging (position changes)
        // We probably don't want to save on every single pixel move, but ReactFlow triggers this constantly.
        // A common strategy is to only save history on 'dragStart' or assume the user handles 'dragStop'.
        // However, onNodesChange handles the actual update.
        // For now, let's skip history here for position changes to avoid flood, 
        // AND reliance on a separate 'onNodeDragStart' or similar if we wanted, 
        // BUT strict undo/redo requires position tracking.
        // Let's leave onNodesChange pure for now and only instrument specific actions.

        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        get().addToHistory(); // Save before connecting
        const { edgeStyle, edgeColor, edgeLineStyle } = get();
        set({
          edges: addEdge(
            {
              ...connection,
              type: edgeStyle,
              animated: false,
              style: {
                strokeWidth: 2,
                stroke: edgeColor,
                strokeDasharray: edgeLineStyle === 'dashed' ? '5,5' : undefined,
              },
            },
            get().edges
          ),
        });
      },

      addNode: (parentId, nodeType = 'text', layoutType = 'default') => {
        get().addToHistory(); // Save before adding
        const newNodeId = generateNodeId();
        const { nodes, edges, edgeStyle, edgeColor, edgeLineStyle } = get();

        // Calculate position
        let position = { x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 25 };

        if (parentId) {
          const parentNode = nodes.find(n => n.id === parentId);
          if (parentNode) {
            // Find how many children this parent already has to offset vertically
            const childEdges = edges.filter(e => e.source === parentId);
            const childCount = childEdges.length;

            const isStacked = layoutType === 'stacked';

            // Default spacing
            const VERTICAL_SPACING = 60;
            const HORIZONTAL_OFFSET = 250;

            if (!isStacked) {
              // Normal / Branch layout
              // Spread or just place to the right with some randomness/jitter or simple offset
              // This corresponds to "New Idea" connecting to "Testing Tool" in the user image
              position = {
                x: parentNode.position.x + HORIZONTAL_OFFSET + (Math.random() * 50),
                y: parentNode.position.y + (childCount * 40) - 20 // Less spread than stacked, maybe?
              };
            } else {
              // Stacked list layout
              position = {
                x: parentNode.position.x + HORIZONTAL_OFFSET,
                y: parentNode.position.y + (childCount * VERTICAL_SPACING)
              };
            }
          }
        } else if (nodes.length > 0) {
          // If no parent but nodes exist (adding loose node), offset from last added
          const lastNode = nodes[nodes.length - 1];
          position = { x: lastNode.position.x + 50, y: lastNode.position.y + 50 };
        }

        const newNode: Node<MindMapNodeData> = {
          id: newNodeId,
          type: 'mindMapNode',
          position,
          data: {
            label: nodeType === 'image' ? 'Image' : 'New Node',
            color: 'blue',
            nodeType,
            layoutType: layoutType as 'default' | 'stacked' | 'structure',
            topics: [],
            order: (parentId && layoutType === 'stacked') ? (() => {
              // Find all sibling nodes (targets of edges from the same parent)
              const siblingEdges = edges.filter(e => e.source === parentId);
              const siblingNodes = nodes.filter(n => siblingEdges.some(e => e.target === n.id));

              // Find the max order among siblings
              const maxOrder = siblingNodes.reduce((max, node) => {
                return (node.data.order || 0) > max ? (node.data.order || 0) : max;
              }, 0);

              return maxOrder + 1;
            })() : undefined,
          },
          // draggable: true, // Allow movement for all nodes including stacked ones
        };

        const newEdges = parentId
          ? [
            ...edges,
            {
              id: `edge-${parentId}-${newNodeId}`,
              source: parentId,
              target: newNodeId,
              type: layoutType === 'stacked' ? 'mindmap' : edgeStyle,
              animated: false,
              style: {
                strokeWidth: 2,
                stroke: edgeColor,
                strokeDasharray: edgeLineStyle === 'dashed' ? '5,5' : undefined,
              },
            },
          ]
          : edges;

        set({
          nodes: [...nodes, newNode],
          edges: newEdges,
          selectedNodeId: newNodeId,
        });
      },

      updateNodeData: (nodeId, data) => {
        // We don't want to save history on every single keystroke if this is bound to input onChange.
        // Ideally we debounce or save on blur. 
        // For now, let's save history here. If it's too frequent, we'll need to move addToHistory to the component's onBlur.
        // We will assume calls to this are distinct enough or acceptable overhead.

        // Actually, for text input, saving on every char is bad UX for undo (undoes 1 char).
        // Let's check what data is being updated.
        const isTextInput = 'label' in data || 'description' in data;

        // If it's NOT text input (color, font, etc), save history. 
        // If it IS text input, we trust the component to handle history or we accept no history for text yet?
        // Let's save for non-text updates here. For text, we'll try to find a better spot or just accept it doesn't undo perfectly per word yet.
        // Wait, the Color Picker calls this.

        if (!isTextInput) {
          get().addToHistory();
        }
        // NOTE: For text, we probably want to save history on BLUR in the component, not here.
        // Current implementation in PropertiesPanel calls updateNodeData on change.

        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } }
              : node
          ),
        });
      },

      saveHistory: () => {
        // Helper to manually save history (e.g. from component onBlur)
        get().addToHistory();
      },

      deleteNode: (nodeId) => {
        if (nodeId === 'root') return;
        get().addToHistory(); // Save before delete
        set({
          nodes: get().nodes.filter((n) => n.id !== nodeId),
          edges: get().edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          ),
          selectedNodeId: null,
        });
      },

      setSelectedNode: (nodeId) => {
        set({ selectedNodeId: nodeId });
      },

      setMapName: (name) => {
        set({ mapName: name });
      },

      setEdgeStyle: (style) => {
        get().addToHistory();
        set({
          edgeStyle: style,
          edges: get().edges.map(edge => ({
            ...edge,
            type: style,
          })),
        });
      },

      setEdgeColor: (color) => {
        get().addToHistory();
        set({
          edgeColor: color,
          edges: get().edges.map(edge => ({
            ...edge,
            style: {
              ...edge.style,
              stroke: color,
            },
          })),
        });
      },

      setEdgeLineStyle: (style) => {
        get().addToHistory();
        set({
          edgeLineStyle: style,
          edges: get().edges.map(edge => ({
            ...edge,
            style: {
              ...edge.style,
              strokeDasharray: style === 'dashed' ? '5,5' : undefined,
            },
          })),
        });
      },

      toggleCollapse: (nodeId) => {
        // Toggle collapse is a visual state, but maybe user wants to undo it? 
        // Let's say yes.
        get().addToHistory();
        const { nodes, edges } = get();
        const nodeIndex = nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) return;

        const node = nodes[nodeIndex];
        const isCollapsed = !node.data.collapsed;

        // Update the collapsed state of the parent node
        const updatedNodes = [...nodes];
        updatedNodes[nodeIndex] = {
          ...node,
          data: { ...node.data, collapsed: isCollapsed }
        };

        // Recursively find all descendants starting ONLY from STACKED children
        const getDescendants = (parentId: string, isFirstLevel: boolean = false): string[] => {
          // Get all direct children
          const childrenEdges = edges.filter(e => e.source === parentId);
          const childrenNodes = childrenEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean);

          // If we are at the first level (the clicked node), we ONLY want to collapse STACKED children.
          // If we use 'isFirstLevel' flag, we can filter.
          // For subsequent levels, if a node is hidden, ALL its children should be hidden regardless of type (standard tree behavior).

          let validChildren: string[] = [];

          if (isFirstLevel) {
            // Filter: Only keep 'stacked' nodes
            validChildren = childrenNodes
              .filter(n => n?.data.layoutType === 'stacked')
              .map(n => n!.id);
          } else {
            // For deeper levels, take everything (cascade hide)
            validChildren = childrenNodes.map(n => n!.id);
          }

          let descendants = [...validChildren];
          validChildren.forEach(childId => {
            descendants = [...descendants, ...getDescendants(childId, false)];
          });
          return descendants;
        };

        const descendantIds = getDescendants(nodeId, true);

        // Hide/Show descendants
        descendantIds.forEach(id => {
          const index = updatedNodes.findIndex(n => n.id === id);
          if (index !== -1) {
            updatedNodes[index] = {
              ...updatedNodes[index],
              hidden: isCollapsed
            };
          }
        });

        // Hide/Show edges connected to descendants or source node if collapsed
        const updatedEdges = edges.map(edge => {
          if (descendantIds.includes(edge.target)) {
            return { ...edge, hidden: isCollapsed };
          }
          return edge;
        });

        set({ nodes: updatedNodes, edges: updatedEdges });
      },

      addSibling: (nodeId: string) => {
        get().addToHistory();
        const { edges, addNode, nodes } = get();
        // Find parent edge (where target is the sibling node)
        const parentEdge = edges.find(e => e.target === nodeId);

        if (parentEdge) {
          // Add node to the same parent
          addNode(parentEdge.source);
        } else {
          // No parent? It's likely a root node or detached.
          // If root, maybe do nothing or add a separate root? 
          // Usually we don't add siblings to Root in strict maps, but let's allow "secondary root" or just ignore.
          // For now, let's treat it as adding a loose node if it's not the main root.
          if (nodeId !== 'root') {
            // Creating a loose node near the current one? 
            // Logic in addNode handles "no parent" by placing it near last node.
            addNode();
          }
        }
      },

      addTopic: (nodeId) => {
        get().addToHistory();
        const { nodes } = get();
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const topics = node.data.topics || [];
        const newTopic: Topic = {
          id: `topic-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          label: 'New Topic',
          subTopics: [],
        };

        get().updateNodeData(nodeId, { topics: [...topics, newTopic] });
      },

      updateTopic: (nodeId, topicId, label) => {
        // Debounce?
        get().addToHistory();
        const { nodes } = get();
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !node.data.topics) return;

        const topics = node.data.topics.map(topic =>
          topic.id === topicId ? { ...topic, label } : topic
        );

        get().updateNodeData(nodeId, { topics });
      },

      deleteTopic: (nodeId, topicId) => {
        get().addToHistory();
        const { nodes } = get();
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !node.data.topics) return;

        const topics = node.data.topics.filter(topic => topic.id !== topicId);
        get().updateNodeData(nodeId, { topics });
      },

      addSubTopic: (nodeId, topicId) => {
        get().addToHistory();
        const { nodes } = get();
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !node.data.topics) return;

        const topics = node.data.topics.map(topic => {
          if (topic.id === topicId) {
            const newSubTopic: SubTopic = {
              id: `subtopic-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              label: 'New Sub-topic',
            };
            return { ...topic, subTopics: [...topic.subTopics, newSubTopic] };
          }
          return topic;
        });

        get().updateNodeData(nodeId, { topics });
      },

      updateSubTopic: (nodeId, topicId, subTopicId, label) => {
        get().addToHistory();
        const { nodes } = get();
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !node.data.topics) return;

        const topics = node.data.topics.map(topic => {
          if (topic.id === topicId) {
            return {
              ...topic,
              subTopics: topic.subTopics.map(st =>
                st.id === subTopicId ? { ...st, label } : st
              ),
            };
          }
          return topic;
        });

        get().updateNodeData(nodeId, { topics });
      },

      deleteSubTopic: (nodeId, topicId, subTopicId) => {
        get().addToHistory();
        const { nodes } = get();
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !node.data.topics) return;

        const topics = node.data.topics.map(topic => {
          if (topic.id === topicId) {
            return {
              ...topic,
              subTopics: topic.subTopics.filter(st => st.id !== subTopicId),
            };
          }
          return topic;
        });

        get().updateNodeData(nodeId, { topics });
      },

      clearMap: () => {
        get().addToHistory();
        nodeIdCounter = 1;
        set({
          nodes: initialNodes,
          edges: initialEdges,
          selectedNodeId: null,
          mapName: 'Untitled Mind Map',
          mapId: generateMapId(),
        });
      },

      exportToJson: () => {
        const { nodes, edges, mapName, edgeStyle, edgeColor, edgeLineStyle } = get();
        return JSON.stringify({ nodes, edges, mapName, edgeStyle, edgeColor, edgeLineStyle }, null, 2);
      },

      importFromJson: (json) => {
        get().addToHistory();
        try {
          const data = JSON.parse(json);
          if (data.nodes && data.edges) {
            set({
              nodes: data.nodes,
              edges: data.edges,
              mapName: data.mapName || 'Imported Mind Map',
              edgeStyle: data.edgeStyle || 'smoothstep',
              edgeColor: data.edgeColor || 'hsl(var(--edge-primary))',
              edgeLineStyle: data.edgeLineStyle || 'solid',
              selectedNodeId: null,
            });
          }
        } catch (e) {
          console.error('Failed to import JSON:', e);
        }
      },

      saveCurrentMap: () => {
        const { nodes, edges, mapName, mapId, savedMaps } = get();
        const now = new Date().toISOString();

        const existingIndex = savedMaps.findIndex(m => m.id === mapId);

        const mapData: SavedMap = {
          id: mapId,
          name: mapName,
          createdAt: existingIndex >= 0 ? savedMaps[existingIndex].createdAt : now,
          updatedAt: now,
          nodes,
          edges,
        };

        if (existingIndex >= 0) {
          const updatedMaps = [...savedMaps];
          updatedMaps[existingIndex] = mapData;
          set({ savedMaps: updatedMaps });
        } else {
          set({ savedMaps: [...savedMaps, mapData] });
        }
      },

      loadMap: (mapId) => {
        const { savedMaps } = get();
        const map = savedMaps.find(m => m.id === mapId);
        if (map) {
          get().addToHistory();
          set({
            nodes: map.nodes,
            edges: map.edges,
            mapName: map.name,
            mapId: map.id,
            selectedNodeId: null,
          });
        }
      },

      deleteMap: (mapId) => {
        set({
          savedMaps: get().savedMaps.filter(m => m.id !== mapId),
        });
      },

      createNewMap: () => {
        get().addToHistory();
        nodeIdCounter = 1;
        set({
          nodes: initialNodes,
          edges: initialEdges,
          selectedNodeId: null,
          mapName: 'Untitled Mind Map',
          mapId: generateMapId(),
        });
      },
    }),
    {
      name: 'mindmap-storage',
    }
  )
);
