import { expect, test } from "@playwright/test";

async function expectApproxRatio(
  actual: number,
  expected: number,
  tolerance: number,
) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

async function getComputedRatio(locator: Parameters<typeof expect>[0]) {
  return locator.evaluate((node: Element) => {
    const style = window.getComputedStyle(node as HTMLElement);
    const width = Number.parseFloat(style.width);
    const height = Number.parseFloat(style.height);
    return width / height;
  });
}

async function getComputedSize(locator: Parameters<typeof expect>[0]) {
  return locator.evaluate((node: Element) => {
    const style = window.getComputedStyle(node as HTMLElement);
    return {
      width: Number.parseFloat(style.width),
      height: Number.parseFloat(style.height),
    };
  });
}

test("renders component harness", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("harness-loaded")).toBeVisible();
  await expect(page.getByTestId("layout-components")).toBeVisible();
  await expect(page.getByTestId("content-components")).toBeVisible();
  await expect(page.getByTestId("embed-components")).toBeVisible();
  await expect(page.getByTestId("course-components")).toBeVisible();

  await expect(page.getByText("Component Harness")).toBeVisible();
  await expect(page.getByText("Build Component Tests")).toBeVisible();
  await expect(page.getByText("Concept A")).toBeVisible();
  await expect(page.getByText("Key Point")).toBeVisible();
  await expect(page.getByText("Video embed")).toBeVisible();
  await expect(page.getByText("Q&A")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Article" })).toBeVisible();
});

test("interactive components behave", async ({ page }) => {
  await page.goto("/");

  const voteButtons = page.getByRole("button", { name: /Next\.js|React/ });
  await voteButtons.first().click();
  await page.getByRole("button", { name: "Vote" }).click();

  await expect(page.getByText(/total votes/i)).toBeVisible();

  await expect(page.getByText("Transcript")).toBeVisible();
  await expect(page.getByPlaceholder("Search transcript…")).toBeVisible();
});

test("step slides expose a control step button", async ({ browser }) => {
  const presenter = await browser.newPage();
  await presenter.goto("/presentation-step.html#/01/0");
  await expect(presenter.getByTestId("step-slide-content")).toBeVisible();
  await expect(presenter.getByTestId("step-active-title")).toHaveText("Step 1");

  const controlPromise = presenter.waitForEvent("popup");
  await presenter.getByRole("button", { name: "Control" }).click();
  const control = await controlPromise;
  await control.waitForLoadState("domcontentloaded");

  await expect(control.locator(".pc-step-counter")).toHaveText("Step 1 / 4");
  await expect(control.locator(".pc-transcript-current-text")).toContainText(
    /prompt is entered/i,
  );
  await expect(control.getByTestId("presentation-step-next")).toBeVisible();
  await control.getByTestId("presentation-step-next").click();
  await expect(control.locator(".pc-step-counter")).toHaveText("Step 2 / 4");

  await control.getByTestId("presentation-step-next").click();
  await expect(control.locator(".pc-step-counter")).toHaveText("Step 3 / 4");

  await control.getByRole("button", { name: "Back" }).click();
  await expect(control.locator(".pc-step-counter")).toHaveText("Step 2 / 4");

  await presenter.bringToFront();
  await expect(presenter.getByTestId("step-active-title")).toHaveText("Step 2");
  await expect(control.locator(".pc-transcript-current-text")).toContainText(
    /repository context is discovered/i,
  );
});

test("control window transcript size defaults larger and is adjustable", async ({
  browser,
}) => {
  const presenter = await browser.newPage();
  await presenter.goto("/presentation-step.html#/01/0");

  const controlPromise = presenter.waitForEvent("popup");
  await presenter.getByRole("button", { name: "Control" }).click();
  const control = await controlPromise;
  await control.waitForLoadState("domcontentloaded");

  const transcriptText = control.locator(".pc-transcript-current-text");
  const transcriptHeader = control.locator(".pc-transcript-header");
  await expect(transcriptText).toBeVisible();
  await expect(transcriptHeader.getByLabel("Transcript size")).toBeVisible();
  await expect(transcriptHeader.getByText("110%")).toBeVisible();

  const defaultFontSize = await transcriptText.evaluate(
    (node) => window.getComputedStyle(node).fontSize,
  );
  const defaultFontSizePx = Number.parseFloat(defaultFontSize);
  expect(defaultFontSizePx).toBeGreaterThan(15);

  await transcriptHeader.getByLabel("Transcript size").fill("7");
  await expect(transcriptHeader.getByText("170%")).toBeVisible();

  const largerFontSize = await transcriptText.evaluate(
    (node) => window.getComputedStyle(node).fontSize,
  );
  const largerFontSizePx = Number.parseFloat(largerFontSize);
  expect(largerFontSizePx).toBeGreaterThan(defaultFontSizePx);

  await control.getByLabel("Slide zoom").selectOption("1.30");
  await expect(control.getByText("Zoom 1.30x")).toBeVisible();
});

test("control toolbar defaults guides off and fullscreen hands off to the slide window", async ({
  browser,
}) => {
  const control = await browser.newPage();
  await control.goto("/presentation-step.html?control=1#/01/0");
  await control.waitForLoadState("domcontentloaded");

  const fullscreenButton = control.getByRole("button", {
    name: "Toggle fullscreen on slide window",
  });
  const guidesButton = control.getByRole("button", {
    name: "Toggle L-corner guides",
  });
  const crossbarsButton = control.getByRole("button", {
    name: "Toggle center crossbar alignment marks",
  });

  await expect(fullscreenButton).toBeVisible();
  await expect(guidesButton).toBeVisible();
  await expect(crossbarsButton).toBeVisible();
  await expect(guidesButton).not.toHaveClass(/active/);
  await expect(crossbarsButton).not.toHaveClass(/active/);
  await expect(
    control.locator(".pc-btn-label", { hasText: "16:9" }),
  ).toBeVisible();
  await expect(
    control.locator(".pc-btn-label", { hasText: "9:16" }),
  ).toBeVisible();

  const presenterPromise = control.waitForEvent("popup");
  await control
    .getByRole("button", { name: "Open or focus 16 by 9 slide window" })
    .click();
  const presenter = await presenterPromise;
  await presenter.waitForLoadState("domcontentloaded");

  await expect(
    presenter.locator(".pe-viewport-guide-svg polyline"),
  ).toHaveCount(0);

  const shortsPromise = control.waitForEvent("popup");
  await control
    .getByRole("button", { name: "Open or focus 9 by 16 slide window" })
    .click();
  const shorts = await shortsPromise;
  await shorts.waitForLoadState("domcontentloaded");

  await control
    .getByRole("button", { name: "Open or focus 16 by 9 slide window" })
    .click();
  await guidesButton.click();
  await expect(guidesButton).toHaveClass(/active/);
  await expect(
    presenter.locator(".pe-viewport-guide-svg polyline"),
  ).toHaveCount(4);
  await expect(shorts.locator(".pe-shorts-guide-svg polyline")).toHaveCount(0);

  await crossbarsButton.click();
  await expect(crossbarsButton).toHaveClass(/active/);
  await expect(presenter.locator(".pe-viewport-guide-svg line")).toHaveCount(4);
  await expect(shorts.locator(".pe-shorts-guide-svg line")).toHaveCount(0);

  await control
    .getByRole("button", { name: "Open or focus 9 by 16 slide window" })
    .click();
  await guidesButton.click();
  await expect(guidesButton).toHaveClass(/active/);
  await expect(shorts.locator(".pe-shorts-guide-svg polyline")).toHaveCount(4);
  await expect(
    presenter.locator(".pe-viewport-guide-svg polyline"),
  ).toHaveCount(4);

  await control
    .getByRole("button", { name: "Open or focus 16 by 9 slide window" })
    .click();
  await fullscreenButton.click();
  await expect
    .poll(async () =>
      presenter.evaluate(() => {
        return (
          Boolean(document.fullscreenElement) ||
          Boolean(document.querySelector('[data-testid="fullscreen-prompt"]'))
        );
      }),
    )
    .toBe(true);
});

test("control toolbar toggles guides and crossbars for 16:9, 9:16, and 4:5 surfaces", async ({
  browser,
}) => {
  const control = await browser.newPage();
  await control.goto("/presentation-step.html?control=1#/01/0");
  await control.waitForLoadState("domcontentloaded");

  const guidesButton = control.getByRole("button", {
    name: "Toggle L-corner guides",
  });
  const crossbarsButton = control.getByRole("button", {
    name: "Toggle center crossbar alignment marks",
  });

  await expect(
    control.locator(".pc-btn-label", { hasText: "4:5" }),
  ).toBeVisible();

  const presenterPromise = control.waitForEvent("popup");
  await control
    .getByRole("button", { name: "Open or focus 16 by 9 slide window" })
    .click();
  const presenter = await presenterPromise;
  await presenter.waitForLoadState("domcontentloaded");
  await presenter.getByTitle("Toggle 16:9 mode (P)").click();

  await expect(presenter.locator(".pe-pip-guide-svg polyline")).toHaveCount(0);
  await expect(presenter.locator(".pe-pip-guide-svg line")).toHaveCount(0);

  const shortsPromise = control.waitForEvent("popup");
  await control
    .getByRole("button", { name: "Open or focus 9 by 16 slide window" })
    .click();
  const shorts = await shortsPromise;
  await shorts.waitForLoadState("domcontentloaded");

  const feedPromise = control.waitForEvent("popup");
  await control
    .getByRole("button", { name: "Open or focus 4 by 5 slide window" })
    .click();
  const feed = await feedPromise;
  await feed.waitForLoadState("domcontentloaded");

  await control
    .getByRole("button", { name: "Open or focus 16 by 9 slide window" })
    .click();
  await guidesButton.click();
  await crossbarsButton.click();
  await expect(presenter.locator(".pe-pip-guide-svg polyline")).toHaveCount(4);
  await expect(presenter.locator(".pe-pip-guide-svg line")).toHaveCount(4);
  await expect(shorts.locator(".pe-shorts-guide-svg polyline")).toHaveCount(0);
  await expect(shorts.locator(".pe-shorts-guide-svg line")).toHaveCount(0);
  await expect(feed.locator(".pe-feed-guide-svg polyline")).toHaveCount(0);
  await expect(feed.locator(".pe-feed-guide-svg line")).toHaveCount(0);

  await control
    .getByRole("button", { name: "Open or focus 9 by 16 slide window" })
    .click();
  await guidesButton.click();
  await crossbarsButton.click();
  await expect(shorts.locator(".pe-shorts-guide-svg polyline")).toHaveCount(4);
  await expect(shorts.locator(".pe-shorts-guide-svg line")).toHaveCount(4);
  await expect(feed.locator(".pe-feed-guide-svg polyline")).toHaveCount(0);
  await expect(feed.locator(".pe-feed-guide-svg line")).toHaveCount(0);

  await control
    .getByRole("button", { name: "Open or focus 4 by 5 slide window" })
    .click();
  await guidesButton.click();
  await crossbarsButton.click();
  await expect(feed.locator(".pe-feed-guide-svg polyline")).toHaveCount(4);
  await expect(feed.locator(".pe-feed-guide-svg line")).toHaveCount(4);
});

test("presentation layouts keep the slide stage at 1.4:1 with square corners", async ({
  browser,
}) => {
  const presenter = await browser.newPage();
  await presenter.goto("/presentation-step.html#/01/0");

  const slideBox = presenter.locator(".pe-slide-box");
  await expect(slideBox).toBeVisible();
  await expect(slideBox).toHaveCSS("aspect-ratio", "7 / 5");
  await expect(slideBox).toHaveCSS("border-radius", "0px");

  await presenter.getByTitle("Toggle 16:9 mode (P)").click();
  const pipColumn = presenter.locator(".pe-pip-column");
  const pipInset = presenter.locator(".pe-pip-inset");
  const pipFooter = presenter.locator(".pe-pip-footer");
  const pipSubscribeIcon = presenter.locator(".pe-pip-subscribe-icon");
  await expect(pipColumn).toBeVisible();
  await expect(pipFooter).toBeVisible();
  await expect(pipSubscribeIcon).toBeVisible();

  const pipColumnSize = await getComputedSize(pipColumn);
  const pipInsetSize = await getComputedSize(pipInset);
  const pipFooterSize = await getComputedSize(pipFooter);
  expect(pipColumnSize.width).toBeGreaterThan(250);
  expect(pipInsetSize.width).toBeGreaterThan(pipColumnSize.width * 0.9);
  // Reference layout: header(44) + info(100) + 1fr(PIP) + auto(footer).
  // PIP inset takes the bulk of the column; footer is compact.
  expect(pipInsetSize.height).toBeGreaterThan(pipFooterSize.height);
  expect(pipFooterSize.height).toBeGreaterThan(40);
  await expect(pipSubscribeIcon).not.toHaveCSS("animation-name", "none");

  const shorts = await browser.newPage();
  await shorts.goto("/presentation-step.html?shorts=1#/01/0");
  const shortsFrame = shorts.locator(".pe-shorts-frame");
  const shortsHeader = shorts.locator(".pe-shorts-header");
  const shortsVideo = shorts.locator(".pe-shorts-video");
  const shortsFooter = shorts.locator(".pe-shorts-footer");
  await expect(shortsHeader).toBeVisible();
  await expect(shortsFooter).toBeVisible();
  const shortsFrameSize = await getComputedSize(shortsFrame);
  const shortsHeaderSize = await getComputedSize(shortsHeader);
  const shortsVideoSize = await getComputedSize(shortsVideo);
  const shortsFooterSize = await getComputedSize(shortsFooter);
  await expectApproxRatio(
    shortsFrameSize.width / shortsHeaderSize.height,
    1.4,
    0.04,
  );
  expect(shortsVideoSize.height).toBeGreaterThan(shortsFooterSize.height);
  expect(shortsVideoSize.width).toBeGreaterThan(0);
});
