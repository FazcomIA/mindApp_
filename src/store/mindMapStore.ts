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
export type FontFamily = 'default' | 'serif' | 'mono' | 'handwriting';
export type EdgeStyle = 'smoothstep' | 'straight' | 'step' | 'bezier';
export type NodeType = 'text' | 'image';

export interface MindMapNodeData {
  label: string;
  color: NodeColor;
  description?: string;
  icon?: string;
  textColor?: TextColor;
  fontFamily?: FontFamily;
  backgroundColor?: string;
  nodeType?: NodeType;
  imageUrl?: string;
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
  savedMaps: SavedMap[];
  
  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (parentId?: string, nodeType?: NodeType) => void;
  updateNodeData: (nodeId: string, data: Partial<MindMapNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setMapName: (name: string) => void;
  setEdgeStyle: (style: EdgeStyle) => void;
  clearMap: () => void;
  exportToJson: () => string;
  importFromJson: (json: string) => void;
  saveCurrentMap: () => void;
  loadMap: (mapId: string) => void;
  deleteMap: (mapId: string) => void;
  createNewMap: () => void;
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
      savedMaps: [],

      onNodesChange: (changes) => {
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
        const { edgeStyle } = get();
        set({
          edges: addEdge(
            {
              ...connection,
              type: edgeStyle,
              animated: false,
              style: { strokeWidth: 2 },
            },
            get().edges
          ),
        });
      },

      addNode: (parentId, nodeType = 'text') => {
        const newNodeId = generateNodeId();
        const { nodes, edges, edgeStyle } = get();
        
        let position = { x: 200, y: 200 };
        
        if (parentId) {
          const parentNode = nodes.find((n) => n.id === parentId);
          if (parentNode) {
            const childCount = edges.filter((e) => e.source === parentId).length;
            const angle = (childCount * 45 - 90) * (Math.PI / 180);
            const distance = 200;
            position = {
              x: parentNode.position.x + Math.cos(angle) * distance,
              y: parentNode.position.y + Math.sin(angle) * distance + 100,
            };
          }
        } else {
          position = {
            x: 300 + Math.random() * 200,
            y: 200 + Math.random() * 200,
          };
        }

        const colors: NodeColor[] = ['blue', 'purple', 'green', 'orange', 'pink', 'teal'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newNode: Node<MindMapNodeData> = {
          id: newNodeId,
          type: 'mindMapNode',
          position,
          data: { 
            label: nodeType === 'image' ? 'Image' : 'New Idea', 
            color: randomColor,
            nodeType,
          },
        };

        const newEdges = parentId
          ? [
              ...edges,
              {
                id: `edge-${parentId}-${newNodeId}`,
                source: parentId,
                target: newNodeId,
                type: edgeStyle,
                animated: false,
                style: { strokeWidth: 2 },
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
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } }
              : node
          ),
        });
      },

      deleteNode: (nodeId) => {
        if (nodeId === 'root') return;
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
        set({ 
          edgeStyle: style,
          edges: get().edges.map(edge => ({
            ...edge,
            type: style,
          })),
        });
      },

      clearMap: () => {
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
        const { nodes, edges, mapName, edgeStyle } = get();
        return JSON.stringify({ nodes, edges, mapName, edgeStyle }, null, 2);
      },

      importFromJson: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.nodes && data.edges) {
            set({
              nodes: data.nodes,
              edges: data.edges,
              mapName: data.mapName || 'Imported Mind Map',
              edgeStyle: data.edgeStyle || 'smoothstep',
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
