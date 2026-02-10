import { Settings, FolderOpen, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGraphStore } from '@/stores/graph-store';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenSessions: () => void;
  onExport: () => void;
}

export function Header({ onOpenSettings, onOpenSessions, onExport }: HeaderProps) {
  const { title, nodes, newGraph } = useGraphStore();

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-2 bg-white">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          SpecKit
        </h1>
        {title && (
          <span className="text-sm text-muted-foreground">
            / {title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {nodes.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <FolderOpen className="h-4 w-4 mr-1" />
              Sessions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => newGraph()}>
              <Plus className="h-4 w-4 mr-2" />
              New Graph
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenSessions}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Manage Sessions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={onOpenSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
