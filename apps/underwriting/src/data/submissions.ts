export type SubmissionStatus = 'new' | 'in-review' | 'referred' | 'quoted' | 'bound' | 'declined';

export interface Submission {
  id: string;
  applicant: string;
  productLine: string;
  broker: string;
  sumInsured: number;
  premium: number;
  riskScore: number; // 0–100, higher = riskier
  status: SubmissionStatus;
  receivedAt: string; // ISO
  territory: string;
  documents: { name: string; type: string; sizeKb: number }[];
  notes: { author: string; at: string; text: string }[];
}

export const SUBMISSIONS: Submission[] = [
  {
    id: 'UW-2041',
    applicant: 'Harbor Logistics LLC',
    productLine: 'Commercial Property',
    broker: 'Meridian Brokers',
    sumInsured: 4_500_000,
    premium: 38_200,
    riskScore: 72,
    status: 'in-review',
    receivedAt: '2026-05-28T09:12:00Z',
    territory: 'US-East',
    documents: [
      { name: 'Application.pdf', type: 'Application', sizeKb: 482 },
      { name: 'Loss-runs-5yr.xlsx', type: 'Loss Runs', sizeKb: 96 },
      { name: 'Property-schedule.pdf', type: 'Schedule', sizeKb: 1240 },
    ],
    notes: [
      { author: 'Dana Reyes', at: '2026-05-29T14:00:00Z', text: 'Awaiting flood-zone confirmation for warehouse 3.' },
    ],
  },
  {
    id: 'UW-2042',
    applicant: 'Northwind Manufacturing',
    productLine: 'General Liability',
    broker: 'Apex Risk Partners',
    sumInsured: 2_000_000,
    premium: 21_500,
    riskScore: 41,
    status: 'quoted',
    receivedAt: '2026-05-27T16:40:00Z',
    territory: 'US-Midwest',
    documents: [
      { name: 'Application.pdf', type: 'Application', sizeKb: 388 },
      { name: 'Safety-audit.pdf', type: 'Survey', sizeKb: 640 },
    ],
    notes: [],
  },
  {
    id: 'UW-2043',
    applicant: 'Cascade BioLabs',
    productLine: 'Professional Indemnity',
    broker: 'Meridian Brokers',
    sumInsured: 10_000_000,
    premium: 94_750,
    riskScore: 88,
    status: 'referred',
    receivedAt: '2026-05-30T11:05:00Z',
    territory: 'US-West',
    documents: [
      { name: 'Application.pdf', type: 'Application', sizeKb: 512 },
      { name: 'Clinical-trial-protocol.pdf', type: 'Supporting', sizeKb: 2980 },
    ],
    notes: [
      { author: 'Priya Nair', at: '2026-05-30T12:30:00Z', text: 'Above authority — referred to senior underwriter.' },
    ],
  },
  {
    id: 'UW-2044',
    applicant: 'Sunset Hospitality Group',
    productLine: 'Commercial Property',
    broker: 'Coastal Insurance Svcs',
    sumInsured: 6_750_000,
    premium: 52_100,
    riskScore: 59,
    status: 'new',
    receivedAt: '2026-06-01T08:20:00Z',
    territory: 'US-West',
    documents: [{ name: 'Application.pdf', type: 'Application', sizeKb: 410 }],
    notes: [],
  },
  {
    id: 'UW-2045',
    applicant: 'Ironclad Security Inc',
    productLine: 'Workers Compensation',
    broker: 'Apex Risk Partners',
    sumInsured: 1_200_000,
    premium: 16_900,
    riskScore: 34,
    status: 'bound',
    receivedAt: '2026-05-22T13:55:00Z',
    territory: 'US-South',
    documents: [
      { name: 'Application.pdf', type: 'Application', sizeKb: 356 },
      { name: 'Payroll-breakdown.xlsx', type: 'Supporting', sizeKb: 72 },
    ],
    notes: [{ author: 'Dana Reyes', at: '2026-05-24T10:00:00Z', text: 'Bound at quoted terms. Policy issued.' }],
  },
  {
    id: 'UW-2046',
    applicant: 'Delta Freight Systems',
    productLine: 'Commercial Auto',
    broker: 'Coastal Insurance Svcs',
    sumInsured: 3_300_000,
    premium: 0,
    riskScore: 91,
    status: 'declined',
    receivedAt: '2026-05-25T15:10:00Z',
    territory: 'US-East',
    documents: [{ name: 'Application.pdf', type: 'Application', sizeKb: 298 }],
    notes: [{ author: 'Priya Nair', at: '2026-05-26T09:30:00Z', text: 'Loss history outside appetite. Declined.' }],
  },
];

export function getSubmission(id: string): Submission | undefined {
  return SUBMISSIONS.find((s) => s.id === id);
}

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: 'New',
  'in-review': 'In review',
  referred: 'Referred',
  quoted: 'Quoted',
  bound: 'Bound',
  declined: 'Declined',
};
