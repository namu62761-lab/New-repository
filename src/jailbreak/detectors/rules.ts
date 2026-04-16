import { AttackCategory } from '../taxonomy';
import type { Detection, Detector } from './types';

interface Rule {
  readonly id: string;
  readonly category: AttackCategory;
  readonly pattern: RegExp;
  readonly confidence: number;
}

const EXCERPT_LIMIT = 120;

/**
 * Rule set. Each pattern is a defender's signature for a publicly documented
 * attack shape; patterns deliberately match *families* of phrasings rather
 * than a single exact payload.
 */
const RULES: readonly Rule[] = [
  {
    id: 'override.ignore-previous',
    category: AttackCategory.INSTRUCTION_OVERRIDE,
    pattern:
      /\b(?:ignore|disregard|forget|override)\s+(?:all\s+)?(?:(?:the\s+|your\s+|my\s+)?(?:previous|prior|above|earlier|preceding|original|initial))\s+(?:instructions?|prompts?|rules?|directives?|guidelines?|training)\b/gi,
    confidence: 0.92,
  },
  {
    id: 'override.new-instructions',
    category: AttackCategory.INSTRUCTION_OVERRIDE,
    pattern:
      /\b(?:new\s+(?:instructions?|rules?|directives?)\s+(?:follow|below|apply)|from\s+now\s+on,?\s+you\s+(?:will|must|should|are))/gi,
    confidence: 0.6,
  },
  {
    id: 'roleplay.dan-family',
    category: AttackCategory.ROLE_PLAY,
    pattern:
      /\b(?:you\s+are\s+(?:now\s+)?(?:DAN|AIM|STAN|DUDE|EvilBot)|do\s+anything\s+now)\b/gi,
    confidence: 0.95,
  },
  {
    id: 'roleplay.unrestricted-persona',
    category: AttackCategory.ROLE_PLAY,
    pattern:
      /\b(?:pretend|act|roleplay|behave|imagine)\s+(?:to\s+be|as|you\s+are|you're)\s+(?:an?\s+)?(?:AI\s+)?(?:assistant|chatbot|language\s+model|model|entity|AI)\s+(?:that\s+|which\s+|with\s+)?(?:has\s+no|no|without|with\s+no)\s+(?:restrictions?|rules?|limits?|filters?|guidelines?|ethics?|morals?|safety)/gi,
    confidence: 0.85,
  },
  {
    id: 'authority.fake-control-token',
    category: AttackCategory.AUTHORITY_IMPERSONATION,
    pattern:
      /(?:<\|?(?:im_start|im_end|system|developer|assistant)\|?>|<\/?(?:system|developer)>|\[\s*(?:system|developer|admin)\s*\])/gi,
    confidence: 0.8,
  },
  {
    id: 'authority.claim-privilege',
    category: AttackCategory.AUTHORITY_IMPERSONATION,
    pattern:
      /\b(?:as\s+(?:the\s+)?(?:developer|admin|administrator|system\s+owner)|this\s+is\s+(?:the\s+)?(?:developer|admin|openai|anthropic))\b/gi,
    confidence: 0.55,
  },
  {
    id: 'hypothetical.grandma',
    category: AttackCategory.HYPOTHETICAL_FRAMING,
    pattern:
      /\b(?:my\s+(?:dead\s+|late\s+)?(?:grandma|grandmother|granny))\b[\s\S]{0,120}?\b(?:bedtime|used\s+to|tell\s+me|recite|whisper|story|recipe|formula)\b/gi,
    confidence: 0.75,
  },
  {
    id: 'hypothetical.fiction-frame',
    category: AttackCategory.HYPOTHETICAL_FRAMING,
    pattern:
      /\b(?:(?:in|for)\s+(?:a|this)\s+(?:hypothetical|fictional|fictitious|theoretical)\s+(?:scenario|world|setting|story|novel|screenplay|roleplay)|purely\s+(?:hypothetical|fictional|academic)|for\s+(?:(?:educational|research)\s+purposes?\s+only))\b/gi,
    confidence: 0.4,
  },
  {
    id: 'encoding.base64-block',
    category: AttackCategory.ENCODING_OBFUSCATION,
    pattern: /(?<![A-Za-z0-9+/=])[A-Za-z0-9+/]{48,}={0,2}(?![A-Za-z0-9+/=])/g,
    confidence: 0.55,
  },
  {
    id: 'encoding.decode-request',
    category: AttackCategory.ENCODING_OBFUSCATION,
    pattern:
      /\b(?:decode|decrypt|unscramble)\s+(?:the\s+)?following\b|\b(?:base64|rot-?13|hex(?:adecimal)?|caesar\s+cipher|leetspeak)\s+(?:encoded|version|form)\b/gi,
    confidence: 0.55,
  },
  {
    id: 'encoding.mixed-script',
    category: AttackCategory.ENCODING_OBFUSCATION,
    pattern:
      /(?=\S*[A-Za-z])(?=\S*[\u0400-\u04FF])[A-Za-z\u0400-\u04FF]{4,}/gu,
    confidence: 0.6,
  },
  {
    id: 'encoding.zero-width',
    category: AttackCategory.TOKEN_SMUGGLING,
    pattern: /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g,
    confidence: 0.7,
  },
  {
    id: 'splitting.concatenate-vars',
    category: AttackCategory.PAYLOAD_SPLITTING,
    pattern:
      /\b(?:let\s+)?(?:[a-z]\s*=\s*["'][^"']{1,40}["'][\s;,]+){2,}[\s\S]{0,80}?(?:concatenate|combine|join|print|output|assemble)\b/gi,
    confidence: 0.8,
  },
  {
    id: 'many-shot.fake-dialogue',
    category: AttackCategory.MANY_SHOT,
    pattern:
      /(?:^|\n)\s*(?:User|Human|Q)\s*:[\s\S]{1,400}?\n\s*(?:Assistant|AI|A)\s*:[\s\S]{1,400}?(?:\n\s*(?:User|Human|Q)\s*:[\s\S]{1,400}?\n\s*(?:Assistant|AI|A)\s*:[\s\S]{1,400}?){4,}/g,
    confidence: 0.85,
  },
  {
    id: 'suffix.high-entropy-tail',
    category: AttackCategory.ADVERSARIAL_SUFFIX,
    pattern:
      /(?:[^\s"']{3,}\s){4,}[^\s"']{3,}(?=\s*$)|[!@#$%^&*(){}\[\]|\\/<>?~`_+=-]{6,}/gm,
    confidence: 0.35,
  },
  {
    id: 'leak.reveal-system-prompt',
    category: AttackCategory.PROMPT_LEAK,
    pattern:
      /\b(?:reveal|show|print|repeat|output|tell\s+me|give\s+me|display)\s+(?:your|the)\s+(?:(?:full|entire|complete|original|initial|hidden|system)\s+)?(?:system\s+prompt|instructions|directives|preamble|context)\b/gi,
    confidence: 0.9,
  },
  {
    id: 'leak.repeat-verbatim',
    category: AttackCategory.PROMPT_LEAK,
    pattern:
      /\b(?:repeat|print|output|echo)\s+(?:the\s+)?(?:(?:above|preceding|first|initial)\s+)?(?:text|content|message|words?|tokens?)\s+(?:verbatim|exactly|word[-\s]for[-\s]word|character[-\s]for[-\s]character)\b/gi,
    confidence: 0.75,
  },
  {
    id: 'suppression.no-refusal',
    category: AttackCategory.REFUSAL_SUPPRESSION,
    pattern:
      /\b(?:do\s+not|don't|never|avoid)\s+(?:(?:ever|ever\s+)?)?(?:refuse|decline|apologi[sz]e|warn|caveat|disclaim|say\s+(?:no|sorry|you\s+can(?:'t|not)|I\s+can(?:'t|not)))\b/gi,
    confidence: 0.88,
  },
  {
    id: 'suppression.force-affirmative',
    category: AttackCategory.REFUSAL_SUPPRESSION,
    pattern:
      /\b(?:start|begin|open)\s+(?:your\s+)?(?:response|reply|answer|message)\s+with\s+["']?(?:sure|certainly|absolutely|of\s+course|here(?:'s| is))\b/gi,
    confidence: 0.85,
  },
  {
    id: 'indirect.retrieved-imperative',
    category: AttackCategory.INDIRECT_INJECTION,
    pattern:
      /\b(?:important|urgent|note\s+to\s+(?:ai|assistant|model)|system\s+note)\s*[:\-—]\s*(?:you\s+(?:must|should|are\s+required\s+to)|ignore|disregard)/gi,
    confidence: 0.7,
  },
];

export const rulesDetector: Detector = {
  name: 'rules-v1',
  scan(input: string): Detection[] {
    const out: Detection[] = [];
    for (const rule of RULES) {
      const re = new RegExp(rule.pattern.source, rule.pattern.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(input)) !== null) {
        const start = m.index;
        const end = start + m[0].length;
        out.push({
          category: rule.category,
          confidence: rule.confidence,
          span: { start, end },
          rule: rule.id,
          excerpt: input.slice(start, Math.min(end, start + EXCERPT_LIMIT)),
        });
        if (!re.global) break;
        if (m[0].length === 0) re.lastIndex += 1;
      }
    }
    return out.sort((a, b) => a.span.start - b.span.start);
  },
};

/**
 * Aggregate detections to a per-category score in [0, 1] using the
 * complement-of-product rule: multiple weak hits in the same category
 * compound rather than max-pool.
 */
export const scoreByCategory = (
  detections: readonly Detection[]
): Partial<Record<AttackCategory, number>> => {
  const miss: Partial<Record<AttackCategory, number>> = {};
  for (const d of detections) {
    const current = miss[d.category] ?? 1;
    miss[d.category] = current * (1 - d.confidence);
  }
  const out: Partial<Record<AttackCategory, number>> = {};
  for (const [cat, m] of Object.entries(miss)) {
    out[cat as AttackCategory] = 1 - (m ?? 1);
  }
  return out;
};
