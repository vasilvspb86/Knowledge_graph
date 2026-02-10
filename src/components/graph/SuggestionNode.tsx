import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SuggestionNodeData } from '@/lib/graph-utils';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';

const REASON_LABELS: Record<string, string> = {
  'related-concept': 'Related',
  prerequisite: 'Prerequisite',
  consequence: 'Consequence',
  contrast: 'Contrast',
  component: 'Component',
  gap: 'Gap',
  application: 'Application',
  example: 'Example',
};

const REASON_COLORS: Record<string, string> = {
  'related-concept': 'bg-blue-100 text-blue-700',
  prerequisite: 'bg-violet-100 text-violet-700',
  consequence: 'bg-green-100 text-green-700',
  contrast: 'bg-red-100 text-red-700',
  component: 'bg-cyan-100 text-cyan-700',
  gap: 'bg-purple-100 text-purple-700',
  application: 'bg-orange-100 text-orange-700',
  example: 'bg-emerald-100 text-emerald-700',
};

function SuggestionNodeComponent({ data, id, selected }: NodeProps) {
  const { acceptSuggestion, rejectSuggestion } = useGraphStore();
  const { selectNode } = useUIStore();
  const nodeData = data as unknown as SuggestionNodeData;

  return (
    <div
      onClick={() => selectNode(id)}
      className={cn(
        'rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3 shadow-sm min-w-[180px] max-w-[240px] cursor-pointer transition-all',
        selected && 'ring-2 ring-amber-300'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-400" />
      <div className="font-medium text-sm text-foreground">{nodeData.label}</div>
      {nodeData.description && (
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {nodeData.description}
        </div>
      )}
      <div className="flex items-center gap-2 mt-2">
        <span
          className={cn(
            'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
            REASON_COLORS[nodeData.reasonType] || 'bg-gray-100 text-gray-700'
          )}
        >
          {REASON_LABELS[nodeData.reasonType] || nodeData.reasonType}
        </span>
      </div>
      {nodeData.reasonText && (
        <div className="text-[11px] text-amber-700 mt-1 italic line-clamp-2">
          {nodeData.reasonText}
        </div>
      )}
      <div className="flex gap-1.5 mt-3 justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            acceptSuggestion(id);
          }}
          className="bg-green-100 hover:bg-green-200 text-green-700 rounded-md p-1.5 transition-colors"
          title="Accept suggestion"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            rejectSuggestion(id);
          }}
          className="bg-red-100 hover:bg-red-200 text-red-700 rounded-md p-1.5 transition-colors"
          title="Reject suggestion"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400" />
    </div>
  );
}

export const SuggestionNode = memo(SuggestionNodeComponent);
