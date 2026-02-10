import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ConceptNodeData } from '@/lib/graph-utils';
import { useUIStore } from '@/stores/ui-store';

function ConceptNodeComponent({ data, id, selected }: NodeProps) {
  const { selectNode } = useUIStore();
  const nodeData = data as unknown as ConceptNodeData;
  const isUserAdded = nodeData.nodeStatus === 'user-added';

  return (
    <div
      onClick={() => selectNode(id)}
      className={cn(
        'rounded-lg border-2 bg-white px-4 py-3 shadow-sm min-w-[180px] max-w-[240px] cursor-pointer transition-all',
        isUserAdded ? 'border-blue-400' : 'border-gray-200',
        selected && 'border-blue-500 ring-2 ring-blue-200'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {nodeData.label}
          </div>
          {nodeData.description && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {nodeData.description}
            </div>
          )}
        </div>
      </div>
      {isUserAdded && (
        <Badge variant="outline" className="mt-2 text-[10px] px-1.5 py-0 border-blue-300 text-blue-600">
          Manual
        </Badge>
      )}
      <div className="flex justify-end mt-2">
        <button
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
          title="Expand with AI"
          onClick={(e) => {
            e.stopPropagation();
            // Will be wired to AI expansion via context
            const event = new CustomEvent('expand-node', { detail: { nodeId: id } });
            window.dispatchEvent(event);
          }}
        >
          <PlusCircle className="h-4 w-4" />
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

export const ConceptNode = memo(ConceptNodeComponent);
