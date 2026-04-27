import type { PresentationStep } from "./PresentationControlEngine";

const STEP_HEADING_PATTERN = /^#\s*step\s+(\d+)\s*$/imu;

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

export function formatStepTranscriptEditValue(
  steps: PresentationStep[],
): string {
  return steps
    .map(
      (step, index) =>
        `# Step ${index + 1}\n${normalizeStepText(step.transcript)}`,
    )
    .join("\n\n")
    .trim();
}

export function parseStepTranscriptEditValue<T extends PresentationStep>(
  text: string,
  steps: T[],
): T[] {
  const bodies = extractEditableStepBodies(text);

  if (bodies.length === 0) {
    return steps;
  }

  return steps.map((step, index) => {
    const transcript = bodies[index];
    if (!transcript || transcript === normalizeStepText(step.transcript)) {
      return step;
    }

    return {
      ...step,
      transcript,
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
