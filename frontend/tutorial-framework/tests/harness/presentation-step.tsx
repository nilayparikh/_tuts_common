import React from "react";
import { createRoot } from "react-dom/client";
import { TutorialGlobalStyles } from "../../src/index";
import {
  PresentationControlPanel,
  PresentationLayout,
  ShortsFeedLayout,
  ShortsLayout,
  usePresentationStep,
} from "../../src/components/presentation";

const CHANNEL_ID = "tf-step-harness";
const deck = {
  id: "01",
  number: "01",
  title: "Step Harness",
  deckType: "short",
  slides: [
    {
      id: "step-slide",
      title: "Animated Step Slide",
      duration: 30,
      narration: "Fallback narration",
      steps: [
        {
          id: "step-1",
          title: "Step 1",
          transcript: "Step 1:\nPrompt is entered.",
        },
        {
          id: "step-2",
          title: "Step 2",
          transcript: "Step 2:\nRepository context is discovered.",
        },
        {
          id: "step-3",
          title: "Step 3",
          transcript: "Step 3:\nThe agent plans the implementation.",
        },
        {
          id: "step-4",
          title: "Step 4",
          transcript: "Step 4:\nThe final output is produced.",
        },
      ],
      content: (
        <div
          data-testid="step-slide-content"
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            background: "#0b0d12",
            color: "#e2e6f0",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Step Harness Slide
        </div>
      ),
    },
  ],
} as any;

const shortDeck = {
  ...deck,
  deckType: "short",
};

function StepAwareContent() {
  const { activeStep } = usePresentationStep();

  return (
    <div
      data-testid="step-slide-content"
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        background: "#0b0d12",
        color: "#e2e6f0",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 12 }}>
          Step Harness Slide
        </div>
        <div
          data-testid="step-active-title"
          style={{ fontSize: 28, fontWeight: 700 }}
        >
          {activeStep?.title ?? "No Step"}
        </div>
      </div>
    </div>
  );
}

deck.slides[0].content = <StepAwareContent />;

function App() {
  const params = new URLSearchParams(window.location.search);
  const control = params.get("control") === "1";
  const shortsMode = params.get("shorts");
  const presenterPopupRef = React.useRef<Window | null>(null);
  const shortsPopupRef = React.useRef<Window | null>(null);
  const feedPopupRef = React.useRef<Window | null>(null);

  const closeOtherSlideWindows = (
    keep: React.MutableRefObject<Window | null>,
  ) => {
    for (const ref of [presenterPopupRef, shortsPopupRef, feedPopupRef]) {
      if (ref !== keep && ref.current && !ref.current.closed) {
        ref.current.close();
        ref.current = null;
      }
    }
  };

  const focusOrOpenPopup = (
    popupRef: React.MutableRefObject<Window | null>,
    url: string,
    name: string,
    features: string,
  ) => {
    closeOtherSlideWindows(popupRef);

    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return popupRef.current;
    }

    const popup = window.open(url, name, features);
    if (popup) {
      popupRef.current = popup;
      popup.focus();
    }
    return popup;
  };

  return (
    <>
      <TutorialGlobalStyles />
      {control ? (
        <PresentationControlPanel
          deck={deck}
          decks={[deck]}
          controlChannelId={CHANNEL_ID}
          onOpenPresenter={() => {
            focusOrOpenPopup(
              presenterPopupRef,
              `${window.location.pathname}${window.location.hash}`,
              "tf-step-harness-presenter",
              "popup=yes,width=1600,height=900,resizable=yes,scrollbars=yes",
            );
          }}
          onOpenShorts={() => {
            focusOrOpenPopup(
              shortsPopupRef,
              `${window.location.pathname}?shorts=1${window.location.hash}`,
              "tf-step-harness-shorts",
              "popup=yes,width=560,height=1000,resizable=yes,scrollbars=yes",
            );
          }}
          onOpenFeed={() => {
            focusOrOpenPopup(
              feedPopupRef,
              `${window.location.pathname}?shorts=45${window.location.hash}`,
              "tf-step-harness-feed",
              "popup=yes,width=900,height=1125,resizable=yes,scrollbars=yes",
            );
          }}
        />
      ) : shortsMode === "1" ? (
        <ShortsLayout
          courseTitle="Harness"
          deck={shortDeck}
          controlChannelId={CHANNEL_ID}
        />
      ) : shortsMode === "45" ? (
        <ShortsFeedLayout
          courseTitle="Harness"
          deck={shortDeck}
          controlChannelId={CHANNEL_ID}
        />
      ) : (
        <PresentationLayout
          courseTitle="Harness"
          deck={deck}
          onHome={() => {
            window.location.hash = "#/";
          }}
          controlChannelId={CHANNEL_ID}
        />
      )}
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
