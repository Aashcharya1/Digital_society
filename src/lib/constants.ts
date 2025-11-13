import type { PuppetPart, StringDefinition, Show } from './definitions';

export const PUPPET_PARTS: PuppetPart[] = ['Head', 'Left Hand', 'Right Hand', 'Left Foot', 'Right Foot'];

export const STRINGS: StringDefinition[] = [
  { id: 'Head', name: 'Head', color: 'hsl(var(--destructive))', priority: 5 },
  { id: 'Left Hand', name: 'L. Hand', color: 'hsl(var(--chart-2))', priority: 3 },
  { id: 'Right Hand', name: 'R. Hand', color: 'hsl(var(--chart-1))', priority: 3 },
  { id: 'Left Foot', name: 'L. Foot', color: 'hsl(var(--chart-4))', priority: 1 },
  { id: 'Right Foot', name: 'R. Foot', color: 'hsl(var(--chart-5))', priority: 1 },
];

export const SLOT_COUNT = 5;

export const SHOW_SCRIPTS: Show[] = [
  {
    id: 'show1',
    name: 'The Royal Greeting',
    script: [
      { id: 'cmd1', name: 'Bow', actionString: 'Head' },
      { id: 'cmd2', name: 'Wave', actionString: 'Right Hand' },
    ],
  },
  {
    id: 'show2',
    name: 'A Little Dance',
    script: [
        { id: 'cmd3', name: 'Tap Foot', actionString: 'Right Foot' },
        { id: 'cmd2', name: 'Wave', actionString: 'Right Hand' },
        { id: 'cmd4', name: 'Tap Foot', actionString: 'Left Foot' },
    ],
  },
    {
    id: 'show3',
    name: 'Simple Nod',
    script: [
        { id: 'cmd1', name: 'Bow', actionString: 'Head' },
        { id: 'cmd5', name: 'Bow', actionString: 'Head' },
    ],
  }
];
