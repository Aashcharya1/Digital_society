export type PuppetPart = 'Head' | 'Left Hand' | 'Right Hand' | 'Left Foot' | 'Right Foot';

export type StringDefinition = {
  id: PuppetPart;
  name: string;
  color: string;
};

export type StringState = StringDefinition & {
  slotIndex: number;
};

export type GameStatus = 'playing' | 'won' | 'lost-tangled' | 'lost-wrong';

export type Coordinates = {
  x: number;
  y: number;
};

export type LineCoordinate = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  isBlocking: boolean;
  isAction: boolean;
};
