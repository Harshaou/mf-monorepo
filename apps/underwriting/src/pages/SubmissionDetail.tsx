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
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  formatCurrency,
  formatDate,
} from '@ginja/design-system';
import { ArrowLeft, Check, Download, FileText, X } from 'lucide-react';
import { getSubmission } from '../data/submissions';
import { RiskBadge, StatusBadge } from '../components/status-badge';
import { NotFound } from './NotFound';

export function SubmissionDetail() {
  const { id } = useParams();
  const submission = id ? getSubmission(id) : undefined;
  const [decision, setDecision] = useState<'pending' | 'approved' | 'declined'>('pending');
  const [note, setNote] = useState('');

  if (!submission) return <NotFound />;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="..">
          <ArrowLeft className="size-4" /> Back to queue , super
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{submission.applicant}</h1>
            <StatusBadge status={submission.status} />
          </div>
          <p className="text-muted-foreground mt-1">
            {submission.id} · {submission.productLine} · {submission.broker}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={decision === 'declined' ? 'destructive' : 'outline'}
            onClick={() => setDecision('declined')}
          >
            <X className="size-4" /> Decline
          </Button>
          <Button
            variant={decision === 'approved' ? 'default' : 'outline'}
            onClick={() => setDecision('approved')}
          >
            <Check className="size-4" /> Approve to quote
          </Button>
        </div>
      </div>

      {decision !== 'pending' && (
        <div
          className={
            decision === 'approved'
              ? 'bg-success/10 text-success rounded-md px-4 py-2 text-sm'
              : 'bg-destructive/10 text-destructive rounded-md px-4 py-2 text-sm'
          }
        >
          Decision recorded (demo): {decision === 'approved' ? 'Approved to quote' : 'Declined'}.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Sum insured" value={formatCurrency(submission.sumInsured)} />
        <Stat
          label="Indicative premium"
          value={submission.premium ? formatCurrency(submission.premium) : '—'}
        />
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-muted-foreground text-sm">Risk score</div>
              <div className="text-2xl font-semibold">{submission.riskScore}/100</div>
            </div>
            <RiskBadge score={submission.riskScore} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents ({submission.documents.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({submission.notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Risk summary</CardTitle>
              <CardDescription>Key facts captured from the submission.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <Field label="Territory" value={submission.territory} />
              <Field label="Product line" value={submission.productLine} />
              <Field label="Broker" value={submission.broker} />
              <Field label="Received" value={formatDate(submission.receivedAt)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="divide-y">
              {submission.documents.map((doc) => (
                <div key={doc.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <FileText className="text-muted-foreground size-5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{doc.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {doc.type} · {doc.sizeKb} KB
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="size-4" /> Download
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="space-y-4">
              {submission.notes.length === 0 && (
                <p className="text-muted-foreground text-sm">No notes yet.</p>
              )}
              {submission.notes.map((n, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{n.author}</span>
                    <Badge variant="outline">{formatDate(n.at)}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{n.text}</p>
                  {i < submission.notes.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
              <Separator />
              <div className="space-y-2">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add an underwriting note…"
                />
                <Button size="sm" disabled={!note.trim()} onClick={() => setNote('')}>
                  Add note
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <div className="text-muted-foreground text-sm">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
