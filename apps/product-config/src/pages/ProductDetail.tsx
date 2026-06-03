import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  formatCurrency,
  formatDate,
} from '@ginja/design-system';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { getProduct, STATUS_LABELS, type Coverage, type PricingFactor, type ProductStatus } from '../data/products';
import { ProductStatusBadge } from '../components/status-badge';
import { NotFound } from './NotFound';

export function ProductDetail() {
  const { id } = useParams();
  const product = id ? getProduct(id) : undefined;

  // Local working copy — edits stay client-side (demo; no backend wired).
  const [name, setName] = useState(product?.name ?? '');
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'draft');
  const [baseRate, setBaseRate] = useState(product?.baseRate ?? 0);
  const [coverages, setCoverages] = useState<Coverage[]>(product?.coverages ?? []);
  const [factors, setFactors] = useState<PricingFactor[]>(product?.pricingFactors ?? []);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!product) return <NotFound />;

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  function updateCoverage(cid: string, patch: Partial<Coverage>) {
    setCoverages((prev) => prev.map((c) => (c.id === cid ? { ...c, ...patch } : c)));
    markDirty();
  }
  function updateFactor(fid: string, multiplier: number) {
    setFactors((prev) => prev.map((f) => (f.id === fid ? { ...f, multiplier } : f)));
    markDirty();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="..">
          <ArrowLeft className="size-4" /> Back to catalog
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
            <ProductStatusBadge status={status} />
            <Badge variant="outline">{product.version}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {product.id} · {product.line} · updated {formatDate(product.updatedAt)}
          </p>
        </div>
        <Button
          disabled={!dirty}
          onClick={() => {
            setDirty(false);
            setSaved(true);
          }}
        >
          <Save className="size-4" /> Save changes
        </Button>
      </div>

      {saved && (
        <div className="bg-success/10 text-success rounded-md px-4 py-2 text-sm">
          Changes saved (demo). In production this would create a new product version.
        </div>
      )}

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="coverages">Coverages ({coverages.length})</TabsTrigger>
          <TabsTrigger value="pricing">Pricing factors ({factors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General settings</CardTitle>
              <CardDescription>Identity, status, and base rating.</CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-xl gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v as ProductStatus);
                    markDirty();
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rate">Base rate (per unit sum insured)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.0001"
                  value={baseRate}
                  onChange={(e) => {
                    setBaseRate(Number(e.target.value));
                    markDirty();
                  }}
                  className="w-48"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverages">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Coverages</CardTitle>
                <CardDescription>Limits, deductibles, and what's included.</CardDescription>
              </div>
              <Button variant="outline" size="sm" disabled>
                <Plus className="size-4" /> Add coverage
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coverage</TableHead>
                    <TableHead className="text-right">Limit</TableHead>
                    <TableHead className="text-right">Deductible</TableHead>
                    <TableHead className="text-center">Included</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coverages.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.limit)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.deductible)}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={c.included}
                          onCheckedChange={(v) => updateCoverage(c.id, { included: v })}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing factors</CardTitle>
              <CardDescription>
                Multipliers applied to the base rate. 1.00 is neutral.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {factors.map((f) => (
                <div key={f.id} className="flex items-center gap-4">
                  <Label className="flex-1">{f.name}</Label>
                  <Input
                    type="number"
                    step="0.05"
                    value={f.multiplier}
                    onChange={(e) => updateFactor(f.id, Number(e.target.value))}
                    className="w-28"
                  />
                  <Badge variant={f.multiplier > 1 ? 'warning' : f.multiplier < 1 ? 'success' : 'secondary'}>
                    {f.multiplier > 1 ? '+' : ''}
                    {Math.round((f.multiplier - 1) * 100)}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
