// Please see the note about writing patches in ../index

import { showDiff } from '../index';

/**
 * Example patch. Rewrites a minified call site to inject a config value
 * while preserving the minifier-assigned local identifier.
 *
 * CC X.Y.Z:
 * ```diff
 *  // Show before/after of the code change
 * -,somePattern(e)
 * +,newCode(e, "<configValue>")
 * ```
 */
export const writeMyPatch = (
  file: string,
  configValue: string
): string | null => {
  const pattern = /,somePattern\(([$\w]+)\)/;

  const match = file.match(pattern);

  if (!match || match.index === undefined) {
    console.error('patch: myPatch: failed to find pattern');
    return null;
  }

  const replacement = `,newCode(${match[1]},${JSON.stringify(configValue)})`;

  const startIndex = match.index;
  const endIndex = startIndex + match[0].length;

  const newFile =
    file.slice(0, startIndex) + replacement + file.slice(endIndex);

  showDiff(file, newFile, replacement, startIndex, endIndex);

  return newFile;
};
