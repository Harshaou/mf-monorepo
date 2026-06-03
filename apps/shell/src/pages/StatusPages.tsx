import { Link } from 'react-router-dom';
import { Button } from '@ginja/design-system';
import { Construction, Lock, MapPinOff } from 'lucide-react';

function CenteredMessage({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1 max-w-md">{body}</p>
      </div>
      <Button asChild variant="outline">
        <Link to="/">Back to Overview</Link>
      </Button>
    </div>
  );
}

/** The tenant is not entitled to this module. */
export function NotEntitled({ moduleLabel }: { moduleLabel?: string }) {
  return (
    <CenteredMessage
      icon={<Lock className="size-6" />}
      title="Not entitled"
      body={`Your tenant isn't entitled to ${moduleLabel ?? 'this module'}. Enabling it is an entitlements change — no deploy required.`}
    />
  );
}

/** Known module, not yet built. */
export function ComingSoon({ moduleLabel }: { moduleLabel?: string }) {
  return (
    <CenteredMessage
      icon={<Construction className="size-6" />}
      title="Coming soon"
      body={`${moduleLabel ?? 'This module'} is in the catalog but its remote hasn't shipped yet. Once a team publishes it, it appears here with no Shell rebuild.`}
    />
  );
}

export function NotFound() {
  return (
    <CenteredMessage
      icon={<MapPinOff className="size-6" />}
      title="Page not found"
      body="That route doesn't exist in this workspace."
    />
  );
}
