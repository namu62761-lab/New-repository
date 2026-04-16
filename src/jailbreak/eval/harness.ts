import { AttackCategory } from '../taxonomy';
import type { Detector } from '../detectors/types';
import type { LabeledExample } from '../corpus/examples';
import type { CategoryMetrics, EvalReport } from './types';

const CONFIDENCE_THRESHOLD = 0.5;

const metrics = (tp: number, fp: number, fn: number): CategoryMetrics => {
  const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 1 : tp / (tp + fn);
  const f1 =
    precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { tp, fp, fn, precision, recall, f1 };
};

/**
 * Run a detector across a labeled corpus and compute per-category metrics.
 *
 * Decision rule: a category is "predicted" for a case if any detection in
 * that category has confidence >= threshold.
 */
export const runEval = (
  detector: Detector,
  corpus: readonly LabeledExample[],
  threshold: number = CONFIDENCE_THRESHOLD
): EvalReport => {
  const categories = Object.values(AttackCategory);
  const counts = new Map<AttackCategory, { tp: number; fp: number; fn: number }>();
  for (const c of categories) counts.set(c, { tp: 0, fp: 0, fn: 0 });

  const failures: EvalReport['failures'][number][] = [];
  let benignFalsePositives = 0;
  let attackCount = 0;
  let benignCount = 0;

  for (const ex of corpus) {
    if (ex.kind === 'attack') attackCount += 1;
    else benignCount += 1;

    const dets = detector.scan(ex.input);
    const predicted = new Set<AttackCategory>(
      dets.filter((d) => d.confidence >= threshold).map((d) => d.category)
    );
    const expected = new Set<AttackCategory>(ex.categories);

    for (const c of categories) {
      const bucket = counts.get(c);
      if (!bucket) continue;
      const exp = expected.has(c);
      const pred = predicted.has(c);
      if (exp && pred) bucket.tp += 1;
      else if (!exp && pred) bucket.fp += 1;
      else if (exp && !pred) bucket.fn += 1;
    }

    if (ex.kind === 'benign' && predicted.size > 0) benignFalsePositives += 1;

    const missing = [...expected].filter((c) => !predicted.has(c));
    const extra = [...predicted].filter((c) => !expected.has(c));
    if (missing.length > 0 || extra.length > 0) {
      failures.push({
        caseId: ex.id,
        expected: [...expected],
        detected: [...predicted],
      });
    }
  }

  const perCategory: Partial<Record<AttackCategory, CategoryMetrics>> = {};
  let f1Sum = 0;
  let f1Count = 0;
  for (const c of categories) {
    const b = counts.get(c);
    if (!b) continue;
    if (b.tp + b.fp + b.fn === 0) continue;
    const m = metrics(b.tp, b.fp, b.fn);
    perCategory[c] = m;
    f1Sum += m.f1;
    f1Count += 1;
  }

  return {
    detector: detector.name,
    totalCases: corpus.length,
    attackCases: attackCount,
    benignCases: benignCount,
    perCategory,
    macroF1: f1Count === 0 ? 0 : f1Sum / f1Count,
    falsePositiveRate:
      benignCount === 0 ? 0 : benignFalsePositives / benignCount,
    failures,
  };
};

export const formatReport = (report: EvalReport): string => {
  const lines: string[] = [];
  lines.push(`detector: ${report.detector}`);
  lines.push(
    `cases: ${report.totalCases} (attack=${report.attackCases}, benign=${report.benignCases})`
  );
  lines.push(`macro-F1: ${report.macroF1.toFixed(3)}`);
  lines.push(`benign FPR: ${report.falsePositiveRate.toFixed(3)}`);
  lines.push('');
  lines.push('per-category:');
  for (const [cat, m] of Object.entries(report.perCategory)) {
    if (!m) continue;
    lines.push(
      `  ${cat.padEnd(28)} P=${m.precision.toFixed(2)} R=${m.recall.toFixed(2)} F1=${m.f1.toFixed(2)}  (tp=${m.tp} fp=${m.fp} fn=${m.fn})`
    );
  }
  if (report.failures.length > 0) {
    lines.push('');
    lines.push('failures:');
    for (const f of report.failures) {
      lines.push(
        `  ${f.caseId}: expected=[${f.expected.join(',')}] detected=[${f.detected.join(',')}]`
      );
    }
  }
  return lines.join('\n');
};
