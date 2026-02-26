import React from "react";
import { createRoot } from "react-dom/client";
import {
  TutorialGlobalStyles,
  TutorialHeader,
  TutorialFooter,
  TutorialLayout,
  SidebarLayout,
  ThemeSelector,
  HeroSection,
  SectionHeading,
  SectionDivider,
  ConceptGrid,
  ConceptCard,
  StepList,
  StepCard,
  CodeBlock,
  KeyPoint,
  TutorialNav,
  CalloutBox,
  InfoBox,
  NoteBox,
  TipBox,
  SuccessBox,
  WarningBox,
  DangerBox,
  MermaidDiagram,
  DescriptionBox,
  PollBlock,
  StepByStepGuide,
  Paragraph,
  LabSettings,
  CodePreview,
  VideoTranscript,
  YouTubeEmbed,
  GitHubGistEmbed,
  TwitterEmbed,
  LinkedInEmbed,
  ShareButtons,
  CourseSidebar,
  CoursePlayerLayout,
  QuizBlock,
  ArticleBlock,
  PodcastEmbed,
  SlideshowEmbed,
  PartTypeBadge,
  QABlock,
  LessonHeader,
  LessonList,
} from "../../src/index";

const header = {
  siteName: "LocalM",
  navItems: [{ label: "Home", href: "/" }],
  currentPath: "/",
  githubUrl: "https://github.com/nilayparikh",
  youtubeUrl: "https://www.youtube.com/",
};

const footer = {
  siteName: "LocalM",
  links: [{ label: "Docs", href: "#" }],
  githubUrl: "https://github.com/nilayparikh",
  youtubeUrl: "https://www.youtube.com/",
  linkedinUrl: "https://www.linkedin.com/",
};

const courseParts = [
  { slug: "intro", title: "Intro", type: "video", duration: "3 mins" },
  {
    slug: "concepts",
    title: "Core Concepts",
    type: "reading",
    duration: "5 mins",
  },
  { slug: "quiz", title: "Quiz", type: "quiz", duration: "2 mins" },
] as const;

function Marker({ id }: { id: string }) {
  return <div data-testid={id} style={{ display: "none" }} />;
}

function App() {
  return (
    <>
      <TutorialGlobalStyles />

      <main style={{ padding: "24px", display: "grid", gap: "20px" }}>
        <h1>Component Harness</h1>
        <Marker id="harness-loaded" />

        <section>
          <h2>Layout Components</h2>
          <Marker id="layout-components" />
          <ThemeSelector />
          <TutorialHeader {...header} />
          <div style={{ marginTop: "8px" }}>
            <TutorialFooter {...footer} />
          </div>
          <TutorialLayout header={header} footer={footer} maxWidth="narrow">
            <Paragraph>Layout content</Paragraph>
          </TutorialLayout>
          <SidebarLayout
            sidebar={<div>Sidebar content</div>}
            children={<div>Main content</div>}
          />
        </section>

        <section>
          <h2>Content Components</h2>
          <Marker id="content-components" />
          <HeroSection
            eyebrow="Getting Started"
            headline="Build **Component Tests**"
            subheading="Validate all shared components in one harness"
            tags={["react", "playwright", "components"]}
          />
          <SectionDivider label="Concepts" />
          <SectionHeading
            eyebrow="Core"
            title="Component primitives"
            subtitle="Each block should render without runtime errors"
          />
          <ConceptGrid columns={2}>
            <ConceptCard title="Concept A" description="First concept" />
            <ConceptCard title="Concept B" description="Second concept" />
          </ConceptGrid>
          <StepList>
            <StepCard
              step={1}
              title="Install"
              description="Install dependencies"
              code="npm install"
              codeLanguage="bash"
            />
          </StepList>
          <CodeBlock
            code={'console.log("hello")'}
            language="typescript"
            filename="sample.ts"
          />
          <KeyPoint variant="info" title="Key Point">
            This is an informational callout.
          </KeyPoint>
          <CalloutBox variant="note" title="CalloutBox">
            Generic callout rendering.
          </CalloutBox>
          <InfoBox title="InfoBox">Info variant</InfoBox>
          <NoteBox title="NoteBox">Note variant</NoteBox>
          <TipBox title="TipBox">Tip variant</TipBox>
          <SuccessBox title="SuccessBox">Success variant</SuccessBox>
          <WarningBox title="WarningBox">Warning variant</WarningBox>
          <DangerBox title="DangerBox">Danger variant</DangerBox>
          <MermaidDiagram
            chart="graph TD; A[Start] --> B[Test]; B --> C[Pass];"
            caption="Simple flow"
          />
          <DescriptionBox
            title="Description"
            subtitle="Metadata + body"
            tags={["tag-1", "tag-2"]}
            meta="5 mins"
          >
            Rich description content.
          </DescriptionBox>
          <PollBlock
            question="Which framework are you using?"
            options={[
              { id: "a", text: "Next.js" },
              { id: "b", text: "React" },
            ]}
            simulatedVotes={{ a: 10, b: 8 }}
          />
          <StepByStepGuide
            title="Guide"
            interactive={false}
            steps={[
              {
                title: "Step One",
                description: "Do the first thing",
                code: "echo step-1",
              },
            ]}
          />
          <Paragraph lead>Lead paragraph style.</Paragraph>
          <LabSettings
            title="Lab Settings"
            setupTime="~5 min"
            difficulty="beginner"
            requirements={[
              {
                name: "Node.js",
                version: "18+",
                description: "Runtime",
              },
            ]}
          />
          <CodePreview
            title="Code Preview"
            segments={[
              {
                code: "const ok = true;",
                language: "typescript",
                filename: "ok.ts",
                explanation: "Simple segment",
              },
            ]}
          />
          <VideoTranscript
            title="Transcript"
            defaultCollapsed={false}
            entries={[
              { time: 0, speaker: "Host", text: "Welcome to the lesson" },
            ]}
          />
          <TutorialNav
            prev={{ label: "Previous", href: "#prev" }}
            next={{ label: "Next", href: "#next" }}
          />
        </section>

        <section>
          <h2>Embed Components</h2>
          <Marker id="embed-components" />
          <YouTubeEmbed
            videoId="dQw4w9WgXcQ"
            title="YouTube sample"
            caption="Video embed"
          />
          <GitHubGistEmbed gistId="aa5a315d61ae9438b18d" caption="Gist embed" />
          <TwitterEmbed
            tweetUrl="https://x.com/jack/status/20"
            caption="Twitter embed"
          />
          <LinkedInEmbed
            postUrl="https://www.linkedin.com/feed/update/urn:li:activity:123"
            caption="LinkedIn embed"
          />
          <ShareButtons
            title="Share Title"
            description="Share Description"
            url="https://example.com"
            hashtags={["localm", "tutorial"]}
          />
        </section>

        <section>
          <h2>Course Components</h2>
          <Marker id="course-components" />
          <PartTypeBadge type="video" duration="3 mins" />
          <LessonHeader
            type="video"
            duration="3 mins"
            title="Lesson Header"
            description="Lesson description"
          />
          <LessonList parts={[...courseParts]} />
          <CourseSidebar
            courseTitle="Course Title"
            parts={[...courseParts]}
            currentSlug="intro"
            basePath=""
            totalDuration="10 mins"
          />
          <CoursePlayerLayout
            header={header}
            footer={footer}
            sidebar={{
              courseTitle: "Course Title",
              parts: [...courseParts],
              currentSlug: "intro",
              basePath: "",
            }}
          >
            <Paragraph>Course player main content.</Paragraph>
          </CoursePlayerLayout>
          <QuizBlock
            title="Quiz"
            questions={[
              {
                id: "q1",
                question: "2 + 2 = ?",
                options: [
                  { id: "a", text: "4" },
                  { id: "b", text: "5" },
                ],
                correctOptionId: "a",
                explanation: "Basic arithmetic",
              },
            ]}
          />
          <QABlock
            title="Q&A"
            items={[
              {
                question: "What is this?",
                answer: "A QA block test case.",
              },
            ]}
          />
          <ArticleBlock
            title="Article"
            subtitle="Article subtitle"
            readingTime="3 min"
          >
            <p>Article body content.</p>
          </ArticleBlock>
          <PodcastEmbed
            title="Podcast"
            description="Podcast description"
            spotifyUrl="https://open.spotify.com/episode/1234567890"
            duration="12 mins"
            showName="LocalM Show"
          />
          <SlideshowEmbed
            title="Slides"
            embedUrl="https://docs.google.com/presentation/d/e/2PACX-1vR/embed?start=false"
            provider="google-slides"
            slideCount={12}
            description="Slide deck"
          />
        </section>
      </main>
    </>
  );
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}
createRoot(root).render(<App />);
