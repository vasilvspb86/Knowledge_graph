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
import { useSettingsStore } from '@/stores/settings-store';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { openaiApiKey, model, maxSuggestions, setApiKey, setModel, setMaxSuggestions } =
    useSettingsStore();

  const [key, setKey] = useState(openaiApiKey);
  const [selectedModel, setSelectedModel] = useState(model);
  const [suggestions, setSuggestions] = useState(maxSuggestions);

  const handleSave = () => {
    setApiKey(key.trim());
    setModel(selectedModel);
    setMaxSuggestions(suggestions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              OpenAI API Key
            </label>
            <Input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Your API key is stored in your browser&apos;s localStorage. It is
              sent directly to OpenAI and never to any other server.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) =>
                setSelectedModel(e.target.value as 'gpt-4o' | 'gpt-4o-mini')
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (faster, cheaper)</option>
              <option value="gpt-4o">GPT-4o (higher quality)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Suggestions per Expansion
            </label>
            <Input
              type="number"
              min={1}
              max={10}
              value={suggestions}
              onChange={(e) => setSuggestions(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
