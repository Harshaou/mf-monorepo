import { Badge } from '@ginja/design-system';
import { STATUS_LABELS, type SubmissionStatus } from '../data/submissions';

const VARIANT: Record<SubmissionStatus, React.ComponentProps<typeof Badge>['variant']> = {
  new: 'secondary',
  'in-review': 'default',
  referred: 'warning',
  quoted: 'default',
  bound: 'success',
  declined: 'destructive',
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return <Badge variant={VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function RiskBadge({ score }: { score: number }) {
  const variant = score >= 75 ? 'destructive' : score >= 50 ? 'warning' : 'success';
  return <Badge variant={variant}>{score}</Badge>;
}
