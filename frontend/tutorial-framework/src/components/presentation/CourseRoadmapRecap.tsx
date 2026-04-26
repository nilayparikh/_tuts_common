"use client";

import React from "react";
import { usePresentationStep } from "./PresentationControlEngine";

const v = {
  bgSurface: "var(--tf-bg-surface, #111318)",
  bgElevated: "var(--tf-bg-elevated, #191c23)",
  bgOverlay: "var(--tf-bg-overlay, #1f222a)",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  textMuted: "var(--tf-text-muted, #8892a8)",
  primary: "var(--tf-color-primary, #6366f1)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  accent: "var(--tf-color-accent, #A838FF)",
  accentLight: "var(--tf-color-accent-light, #C68BFF)",
  success: "var(--tf-color-success, #10b981)",
  borderDefault: "var(--tf-border-default, rgba(202,211,230,0.14))",
  borderSubtle: "var(--tf-border-subtle, rgba(202,211,230,0.08))",
  fontDisplay:
    "var(--tf-font-display, 'Outfit', 'Segoe UI', Roboto, Arial, sans-serif)",
  fontBody:
    "var(--tf-font-body, 'Inter', 'Segoe UI', Roboto, Arial, sans-serif)",
  fontMono:
    "var(--tf-font-mono, 'JetBrains Mono', 'Share Tech Mono', Consolas, monospace)",
};

function scalePx(value: string): string {
  return `calc(${value} * var(--pe-roadmap-density-scale, 1))`;
}

function scaleSpace(...values: string[]): string {
  return values.map((value) => scalePx(value)).join(" ");
}

export interface CourseRoadmapLesson {
  number: string;
  title: string;
  description: string;
}

export interface CourseRoadmapRecapStep {
  title: string;
  detail?: string;
}

export interface CourseRoadmapRecapProps {
  lessonNumber: string;
  lessons: readonly CourseRoadmapLesson[];
  steps: readonly CourseRoadmapRecapStep[];
  pathBullets: readonly string[];
  pathLabel?: string;
  pathSummary?: string;
  completedLessonsText?: string;
  currentLessonText?: string;
  fullMapText?: string;
  progressLabel?: string;
  currentLockLabel?: string;
}

export function CourseRoadmapRecap({
  lessonNumber,
  lessons,
  steps,
  pathBullets,
  pathLabel = "One bounded course path",
  pathSummary = "Each lesson adds one mechanism and keeps the earlier contract alive.",
  completedLessonsText = "The earlier mechanisms stay live. This lesson inherits their constraints instead of replacing them.",
  currentLessonText = "This is the next mechanism on the same chain. The system only gets stronger because the earlier contract is already locked.",
  fullMapText = "Keep the full map in your head. The local diagram only matters because the whole course path is still standing behind it.",
  progressLabel = "Progress",
  currentLockLabel = "Current lock",
}: CourseRoadmapRecapProps) {
  const currentIndex = Number.parseInt(lessonNumber, 10) - 1;
  const isDenseRoadmap = lessons.length >= 7;
  const roadmapDensityScale = isDenseRoadmap
    ? "clamp(0.95, calc(0.95 + ((var(--pe-slide-enlarge, 1) - 1) * 0.08)), 1.06)"
    : "clamp(1, calc(1 + ((var(--pe-slide-enlarge, 1) - 1) * 0.4)), 1.24)";
  const { stepIndex, stepCount } = usePresentationStep();
  const activeIdx =
    stepCount > 0 ? Math.min(stepIndex, Math.max(steps.length - 1, 0)) : 0;
  const activeStep = steps[activeIdx] ?? steps[0];
  const currentLesson = lessons[currentIndex];
  const activeNarrative =
    activeStep?.detail === "completed lessons"
      ? completedLessonsText
      : activeStep?.detail === "current lesson"
        ? currentLessonText
        : fullMapText;

  return (
    <div
      data-roadmap-density={isDenseRoadmap ? "dense" : "default"}
      style={
        {
          "--pe-roadmap-density-scale": roadmapDensityScale,
          display: "grid",
          gridTemplateColumns: isDenseRoadmap
            ? "minmax(0, 1.28fr) minmax(0, 0.72fr)"
            : "minmax(0, 1.18fr) minmax(0, 0.82fr)",
          gap: scalePx(isDenseRoadmap ? "14px" : "18px"),
          minHeight: 0,
          flex: 1,
          overflow: "hidden",
        } as React.CSSProperties
      }
    >
      <div
        style={{
          minHeight: 0,
          borderRadius: scalePx(isDenseRoadmap ? "20px" : "22px"),
          border: `1px solid ${v.borderDefault}`,
          background: `linear-gradient(180deg, color-mix(in srgb, ${v.primary} 6%, ${v.bgSurface}) 0%, ${v.bgElevated} 100%)`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "relative",
            minHeight: 0,
            flex: 1,
            padding: scaleSpace(
              isDenseRoadmap ? "14px" : "18px",
              isDenseRoadmap ? "16px" : "20px",
              isDenseRoadmap ? "14px" : "18px",
              isDenseRoadmap ? "70px" : "78px",
            ),
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: scalePx(isDenseRoadmap ? "38px" : "42px"),
              top: scalePx(isDenseRoadmap ? "22px" : "28px"),
              bottom: scalePx(isDenseRoadmap ? "22px" : "28px"),
              width: scalePx("3px"),
              borderRadius: "999px",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--tf-color-success, #10b981) 76%, transparent) 0%, color-mix(in srgb, var(--tf-color-primary-light, #818cf8) 78%, transparent) 58%, color-mix(in srgb, var(--tf-text-muted, #8892a8) 26%, transparent) 100%)",
              opacity: 0.68,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: scalePx(isDenseRoadmap ? "9px" : "12px"),
              minHeight: 0,
              overflowY: "auto",
              paddingRight: scalePx(isDenseRoadmap ? "6px" : "8px"),
            }}
          >
            {lessons.map((lesson, index) => {
              const baseStatus =
                index < currentIndex
                  ? "complete"
                  : index === currentIndex
                    ? "current"
                    : "upcoming";
              const emphasis =
                activeIdx === 1
                  ? index <= currentIndex
                  : activeIdx === 2
                    ? index === currentIndex
                    : true;
              const palette =
                baseStatus === "complete"
                  ? {
                      border: "var(--tf-color-success, #10b981)",
                      glow: "var(--tf-color-success, #10b981)",
                      label: "#bbf7d0",
                      body: "#dcfce7",
                      fill: "#052e1f",
                      state: "locked in",
                    }
                  : baseStatus === "current"
                    ? {
                        border: "var(--tf-color-primary-light, #818cf8)",
                        glow: "var(--tf-color-primary-light, #818cf8)",
                        label: "#c7d2fe",
                        body: "#eef2ff",
                        fill: "#172554",
                        state: "current focus",
                      }
                    : {
                        border: v.borderDefault,
                        glow: v.textMuted,
                        label: v.textMuted,
                        body: v.textSecondary,
                        fill: v.bgOverlay,
                        state: "coming next",
                      };

              return (
                <div
                  key={lesson.number}
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: `${scalePx(isDenseRoadmap ? "24px" : "28px")} minmax(0, 1fr)`,
                    gap: scalePx(isDenseRoadmap ? "12px" : "14px"),
                    alignItems: "stretch",
                    opacity: emphasis ? 1 : 0.48,
                    transform: emphasis ? "translateX(0)" : "translateX(2px)",
                    transition: "opacity 180ms ease, transform 180ms ease",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      width: scalePx(isDenseRoadmap ? "24px" : "28px"),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: scalePx(isDenseRoadmap ? "16px" : "18px"),
                        height: scalePx(isDenseRoadmap ? "16px" : "18px"),
                        borderRadius: "999px",
                        border: `2px solid ${palette.border}`,
                        background: palette.fill,
                        boxShadow: `0 0 0 ${scalePx(isDenseRoadmap ? "4px" : "5px")} color-mix(in srgb, ${palette.glow} 18%, transparent), 0 0 ${scalePx(isDenseRoadmap ? "18px" : "24px")} color-mix(in srgb, ${palette.glow} 28%, transparent)`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: scalePx(isDenseRoadmap ? "6px" : "8px"),
                      padding: scaleSpace(
                        isDenseRoadmap ? "11px" : "14px",
                        isDenseRoadmap ? "13px" : "16px",
                      ),
                      borderRadius: scalePx(isDenseRoadmap ? "16px" : "18px"),
                      border: `1px solid color-mix(in srgb, ${palette.border} 42%, ${v.borderDefault})`,
                      background: `linear-gradient(180deg, color-mix(in srgb, ${palette.fill} 82%, ${v.bgSurface}) 0%, color-mix(in srgb, ${v.bgElevated} 90%, ${palette.glow} 10%) 100%)`,
                      boxShadow:
                        "0 16px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.04)",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: scalePx(isDenseRoadmap ? "10px" : "12px"),
                        alignItems: "baseline",
                      }}
                    >
                      <div
                        style={{
                          fontSize: scalePx(isDenseRoadmap ? "11px" : "12px"),
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontFamily: v.fontMono,
                          color: palette.label,
                          flexShrink: 0,
                        }}
                      >
                        L{lesson.number}
                      </div>
                      <div
                        style={{
                          fontSize: scalePx(isDenseRoadmap ? "11px" : "12px"),
                          lineHeight: 1.3,
                          fontFamily: v.fontMono,
                          color: palette.label,
                          textAlign: "right",
                        }}
                      >
                        {palette.state}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: scalePx(isDenseRoadmap ? "21px" : "25px"),
                        lineHeight: isDenseRoadmap ? 1.02 : 1.08,
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        color: palette.body,
                        fontFamily: v.fontDisplay,
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                      }}
                    >
                      {lesson.title}
                    </div>
                    <div
                      style={{
                        fontSize: scalePx(isDenseRoadmap ? "13px" : "14px"),
                        lineHeight: isDenseRoadmap ? 1.4 : 1.5,
                        color: v.textSecondary,
                        maxWidth: isDenseRoadmap ? "100%" : "94%",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: isDenseRoadmap ? 2 : 3,
                        overflow: "hidden",
                      }}
                    >
                      {lesson.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr) auto",
          gap: scalePx(isDenseRoadmap ? "12px" : "14px"),
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: scaleSpace(
              isDenseRoadmap ? "12px" : "14px",
              isDenseRoadmap ? "14px" : "16px",
            ),
            borderRadius: scalePx(isDenseRoadmap ? "16px" : "18px"),
            border: `1px solid color-mix(in srgb, ${v.primary} 34%, ${v.borderDefault})`,
            background: `linear-gradient(180deg, color-mix(in srgb, ${v.primary} 10%, ${v.bgSurface}) 0%, ${v.bgElevated} 100%)`,
          }}
        >
          <div
            style={{
              fontSize: scalePx(isDenseRoadmap ? "10px" : "11px"),
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: v.fontMono,
              color: v.primaryLight,
            }}
          >
            {pathLabel}
          </div>
          <div
            style={{
              marginTop: scalePx("8px"),
              fontSize: scalePx(isDenseRoadmap ? "13px" : "14px"),
              lineHeight: isDenseRoadmap ? 1.45 : 1.55,
              color: v.textSecondary,
            }}
          >
            {pathSummary}
          </div>
        </div>

        <div
          style={{
            padding: scalePx(isDenseRoadmap ? "15px" : "18px"),
            borderRadius: scalePx(isDenseRoadmap ? "16px" : "18px"),
            border: `1px solid ${v.borderDefault}`,
            background: `linear-gradient(180deg, color-mix(in srgb, ${v.accent} 8%, ${v.bgSurface}) 0%, ${v.bgElevated} 100%)`,
            display: "flex",
            flexDirection: "column",
            gap: scalePx(isDenseRoadmap ? "10px" : "12px"),
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: scalePx(isDenseRoadmap ? "6px" : "8px"),
              alignSelf: "flex-start",
              padding: scaleSpace(
                isDenseRoadmap ? "6px" : "7px",
                isDenseRoadmap ? "8px" : "10px",
              ),
              borderRadius: "999px",
              background:
                "color-mix(in srgb, var(--tf-bg-overlay, #1f222a) 82%, transparent)",
              border: `1px solid color-mix(in srgb, ${v.accent} 42%, transparent)`,
            }}
          >
            <span
              style={{
                width: scalePx("8px"),
                height: scalePx("8px"),
                borderRadius: "999px",
                background: v.accentLight,
                boxShadow: `0 0 ${scalePx(isDenseRoadmap ? "14px" : "18px")} color-mix(in srgb, ${v.accentLight} 58%, transparent)`,
              }}
            />
            <span
              style={{
                fontSize: scalePx(isDenseRoadmap ? "10px" : "11px"),
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: v.fontMono,
                color: v.accentLight,
              }}
            >
              Step focus
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gap: scalePx(isDenseRoadmap ? "10px" : "12px"),
              minHeight: 0,
              overflowY: "auto",
              paddingRight: scalePx(isDenseRoadmap ? "4px" : "6px"),
            }}
          >
            <div
              style={{
                fontSize: scalePx(isDenseRoadmap ? "23px" : "26px"),
                lineHeight: isDenseRoadmap ? 1.03 : 1.08,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: v.textPrimary,
                fontFamily: v.fontDisplay,
              }}
            >
              {activeStep?.title}
            </div>
            <div
              style={{
                fontSize: scalePx(isDenseRoadmap ? "14px" : "15px"),
                lineHeight: isDenseRoadmap ? 1.5 : 1.6,
                color: v.textSecondary,
              }}
            >
              {activeNarrative}
            </div>
            <div
              style={{
                display: "grid",
                gap: scalePx(isDenseRoadmap ? "7px" : "8px"),
                padding: scaleSpace(
                  isDenseRoadmap ? "10px" : "12px",
                  isDenseRoadmap ? "12px" : "14px",
                ),
                borderRadius: scalePx(isDenseRoadmap ? "14px" : "16px"),
                border: `1px solid ${v.borderSubtle}`,
                background:
                  "color-mix(in srgb, var(--tf-bg-overlay, #1f222a) 84%, transparent)",
              }}
            >
              <div
                style={{
                  fontSize: scalePx(isDenseRoadmap ? "10px" : "11px"),
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: v.fontMono,
                  color: v.textMuted,
                }}
              >
                Start to finish
              </div>
              <div
                style={{
                  display: "grid",
                  gap: scalePx(isDenseRoadmap ? "7px" : "8px"),
                }}
              >
                {pathBullets.map((bullet) => (
                  <div
                    key={bullet}
                    style={{
                      display: "grid",
                      gridTemplateColumns: `${scalePx(isDenseRoadmap ? "7px" : "8px")} minmax(0, 1fr)`,
                      gap: scalePx(isDenseRoadmap ? "7px" : "8px"),
                      alignItems: "start",
                    }}
                  >
                    <div
                      style={{
                        width: scalePx(isDenseRoadmap ? "7px" : "8px"),
                        height: scalePx(isDenseRoadmap ? "7px" : "8px"),
                        marginTop: scalePx(isDenseRoadmap ? "6px" : "7px"),
                        borderRadius: "999px",
                        background: v.accentLight,
                        boxShadow: `0 0 ${scalePx(isDenseRoadmap ? "12px" : "14px")} color-mix(in srgb, ${v.accentLight} 42%, transparent)`,
                      }}
                    />
                    <div
                      style={{
                        fontSize: scalePx(isDenseRoadmap ? "12px" : "13px"),
                        lineHeight: isDenseRoadmap ? 1.4 : 1.5,
                        color: v.textSecondary,
                      }}
                    >
                      {bullet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: scalePx(isDenseRoadmap ? "8px" : "10px"),
          }}
        >
          <div
            style={{
              padding: scaleSpace(
                isDenseRoadmap ? "10px" : "12px",
                isDenseRoadmap ? "12px" : "14px",
              ),
              borderRadius: scalePx(isDenseRoadmap ? "13px" : "14px"),
              border: `1px solid ${v.borderSubtle}`,
              background:
                "color-mix(in srgb, var(--tf-bg-overlay, #1f222a) 84%, transparent)",
            }}
          >
            <div
              style={{
                fontSize: scalePx(isDenseRoadmap ? "10px" : "11px"),
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: v.fontMono,
                color: v.textMuted,
              }}
            >
              {progressLabel}
            </div>
            <div
              style={{
                marginTop: scalePx("8px"),
                fontSize: scalePx(isDenseRoadmap ? "20px" : "22px"),
                lineHeight: 1,
                fontWeight: 800,
                color: v.textPrimary,
                fontFamily: v.fontDisplay,
              }}
            >
              {lessonNumber} / {lessons.length.toString().padStart(2, "0")}
            </div>
          </div>
          <div
            style={{
              padding: scaleSpace(
                isDenseRoadmap ? "10px" : "12px",
                isDenseRoadmap ? "12px" : "14px",
              ),
              borderRadius: scalePx(isDenseRoadmap ? "13px" : "14px"),
              border: `1px solid ${v.borderSubtle}`,
              background:
                "color-mix(in srgb, var(--tf-bg-overlay, #1f222a) 84%, transparent)",
            }}
          >
            <div
              style={{
                fontSize: scalePx(isDenseRoadmap ? "10px" : "11px"),
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: v.fontMono,
                color: v.textMuted,
              }}
            >
              {currentLockLabel}
            </div>
            <div
              style={{
                marginTop: scalePx("8px"),
                fontSize: scalePx(isDenseRoadmap ? "14px" : "16px"),
                lineHeight: isDenseRoadmap ? 1.3 : 1.4,
                fontWeight: 700,
                color: v.textPrimary,
                fontFamily: v.fontDisplay,
              }}
            >
              {currentLesson?.title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
