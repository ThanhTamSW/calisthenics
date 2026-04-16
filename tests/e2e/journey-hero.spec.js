import { test, expect } from "@playwright/test";

test.describe("Hero and Journey flows", () => {
  test("hero carousel changes active avatar when clicking next", async ({ page }) => {
    await page.goto("/");

    const activeAvatar = page.locator(".avatar-slide.active").first();
    const firstAlt = await activeAvatar.getAttribute("alt");

    await page.getByRole("button", { name: "Next image" }).click({ force: true });

    await expect(activeAvatar).not.toHaveAttribute("alt", firstAlt || "", { timeout: 10000 });
  });

  test("timeline item without image opens without rendering thumb", async ({ page }) => {
    await page.goto("/");

    const noImageItem = page.locator(".timeline-item").last();
    await noImageItem.locator(".timeline-head").click();

    await expect(noImageItem.locator(".timeline-head")).toHaveAttribute("aria-expanded", "true");
    await expect(noImageItem.locator(".timeline-project-thumb")).toHaveCount(0);
    await expect(noImageItem.locator(".timeline-project-chip").first()).toBeVisible();
  });

  test("timeline item with image renders thumbnail after open", async ({ page }) => {
    await page.goto("/");

    const imageItem = page.locator(".timeline-item").first();
    await imageItem.locator(".timeline-head").click();

    await expect(imageItem.locator(".timeline-head")).toHaveAttribute("aria-expanded", "true");
    await expect(imageItem.locator(".timeline-project-thumb")).toBeVisible();
    await expect(imageItem.locator(".timeline-project-image.active")).toBeVisible({ timeout: 10000 });
  });
});
