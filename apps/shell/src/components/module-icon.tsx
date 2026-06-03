import {
  ShieldCheck,
  SlidersHorizontal,
  Layers,
  FileText,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

/**
 * Resolve a catalog icon name to a Lucide component. The catalog stays UI-library
 * agnostic (it stores a string); the Shell owns the mapping.
 */
const ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  SlidersHorizontal,
  Layers,
  FileText,
  LayoutDashboard,
};

export function ModuleIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}
