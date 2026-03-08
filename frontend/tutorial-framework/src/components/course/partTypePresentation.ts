import type { CoursePart, PartType } from "./CourseSidebar";

export interface PartTypePresentation {
  badgeIcon: string;
  materialIcon: string;
  label: string;
  bg: string;
  color: string;
  borderColor: string;
}

function hasCodeExample(part: CoursePart): boolean {
  return Boolean(
    part.codeUrl ||
    part.colabUrl ||
    part.notebookUrl ||
    part.codePreview?.segments?.length,
  );
}

function isInterviewStyle(part: CoursePart): boolean {
  const value = `${part.title} ${part.slug}`.toLowerCase();
  return value.includes("interview");
}

function basePresentation(
  materialIcon: string,
  badgeIcon: string,
  label: string,
  bg: string,
  color: string,
  borderColor: string,
): PartTypePresentation {
  return {
    materialIcon,
    badgeIcon,
    label,
    bg,
    color,
    borderColor,
  };
}

export function getPartTypePresentation(
  part: CoursePart,
): PartTypePresentation {
  const codeExample = hasCodeExample(part);

  switch (part.type) {
    case "video":
    case "video-code":
      return codeExample
        ? basePresentation(
            "code",
            "💻",
            "Video + Code Examples",
            "var(--tf-color-accent-container)",
            "var(--tf-color-accent-light)",
            "var(--tf-color-accent-border)",
          )
        : basePresentation(
            "play_circle",
            "▶",
            "Video Lesson",
            "var(--tf-color-danger-container)",
            "var(--tf-color-danger)",
            "var(--tf-color-danger-border)",
          );
    case "reading":
      return basePresentation(
        "menu_book",
        "📖",
        "Reading Guide",
        "var(--tf-color-primary-container)",
        "var(--tf-color-primary-light)",
        "var(--tf-color-primary-border)",
      );
    case "quiz":
      return isInterviewStyle(part)
        ? basePresentation(
            "quiz",
            "📝",
            "Interview Questions",
            "var(--tf-color-success-container)",
            "var(--tf-color-success)",
            "var(--tf-color-success-border)",
          )
        : basePresentation(
            "quiz",
            "📝",
            "Assessment",
            "var(--tf-color-success-container)",
            "var(--tf-color-success)",
            "var(--tf-color-success-border)",
          );
    case "podcast":
      return basePresentation(
        "podcasts",
        "🎙",
        "Audio Lesson",
        "var(--tf-color-success-container)",
        "var(--tf-brand-spotify)",
        "var(--tf-color-success-border)",
      );
    case "slideshow":
      return basePresentation(
        "slideshow",
        "📑",
        "Slide Deck",
        "var(--tf-color-primary-container)",
        "var(--tf-color-primary-light)",
        "var(--tf-color-primary-border)",
      );
    case "article":
      return basePresentation(
        "article",
        "📰",
        "Article",
        "var(--tf-color-secondary-container)",
        "var(--tf-color-secondary-light)",
        "var(--tf-color-secondary-border)",
      );
    case "lab":
      return basePresentation(
        "science",
        "🧪",
        "Hands-On Lab",
        "var(--tf-color-accent-container)",
        "var(--tf-color-accent)",
        "var(--tf-color-accent-border)",
      );
    case "code":
      return codeExample
        ? basePresentation(
            "code_blocks",
            "🖥️",
            "Code Example",
            "var(--tf-color-secondary-container)",
            "var(--tf-color-secondary-light)",
            "var(--tf-color-secondary-border)",
          )
        : basePresentation(
            "code_blocks",
            "🖥️",
            "Code Lab",
            "var(--tf-color-secondary-container)",
            "var(--tf-color-secondary-light)",
            "var(--tf-color-secondary-border)",
          );
    default: {
      const neverType: never = part.type satisfies PartType;
      return neverType;
    }
  }
}
