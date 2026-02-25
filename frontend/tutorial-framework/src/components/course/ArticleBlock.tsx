import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ArticleAuthor {
  name: string;
  /** Optional avatar URL */
  avatarUrl?: string;
  /** Optional profile link */
  href?: string;
}

export interface ArticleBlockProps {
  /** Article headline */
  title: string;
  /** Deck / subtitle */
  subtitle?: string;
  /** Author info */
  author?: ArticleAuthor;
  /** Publication date (ISO string or readable) */
  publishedDate?: string;
  /** Estimated reading time */
  readingTime?: string;
  /** Optional hero image URL */
  heroImageUrl?: string;
  /** Optional hero image alt text */
  heroImageAlt?: string;
  /** Main article body — supports React children for rich content */
  children: React.ReactNode;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ArticleBlock({
  title,
  subtitle,
  author,
  publishedDate,
  readingTime,
  heroImageUrl,
  heroImageAlt,
  children,
}: ArticleBlockProps): React.ReactElement {
  return (
    <article
      style={{
        maxWidth: "68ch",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-8)",
      }}
    >
      {/* Header block */}
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--tf-space-4)",
        }}
      >
        {/* Article badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--tf-space-1)",
            fontFamily: "var(--tf-font-mono)",
            fontSize: "var(--tf-text-xs)",
            fontWeight: 700,
            letterSpacing: "var(--tf-tracking-wide)",
            color: "var(--tf-color-accent)",
            textTransform: "uppercase",
          }}
        >
          📰 Article
        </span>

        <h1
          style={{
            margin: 0,
            fontFamily: "var(--tf-font-display)",
            fontWeight: 800,
            fontSize: "var(--tf-text-4xl)",
            color: "var(--tf-text-primary)",
            lineHeight: "var(--tf-leading-snug)",
            letterSpacing: "var(--tf-tracking-tight)",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              margin: 0,
              fontSize: "var(--tf-text-xl)",
              color: "var(--tf-text-secondary)",
              lineHeight: "var(--tf-leading-relaxed)",
              fontWeight: 400,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Meta row */}
        {(author || publishedDate || readingTime) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--tf-space-4)",
              paddingTop: "var(--tf-space-3)",
              borderTop: "1px solid var(--tf-border-subtle)",
            }}
          >
            {author && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--tf-space-2)",
                }}
              >
                {author.avatarUrl ? (
                  <img
                    src={author.avatarUrl}
                    alt={author.name}
                    width={32}
                    height={32}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, var(--tf-color-primary) 0%, var(--tf-color-accent) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "var(--tf-text-sm)",
                      color: "#fff",
                    }}
                  >
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {author.href ? (
                  <a
                    href={author.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "var(--tf-text-sm)",
                      fontWeight: 600,
                      color: "var(--tf-text-primary)",
                      textDecoration: "none",
                    }}
                  >
                    {author.name}
                  </a>
                ) : (
                  <span
                    style={{
                      fontSize: "var(--tf-text-sm)",
                      fontWeight: 600,
                      color: "var(--tf-text-primary)",
                    }}
                  >
                    {author.name}
                  </span>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--tf-space-3)",
                fontSize: "var(--tf-text-xs)",
                color: "var(--tf-text-muted)",
                marginLeft: author ? undefined : 0,
              }}
            >
              {publishedDate && <span>{publishedDate}</span>}
              {publishedDate && readingTime && <span>·</span>}
              {readingTime && <span>📖 {readingTime} read</span>}
            </div>
          </div>
        )}
      </header>

      {/* Hero image */}
      {heroImageUrl && (
        <figure style={{ margin: 0 }}>
          <img
            src={heroImageUrl}
            alt={heroImageAlt ?? ""}
            style={{
              width: "100%",
              borderRadius: "var(--tf-radius-xl)",
              border: "1px solid var(--tf-border-subtle)",
              objectFit: "cover",
              maxHeight: 420,
            }}
          />
        </figure>
      )}

      {/* Article body prose */}
      <div
        style={{
          fontSize: "var(--tf-text-md)",
          lineHeight: "var(--tf-leading-relaxed)",
          color: "var(--tf-text-secondary)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--tf-space-5)",
        }}
      >
        {children}
      </div>
    </article>
  );
}
