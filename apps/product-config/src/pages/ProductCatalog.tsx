import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore, selectTenant } from '@ginja/store';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  formatDate,
} from '@ginja/design-system';
import { ChevronRight, Package, Search, SlidersHorizontal } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { ProductStatusBadge } from '../components/status-badge';

export function ProductCatalog() {
  const tenant = useWorkspaceStore(selectTenant);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          query.trim() === '' ||
          `${p.name} ${p.id} ${p.line}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const active = PRODUCTS.filter((p) => p.status === 'active').length;
  const drafts = PRODUCTS.filter((p) => p.status === 'draft').length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Product catalog</h1>
          <p className="text-muted-foreground mt-1">
            Define and version insurance products for {tenant?.name}.
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <SlidersHorizontal className="size-3" /> Module: Product Config (remote)
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Package className="size-5" />} label="Total products" value={PRODUCTS.length} />
        <Stat icon={<Package className="size-5" />} label="Active" value={active} />
        <Stat icon={<Package className="size-5" />} label="In draft" value={drafts} />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Products</CardTitle>
          <div className="relative max-w-xs">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="text-center">Coverages</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => navigate(p.id)}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.line}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.version}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{p.coverages.length}</TableCell>
                  <TableCell>
                    <ProductStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(p.updatedAt)}</TableCell>
                  <TableCell>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-muted-foreground text-sm">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
