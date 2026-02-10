import { Trash2, PlusCircle, ClipboardCheck, BookOpen, FileText, Video, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';

interface NodeDetailPanelProps {
  onExpand: (nodeId: string) => void;
  onMECECheck: (nodeId: string) => void;
  onFindResources: (nodeId: string) => void;
}

export function NodeDetailPanel({ onExpand, onMECECheck, onFindResources }: NodeDetailPanelProps) {
  const { selectedNodeId } = useUIStore();
  const { nodes, edges, removeNode } = useGraphStore();

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const childEdges = edges.filter((e) => e.source === node.id);
  const children = nodes.filter((n) =>
    childEdges.some((e) => e.target === n.id)
  );
  const acceptedChildren = children.filter(
    (c) => c.status === 'accepted' || c.status === 'user-added'
  );

  const parentEdge = edges.find((e) => e.target === node.id);
  const parent = parentEdge
    ? nodes.find((n) => n.id === parentEdge.source)
    : null;

  const hasResources = node.resources && node.resources.length > 0;

  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm">{node.label}</h3>
          <Badge
            variant={
              node.status === 'root'
                ? 'default'
                : node.status === 'user-added'
                  ? 'outline'
                  : 'secondary'
            }
            className="text-[10px]"
          >
            {node.status === 'root'
              ? 'Root'
              : node.status === 'user-added'
                ? 'Manual'
                : node.status === 'accepted'
                  ? 'Accepted'
                  : 'Suggestion'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{node.description}</p>
      </div>

      {node.reasonText && (
        <div className="bg-amber-50 rounded-md p-2 border border-amber-200">
          <div className="text-[10px] font-medium text-amber-800 mb-0.5">
            AI Reason
          </div>
          <div className="text-xs text-amber-700">{node.reasonText}</div>
        </div>
      )}

      {parent && (
        <div>
          <div className="text-[10px] font-medium text-muted-foreground mb-1">
            Parent
          </div>
          <div className="text-xs">
            {parent.label}
            {parentEdge && (
              <span className="text-muted-foreground">
                {' '}
                ({parentEdge.label})
              </span>
            )}
          </div>
        </div>
      )}

      {children.length > 0 && (
        <div>
          <div className="text-[10px] font-medium text-muted-foreground mb-1">
            Children ({children.length})
          </div>
          <div className="space-y-1">
            {children.map((child) => (
              <div key={child.id} className="text-xs flex items-center gap-1">
                <span
                  className={
                    child.status === 'ai-suggested'
                      ? 'text-amber-600'
                      : 'text-foreground'
                  }
                >
                  {child.label}
                </span>
                {child.status === 'ai-suggested' && (
                  <span className="text-[10px] text-amber-500">(pending)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="justify-start text-xs"
          onClick={() => onExpand(node.id)}
        >
          <PlusCircle className="h-3.5 w-3.5 mr-2" />
          Expand with AI
        </Button>

        {acceptedChildren.length >= 2 && (
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs"
            onClick={() => onMECECheck(node.id)}
          >
            <ClipboardCheck className="h-3.5 w-3.5 mr-2" />
            Check MECE
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="justify-start text-xs"
          onClick={() => onFindResources(node.id)}
          disabled={hasResources}
        >
          <BookOpen className="h-3.5 w-3.5 mr-2" />
          {hasResources ? 'Resources Loaded' : 'Learn More'}
        </Button>

        {node.status !== 'root' && (
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs text-destructive hover:text-destructive"
            onClick={() => removeNode(node.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {hasResources && (
        <div className="pt-2 border-t border-border">
          <div className="text-[10px] font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Learning Resources
          </div>
          <div className="space-y-2">
            {node.resources!.map((resource, i) => (
              <div
                key={i}
                className="bg-blue-50 rounded-md p-2 border border-blue-200"
              >
                <div className="flex items-start gap-1.5">
                  {resource.type === 'article' && (
                    <FileText className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
                  )}
                  {resource.type === 'book' && (
                    <BookOpen className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
                  )}
                  {resource.type === 'video' && (
                    <Video className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
                  )}
                  {resource.type === 'podcast' && (
                    <Headphones className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-medium text-blue-900">
                      {resource.url ? (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {resource.title}
                        </a>
                      ) : (
                        resource.title
                      )}
                    </div>
                    {resource.author && (
                      <div className="text-[10px] text-blue-700">
                        by {resource.author}
                      </div>
                    )}
                    <div className="text-[10px] text-blue-600 mt-0.5">
                      {resource.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
