import { Badge } from '@ginja/design-system';
import { STATUS_LABELS, type ProductStatus } from '../data/products';

const VARIANT: Record<ProductStatus, React.ComponentProps<typeof Badge>['variant']> = {
  draft: 'warning',
  active: 'success',
  retired: 'secondary',
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <Badge variant={VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}
