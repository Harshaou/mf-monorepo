import { Link } from 'react-router-dom';
import { Button } from '@ginja/design-system';
import { SearchX } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <SearchX className="text-muted-foreground size-10" />
      <div>
        <h2 className="text-lg font-semibold">Product not found</h2>
        <p className="text-muted-foreground text-sm">That product doesn't exist in the catalog.</p>
      </div>
      <Button asChild variant="outline">
        <Link to="..">Back to catalog</Link>
      </Button>
    </div>
  );
}
