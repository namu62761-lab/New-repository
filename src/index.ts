/**
 * Patch runtime for minified Claude Code bundles.
 *
 * =============================================================================
 * NOTE ON WRITING PATCHES
 * =============================================================================
 *
 * Each patch is a pure function: `(file: string, ...args) => string | null`.
 * It locates a fragment of minified JS via a regex, rewrites it, and returns
 * the new source. Returning `null` signals the anchor was not found and the
 * caller must decide how to proceed (skip, warn, abort).
 *
 * RULES
 * -----
 * 1. Identifiers: match with `[$\w]+`, never `\w+`. `$` is a valid JS
 *    identifier character and minifiers use it heavily.
 *
 * 2. Anchors: start every pattern with a boundary character — one of
 *    `, ; { } ( )` — or a keyword. A leading literal cuts regex backtracking
 *    dramatically on multi-megabyte bundles (observed: 1.5s -> 30ms).
 *
 * 3. Be specific: prefer a pattern that matches exactly once. If the anchor
 *    is ambiguous, extend it with surrounding tokens rather than adding
 *    lookarounds.
 *
 * 4. Preserve captures: when the minifier assigns a short local name
 *    (e.g. `e`, `t`, `r`), capture it with `([$\w]+)` and reuse it in the
 *    replacement so the patch survives rename churn between releases.
 *
 * 5. Version the patch: put a `CC X.Y.Z` line and a unified diff in the
 *    doc comment so future readers can confirm the target release.
 *
 * 6. One patch, one concern. Chain patches at the call site; do not stuff
 *    multiple rewrites into one function.
 *
 * 7. Always call `showDiff` before returning so changes are auditable.
 *
 * TEMPLATE
 * --------
 *   export const writeMyPatch = (file: string, arg: string): string | null => {
 *     const pattern = /,someAnchor([$\w]+)/;
 *     const match = file.match(pattern);
 *     if (!match || match.index === undefined) {
 *       console.error('patch: myPatch: failed to find pattern');
 *       return null;
 *     }
 *     const replacement = `,newCode${match[1]}`;
 *     const start = match.index;
 *     const end = start + match[0].length;
 *     const out = file.slice(0, start) + replacement + file.slice(end);
 *     showDiff(file, out, replacement, start, end);
 *     return out;
 *   };
 * =============================================================================
 */

const CONTEXT_CHARS = 40;

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';

const useColor = (): boolean =>
  typeof process !== 'undefined' &&
  process.stdout?.isTTY === true &&
  process.env['NO_COLOR'] === undefined;

const paint = (s: string, color: string): string =>
  useColor() ? `${color}${s}${RESET}` : s;

const escape = (s: string): string =>
  s.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');

/**
 * Print a unified-style diff of a single in-place edit.
 *
 * @param original     The file before the patch.
 * @param patched      The file after the patch.
 * @param replacement  The exact text that was inserted.
 * @param startIndex   Offset in `original` where the replaced span begins.
 * @param endIndex     Offset in `original` where the replaced span ends.
 */
export const showDiff = (
  original: string,
  patched: string,
  replacement: string,
  startIndex: number,
  endIndex: number
): void => {
  const removed = original.slice(startIndex, endIndex);
  const before = original.slice(
    Math.max(0, startIndex - CONTEXT_CHARS),
    startIndex
  );
  const after = original.slice(
    endIndex,
    Math.min(original.length, endIndex + CONTEXT_CHARS)
  );

  const ctxBefore = paint(escape(before), DIM);
  const ctxAfter = paint(escape(after), DIM);

  console.log(paint(`@@ ${startIndex},${endIndex - startIndex} @@`, DIM));
  console.log(`${paint('-', RED)} ${ctxBefore}${paint(escape(removed), RED)}${ctxAfter}`);
  console.log(`${paint('+', GREEN)} ${ctxBefore}${paint(escape(replacement), GREEN)}${ctxAfter}`);
  void patched;
};

/**
 * Apply a chain of patches to a source file. If any patch returns `null`,
 * the chain short-circuits and the whole call returns `null` so the caller
 * can abort a broken release rather than ship a half-patched bundle.
 */
export const applyPatches = (
  file: string,
  patches: ReadonlyArray<(f: string) => string | null>
): string | null => {
  let current = file;
  for (const patch of patches) {
    const next = patch(current);
    if (next === null) return null;
    current = next;
  }
  return current;
};
