import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useGraphStore } from '@/stores/graph-store';

const EXAMPLE_TOPICS = [
  'Product-Market Fit',
  'Machine Learning',
  'Agile Methodology',
  'Digital Transformation',
  'User Experience Design',
  'Data Privacy',
];

export function TopicInputPanel() {
  const [topic, setTopic] = useState('');
  const setRootTopic = useGraphStore((s) => s.setRootTopic);

  const handleSubmit = () => {
    const trimmed = topic.trim();
    if (!trimmed) return;
    setRootTopic(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-50/50">
      <Card className="w-full max-w-lg mx-4 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Explore a Topic
            </h2>
            <p className="text-muted-foreground text-sm">
              Enter a concept or question to build a knowledge graph and see the
              full picture.
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Product-Market Fit"
              className="text-base"
              autoFocus
            />
            <Button onClick={handleSubmit} disabled={!topic.trim()}>
              <Search className="h-4 w-4 mr-1" />
              Explore
            </Button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TOPICS.map((example) => (
                <button
                  key={example}
                  onClick={() => setRootTopic(example)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-white hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
