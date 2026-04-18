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
