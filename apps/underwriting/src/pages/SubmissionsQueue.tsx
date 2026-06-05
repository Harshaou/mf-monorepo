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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  formatCurrency,
  formatDate,
} from '@ginja/design-system';
import { ChevronRight, FileStack, Inbox, Search, ShieldAlert, ThumbsUp } from 'lucide-react';
import { SUBMISSIONS, STATUS_LABELS, type SubmissionStatus } from '../data/submissions';
import { RiskBadge, StatusBadge } from '../components/status-badge';

export function SubmissionsQueue() {
  const tenant = useWorkspaceStore(selectTenant);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<SubmissionStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return SUBMISSIONS.filter((s) => {
      const matchesQuery =
        query.trim() === '' ||
        `${s.applicant} ${s.id} ${s.broker} ${s.productLine}`
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesStatus = status === 'all' || s.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const kpis = useMemo(() => {
    const open = SUBMISSIONS.filter((s) => ['new', 'in-review'].includes(s.status)).length;
    const referred = SUBMISSIONS.filter((s) => s.status === 'referred').length;
    const bound = SUBMISSIONS.filter((s) => s.status === 'bound').length;
    const premium = SUBMISSIONS.filter((s) => s.status === 'bound').reduce(
      (a, s) => a + s.premium,
      0
    );
    return { open, referred, bound, premium };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Underwriting queue</h1>
          <p className="text-muted-foreground mt-1">
            Submissions awaiting triage and decision for {tenant?.name}.
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <ShieldAlert className="size-3" /> Module: Underwriting (remote)
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Inbox className="size-5" />} label="Open submissions" value={kpis.open} />
        <KpiCard icon={<FileStack className="size-5" />} label="Referred" value={kpis.referred} />
        <KpiCard icon={<ThumbsUp className="size-5" />} label="Bound (MTD)" value={kpis.bound} />
        <KpiCard
          icon={<ShieldAlert className="size-5" />}
          label="Bound premium"
          value={formatCurrency(kpis.premium)}
        />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Submissions</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative max-w-xs flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search applicant, broker, ID…"
                className="pl-8"
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as SubmissionStatus | 'all')}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Product line</TableHead>
                <TableHead className="text-right">Sum insured</TableHead>
                <TableHead className="text-right">Premium</TableHead>
                <TableHead className="text-center">Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`submissions/${s.id}`)}
                >
                  <TableCell className="font-medium">{s.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{s.applicant}</div>
                    <div className="text-muted-foreground text-xs">{s.broker}</div>
                  </TableCell>
                  <TableCell>{s.productLine}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.sumInsured)}</TableCell>
                  <TableCell className="text-right">
                    {s.premium ? formatCurrency(s.premium) : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    <RiskBadge score={s.riskScore} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(s.receivedAt)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground py-10 text-center">
                    No submissions match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
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
