"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  usePresentationStep,
  type PresentationStep,
} from "./PresentationControlEngine";

const v = {
  bgBase: "var(--tf-bg-base, #0b0d12)",
  bgSurface: "var(--tf-bg-surface, #111318)",
  panelBg: "var(--tf-surface-panel-bg, var(--tf-bg-surface, #111318))",
  cardBg: "var(--tf-surface-card-bg, var(--tf-bg-elevated, #191c23))",
  controlBg: "var(--tf-surface-control-bg, var(--tf-bg-overlay, #1f222a))",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  textMuted: "var(--tf-text-muted, #8892a8)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  recommendationAccent:
    "var(--tf-state-recommendation-accent, var(--tf-color-primary-light, #818cf8))",
  borderDefault: "var(--tf-border-default, rgba(202,211,230,0.14))",
  cardBorder:
    "var(--tf-surface-card-border, var(--tf-border-default, rgba(202,211,230,0.14)))",
  glassHighlight: "var(--tf-glass-highlight, none)",
  fontMono: "var(--tf-font-mono, 'JetBrains Mono', monospace)",
  radiusMd: "var(--tf-radius-md, 12px)",
  radiusLg: "var(--tf-radius-lg, 16px)",
  radiusSm: "var(--tf-radius-sm, 8px)",
};

const SVG_RENDERABLE_SELECTOR = [
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "image",
  "use",
  "foreignObject",
].join(", ");

export interface AnimatedSvgFocusStep extends PresentationStep {
  selectors?: string[];
  detail?: string;
  color?: string;
  revealMode?: "context" | "focus" | "full";
}

interface AnimatedSvgFocusWidgetProps {
  svgMarkup: string;
  steps: AnimatedSvgFocusStep[];
  density?: "default" | "compact";
}

function getRenderableElements(root: ParentNode): SVGElement[] {
  return Array.from(root.querySelectorAll<SVGElement>(SVG_RENDERABLE_SELECTOR))
    .filter((element) => !element.closest("defs"))
    .filter((element) => !element.hasAttribute("data-svg-focus-ignore"));
}

function isTextElement(element: SVGElement): boolean {
  const tagName = element.tagName.toLowerCase();
  return tagName === "text" || tagName === "tspan";
}

function clearRenderableState(element: SVGElement): void {
  element.style.opacity = "";
  element.style.filter = "";
}

function prepareSvgRoot(svgRoot: SVGSVGElement): void {
  svgRoot.style.width = "100%";
  svgRoot.style.height = "100%";
  svgRoot.style.maxWidth = "100%";
  svgRoot.style.maxHeight = "100%";
  svgRoot.style.display = "block";
  svgRoot.removeAttribute("width");
  svgRoot.removeAttribute("height");
  svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");

  for (const element of getRenderableElements(svgRoot)) {
    element.style.transition =
      "opacity 260ms ease, filter 260ms ease, transform 260ms ease";
    element.style.transformOrigin = "center";
    element.style.transformBox = "fill-box";
  }
}

function collectFocusedElements(
  svgRoot: SVGSVGElement,
  selectors: string[],
): Set<SVGElement> {
  const focused = new Set<SVGElement>();

  for (const selector of selectors) {
    if (!selector.trim()) continue;

    let matches: Element[] = [];
    try {
      matches = Array.from(svgRoot.querySelectorAll(selector));
    } catch {
      continue;
    }

    for (const match of matches) {
      if (
        match instanceof SVGElement &&
        match.matches(SVG_RENDERABLE_SELECTOR) &&
        !match.closest("defs")
      ) {
        focused.add(match);
      }

      for (const descendant of getRenderableElements(match)) {
        focused.add(descendant);
      }
    }
  }

  return focused;
}

export function applySvgFocusStepState(
  svgRoot: SVGSVGElement,
  step: AnimatedSvgFocusStep | undefined,
): void {
  const renderables = getRenderableElements(svgRoot);

  if (!step || step.revealMode === "full") {
    for (const element of renderables) {
      clearRenderableState(element);
    }
    return;
  }

  const focusColor = step.color ?? v.recommendationAccent;
  const focusMode = step.revealMode ?? "focus";

  for (const element of renderables) {
    element.style.opacity = isTextElement(element) ? "0.34" : "0.22";
    element.style.filter = "grayscale(1) saturate(0.15) brightness(0.5)";
  }

  if (focusMode === "context") {
    return;
  }

  const focused = collectFocusedElements(svgRoot, step.selectors ?? []);

  for (const element of focused) {
    element.style.opacity = "1";
    element.style.filter = isTextElement(element)
      ? "none"
      : `drop-shadow(0 0 8px ${focusColor})`;
  }
}

let widgetCounter = 0;

export function AnimatedSvgFocusWidget({
  svgMarkup,
  steps,
  density = "default",
}: AnimatedSvgFocusWidgetProps) {
  const { stepIndex, stepCount } = usePresentationStep();
  const activeIdx =
    stepCount > 0 ? Math.min(stepIndex, Math.max(steps.length - 1, 0)) : 0;
  const activeStep = steps[activeIdx];
  const isCompact = density === "compact";
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [widgetId] = useState(() => `asfw-${++widgetCounter}`);

  const normalizedMarkup = useMemo(
    () =>
      svgMarkup.replace(/<svg\b/, `<svg data-animated-svg-root="${widgetId}"`),
    [svgMarkup, widgetId],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    setRendered(false);
    containerRef.current.innerHTML = normalizedMarkup;

    const svgRoot = containerRef.current.querySelector<SVGSVGElement>("svg");
    if (!svgRoot) return;

    prepareSvgRoot(svgRoot);
    applySvgFocusStepState(svgRoot, activeStep);
    setRendered(true);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [normalizedMarkup, activeStep]);

  useEffect(() => {
    if (!rendered || !containerRef.current) return;

    const svgRoot = containerRef.current.querySelector<SVGSVGElement>("svg");
    if (!svgRoot) return;

    applySvgFocusStepState(svgRoot, activeStep);
  }, [activeStep, rendered]);

  return (
    <div
      data-testid="animated-svg-focus-widget"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isCompact ? "8px" : "12px",
        padding: isCompact ? "10px" : "14px",
        borderRadius: v.radiusLg,
        border: `1px solid ${v.cardBorder}`,
        background: `linear-gradient(180deg, ${v.panelBg}, ${v.bgBase})`,
        minHeight: 0,
        flex: 1,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          background: v.cardBg,
          borderRadius: v.radiusMd,
          padding: isCompact ? "12px" : "18px",
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isCompact ? "8px" : "12px",
          padding: isCompact ? "8px 10px" : "10px 14px",
          borderRadius: v.radiusSm,
          border: `1px solid ${v.cardBorder}`,
          background: `${v.glassHighlight}, linear-gradient(180deg, ${v.cardBg}, ${v.controlBg})`,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: isCompact ? "9px" : "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: activeStep?.color ?? v.primaryLight,
            fontFamily: v.fontMono,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          [{String(activeIdx + 1).padStart(2, "0")}/
          {String(steps.length).padStart(2, "0")}]
        </div>
        <div
          style={{
            fontSize: isCompact ? "12px" : "13px",
            fontWeight: 600,
            color: v.textPrimary,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
          }}
        >
          {activeStep?.title ?? ""}
        </div>
        {activeStep?.detail && (
          <div
            style={{
              fontSize: isCompact ? "10px" : "11px",
              color: v.textSecondary,
              fontFamily: v.fontMono,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            {activeStep.detail}
          </div>
        )}
      </div>
    </div>
  );
}
