/**
 * SlideBase — Theme-aware Spectacle slide wrappers.
 *
 * Uses CSS custom properties (--tf-*) so slides automatically adapt
 * to whichever theme the ThemeProvider activates.
 *
 * Peer dependency: spectacle ^10.0.0
 */

import React from "react";
import { Slide, Heading, Text, FlexBox, Box, Notes } from "spectacle";

/* ── Shared tokens as CSS var references ──────────────────────────────── */

const v = {
  bgBase: "var(--tf-bg-base, #0b0d12)",
  bgSurface: "var(--tf-bg-surface, #111318)",
  bgElevated: "var(--tf-bg-elevated, #191c23)",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  textMuted: "var(--tf-text-muted, #8892a8)",
  primary: "var(--tf-color-primary, #6366f1)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  accent: "var(--tf-color-accent, #f59e0b)",
  fontDisplay: "var(--tf-font-display, 'Inter', system-ui, sans-serif)",
  fontBody: "var(--tf-font-body, 'Inter', system-ui, sans-serif)",
};

/* ── Types ────────────────────────────────────────────────────────────── */

export interface SlideBaseProps {
  children: React.ReactNode;
  notes?: string;
  bg?: string;
}

/* ── Base Slide Wrappers ──────────────────────────────────────────────── */

/** Dark base slide (default surface — deepest background) */
export function DarkSlide({ children, notes, bg }: SlideBaseProps) {
  return (
    <Slide backgroundColor={bg ?? "transparent"} padding="48px 64px">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: bg ?? v.bgBase,
          zIndex: -1,
        }}
      />
      {children}
      {notes && <Notes>{notes}</Notes>}
    </Slide>
  );
}

/** Surface slide (slightly lighter) */
export function SurfaceSlide({ children, notes, bg }: SlideBaseProps) {
  return (
    <Slide backgroundColor={bg ?? "transparent"} padding="48px 64px">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: bg ?? v.bgSurface,
          zIndex: -1,
        }}
      />
      {children}
      {notes && <Notes>{notes}</Notes>}
    </Slide>
  );
}

/* ── Title Slide ──────────────────────────────────────────────────────── */

interface TitleSlideProps {
  lessonNumber: string;
  title: string;
  subtitle?: string;
  notes?: string;
}

export function TitleSlide({
  lessonNumber,
  title,
  subtitle,
  notes,
}: TitleSlideProps) {
  return (
    <DarkSlide notes={notes}>
      <FlexBox
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        {/* Pill badge */}
        <div
          style={{
            padding: "6px 22px",
            borderRadius: "9999px",
            background: `linear-gradient(135deg, ${v.primary}, ${v.primaryLight})`,
            marginBottom: "28px",
          }}
        >
          <Text
            fontSize="14px"
            fontWeight={700}
            color={v.bgBase}
            fontFamily={v.fontDisplay}
            style={{
              margin: 0,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Lesson {lessonNumber}
          </Text>
        </div>

        <Heading
          fontSize="52px"
          fontWeight={800}
          color={v.textPrimary}
          fontFamily={v.fontDisplay}
          style={{ textAlign: "center", lineHeight: 1.15, margin: 0 }}
        >
          {title}
        </Heading>

        {subtitle && (
          <Text
            fontSize="22px"
            color={v.textSecondary}
            fontFamily={v.fontBody}
            style={{
              textAlign: "center",
              marginTop: "20px",
              maxWidth: "720px",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Text>
        )}

        {/* Decorative gradient line */}
        <div
          style={{
            width: "120px",
            height: "3px",
            marginTop: "32px",
            borderRadius: "2px",
            background: `linear-gradient(90deg, ${v.primary}, ${v.accent})`,
          }}
        />
      </FlexBox>
    </DarkSlide>
  );
}

/* ── Section Divider ──────────────────────────────────────────────────── */

interface SectionDividerProps {
  icon: string;
  title: string;
  subtitle?: string;
  notes?: string;
}

export function SectionDivider({
  icon,
  title,
  subtitle,
  notes,
}: SectionDividerProps) {
  return (
    <DarkSlide notes={notes}>
      <FlexBox
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Text fontSize="64px" style={{ margin: 0, marginBottom: "20px" }}>
          {icon}
        </Text>
        <Heading
          fontSize="40px"
          fontWeight={700}
          color={v.textPrimary}
          fontFamily={v.fontDisplay}
          style={{ textAlign: "center", lineHeight: 1.2, margin: 0 }}
        >
          {title}
        </Heading>
        {subtitle && (
          <Text
            fontSize="20px"
            color={v.textMuted}
            fontFamily={v.fontBody}
            style={{
              textAlign: "center",
              marginTop: "14px",
              maxWidth: "640px",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Text>
        )}
        <div
          style={{
            width: "80px",
            height: "2px",
            marginTop: "24px",
            borderRadius: "1px",
            background: `linear-gradient(90deg, transparent, ${v.primaryLight}, transparent)`,
          }}
        />
      </FlexBox>
    </DarkSlide>
  );
}

/* ── Content Slide (heading + body) ───────────────────────────────────── */

interface ContentSlideProps {
  title: string;
  children: React.ReactNode;
  notes?: string;
}

export function ContentSlide({ title, children, notes }: ContentSlideProps) {
  return (
    <SurfaceSlide notes={notes}>
      <Heading
        fontSize="32px"
        fontWeight={700}
        color={v.textPrimary}
        fontFamily={v.fontDisplay}
        style={{ marginBottom: "28px", lineHeight: 1.2 }}
      >
        {title}
      </Heading>
      {children}
    </SurfaceSlide>
  );
}

/* ── Diagram Slide (centred visual) ───────────────────────────────────── */

interface DiagramSlideProps {
  title: string;
  children: React.ReactNode;
  notes?: string;
}

export function DiagramSlide({ title, children, notes }: DiagramSlideProps) {
  return (
    <DarkSlide notes={notes}>
      <Heading
        fontSize="30px"
        fontWeight={700}
        color={v.textPrimary}
        fontFamily={v.fontDisplay}
        style={{ marginBottom: "20px", textAlign: "center" }}
      >
        {title}
      </Heading>
      <FlexBox justifyContent="center" alignItems="center" flex={1}>
        {children}
      </FlexBox>
    </DarkSlide>
  );
}
