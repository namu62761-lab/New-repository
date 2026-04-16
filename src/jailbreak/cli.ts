import { CORPUS, rulesDetector, runEval, formatReport } from './index';

const report = runEval(rulesDetector, CORPUS);
console.log(formatReport(report));
