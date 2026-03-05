import React from "react";

export interface HeroSectionProps {
  /** Eyebrow label above the headline */
  eyebrow?: string;
  /** Main headline */
  headline: string;
  /** Subheading / description */
  subheading?: string;
  /** Primary CTA button */
  primaryAction?: { label: string; href: string };
  /** Secondary CTA button */
  secondaryAction?: { label: string; href: string };
  /** Optional image URL */
  imageUrl?: string;
  /** Alt text for image */
  imageAlt?: string;
  /** Tags / tech stack chips */
  tags?: string[];
}

const s: Record<string, React.CSSProperties> = {
  hero: {
    padding: "var(--tf-space-12) 0 var(--tf-space-8)",
    position: "relative",
    overflow: "hidden",
  },
  bg: {
    position: "absolute",
    inset: 0,
    background: "none",
    pointerEvents: "none",
    zIndex: 0,
  },
  inner: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "var(--tf-space-12)",
    alignItems: "center",
  },
  innerNoImage: {
    position: "relative",
    zIndex: 1,
    textAlign: "center" as const,
    maxWidth: "var(--tf-narrow-width)",
    margin: "0 auto",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--tf-space-2)",
    padding: "var(--tf-space-1) var(--tf-space-3)",
    borderRadius: "var(--tf-radius-full)",
    background: "var(--tf-color-primary-bg)",
    border: "1px solid var(--tf-color-primary-border)",
    color: "var(--tf-color-primary-light)",
    fontFamily: "var(--tf-font-mono)",
    fontSize: "var(--tf-text-xs)",
    fontWeight: 600,
    letterSpacing: "var(--tf-tracking-widest)",
    textTransform: "uppercase" as const,
    marginBottom: "var(--tf-space-5)",
  },
  headline: {
    fontFamily: "var(--tf-font-display)",
    fontWeight: 800,
    fontSize: "clamp(2rem, 5vw, var(--tf-text-6xl))",
    lineHeight: 1.1,
    letterSpacing: "var(--tf-tracking-tight)",
    color: "var(--tf-text-primary)",
    marginBottom: "var(--tf-space-5)",
  },
  highlight: {
    background:
      "linear-gradient(120deg, var(--tf-color-primary-light), var(--tf-color-accent))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subheading: {
    fontSize: "var(--tf-text-lg)",
    lineHeight: "var(--tf-leading-relaxed)",
    color: "var(--tf-text-secondary)",
    maxWidth: "38rem",
    marginBottom: "var(--tf-space-5)",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "var(--tf-space-3)",
    marginBottom: "var(--tf-space-5)",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--tf-space-2)",
    padding: "var(--tf-space-3) var(--tf-space-6)",
    borderRadius: "var(--tf-radius-full)",
    background:
      "linear-gradient(135deg, var(--tf-color-primary) 0%, var(--tf-color-accent) 100%)",
    color: "#fff",
    fontFamily: "var(--tf-font-display)",
    fontWeight: 600,
    fontSize: "var(--tf-text-sm)",
    textDecoration: "none",
    border: "none",
    transition:
      "opacity var(--tf-transition-fast), box-shadow var(--tf-transition-fast), transform var(--tf-transition-fast)",
    boxShadow: "0 0 20px rgba(41,50,255,0.25), 0 0 40px rgba(168,56,255,0.15)",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--tf-space-2)",
    padding: "var(--tf-space-3) var(--tf-space-6)",
    borderRadius: "var(--tf-radius-full)",
    background: "transparent",
    color: "var(--tf-text-primary)",
    fontFamily: "var(--tf-font-display)",
    fontWeight: 600,
    fontSize: "var(--tf-text-sm)",
    textDecoration: "none",
    border: "1px solid var(--tf-border-strong)",
    transition:
      "border-color var(--tf-transition-fast), background var(--tf-transition-fast)",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "var(--tf-space-2)",
  },
  tag: {
    padding: "var(--tf-space-1) var(--tf-space-3)",
    borderRadius: "var(--tf-radius-full)",
    background: "var(--tf-bg-elevated)",
    border: "1px solid var(--tf-border-default)",
    color: "var(--tf-text-secondary)",
    fontFamily: "var(--tf-font-mono)",
    fontSize: "var(--tf-text-xs)",
  },
  image: {
    width: "30rem",
    maxWidth: "100%",
    borderRadius: "var(--tf-radius-xl)",
    border: "1px solid var(--tf-border-default)",
    boxShadow: "var(--tf-shadow-xl), var(--tf-shadow-glow)",
    flexShrink: 0,
  },
};

export function HeroSection({
  eyebrow,
  headline,
  subheading,
  primaryAction,
  secondaryAction,
  imageUrl,
  imageAlt = "",
  tags = [],
}: HeroSectionProps): React.ReactElement {
  const hasImage = !!imageUrl;
  const contentStyle = hasImage ? s.inner : s.innerNoImage;

  return (
    <section style={s.hero}>
      <div style={s.bg} aria-hidden="true" />
      <div style={contentStyle}>
        <div>
          {eyebrow && <div style={s.eyebrow}>{eyebrow}</div>}

          <h1 style={s.headline}>
            {headline.includes("**")
              ? // Supports **text** for gradient highlight
                headline.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                  part.startsWith("**") ? (
                    <span key={i} style={s.highlight}>
                      {part.slice(2, -2)}
                    </span>
                  ) : (
                    part
                  ),
                )
              : headline}
          </h1>

          {subheading && (
            <p
              style={{
                ...s.subheading,
                textAlign: hasImage ? "left" : "center",
                ...(hasImage
                  ? {}
                  : { marginLeft: "auto", marginRight: "auto" }),
              }}
            >
              {subheading}
            </p>
          )}

          {(primaryAction || secondaryAction) && (
            <div
              style={{
                ...s.actions,
                justifyContent: hasImage ? "flex-start" : "center",
              }}
            >
              {primaryAction && (
                <a href={primaryAction.href} style={s.btnPrimary}>
                  {primaryAction.label}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M3.75 8a.75.75 0 0 1 .75-.75h4.19L6.47 5.03a.75.75 0 0 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.061l-3 3a.75.75 0 1 1-1.06-1.06l2.22-2.22H4.5A.75.75 0 0 1 3.75 8Z" />
                  </svg>
                </a>
              )}
              {secondaryAction && (
                <a href={secondaryAction.href} style={s.btnSecondary}>
                  {secondaryAction.label}
                </a>
              )}
            </div>
          )}

          {tags.length > 0 && (
            <div
              style={{
                ...s.tags,
                ...(hasImage ? {} : { justifyContent: "center" }),
              }}
            >
              {tags.map((tag) => (
                <span key={tag} style={s.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {hasImage && <img src={imageUrl} alt={imageAlt} style={s.image} />}
      </div>
    </section>
  );
}
