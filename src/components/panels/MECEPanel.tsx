import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MECECheckResult } from '@/types/graph';

interface MECEPanelProps {
  result: MECECheckResult | null;
}

export function MECEPanel({ result }: MECEPanelProps) {
  if (!result) {
    return (
      <div className="p-4 text-xs text-muted-foreground">
        Select a node with 2+ children and click &quot;Check MECE&quot; to evaluate
        completeness.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        {result.isCompliant ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        )}
        <div>
          <div className="font-semibold text-sm">
            {result.isCompliant ? 'MECE Compliant' : 'MECE Issues Found'}
          </div>
          <div className="text-xs text-muted-foreground">
            Score: {result.overallScore}/100
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{result.summary}</p>

      {result.gaps.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-purple-700 mb-1 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Gaps ({result.gaps.length})
          </div>
          <div className="space-y-2">
            {result.gaps.map((gap, i) => (
              <div
                key={i}
                className="text-xs bg-purple-50 border border-purple-200 rounded-md p-2"
              >
                <div>{gap.description}</div>
                {gap.suggestedNode && (
                  <Badge variant="outline" className="mt-1 text-[10px] border-purple-300 text-purple-700">
                    Suggested: {gap.suggestedNode}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {result.overlaps.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-orange-700 mb-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Overlaps ({result.overlaps.length})
          </div>
          <div className="space-y-2">
            {result.overlaps.map((overlap, i) => (
              <div
                key={i}
                className="text-xs bg-orange-50 border border-orange-200 rounded-md p-2"
              >
                <div className="font-medium">
                  &quot;{overlap.nodeA}&quot; &amp; &quot;{overlap.nodeB}&quot;
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {overlap.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
