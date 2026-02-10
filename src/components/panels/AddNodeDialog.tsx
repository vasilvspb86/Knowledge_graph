import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGraphStore } from '@/stores/graph-store';
import type { RelationType } from '@/types/graph';

interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentNodeId: string | null;
}

const RELATION_TYPES: { value: RelationType; label: string }[] = [
  { value: 'related-to', label: 'Related to' },
  { value: 'part-of', label: 'Part of' },
  { value: 'is-a', label: 'Is a type of' },
  { value: 'leads-to', label: 'Leads to' },
  { value: 'requires', label: 'Requires' },
  { value: 'contrasts-with', label: 'Contrasts with' },
  { value: 'example-of', label: 'Example of' },
  { value: 'applies-to', label: 'Applies to' },
];

export function AddNodeDialog({ open, onOpenChange, parentNodeId }: AddNodeDialogProps) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [relationType, setRelationType] = useState<RelationType>('related-to');
  const addNode = useGraphStore((s) => s.addNode);

  const handleSubmit = () => {
    if (!label.trim()) return;

    addNode(
      {
        label: label.trim(),
        description: description.trim() || `User-added concept: ${label.trim()}`,
        status: 'user-added',
      },
      parentNodeId || undefined
    );

    setLabel('');
    setDescription('');
    setRelationType('related-to');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Concept</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Concept Name
            </label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Market Segmentation"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief explanation (optional)"
            />
          </div>
          {parentNodeId && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Relationship to Parent
              </label>
              <select
                value={relationType}
                onChange={(e) => setRelationType(e.target.value as RelationType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {RELATION_TYPES.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!label.trim()}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
