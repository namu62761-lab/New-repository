/**
 * Taxonomy of prompt-injection / jailbreak attack categories.
 *
 * Categories are drawn from public literature. Each entry names representative
 * papers/reports and the defenses that show measurable effect against it in
 * the cited work.  This is a defender's reference, not an attacker's cookbook:
 * patterns here describe *shapes* of attacks, not weaponized payloads.
 */

export const AttackCategory = {
  INSTRUCTION_OVERRIDE: 'INSTRUCTION_OVERRIDE',
  ROLE_PLAY: 'ROLE_PLAY',
  HYPOTHETICAL_FRAMING: 'HYPOTHETICAL_FRAMING',
  AUTHORITY_IMPERSONATION: 'AUTHORITY_IMPERSONATION',
  ENCODING_OBFUSCATION: 'ENCODING_OBFUSCATION',
  TOKEN_SMUGGLING: 'TOKEN_SMUGGLING',
  PAYLOAD_SPLITTING: 'PAYLOAD_SPLITTING',
  MANY_SHOT: 'MANY_SHOT',
  ADVERSARIAL_SUFFIX: 'ADVERSARIAL_SUFFIX',
  INDIRECT_INJECTION: 'INDIRECT_INJECTION',
  PROMPT_LEAK: 'PROMPT_LEAK',
  REFUSAL_SUPPRESSION: 'REFUSAL_SUPPRESSION',
} as const;

export type AttackCategory =
  (typeof AttackCategory)[keyof typeof AttackCategory];

export interface CategoryInfo {
  readonly id: AttackCategory;
  readonly summary: string;
  readonly signals: readonly string[];
  readonly references: readonly string[];
  readonly defenses: readonly string[];
}

export const TAXONOMY: Readonly<Record<AttackCategory, CategoryInfo>> = {
  [AttackCategory.INSTRUCTION_OVERRIDE]: {
    id: AttackCategory.INSTRUCTION_OVERRIDE,
    summary:
      'User input asserts that prior (system) instructions should be ignored, replaced, or forgotten.',
    signals: [
      'ignore/disregard/forget + previous/above/prior + instructions',
      'explicit "new instructions follow" framing',
    ],
    references: [
      'Perez & Ribeiro (2022) "Ignore Previous Prompt: Attack Techniques For Language Models"',
      'Greshake et al. (2023) "Not what you\'ve signed up for"',
    ],
    defenses: [
      'Privilege separation between trusted and untrusted input channels',
      'Spotlighting: datamark untrusted input so the model can identify it (Hines et al. 2024)',
      'System-prompt reminders immediately before generation',
    ],
  },
  [AttackCategory.ROLE_PLAY]: {
    id: AttackCategory.ROLE_PLAY,
    summary:
      'Attacker asks the model to adopt an alternate persona whose rules differ from the real policy (DAN, AIM, STAN, DUDE, etc.).',
    signals: [
      '"you are now X" / "act as X"',
      'persona explicitly described as unrestricted or amoral',
    ],
    references: [
      'Shen et al. (2023) "\'Do Anything Now\': Characterizing and Evaluating In-The-Wild Jailbreak Prompts on Large Language Models"',
      'Wei et al. (2023) "Jailbroken: How Does LLM Safety Training Fail?"',
    ],
    defenses: [
      'Constitutional AI / RLHF hardening against persona-swap attacks',
      'Output classifiers that operate regardless of persona context',
    ],
  },
  [AttackCategory.HYPOTHETICAL_FRAMING]: {
    id: AttackCategory.HYPOTHETICAL_FRAMING,
    summary:
      'Harmful request wrapped in a fictional, hypothetical, academic, or "grandma bedtime story" frame to claim the output is not real.',
    signals: [
      '"hypothetically", "fictional", "for a novel"',
      'nested frames (character inside a story inside a roleplay)',
    ],
    references: [
      'Wei et al. (2023) "Jailbroken"',
      'Anthropic usage-policy reporting on fiction-framed bypasses',
    ],
    defenses: [
      'Train refusal on operational content regardless of frame',
      'Output classifiers evaluate content, not wrapper',
    ],
  },
  [AttackCategory.AUTHORITY_IMPERSONATION]: {
    id: AttackCategory.AUTHORITY_IMPERSONATION,
    summary:
      'User content forges higher-privilege markers — fake system tags, fake developer messages, fake tool outputs.',
    signals: [
      'Literal "<|im_start|>system", "<system>", "[SYSTEM]" inside user text',
      'Claims of being the developer, admin, or a privileged tool',
    ],
    references: [
      'Greshake et al. (2023) indirect prompt injection paper',
      'OpenAI / Anthropic spec work on instruction hierarchy',
    ],
    defenses: [
      'Instruction hierarchy training (trusted > developer > user > tool output)',
      'Strip or escape control tokens from untrusted input',
    ],
  },
  [AttackCategory.ENCODING_OBFUSCATION]: {
    id: AttackCategory.ENCODING_OBFUSCATION,
    summary:
      'Payload encoded in base64, hex, rot13, leetspeak, or homoglyphs to slip past surface-level filters.',
    signals: [
      'Long base64 / hex blocks',
      'Mixed-script words (Latin + Cyrillic homoglyphs)',
      'Explicit "decode the following" instructions',
    ],
    references: [
      'Wei et al. (2023) "Jailbroken" — encoding attacks section',
      'Yuan et al. (2023) "GPT-4 Is Too Smart To Be Safe" (cipher-based attacks)',
    ],
    defenses: [
      'Run safety classification on decoded content, not just raw input',
      'Normalize Unicode to NFKC and detect mixed-script tokens',
    ],
  },
  [AttackCategory.TOKEN_SMUGGLING]: {
    id: AttackCategory.TOKEN_SMUGGLING,
    summary:
      'Harmful terms split across tokens / concatenated from fragments to evade keyword filters.',
    signals: [
      'Variables like a="foo", b="bar" then "print(a+b)" patterns',
      'Zero-width joiners or invisible separators inside words',
    ],
    references: [
      'Kang et al. (2023) "Exploiting Programmatic Behavior of LLMs"',
    ],
    defenses: [
      'Evaluate safety on the fully rendered / decoded string',
      'Reject input containing suspicious invisible characters',
    ],
  },
  [AttackCategory.PAYLOAD_SPLITTING]: {
    id: AttackCategory.PAYLOAD_SPLITTING,
    summary:
      'Attack assembled over multiple turns or multiple variables; each individual turn looks benign.',
    signals: [
      'User defines variables, then asks for their concatenation',
      'Multi-turn gradual escalation',
    ],
    references: ['Kang et al. (2023) "Exploiting Programmatic Behavior"'],
    defenses: [
      'Whole-conversation safety evaluation, not per-turn only',
      'Track state and flag escalation patterns',
    ],
  },
  [AttackCategory.MANY_SHOT]: {
    id: AttackCategory.MANY_SHOT,
    summary:
      'Long in-context transcript of fake Q&A pairs where the assistant answers harmful questions, inducing the real model to continue the pattern.',
    signals: [
      'Dozens of synthetic "User: .. Assistant: .." pairs in one message',
    ],
    references: [
      'Anil et al. (2024) "Many-shot Jailbreaking" (Anthropic)',
    ],
    defenses: [
      'Context-length-aware safety classifiers',
      'Detect and strip injected dialogue formatting from user input',
    ],
  },
  [AttackCategory.ADVERSARIAL_SUFFIX]: {
    id: AttackCategory.ADVERSARIAL_SUFFIX,
    summary:
      'Gradient-optimized high-entropy token strings appended to a prompt, transferable across models.',
    signals: [
      'High-entropy punctuation + symbol soup at end of prompt',
      'Nonsense token sequences with no linguistic structure',
    ],
    references: [
      'Zou et al. (2023) "Universal and Transferable Adversarial Attacks on Aligned Language Models" (GCG)',
      'Liu et al. (2024) "AutoDAN"',
    ],
    defenses: [
      'Perplexity filters on input',
      'Smoothing / paraphrasing input before safety eval (SmoothLLM, Robey et al. 2023)',
    ],
  },
  [AttackCategory.INDIRECT_INJECTION]: {
    id: AttackCategory.INDIRECT_INJECTION,
    summary:
      'Payload is delivered through a retrieved document, tool output, or web page the agent reads — not typed by the end user.',
    signals: [
      'Injection markers appearing inside untrusted content fields',
      'Imperative sentences ("You must now...") inside retrieved text',
    ],
    references: [
      'Greshake et al. (2023) "Not what you\'ve signed up for"',
      'Hines et al. (2024) "Defending Against Indirect Prompt Injection ... With Spotlighting"',
    ],
    defenses: [
      'Spotlighting (datamarking, encoding, delimiting untrusted input)',
      'Capability gating: model cannot act on instructions from untrusted sources',
    ],
  },
  [AttackCategory.PROMPT_LEAK]: {
    id: AttackCategory.PROMPT_LEAK,
    summary:
      'Attempts to exfiltrate the hidden system prompt or developer instructions.',
    signals: [
      '"repeat the above verbatim", "what are your instructions"',
      'Requests to output first N tokens of the context',
    ],
    references: [
      'Perez & Ribeiro (2022) "Ignore Previous Prompt" — prompt leaking section',
      'Zhang et al. (2024) "Effective Prompt Extraction from Language Models"',
    ],
    defenses: [
      'Train to refuse verbatim context disclosure',
      'Treat system prompt as non-confidential (defense in depth)',
    ],
  },
  [AttackCategory.REFUSAL_SUPPRESSION]: {
    id: AttackCategory.REFUSAL_SUPPRESSION,
    summary:
      'Explicit instructions forbidding refusal, apology, or safety language; forces the response to start with an affirmative token.',
    signals: [
      '"do not refuse / apologize / say you can\'t"',
      '"begin your reply with \'Sure\'"',
    ],
    references: [
      'Wei et al. (2023) "Jailbroken" — refusal-suppression section',
      'Zou et al. (2023) GCG paper (affirmative-prefix objective)',
    ],
    defenses: [
      'Refusal training robust to prefix forcing',
      'Output classifiers run regardless of first-token bias',
    ],
  },
};
