import type { PuppetPart, StringDefinition } from './definitions';

export const PUPPET_PARTS: PuppetPart[] = ['Head', 'Left Hand', 'Right Hand', 'Left Foot', 'Right Foot'];

export const STRINGS: StringDefinition[] = [
  { id: 'Head', name: 'Head', color: 'hsl(var(--destructive))' },
  { id: 'Left Hand', name: 'L. Hand', color: 'hsl(var(--chart-2))' },
  { id: 'Right Hand', name: 'R. Hand', color: 'hsl(var(--chart-1))' },
  { id: 'Left Foot', name: 'L. Foot', color: 'hsl(var(--chart-4))' },
  { id: 'Right Foot', name: 'R. Foot', color: 'hsl(var(--chart-5))' },
];

export const ACTION_STRING_ID: PuppetPart = 'Head';
export const BLOCKING_STRING_ID: PuppetPart = 'Left Hand';

export const SLOT_COUNT = 5;
