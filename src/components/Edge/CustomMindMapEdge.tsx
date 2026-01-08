import { BaseEdge, EdgeProps, getSmoothStepPath } from 'reactflow';

export default function CustomMindMapEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 20, // Creates the "Arc" corner look
    });

    return (
        <BaseEdge
            path={edgePath}
            markerEnd={markerEnd}
            style={{
                ...style,
                strokeWidth: style.strokeWidth || 3,
                stroke: style.stroke || '#3b82f6',
                strokeDasharray: style.strokeDasharray
            }}
            id={id}
        />
    );
}
