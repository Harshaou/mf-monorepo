import { type ClassValue } from 'clsx';
/** Merge conditional class names and dedupe conflicting Tailwind utilities. */
export declare function cn(...inputs: ClassValue[]): string;
/** Format a number as USD currency for the insurance UIs. */
export declare function formatCurrency(value: number, currency?: string): string;
/** Format an ISO date string as a short, locale date. */
export declare function formatDate(iso: string): string;
