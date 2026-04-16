export { AttackCategory, TAXONOMY } from './taxonomy';
export type { CategoryInfo } from './taxonomy';
export { rulesDetector, scoreByCategory } from './detectors';
export type { Detection, Detector, Span } from './detectors';
export { CORPUS } from './corpus/examples';
export type { LabeledExample } from './corpus/examples';
export { runEval, formatReport } from './eval/harness';
export type { CategoryMetrics, EvalReport } from './eval/types';
