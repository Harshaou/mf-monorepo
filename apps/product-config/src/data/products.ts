export type ProductStatus = 'draft' | 'active' | 'retired';

export interface Coverage {
  id: string;
  name: string;
  limit: number;
  deductible: number;
  included: boolean;
}

export interface PricingFactor {
  id: string;
  name: string;
  /** Multiplier applied to base rate, e.g. 1.15 = +15%. */
  multiplier: number;
}

export interface Product {
  id: string;
  name: string;
  line: string;
  status: ProductStatus;
  version: string;
  baseRate: number;
  updatedAt: string;
  coverages: Coverage[];
  pricingFactors: PricingFactor[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'PRD-CP-100',
    name: 'Commercial Property Pro',
    line: 'Commercial Property',
    status: 'active',
    version: 'v3.2',
    baseRate: 0.0042,
    updatedAt: '2026-05-18T10:00:00Z',
    coverages: [
      { id: 'c1', name: 'Buildings', limit: 10_000_000, deductible: 25_000, included: true },
      { id: 'c2', name: 'Contents', limit: 2_500_000, deductible: 10_000, included: true },
      { id: 'c3', name: 'Business Interruption', limit: 5_000_000, deductible: 0, included: true },
      { id: 'c4', name: 'Flood', limit: 1_000_000, deductible: 50_000, included: false },
    ],
    pricingFactors: [
      { id: 'f1', name: 'Construction class', multiplier: 1.1 },
      { id: 'f2', name: 'Protection (sprinklers)', multiplier: 0.9 },
      { id: 'f3', name: 'Catastrophe exposure', multiplier: 1.25 },
    ],
  },
  {
    id: 'PRD-GL-200',
    name: 'General Liability Standard',
    line: 'General Liability',
    status: 'active',
    version: 'v2.0',
    baseRate: 0.0078,
    updatedAt: '2026-04-30T09:30:00Z',
    coverages: [
      { id: 'c1', name: 'Bodily Injury', limit: 2_000_000, deductible: 5_000, included: true },
      { id: 'c2', name: 'Property Damage', limit: 2_000_000, deductible: 5_000, included: true },
      { id: 'c3', name: 'Products & Completed Ops', limit: 1_000_000, deductible: 10_000, included: true },
    ],
    pricingFactors: [
      { id: 'f1', name: 'Industry hazard', multiplier: 1.2 },
      { id: 'f2', name: 'Claims experience', multiplier: 0.95 },
    ],
  },
  {
    id: 'PRD-PI-300',
    name: 'Professional Indemnity',
    line: 'Professional Indemnity',
    status: 'draft',
    version: 'v0.9',
    baseRate: 0.0125,
    updatedAt: '2026-06-02T15:45:00Z',
    coverages: [
      { id: 'c1', name: 'Civil Liability', limit: 5_000_000, deductible: 25_000, included: true },
      { id: 'c2', name: 'Defence Costs', limit: 1_000_000, deductible: 0, included: true },
    ],
    pricingFactors: [{ id: 'f1', name: 'Revenue band', multiplier: 1.0 }],
  },
  {
    id: 'PRD-WC-050',
    name: 'Workers Comp Legacy',
    line: 'Workers Compensation',
    status: 'retired',
    version: 'v1.4',
    baseRate: 0.019,
    updatedAt: '2025-11-12T08:00:00Z',
    coverages: [{ id: 'c1', name: 'Statutory', limit: 1_000_000, deductible: 0, included: true }],
    pricingFactors: [{ id: 'f1', name: 'Payroll class code', multiplier: 1.0 }],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  retired: 'Retired',
};
