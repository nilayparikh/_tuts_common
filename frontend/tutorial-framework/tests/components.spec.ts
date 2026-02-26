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
  await expect(page.getByText("Article")).toBeVisible();
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
