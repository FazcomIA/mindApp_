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

export type NodeColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal' | 'yellow' | 'gray';

export interface MindMapNodeData {
  label: string;
  color: NodeColor;
  description?: string;
  icon?: string;
}

export interface MindMapState {
  nodes: Node<MindMapNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  mapName: string;
  
  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (parentId?: string) => void;
  updateNodeData: (nodeId: string, data: Partial<MindMapNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setMapName: (name: string) => void;
  clearMap: () => void;
  exportToJson: () => string;
  importFromJson: (json: string) => void;
}

const initialNodes: Node<MindMapNodeData>[] = [
  {
    id: 'root',
    type: 'mindMapNode',
    position: { x: 400, y: 300 },
    data: { label: 'Central Idea', color: 'blue' },
  },
];

const initialEdges: Edge[] = [];

let nodeIdCounter = 1;

const generateNodeId = () => {
  nodeIdCounter += 1;
  return `node-${nodeIdCounter}-${Date.now()}`;
};

export const useMindMapStore = create<MindMapState>()(
  persist(
    (set, get) => ({
      nodes: initialNodes,
      edges: initialEdges,
      selectedNodeId: null,
      mapName: 'Untitled Mind Map',

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
        set({
          edges: addEdge(
            {
              ...connection,
              type: 'smoothstep',
              animated: false,
              style: { strokeWidth: 2 },
            },
            get().edges
          ),
        });
      },

      addNode: (parentId) => {
        const newNodeId = generateNodeId();
        const { nodes, edges } = get();
        
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
          // Random position near center
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
          data: { label: 'New Idea', color: randomColor },
        };

        const newEdges = parentId
          ? [
              ...edges,
              {
                id: `edge-${parentId}-${newNodeId}`,
                source: parentId,
                target: newNodeId,
                type: 'smoothstep',
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
        if (nodeId === 'root') return; // Prevent deleting root
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

      clearMap: () => {
        nodeIdCounter = 1;
        set({
          nodes: initialNodes,
          edges: initialEdges,
          selectedNodeId: null,
          mapName: 'Untitled Mind Map',
        });
      },

      exportToJson: () => {
        const { nodes, edges, mapName } = get();
        return JSON.stringify({ nodes, edges, mapName }, null, 2);
      },

      importFromJson: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.nodes && data.edges) {
            set({
              nodes: data.nodes,
              edges: data.edges,
              mapName: data.mapName || 'Imported Mind Map',
              selectedNodeId: null,
            });
          }
        } catch (e) {
          console.error('Failed to import JSON:', e);
        }
      },
    }),
    {
      name: 'mindmap-storage',
    }
  )
);
