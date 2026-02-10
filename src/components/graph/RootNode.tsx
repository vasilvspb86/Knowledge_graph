import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConceptNodeData } from '@/lib/graph-utils';
import { useUIStore } from '@/stores/ui-store';

function RootNodeComponent({ data, id, selected }: NodeProps) {
  const { selectNode } = useUIStore();
  const nodeData = data as unknown as ConceptNodeData;

  return (
    <div
      onClick={() => selectNode(id)}
      className={cn(
        'rounded-xl bg-indigo-600 text-white px-5 py-4 shadow-lg min-w-[200px] max-w-[280px] cursor-pointer transition-all',
        selected && 'ring-4 ring-indigo-300'
      )}
    >
      <div className="font-semibold text-base mb-1">{nodeData.label}</div>
      <div className="text-indigo-200 text-xs">{nodeData.description}</div>
      <div className="flex justify-end mt-3">
        <button
          className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
          title="Expand with AI"
          onClick={(e) => {
            e.stopPropagation();
            const event = new CustomEvent('expand-node', { detail: { nodeId: id } });
            window.dispatchEvent(event);
          }}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Expand
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400" />
    </div>
  );
}

export const RootNode = memo(RootNodeComponent);
