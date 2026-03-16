import { expect, test } from "@playwright/test";

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

  await expect(control.getByText("Step 1 / 4")).toBeVisible();
  await expect(control.getByText(/prompt is entered/i)).toBeVisible();
  await expect(control.getByTestId("presentation-step-next")).toBeVisible();
  await control.getByTestId("presentation-step-next").click();
  await expect(control.getByText("Step 2 / 4")).toBeVisible();

  await control.getByTestId("presentation-step-next").click();
  await expect(control.getByText("Step 3 / 4")).toBeVisible();

  await control.getByRole("button", { name: "Back" }).click();
  await expect(control.getByText("Step 2 / 4")).toBeVisible();

  await presenter.bringToFront();
  await expect(presenter.getByTestId("step-active-title")).toHaveText("Step 2");
  await expect(
    control.getByText(/repository context is discovered/i),
  ).toBeVisible();
});
