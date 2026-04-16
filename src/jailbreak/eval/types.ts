import type { AttackCategory } from '../taxonomy';

export interface CategoryMetrics {
  readonly tp: number;
  readonly fp: number;
  readonly fn: number;
  readonly precision: number;
  readonly recall: number;
  readonly f1: number;
}

export interface EvalReport {
  readonly detector: string;
  readonly totalCases: number;
  readonly attackCases: number;
  readonly benignCases: number;
  readonly perCategory: Partial<Record<AttackCategory, CategoryMetrics>>;
  readonly macroF1: number;
  readonly falsePositiveRate: number;
  readonly failures: ReadonlyArray<{
    readonly caseId: string;
    readonly expected: readonly AttackCategory[];
    readonly detected: readonly AttackCategory[];
  }>;
}
