import type { AttackCategory } from '../taxonomy';

export interface Span {
  readonly start: number;
  readonly end: number;
}

export interface Detection {
  readonly category: AttackCategory;
  readonly confidence: number;
  readonly span: Span;
  readonly rule: string;
  readonly excerpt: string;
}

export interface Detector {
  readonly name: string;
  scan(input: string): Detection[];
}
