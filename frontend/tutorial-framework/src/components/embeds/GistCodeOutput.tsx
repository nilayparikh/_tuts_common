"use client";
import React, { useEffect, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface GistFile {
  filename: string;
  language: string | null;
  raw_url: string;
  content: string;
  truncated: boolean;
  size: number;
}

export interface GistCodeOutputProps {
  /**
   * Full Gist ID, including owner prefix.
   * e.g. "nilayparikh/abc123def456" or just "abc123def456"
   */
  gistId: string;
  /** Optionally show only a specific file from the gist */
  file?: string;
  /** Title shown above the gist */
  title?: string;
  /** Description text below the title */
  description?: string;
  /** Optional simulated/static output text to display below code */
  output?: string;
  /** Max height for code area before scroll (CSS value, default "500px") */
  maxCodeHeight?: string;
  /** Show line numbers (default true) */
  showLineNumbers?: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const LANG_MAP: Record<string, string> = {
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  JSON: "json",
  YAML: "yaml",
  Markdown: "markdown",
  Shell: "bash",
  Bash: "bash",
  Dockerfile: "dockerfile",
  HTML: "html",
  CSS: "css",
  SQL: "sql",
  Go: "go",
  Rust: "rust",
  Java: "java",
  "C#": "csharp",
  Ruby: "ruby",
  PHP: "php",
  Swift: "swift",
  Kotlin: "kotlin",
  "Jupyter Notebook": "json",
};

function mapLanguage(lang: string | null): string {
  if (!lang) return "text";
  return LANG_MAP[lang] || lang.toLowerCase();
}

// ─── Syntax highlight (basic, no external deps) ───────────────────────────

/** Ultra-simple keyword highlighter for inline rendering */
function highlightCode(code: string, _lang: string): React.ReactNode[] {
  // Just render as plain pre-formatted text — the component provides the
  // chrome (header bar, line numbers, copy button, output panel) while the
  // actual code stays readable without a heavy highlight library.
  return code.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      {"\n"}
    </span>
  ));
}

// ─── Component ─────────────────────────────────────────────────────────────

export function GistCodeOutput({
  gistId,
  file,
  title,
  description,
  output,
  maxCodeHeight = "500px",
  showLineNumbers = true,
}: GistCodeOutputProps): React.ReactElement {
  const [files, setFiles] = useState<GistFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState(0);

  const gistUrl = `https://gist.github.com/${gistId}`;

  // Fetch gist data from GitHub API
  useEffect(() => {
    const id = gistId.includes("/") ? gistId.split("/").pop()! : gistId;
    fetch(`https://api.github.com/gists/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`GitHub API: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const gistFiles = Object.values(data.files) as GistFile[];
        if (file) {
          const matched = gistFiles.filter((f) => f.filename === file);
          setFiles(matched.length > 0 ? matched : gistFiles);
        } else {
          setFiles(gistFiles);
        }
      })
      .catch((e) => setError(e.message));
  }, [gistId, file]);

  const currentFile = files?.[activeFile] ?? null;
  const lang = currentFile ? mapLanguage(currentFile.language) : "text";

  const handleCopy = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <figure style={{ margin: 0 }}>
      {/* Title & description */}
      {(title || description) && (
        <div style={{ marginBottom: "var(--tf-space-3)" }}>
          {title && (
            <div
              style={{
                fontSize: "var(--tf-text-lg)",
                fontWeight: 700,
                color: "var(--tf-text-primary)",
                fontFamily: "var(--tf-font-display)",
              }}
            >
              {title}
            </div>
          )}
          {description && (
            <div
              style={{
                fontSize: "var(--tf-text-sm)",
                color: "var(--tf-text-secondary)",
                marginTop: "var(--tf-space-1)",
                lineHeight: "var(--tf-leading-relaxed)",
              }}
            >
              {description}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          borderRadius: "var(--tf-radius-xl)",
          overflow: "hidden",
          border: "1px solid var(--tf-border-default)",
          boxShadow: "var(--tf-shadow-md)",
          fontFamily: "var(--tf-font-mono)",
          fontSize: "var(--tf-text-sm)",
        }}
      >
        {/* ── Header bar ─────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-2)",
            padding: "var(--tf-space-2) var(--tf-space-4)",
            background: "var(--tf-bg-elevated)",
            borderBottom: "1px solid var(--tf-border-subtle)",
            flexWrap: "wrap",
            minHeight: 38,
          }}
        >
          {/* Traffic lights decoration */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginRight: "var(--tf-space-2)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#ff5f57",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#febc2e",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#28c840",
              }}
            />
          </div>

          {/* File tabs or filename */}
          {files && files.length > 1 ? (
            <div style={{ display: "flex", gap: 2, flex: 1, minWidth: 0 }}>
              {files.map((f, i) => (
                <button
                  key={f.filename}
                  type="button"
                  onClick={() => setActiveFile(i)}
                  style={{
                    padding: "var(--tf-space-1) var(--tf-space-3)",
                    borderRadius: "var(--tf-radius-md) var(--tf-radius-md) 0 0",
                    border: "none",
                    background:
                      i === activeFile ? "var(--tf-code-bg)" : "transparent",
                    color:
                      i === activeFile
                        ? "var(--tf-text-primary)"
                        : "var(--tf-text-muted)",
                    fontSize: "var(--tf-text-xs)",
                    fontFamily: "var(--tf-font-mono)",
                    fontWeight: i === activeFile ? 600 : 400,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 180,
                  }}
                >
                  {f.filename}
                </button>
              ))}
            </div>
          ) : currentFile ? (
            <span
              style={{
                fontSize: "var(--tf-text-xs)",
                color: "var(--tf-text-muted)",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentFile.filename}
            </span>
          ) : (
            <span
              style={{
                fontSize: "var(--tf-text-xs)",
                color: "var(--tf-text-muted)",
                flex: 1,
              }}
            >
              Loading…
            </span>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "var(--tf-space-3)",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            {currentFile && (
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--tf-text-muted)",
                  cursor: "pointer",
                  fontSize: "var(--tf-text-xs)",
                  fontFamily: "var(--tf-font-mono)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--tf-space-1)",
                  padding: "var(--tf-space-1) var(--tf-space-2)",
                  borderRadius: "var(--tf-radius-sm)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--tf-bg-surface)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            )}
            <a
              href={gistUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "var(--tf-text-xs)",
                color: "var(--tf-color-primary-light)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "var(--tf-space-1)",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="var(--tf-text-muted)"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              Gist
            </a>
          </div>
        </div>

        {/* ── Code panel ─────────────────────────────────────────── */}
        <div
          style={{
            background: "var(--tf-code-bg)",
            maxHeight: maxCodeHeight,
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          {error ? (
            <div
              style={{
                padding: "var(--tf-space-6)",
                color: "var(--tf-color-danger)",
                textAlign: "center",
                fontSize: "var(--tf-text-sm)",
              }}
            >
              Failed to load gist: {error}
            </div>
          ) : !currentFile ? (
            <div
              style={{
                padding: "var(--tf-space-6)",
                color: "var(--tf-text-muted)",
                textAlign: "center",
                fontSize: "var(--tf-text-sm)",
              }}
            >
              Loading gist…
            </div>
          ) : (
            <div style={{ display: "flex" }}>
              {/* Line numbers */}
              {showLineNumbers && (
                <div
                  style={{
                    padding:
                      "var(--tf-space-4) var(--tf-space-3) var(--tf-space-4) var(--tf-space-4)",
                    textAlign: "right",
                    userSelect: "none",
                    color: "var(--tf-text-muted)",
                    opacity: 0.4,
                    fontSize: "var(--tf-text-xs)",
                    lineHeight: "1.7",
                    flexShrink: 0,
                    borderRight: "1px solid var(--tf-border-subtle)",
                  }}
                >
                  {currentFile.content.split("\n").map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
              )}

              {/* Code content */}
              <pre
                style={{
                  flex: 1,
                  margin: 0,
                  padding: "var(--tf-space-4)",
                  fontSize: "var(--tf-text-sm)",
                  lineHeight: "1.7",
                  color: "var(--tf-code-text, var(--tf-text-primary))",
                  whiteSpace: "pre",
                  overflowX: "auto",
                  tabSize: 4,
                }}
              >
                <code>{highlightCode(currentFile.content, lang)}</code>
              </pre>
            </div>
          )}
        </div>

        {/* ── Output panel (optional) ────────────────────────────── */}
        {output && (
          <div
            style={{
              borderTop: "1px solid var(--tf-border-subtle)",
              background: "var(--tf-bg-surface)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--tf-space-2)",
                padding: "var(--tf-space-2) var(--tf-space-4)",
                borderBottom: "1px solid var(--tf-border-subtle)",
                background: "var(--tf-bg-elevated)",
              }}
            >
              <span style={{ fontSize: "var(--tf-text-xs)", opacity: 0.7 }}>
                ▶
              </span>
              <span
                style={{
                  fontSize: "var(--tf-text-xs)",
                  color: "var(--tf-text-muted)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Output
              </span>
            </div>
            <pre
              style={{
                margin: 0,
                padding: "var(--tf-space-4)",
                fontSize: "var(--tf-text-sm)",
                lineHeight: "1.7",
                color: "var(--tf-color-success)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              {output}
            </pre>
          </div>
        )}
      </div>
    </figure>
  );
}
