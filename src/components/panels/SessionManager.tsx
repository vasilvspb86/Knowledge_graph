import { Trash2, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/stores/graph-store';

interface SessionManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionManager({ open, onOpenChange }: SessionManagerProps) {
  const { savedGraphs, currentGraphId, loadGraph, deleteGraph } =
    useGraphStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Saved Sessions</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          {savedGraphs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No saved sessions yet. Explore a topic to get started.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {savedGraphs.map((graph) => (
                <div
                  key={graph.id}
                  className={`flex items-center justify-between rounded-md border p-3 ${
                    graph.id === currentGraphId
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <button
                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                    onClick={() => {
                      loadGraph(graph.id);
                      onOpenChange(false);
                    }}
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {graph.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {graph.nodes.length} nodes &middot;{' '}
                        {new Date(graph.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteGraph(graph.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
