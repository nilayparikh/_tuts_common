const STEP_HEADING_PATTERN = /^#\s*step\s+(\d+)\s*$/imu;

export type TranscriptLanguageCode = "en" | "hi" | "gu" | (string & {});

export type TranscriptLanguageMap = Partial<
  Record<TranscriptLanguageCode, string>
>;

export type TranscriptEditValue = string | TranscriptLanguageMap;
export type TranscriptEditRecord = Record<
  string,
  TranscriptEditValue | undefined
>;

export const DEFAULT_TRANSCRIPT_LANGUAGE: TranscriptLanguageCode = "en";

type SlideNarrationLike = {
  narration?: string;
  narrationByLanguage?: TranscriptLanguageMap;
};

type StepTranscriptLike = {
  transcript: string;
  transcriptByLanguage?: TranscriptLanguageMap;
};

function hasTranscriptText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isTranscriptLanguageMap(
  value: unknown,
): value is TranscriptLanguageMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (entry) => entry === undefined || typeof entry === "string",
  );
}

export function parseStoredTranscriptEditRecord(
  value: unknown,
): TranscriptEditRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, TranscriptEditValue] =>
        typeof entry[1] === "string" || isTranscriptLanguageMap(entry[1]),
    ),
  );
}

export function looksLikeStepTranscriptEditValue(text: string): boolean {
  return STEP_HEADING_PATTERN.test(text.replace(/\r\n?/gu, "\n").trim());
}

export function resolveTranscriptEditForLanguage(
  value: TranscriptEditValue | undefined,
  language: TranscriptLanguageCode = DEFAULT_TRANSCRIPT_LANGUAGE,
): string | null {
  if (typeof value === "string") {
    return language === DEFAULT_TRANSCRIPT_LANGUAGE && value !== ""
      ? value
      : null;
  }

  if (!value) {
    return null;
  }

  const localized = value[language];
  return hasTranscriptText(localized) ? localized : null;
}

export function writeTranscriptEditForLanguage(
  existingValue: TranscriptEditValue | undefined,
  language: TranscriptLanguageCode,
  text: string,
): TranscriptEditValue | undefined {
  const nextText = text.trim();
  if (!nextText) {
    if (typeof existingValue === "string") {
      return undefined;
    }
    if (!existingValue) {
      return undefined;
    }

    const nextValue = { ...existingValue };
    delete nextValue[language];
    return Object.keys(nextValue).length > 0 ? nextValue : undefined;
  }

  if (language === DEFAULT_TRANSCRIPT_LANGUAGE) {
    if (
      existingValue &&
      typeof existingValue === "object" &&
      Object.keys(existingValue).some(
        (key) => key !== DEFAULT_TRANSCRIPT_LANGUAGE,
      )
    ) {
      return {
        ...existingValue,
        [DEFAULT_TRANSCRIPT_LANGUAGE]: text,
      };
    }

    return text;
  }

  const nextValue =
    typeof existingValue === "string"
      ? { [DEFAULT_TRANSCRIPT_LANGUAGE]: existingValue }
      : { ...(existingValue ?? {}) };

  nextValue[language] = text;
  return nextValue;
}

function resolveLocalizedTranscriptText(
  baseText: string | undefined,
  byLanguage: TranscriptLanguageMap | undefined,
  language: TranscriptLanguageCode = DEFAULT_TRANSCRIPT_LANGUAGE,
): string {
  const localizedText = byLanguage?.[language];
  if (hasTranscriptText(localizedText)) {
    return localizedText;
  }

  if (hasTranscriptText(baseText)) {
    return baseText;
  }

  const englishText = byLanguage?.[DEFAULT_TRANSCRIPT_LANGUAGE];
  if (hasTranscriptText(englishText)) {
    return englishText;
  }

  const fallbackText = Object.values(byLanguage ?? {}).find(hasTranscriptText);
  return fallbackText ?? "";
}

export function resolveSlideNarration(
  slide: SlideNarrationLike | undefined,
  language: TranscriptLanguageCode = DEFAULT_TRANSCRIPT_LANGUAGE,
): string {
  return resolveLocalizedTranscriptText(
    slide?.narration,
    slide?.narrationByLanguage,
    language,
  );
}

export function resolveStepTranscript(
  step: StepTranscriptLike,
  language: TranscriptLanguageCode = DEFAULT_TRANSCRIPT_LANGUAGE,
): string {
  return resolveLocalizedTranscriptText(
    step.transcript,
    step.transcriptByLanguage,
    language,
  );
}

export function resolveStepsForLanguage<T extends StepTranscriptLike>(
  steps: T[] | undefined,
  language: TranscriptLanguageCode = DEFAULT_TRANSCRIPT_LANGUAGE,
): T[] {
  return (steps ?? []).map((step) => ({
    ...step,
    transcript: resolveStepTranscript(step, language),
  }));
}

function normalizeStepText(text: string): string {
  return text.replace(/\r\n?/gu, "\n").trim();
}

function extractEditableStepBodies(text: string): string[] {
  const normalized = text.replace(/\r\n?/gu, "\n").trim();
  if (!normalized) {
    return [];
  }

  const matches = Array.from(normalized.matchAll(/^#\s*step\s+(\d+)\s*$/gimu));
  if (matches.length === 0) {
    return [normalized];
  }

  return matches
    .map((match, index) => {
      const start = (match.index ?? 0) + match[0].length;
      const end = matches[index + 1]?.index ?? normalized.length;
      return normalizeStepText(normalized.slice(start, end));
    })
    .filter(Boolean);
}

export function formatStepTranscriptEditValue<T extends StepTranscriptLike>(
  steps: T[],
  language: TranscriptLanguageCode = DEFAULT_TRANSCRIPT_LANGUAGE,
): string {
  return steps
    .map(
      (step, index) =>
        `# Step ${index + 1}\n${normalizeStepText(resolveStepTranscript(step, language))}`,
    )
    .join("\n\n")
    .trim();
}

export function parseStepTranscriptEditValue<T extends StepTranscriptLike>(
  text: string,
  steps: T[],
  language: TranscriptLanguageCode = DEFAULT_TRANSCRIPT_LANGUAGE,
): T[] {
  const bodies = extractEditableStepBodies(text);

  if (bodies.length === 0) {
    return steps;
  }

  return steps.map((step, index) => {
    const transcript = bodies[index];
    if (
      !transcript ||
      transcript === normalizeStepText(resolveStepTranscript(step, language))
    ) {
      return step;
    }

    return {
      ...step,
      transcript,
      transcriptByLanguage:
        language === DEFAULT_TRANSCRIPT_LANGUAGE
          ? step.transcriptByLanguage
          : {
              ...(step.transcriptByLanguage ?? {}),
              [language]: transcript,
            },
    };
  });
}

export function summarizeStepTranscript(text: string): string {
  const normalized = normalizeStepText(text);
  if (!normalized) {
    return "";
  }

  const lineParts = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const source = lineParts.slice(0, 2).join(" ");
  const sentences = source
    .split(/(?<=[.!?])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    return source;
  }

  return sentences.slice(0, 2).join(" ");
}

export function resolveTranscriptContent({
  narration,
  transcriptText,
  editedText,
}: {
  narration?: string;
  transcriptText?: string;
  editedText?: string | null;
}): {
  baseText: string;
  displayText: string;
  usesExternalTranscript: boolean;
} {
  const baseText = transcriptText ?? narration ?? "";
  const usesExternalTranscript = transcriptText !== undefined;

  return {
    baseText,
    displayText: usesExternalTranscript ? baseText : (editedText ?? baseText),
    usesExternalTranscript,
  };
}
